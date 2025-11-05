// index.js (fixed + safer helmet + robust error handling)
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
 * Trust proxy if behind Render / Netlify / Vercel
 */
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

/**
 * Production origin (your frontend)
 */
const prodOrigin = process.env.PROD_ORIGIN || 'https://ab-agent-project.vercel.app';

/**
 * Netlify preview regex example (keep if you ever use Netlify)
 */
const deployPreviewRegex = /^https:\/\/([a-z0-9\-]+)--tangerine-lily-5aaf71\.netlify\.app$/;

/**
 * Utility: parse EXTRA_ALLOWED_ORIGINS from .env (comma-separated)
 */
const parseExtraOrigins = (csv) => {
  if (!csv) return [];
  return csv.split(',').map(s => s.trim()).filter(Boolean);
};
const extraOrigins = parseExtraOrigins(process.env.EXTRA_ALLOWED_ORIGINS);

/**
 * Hosted origin patterns — includes major hosts + Google + Vercel + your prod link
 * (kept exactly as provided)
 */
const hostedOriginPatterns = [
  // Local dev
  /^https?:\/\/localhost(?::\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8001',

  // Your new production frontend
  prodOrigin,

  // Vercel (production + preview)
  /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/,
  /^https?:\/\/([a-z0-9-]+\.)?vercel\.dev$/,
  /^https:\/\/ab-agent-project\.vercel\.app$/,

  // Netlify (if used)
  /^https?:\/\/([a-z0-9-]+\.)?netlify\.app$/,
  /^https?:\/\/([a-z0-9-]+\.)?netlify\.com$/,
  deployPreviewRegex,

  // GitHub Pages
  /^https?:\/\/([a-z0-9-]+\.)?github\.io$/,

  // Firebase / web.app
  /^https?:\/\/([a-z0-9-]+\.)?firebaseapp\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?web\.app$/,
  'https://6000-firebase-studio-1762339781050.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev',

  // AWS / CloudFront
  /^https?:\/\/([a-z0-9-]+\.)?s3\.amazonaws\.com/,
  /^https?:\/\/([a-z0-9-]+\.)?cloudfront\.net/,
  /^https?:\/\/([a-z0-9-]+\.)?amazonaws\.com/,

  // Surge / Cloudflare Pages / Render / Fly.io
  /^https?:\/\/([a-z0-9-]+\.)?surge\.sh$/,
  /^https?:\/\/([a-z0-9-]+\.)?pages\.dev$/,
  /^https?:\/\/([a-z0-9-]+\.)?herokuapp\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?render\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?fly\.io$/,

  // --- Google-hosted ---
  /^https?:\/\/[a-z0-9-]+\.appspot\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?googleusercontent\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?googleapis\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?gstatic\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?storage\.googleapis\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?blogspot\.com$/,
  /^https?:\/\/accounts\.google\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)?google\.com$/,
];

// Merge extra origins from .env if any
for (const orig of extraOrigins) {
  if (orig.startsWith('/') && orig.endsWith('/')) {
    try {
      const body = orig.slice(1, -1);
      hostedOriginPatterns.push(new RegExp(body));
    } catch {
      console.warn('Invalid regex in EXTRA_ALLOWED_ORIGINS, ignoring:', orig);
    }
  } else {
    hostedOriginPatterns.push(orig);
  }
}

/**
 * CORS options
 */
const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser requests (curl/postman/server-to-server) which send no Origin header
    if (!origin) return callback(null, true);

    // allow file:// testing if enabled
    if (origin === 'null' && process.env.ALLOW_NULL_ORIGIN === '1') {
      console.warn('Allowing null origin for local file:// testing (ALLOW_NULL_ORIGIN=1)');
      return callback(null, true);
    }

    // global allow toggle for dev only
    if (process.env.ALLOW_ALL_HOSTED_ORIGINS === '1') {
      if (/^https?:\/\//.test(origin)) return callback(null, true);
      return callback(new Error('Invalid origin scheme'));
    }

    const allowed = hostedOriginPatterns.some(o => {
      if (typeof o === 'string') return o === origin;
      if (o instanceof RegExp) return o.test(origin);
      return false;
    });

    if (allowed) return callback(null, true);

    console.error('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
  credentials: false
};

/**
 * Use Helmet but disable global CSP/COOP/CORP that can block cross-origin script loads.
 * We will set controlled headers only for /agent.js response.
 *
 * This keeps other Helmet protections but avoids the automatic CSP/COOP/CORP that caused blocking.
 */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// Logging + CORS + body parsing
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional request logger (enable via env)
if (process.env.REQUEST_LOG === '1') {
  app.use((req, res, next) => {
    console.log('[REQUEST]', req.method, req.originalUrl, 'Origin:', req.get('origin'));
    next();
  });
}

/**
 * Health / readiness endpoint (useful for Render / load balancers)
 */
app.get('/healthz', async (req, res) => {
  try {
    const mongoState = mongoose.connection.readyState; // 1 = connected
    if (mongoState !== 1) {
      return res.status(503).json({ status: 'fail', mongoState });
    }
    return res.status(200).json({ status: 'ok', time: new Date().toISOString(), mongoState });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: String(err) });
  }
});

// Keep root friendly
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ab-agent-backend', time: new Date().toISOString() });
});

// Serve static files (for agent.js and other public assets)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/experiments', experimentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Serve agent.js with safe relaxed headers (only for this file).
 * This avoids global header changes and keeps it explicit and auditable.
 */
app.get('/agent.js', cors(corsOptions), (req, res) => {
  const filePath = path.join(__dirname, 'public', 'agent.js');
  const reqOrigin = req.get('origin');

  if (reqOrigin) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    res.setHeader('Vary', 'Origin');
  } else {
    // scripts often have no Origin header; allow by default for non-browser clients
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Allow cross-origin resource loading for this JS file
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  // Less strict COOP for embed/test scenarios
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Response-level CSP tailored for agent.js only (whitelist explicit origins)
  const allowedScriptSrc = [
    "'self'",
    "'unsafe-inline'",
    prodOrigin,
    'https://backend-service-0d12.onrender.com',
    'http://127.0.0.1:8001'
  ].join(' ');

  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; script-src ${allowedScriptSrc}; connect-src 'self' https://backend-service-0d12.onrender.com ${prodOrigin}; img-src 'self' data:; style-src 'self' 'unsafe-inline'; object-src 'none';`
  );

  res.type('application/javascript');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending agent.js:', err);
      try { res.sendStatus(500); } catch (e) {}
    }
  });
});

// Centralized JSON error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err && err.message ? err.message : err);
  const status = err && err.status ? err.status : 500;
  if (err && err.message && err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ error: 'CORS Error: Origin not allowed' });
  }
  res.status(status).json({ error: err.message || 'Server Error' });
});

/**
 * Improve stability: log uncaught errors and rejections so we can debug crashes.
 * In production you might want to exit and restart — Render will restart on process exit.
 */
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('UNHANDLED REJECTION at:', p, 'reason:', reason);
});

/** Connect to MongoDB and start server (modern connect without deprecated flags) */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Allowed frontend: ${prodOrigin}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

