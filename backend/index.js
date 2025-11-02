require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // We will configure this

// Import your routes
const experimentRoutes = require('./routes/experimentRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// --- THIS IS THE FIX ---
// This tells the server to allow requests from ANY origin.
// This will fix the blocking error.
app.use(cors());
// ----------------------

app.use(express.json()); // Parses incoming JSON data
app.use(express.static('public')); // Serves static files

// --- Routes ---
app.use('/api/experiments', experimentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start the server ONLY after the database is connected
    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });