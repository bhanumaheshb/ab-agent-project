const express = require('express');
const router = express.Router();
const { getAllUsers, getAllProjects } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here are protected and for admins only
router.get('/users', protect, admin, getAllUsers);
router.get('/projects', protect, admin, getAllProjects);

module.exports = router;