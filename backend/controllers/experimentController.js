// controllers/experimentController.js
const mongoose = require('mongoose');
const axios = require('axios');

const Experiment = require('../models/Experiment');
const Project = require('../models/Project');
const DailyStat = require('../models/DailyStat');
const { getStartOfDay } = require('../utils/dateUtils');

// --- Helper: update daily stats ---
const updateDailyStats = async (type, experiment, variation) => {
  const today = getStartOfDay();
  await DailyStat.findOneAndUpdate(
    { experiment: experiment._id, variation: variation._id, date: today },
    {
      $inc: { [type]: 1 },
      $setOnInsert: {
        user: experiment.user,
        project: experiment.project,
        variationName: variation.name
      }
    },
    { upsert: true, new: true }
  );
};

// --- In-memory short-lived cache to reduce ML spikes ---
const decisionCache = new Map(); // key -> { decision, expiresAt }
const DECISION_CACHE_TTL = 30 * 1000; // 30s

// --- PROTECTED ROUTES ---

// @desc Get all experiments for a specific project
exports.getExperimentsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const experiments = await Experiment.find({
      project: projectId,
      user: req.user.id,
    });

    res.status(200).json(experiments);
  } catch (error) {
    console.error('Error fetching experiments by project:', error && error.message ? error.message : error);
    res.status(500).json({ message: 'Error fetching experiments', error: error.message });
  }
};

// @desc Get a single experiment by ID
exports.getExperimentById = async (req, res) => {
  try {
    const experiment = await Experiment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }
    res.status(200).json(experiment);
  } catch (error) {
    console.error('Error fetching experiment by id:', error && error.message ? error.message : error);
    res.status(500).json({ message: 'Error fetching experiment', error: error.message });
  }
};

// @desc Create a new experiment
exports.createExperiment = async (req, res) => {
  try {
    const { name, variations, projectId } = req.body;
    if (!name || !variations || !Array.isArray(variations) || variations.length < 2 || !projectId) {
      return res.status(400).json({
        message: 'Experiment must have a name, projectId, and at least 2 variations.'
      });
    }

    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!project) {
      return res.status(403).json({ message: 'Not authorized to add experiments to this project' });
    }

    // normalize and validate variation names
    const names = variations.map(v => (v.name || '').trim());
    if (names.some(n => !n)) {
      return res.status(400).json({ message: 'All variations must have non-empty names.' });
    }
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    if (duplicates.length) {
      return res.status(400).json({ message: 'Duplicate variation names are not allowed.' });
    }

    const experimentVariations = variations.map(v => ({ name: v.name, trials: 0, successes: 0 }));

    const newExperiment = new Experiment({
      name,
      variations: experimentVariations,
      project: projectId,
      user: req.user.id,
      status: 'running'
    });

    await newExperiment.save();
    res.status(201).json(newExperiment);
  } catch (error) {
    console.error('Error creating experiment:', error && error.message ? error.message : error);
    res.status(500).json({ message: 'Error creating experiment', error: error.message });
  }
};

// --- PUBLIC AGENT ROUTES ---

// @desc Get a decision from the ML service (with retry + fallback)
exports.getDecision = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    // If experiment not running, return default variation
    if (experiment.status !== 'running') {
      return res.status(200).json({ decision: experiment.variations[0]?.name || 'default' });
    }

    // check short-lived cache
    const cacheKey = String(experiment._id);
    const cached = decisionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json({ decision: cached.decision, cached: true });
    }

    const payload = { variations: experiment.variations };
    const mlUrl = `${process.env.ML_SERVICE_URL}/decision`;

    let mlResponse;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        mlResponse = await axios.post(mlUrl, payload, { timeout: 3000 });
        break;
      } catch (err) {
        const status = err.response?.status;
        console.warn(`⚠️ ML API attempt ${attempts} failed (${status || 'no response'})`);

        if (status === 429) {
          console.warn('⏳ ML service rate-limited (429). Using local fallback.');
          mlResponse = null;
          break;
        }

        if (status >= 500 && attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 200 * attempts));
          continue;
        }
        break;
      }
    }

    let winnerName;

    if (mlResponse && mlResponse.data?.decision) {
      winnerName = mlResponse.data.decision;
      console.log(`✅ ML decision: ${winnerName}`);
    } else {
      console.warn('⚠️ ML unavailable — using local Thompson-like fallback');
      const local = experiment.variations.reduce(
        (best, v) => {
          const score = (v.successes + 1) / (v.trials + 2);
          return score > best.score ? { name: v.name, score } : best;
        },
        { name: experiment.variations[0]?.name || 'default', score: -1 }
      );
      winnerName = local.name;
    }

    // record trial
    const winnerVariation = experiment.variations.find(v => v.name === winnerName);
    if (winnerVariation) {
      winnerVariation.trials += 1;
      await updateDailyStats('trials', experiment, winnerVariation);
      await experiment.save();
    } else {
      console.warn('Winner variation not found:', winnerName);
    }

    // set short-lived cache
    decisionCache.set(cacheKey, { decision: winnerName, expiresAt: Date.now() + DECISION_CACHE_TTL });

    res.status(200).json({ decision: winnerName });
  } catch (error) {
    console.error('❌ Error getting decision:', error && error.message ? error.message : error);
    // fallback: return default variation if possible
    const fallback = (await Experiment.findById(req.params.id))?.variations?.[0]?.name || 'default';
    res.status(200).json({
      decision: fallback,
      warning: 'ML service unavailable, default variation shown'
    });
  }
};

