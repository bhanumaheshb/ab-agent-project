require('dotenv').config(); // Loads .env file variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your routes
const experimentRoutes = require('./routes/experimentRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
app.use(cors()); // Allows your React frontend to talk to this server
app.use(express.json()); // Parses incoming JSON data

//--public--
app.use(express.static('public')); // Serves static files from 'public' folder

// --- Routes ---
app.use('/api/experiments', experimentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/users', userRoutes);

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start the server ONLY after the database is connected
    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });