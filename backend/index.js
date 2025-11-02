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

// --- THIS IS THE ROBUST PRODUCTION FIX ---
const allowedOrigins = [
  'http://localhost:5173', // Your local dev environment
  'https://tangerine-lily-5aaf71.netlify.app' // Your live site
];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the incoming origin is in our allowed list, or if it's not a browser (e.g., Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // For legacy browsers
};

// 1. Use the full CORS configuration
app.use(cors(corsOptions));
// 2. Explicitly handle pre-flight OPTIONS requests
app.options('*', cors(corsOptions));
// ----------------------------------------

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