// @desc Record feedback (conversion)
exports.recordFeedback = async (req, res) => {
  try {
    const { variationName } = req.body;
    if (!variationName) {
      return res.status(400).json({ message: 'Variation name is required' });
    }

    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    const variation = experiment.variations.find(v => v.name === variationName);
    if (!variation) {
      return res.status(404).json({ message: 'Variation not found' });
    }

    variation.successes += 1;
    await updateDailyStats('successes', experiment, variation);
    await experiment.save();

    res.status(200).json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Error recording feedback:', error && error.message ? error.message : error);
    res.status(500).json({ message: 'Error recording feedback', error: error.message });
  }
};

// @desc Get daily stats for an experiment
exports.getExperimentStats = async (req, res) => {
  try {
    const experiment = await Experiment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    const stats = await DailyStat.find({
      experiment: req.params.id,
      user: req.user.id,
    }).sort({ date: 'asc' });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error && error.message ? error.message : error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// --- UPDATE / EDIT EXPERIMENT (PUT /api/experiments/:id) ---
// exports.updateExperiment defined earlier by user; keep as-is and export both names
exports.updateExperiment = exports.editExperiment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { name, variations } = req.body;
    const experimentId = req.params.id;

    if (!name && !variations) {
      return res.status(400).json({ message: 'Nothing to update. Provide name and/or variations.' });
    }

    if (variations && (!Array.isArray(variations) || variations.length < 2)) {
      return res.status(400).json({ message: 'Experiment must have at least 2 variations.' });
    }

    // basic duplicate-name check for incoming variations
    if (variations) {
      const names = variations.map(v => (v.name || '').trim());
      const duplicates = names.filter((n, i) => n && names.indexOf(n) !== i);
      if (duplicates.length) {
        return res.status(400).json({ message: 'Duplicate variation names in payload are not allowed.' });
      }
    }

    // Start transaction before reads so reads are part of the transaction
    await session.startTransaction();

    // Fetch experiment in the session
    const experiment = await Experiment.findById(experimentId).session(session);
    if (!experiment) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Experiment not found' });
    }

    // authorization: user must own the experiment
    if (String(experiment.user) !== String(req.user.id)) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to update this experiment' });
    }

    // Update name if provided
    if (name) {
      experiment.name = name;
    }

    if (variations) {
      // Build lookup of existing variations by id and by name
      const existingById = new Map();
      const existingByName = new Map();
      experiment.variations.forEach(v => {
        if (v._id) existingById.set(String(v._id), v);
        existingByName.set(v.name, v);
      });

      const newVariations = [];
      const seenExistingIds = new Set();

      for (const v of variations) {
        // client may pass { _id, name } or { name }
        if (v._id && existingById.has(String(v._id))) {
          const ex = existingById.get(String(v._id));
          ex.name = v.name || ex.name;
          newVariations.push({
            _id: ex._id,
            name: ex.name,
            trials: ex.trials || 0,
            successes: ex.successes || 0
          });
          seenExistingIds.add(String(ex._id));
        } else if (v.name && existingByName.has(v.name)) {
          // match by name (case-sensitive). If required, normalize case/trim before matching.
          const ex = existingByName.get(v.name);
          newVariations.push({
            _id: ex._id,
            name: ex.name,
            trials: ex.trials || 0,
            successes: ex.successes || 0
          });
          if (ex._id) seenExistingIds.add(String(ex._id));
        } else {
          // brand new variation
          newVariations.push({
            name: v.name,
            trials: 0,
            successes: 0
          });
        }
      }

      // Identify removed variations: those existing IDs not in seenExistingIds
      const removedVariationIds = experiment.variations
        .filter(v => v._id && !seenExistingIds.has(String(v._id)))
        .map(v => v._id);

      // Replace experiment variations with new array
      experiment.variations = newVariations;

      // Persist and clean up DailyStat entries for removed variations (within session)
      if (removedVariationIds.length > 0) {
        await DailyStat.deleteMany({
          experiment: experiment._id,
          variation: { $in: removedVariationIds }
        }).session(session);
      }
    }

    // Save experiment within session
    await experiment.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // reload experiment (fresh state) without session (or with, if you prefer)
    const updated = await Experiment.findById(experimentId);

    return res.status(200).json({ message: 'Experiment updated', experiment: updated });
  } catch (err) {
    // Attempt to abort transaction if active
    try {
      if (session.inTransaction()) await session.abortTransaction();
    } catch (e) {
      console.warn('Error aborting transaction:', e && e.message ? e.message : e);
    }

    console.error('❌ Error updating experiment:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Error updating experiment', error: err.message || err });
  } finally {
    session.endSession();
  }
};
