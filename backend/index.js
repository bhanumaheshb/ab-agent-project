// backend/index.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Route imports
const experimentRoutes = require('./routes/experimentRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

/* ---------- Basic env validation ---------- */
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set in environment');
  process.exit(1);
}

/* ---------- Proxy & environment tuning ---------- */
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

/* ---------- Allowed Origins ---------- */
const prodOrigin = process.env.PROD_ORIGIN || 'https://ab-agent-project.vercel.app';

// ✅ Updated regex to match all Vercel preview deployments
const vercelPreviewRegex = /^https:\/\/ab-agent-project-[a-z0-9]+-bhanumaheshbs-projects\.vercel\.app$/;

const allowedOrigins = [
  // Local
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8001',

  // Production domains
  prodOrigin,
  'https://ab-agent-project.vercel.app',
  'https://ab-agent-project-bhanumaheshbs-projects.vercel.app',
  'https://ab-agent-project-ch5ahi3dd-bhanumaheshbs-projects.vercel.app', // ✅ current one

  // All preview builds
  vercelPreviewRegex,

  // Optional Netlify domain
  /^https:\/\/[a-z0-9\-]+--tangerine-lily-5aaf71\.netlify\.app$/,
  'https://tangerine-lily-5aaf71.netlify.app',

  // Generic platforms
  /^https:\/\/[a-z0-9\-]+\.web\.app$/,
  /^https:\/\/[a-z0-9\-]+\.firebaseapp\.com$/,
  /^https:\/\/[a-z0-9\-]+\.appspot\.com$/,
  /^https:\/\/[a-z0-9\-]+\.github\.io$/,
  /^https:\/\/[a-z0-9\-]+\.github\.io\/[a-z0-9\-]+$/,
  /^https:\/\/sites\.google\.com\/.*/,
  /^https:\/\/[a-z0-9\-]+\.onrender\.com$/,

  // Cloud workstations (for development)
  'https://6000-firebase-studio-1762339781050.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev',
];

/* ---------- CORS configuration ---------- */
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );

    if (allowed) {
      console.log(`✅ CORS allowed for: ${origin}`);
      return callback(null, true);
    } else {
      console.error(`❌ CORS Error: Origin not allowed -> ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

/* ---------- Middleware ---------- */
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching to avoid stale data
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

/* ---------- Serve agent.js with proper headers ---------- */
app.get('/agent.js', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'agent.js');
  const origin = req.get('origin');

  if (
    origin &&
    allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.removeHeader('Content-Security-Policy');

  res.type('application/javascript');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending agent.js:', err);
      res.sendStatus(500);
    }
  });
});

/* ---------- Static & API routes ---------- */
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/experiments', experimentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

/* ---------- Health check ---------- */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message || err);
  const status = err.message?.includes('CORS') ? 403 : err.status || 500;
  res.status(status).json({ error: err.message || 'Server Error' });
});

/* ---------- Start Server ---------- */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
