const Experiment = require('../models/Experiment');
const Project = require('../models/Project');
const DailyStat = require('../models/DailyStat'); // <-- IMPORTED
const { getStartOfDay } = require('../utils/dateUtils'); // <-- IMPORTED
const axios = require('axios');

// --- Helper function to update daily stats ---
const updateDailyStats = async (type, experiment, variation) => {
  const today = getStartOfDay(); // Get today's date at 00:00:00

  await DailyStat.findOneAndUpdate(
    {
      experiment: experiment._id,
      variation: variation._id,
      date: today
    },
    {
      $inc: { [type]: 1 }, // Increment 'trials' or 'successes'
      $setOnInsert: {
        user: experiment.user,
        project: experiment.project,
        variationName: variation.name
      }
    },
    {
      upsert: true, // "update or insert"
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
      return res.status(400).json({ message: 'Experiment must have a name, projectId, and at least 2 variations.' });
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

// --- PUBLIC AGENT ROUTES (UPGRADED) ---

// @desc    Get a decision from the ML service
exports.getDecision = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }
    
    if (experiment.status !== 'running') {
      return res.status(200).json({ decision: experiment.variations[0].name });
    }

    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/decision`,
      { variations: experiment.variations }
    );
    
    const winnerName = mlResponse.data.decision;
    const winnerVariation = experiment.variations.find(v => v.name === winnerName);
    
    if (winnerVariation) {
      // 1. Update total score
      winnerVariation.trials += 1;
      
      // 2. Update daily score (NEW)
      updateDailyStats('trials', experiment, winnerVariation);
      
      // 3. Save total score
      await experiment.save();
    }
    
    res.status(200).json({ decision: winnerName });
  } catch (error) {
    console.error('Error getting decision:', error.message);
    res.status(500).json({ message: 'Error getting decision', error: error.message });
  }
};

// @desc    Record a success/conversion
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

    // 1. Update total score
    variation.successes += 1;
    
    // 2. Update daily score (NEW)
    updateDailyStats('successes', experiment, variation);
    
    // 3. Save total score
    await experiment.save();
    
    res.status(200).json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording feedback', error: error.message });
  }
};

// ... (keep all other functions: getDecision, recordFeedback, etc.)

// @desc    Get daily stats for an experiment
// @route   GET /api/experiments/:id/stats
// @access  Private
exports.getExperimentStats = async (req, res) => {
  try {
    // First, check if this user owns this experiment
    const experiment = await Experiment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    // Now, find all daily stats for this experiment
    const stats = await DailyStat.find({
      experiment: req.params.id,
      user: req.user.id,
    }).sort({ date: 'asc' }); // Sort by date ascending

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};