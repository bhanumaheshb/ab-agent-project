require('dotenv').config();
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

// --- DYNAMIC PRODUCTION CORS SETUP ---

// 1. Your main production URL
const prodOrigin = 'https://tangerine-lily-5aaf71.netlify.app';

// 2. A RegEx to match all Netlify "deploy previews"
// Matches: https://[any-string]--tangerine-lily-5aaf71.netlify.app
// ✅ FIXED by escaping the dash (-)
const deployPreviewOrigin = /^https:\/\/([a-z0-9\-]+)--tangerine-lily-5aaf71\.netlify\.app$/;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',// Local dev
  prodOrigin,              // Production
  deployPreviewOrigin,     // Deploy previews
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests if origin is in allowed list or from non-browser (e.g., Postman)
    if (
      !origin ||
      allowedOrigins.some(o =>
        typeof o === 'string' ? o === origin : o.test(origin)
      )
    ) {
      callback(null, true);
    } else {
      console.error('❌ CORS Error: This origin is not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // For legacy browsers
};

// 3. Apply CORS configuration
app.use(cors(corsOptions));
// 4. Handle pre-flight requests globally
app.options('*', cors(corsOptions));

// ----------------------------------------

app.use(express.json()); // Parse incoming JSON
app.use(express.static('public')); // Serve static files

// --- Routes ---
app.use('/api/experiments', experimentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

// --- Database Connection ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start the server ONLY after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
