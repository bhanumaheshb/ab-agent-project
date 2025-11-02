const User = require('../models/User');
const Project = require('../models/Project');
const Experiment = require('../models/Experiment');

// @desc    Get all users (agencies)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private/Admin
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).populate('user', 'agencyName email');
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};