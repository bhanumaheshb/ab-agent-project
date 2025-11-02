const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Middleware to protect routes (checks if user is logged in)
 */
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.c., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token ID and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next step
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @desc    Middleware for admin-only routes (checks if user is admin)
 * This MUST run AFTER the 'protect' middleware
 */
exports.admin = (req, res, next) => {
  // We check req.user (which the 'protect' middleware gave us)
  if (req.user && req.user.isAdmin) {
    next(); // They are an admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};