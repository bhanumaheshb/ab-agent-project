const Experiment = require('../models/Experiment');
const Project = require('../models/Project');
const DailyStat = require('../models/DailyStat');
const { getStartOfDay } = require('../utils/dateUtils');
const axios = require('axios');

// --- Helper function to update daily stats ---
const updateDailyStats = async (type, experiment, variation) => {
  const today = getStartOfDay();

  await DailyStat.findOneAndUpdate(
    {
      experiment: experiment._id,
      variation: variation._id,
      date: today
    },
    {
      $inc: { [type]: 1 },
      $setOnInsert: {
        user: experiment.user,
        project: experiment.project,
        variationName: variation.name
      }
    },
    {
      upsert: true,
      new: true
    }
  );
};

// --- PROTECTED ROUTES ---

// @desc    Get all experiments for a specific project
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
    res.status(500).json({ message: 'Error fetching experiments', error: error.message });
  }
};

// @desc    Get a single experiment by ID
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
    res.status(500).json({ message: 'Error fetching experiment', error: error.message });
  }
};

// @desc    Create a new experiment
exports.createExperiment = async (req, res) => {
  try {
    const { name, variations, projectId } = req.body;
    if (!name || !variations || variations.length < 2 || !projectId) {
      return res.status(400).json({
        message: 'Experiment must have a name, projectId, and at least 2 variations.'
      });
    }

    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!project) {
      return res.status(403).json({ message: 'Not authorized to add experiments to this project' });
    }

    const experimentVariations = variations.map(v => ({
      name: v.name,
      trials: 0,
      successes: 0
    }));

    const newExperiment = new Experiment({
      name,
      variations: experimentVariations,
      project: projectId,
      user: req.user.id,
    });

    await newExperiment.save();
    res.status(201).json(newExperiment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating experiment', error: error.message });
  }
};

// --- PUBLIC AGENT ROUTES (IMPROVED) ---

// @desc    Get a decision from the ML service (with retry + fallback)
exports.getDecision = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    if (experiment.status !== 'running') {
      return res.status(200).json({ decision: experiment.variations[0].name });
    }

    const payload = { variations: experiment.variations };
    const mlUrl = `${process.env.ML_SERVICE_URL}/decision`;

    let mlResponse;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        mlResponse = await axios.post(mlUrl, payload);
        break; // success
      } catch (err) {
        attempts++;
        const status = err.response?.status;
        console.warn(`⚠️ ML API attempt ${attempts} failed (${status || 'no response'})`);

        // Handle rate-limit (429) with backoff
        if (status === 429 && attempts < maxAttempts) {
          const wait = 500 * attempts; // exponential delay
          console.log(`⏳ Rate limit hit. Retrying after ${wait}ms...`);
          await new Promise(res => setTimeout(res, wait));
          continue;
        }

        // Other server errors (>=500), retry
        if (status >= 500 && attempts < maxAttempts) {
          await new Promise(res => setTimeout(res, 300 * attempts));
          continue;
        }

        // If permanent failure, throw
        throw err;
      }
    }

    let winnerName;

    if (mlResponse && mlResponse.data?.decision) {
      winnerName = mlResponse.data.decision;
      console.log(`✅ ML decision: ${winnerName}`);
    } else {
      console.warn("⚠️ ML service unavailable — using fallback decision");

      // Local Thompson-like fallback
      const localDecision = experiment.variations.reduce(
        (best, v) => {
          const score = (v.successes + 1) / (v.trials + 2);
          return score > best.score ? { name: v.name, score } : best;
        },
        { name: experiment.variations[0].name, score: 0 }
      );
      winnerName = localDecision.name;
    }

    // Record trial
    const winnerVariation = experiment.variations.find(v => v.name === winnerName);
    if (winnerVariation) {
      winnerVariation.trials += 1;
      await updateDailyStats('trials', experiment, winnerVariation);
      await experiment.save();
    }

    res.status(200).json({ decision: winnerName });

  } catch (error) {
    console.error('❌ Error getting decision:', error.message);
    res.status(200).json({
      decision: 'default',
      warning: 'ML service unavailable, default variation shown'
    });
  }
};

// @desc    Record feedback (conversion)
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
    res.status(500).json({ message: 'Error recording feedback', error: error.message });
  }
};

// @desc    Get daily stats for an experiment
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
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
