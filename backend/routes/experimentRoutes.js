const express = require('express');
const router = express.Router();
const controller = require('../controllers/experimentController');
const { protect } = require('../middleware/authMiddleware');

// --- Protected Dashboard Routes (for Maria) ---

// POST a new experiment
// (We protect this route)
router.post('/', protect, controller.createExperiment);

// GET a single experiment by its ID
// (We protect this route)
router.get('/:id', protect, controller.getExperimentById);

// GET all experiments FOR A SPECIFIC PROJECT
// (We protect this route)
router.get('/project/:projectId', protect, controller.getExperimentsByProject);

// --- ADD THIS NEW ROUTE ---
// GET daily stats for a single experiment
router.get('/:id/stats', protect, controller.getExperimentStats);

// --- Public Agent Routes (for the agent.js) ---

// GET a decision for which variation to show
// (This MUST be public)
router.get('/:id/decision', controller.getDecision);

// POST feedback for a variation (e.g., a conversion)
// (This MUST be public)
router.post('/:id/feedback', controller.recordFeedback);

module.exports = router;