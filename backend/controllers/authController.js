const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to create a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token lasts for 30 days
  });
};

exports.signup = async (req, res) => {
  try {
    const { agencyName, email, password } = req.body;

    if (!agencyName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      agencyName,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);
    res.status(201).json({ 
      token, 
      _id: user._id,
      email: user.email, 
      agencyName: user.agencyName,
      isAdmin: user.isAdmin // <-- Send the admin status
    });

  } catch (error) {
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user._id);
    
    // --- THIS IS THE CORRECTED LINE ---
    res.status(200).json({ 
      token, 
      _id: user._id,
      email: user.email, 
      agencyName: user.agencyName,
      isAdmin: user.isAdmin // <-- Now it sends the admin status
    });

  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};