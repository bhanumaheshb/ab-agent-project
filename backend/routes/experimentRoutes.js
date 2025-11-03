const express = require('express');
const router = express.Router();
const controller = require('../controllers/experimentController');
const { protect } = require('../middleware/authMiddleware');

// --- Protected Routes (Maria Dashboard) ---
router.post('/', protect, controller.createExperiment);
router.get('/:id', protect, controller.getExperimentById);
router.get('/project/:projectId', protect, controller.getExperimentsByProject);
router.get('/:id/stats', protect, controller.getExperimentStats);

// --- Public Agent Routes (agent.js script) ---
router.get('/:id/decision', controller.getDecision);
router.post('/:id/feedback', controller.recordFeedback);

module.exports = router;
