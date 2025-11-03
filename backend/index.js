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

// --- THIS IS THE DYNAMIC PRODUCTION FIX ---

// 1. Your main production URL
const prodOrigin = 'https://tangerine-lily-5aaf71.netlify.app';

// 2. A RegEx to match all Netlify "deploy previews"
// This matches https://[any-string]--tangerine-lily-5aaf71.netlify.app
// ✅ FIXED by escaping the dash (-)
const deployPreviewOrigin = /^https:\/\/([a-z0-9\-]+)--tangerine-lily-5aaf71\.netlify\.app$/;

const allowedOrigins = [
  'http://localhost:5173', // Your local dev environment
  'http://localhost:3000',
  'http://localhost:8001', // <-- THIS IS THE FIX (Python server)
  'http://[::]:8001',// Your test.html server
  prodOrigin,               // Your live site
  deployPreviewOrigin,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o => 
        typeof o === 'string' ? o === origin : o.test(o)
    )) {
      callback(null, true);
    } else {
      console.error('CORS Error: This origin is not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // For legacy browsers
};

// 3. Use the full CORS configuration
app.use(cors(corsOptions));
// 4. Explicitly handle pre-flight OPTIONS requests
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
    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
