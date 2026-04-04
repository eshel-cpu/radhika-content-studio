/**
 * server.js — Radhika Content Studio
 *
 * Password-protected web app for Satya to create Radhika Instagram content
 * using Claude AI + the Super Claude Knowledge Base.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./src/routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Auth middleware — protects all /api routes except /health
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
if (ACCESS_TOKEN) {
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    const token = req.headers['x-access-token'] || (req.headers['authorization'] || '').replace('Bearer ', '');
    if (token !== ACCESS_TOKEN) return res.status(401).json({ error: 'unauthorized' });
    next();
  });
  console.log('[radhika-studio] Auth enabled');
} else {
  console.log('[radhika-studio] Auth DISABLED — set ACCESS_TOKEN env var');
}

app.use('/api', routes);

// Serve React dashboard
const dashboardPath = path.join(__dirname, 'dashboard/dist');
if (fs.existsSync(dashboardPath)) {
  app.use(express.static(dashboardPath, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-store');
    },
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(dashboardPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      service: 'radhika-content-studio',
      status: 'running',
      note: 'Dashboard not built yet. Run: cd dashboard && npm install && npm run build',
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[radhika-studio] Running on port ${PORT}`);
  console.log(`[radhika-studio] KB: ${process.env.KB_RAILWAY_URL || '(not set)'}`);
  console.log(`[radhika-studio] Coordinator: ${process.env.COORDINATOR_URL || '(not set)'}`);
});

// Keep-alive — ping self every 4 minutes to prevent Railway cold starts
setInterval(async () => {
  try {
    const url = `http://localhost:${PORT}/api/health`;
    const res = await fetch(url);
    if (res.ok) console.log('[radhika-studio] keep-alive ping ok');
  } catch (e) {
    console.log('[radhika-studio] keep-alive ping failed:', e.message);
  }
}, 4 * 60 * 1000);
