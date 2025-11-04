// index.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const experimentRoutes = require('./routes/experimentRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Basic env validation
 */
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set in environment');
  process.exit(1);
}

/**
 * Trust proxy if behind Render / Netlify / other proxies
 * Use 1 if you are behind a single proxy (common on Render)
 */
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

/**
 * Production origin(s)
 * Put your production origin in .env for flexible deployments:
 *   PROD_ORIGIN=https://tangerine-lily-5aaf71.netlify.app
 */
const prodOrigin = process.env.PROD_ORIGIN || 'https://tangerine-lily-5aaf71.netlify.app';
const deployPreviewRegex = /^https:\/\/([a-z0-9\-]+)--tangerine-lily-5aaf71\.netlify\.app$/;

/**
 * Allowed origins
 * - Allows any localhost port via regex (http)
 * - Keeps previously allowed dev ports and production origins
 */
const allowedOrigins = [
  /^https?:\/\/localhost(?::\d+)?$/,  // allow any localhost port (http)
  'http://localhost:5173',
  'http://localhost:3000',
  prodOrigin,
  deployPreviewRegex,
];

/**
 * CORS options
 * - Uses a RegExp-aware check
 * - Allows non-browser server-to-server calls where origin is undefined
 * - (Optional) special-case for "null" while debugging local file:// testing, gated by ALLOW_NULL_ORIGIN
 */
const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser requests (curl/postman/server-to-server) which send no Origin header
    if (!origin) return callback(null, true);

    // NOTE: origin === 'null' occurs when page is loaded from file:// — avoid relying on this in production.
    if (origin === 'null' && process.env.ALLOW_NULL_ORIGIN === '1') {
      console.warn('Allowing null origin for local file:// testing (ALLOWED via ALLOW_NULL_ORIGIN=1)');
      return callback(null, true);
    }

    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );

    if (allowed) return callback(null, true);

    console.error('CORS Error: This origin is not allowed:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
  credentials: false // set true only if you need cookies
};

// Middleware: security, logging, parsing
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// IMPORTANT: register CORS before routes so preflight and CORS headers are applied
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight handler

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporary request logger to help debug origins — remove in production if verbose
if (process.env.REQUEST_LOG === '1') {
  app.use((req, res, next) => {
    console.log('[REQUEST]', req.method, req.originalUrl, 'Origin:', req.get('origin'));
    next();
  });
}

// Serve static files from public (agent.js should live here)
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes (registered after CORS middleware) ---
app.use('/api/experiments', experimentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Serve agent.js explicitly with correct content-type and CORS headers.
 * This is optional if agent.js lives in /public, but explicit route gives control.
 */
app.get('/agent.js', cors(corsOptions), (req, res) => {
  const filePath = path.join(__dirname, 'public', 'agent.js');
  res.type('application/javascript');
  res.sendFile(filePath, err => {
    if (err) {
      console.error('Error sending agent.js:', err);
      res.sendStatus(500);
    }
  });
});

// Centralized error handler (JSON)
app.use((err, req, res, next) => {
  console.error('[ERROR]', err && err.message ? err.message : err);
  const status = err && err.status ? err.status : 500;
  // If CORS error, you might prefer to send 403
  if (err && err.message && err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ error: 'CORS Error: Origin not allowed' });
  }
  res.status(status).json({ error: err.message || 'Server Error' });
});

/** Connect to DB and start server */
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
