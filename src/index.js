/**
 * SWAGCLAW - Main Entry Point
 * Backend API service with specialized AI integrations
 */

// Logger must be required first — it intercepts console methods
require('./services/logger');

require('dotenv').config();
const express = require('express');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import services
const databaseService = require('./services/database');
const apiService      = require('./services/api');
const authService     = require('./services/auth');
const discordService  = require('./services/discord');
const heartbeat       = require('./services/heartbeat');
const autoRepair      = require('./services/auto-repair');
const dashboard       = require('./dashboard');

// Serve static assets
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Kings Dripping Swag Agency Hub (Main Landing)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'agency.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiService.router);

// Auto-Activate OS Voice Endpoint
app.post('/api/activate-voice', async (req, res) => {
  try {
    const voice = require('./services/voice');
    await voice.speak("System initialized. Antigravity online. Welcome back to the Hub, Architect.");
    res.json({ success: true, message: "Voice activated locally." });
  } catch (err) {
    console.error("Voice Activation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- CONTENT LAB ---
app.get('/lab/prompter', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'prompter.html'));
});

// Command Center Dashboard
app.use('/dashboard', dashboard);

// Start server
async function startServer() {
  try {
    // Connect to database
    const dbConnected = await databaseService.connect();
    if (dbConnected) {
      console.log('✓ Database (Supabase) connected');
    } else {
      console.log('⚠ Database offline — only session-based features available');
    }

    // Initialize auth service
    await authService.initialize();
    console.log('✓ Auth service active');

    // Initialize Discord service
    const discordReady = await discordService.initialize();
    if (discordReady) {
      console.log('✓ Discord service active');
      
      // Start heartbeat (proactive AI assistant)
      heartbeat.start();

      // Start Auto-Repair System
      autoRepair.start();
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 SWAGCLAW running on http://localhost:${PORT}`);
      console.log(`📊 Command Center → http://localhost:${PORT}/dashboard`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

startServer();

module.exports = app;
