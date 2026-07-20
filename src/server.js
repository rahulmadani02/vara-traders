// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Basic protection against brute-forcing login/register.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// rahul: frontend is now the React app (client/) — Express only serves its
// production build plus the /images folder (photos aren't part of the
// client bundle, so they stay served straight from public/images).
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// Fallback 404 for unknown API routes (keep this after static + routes)
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// Any other GET request (not /api, not a real static file) is a client-side
// route — hand it to the React app so react-router can render it (including
// its own not-found page). Express 5's path-to-regexp rejects a bare '*'
// pattern, so this uses app.use (no path) instead, same as the old 404
// fallback did.
app.use((_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Vara Traders server running at http://localhost:${PORT}`);
});