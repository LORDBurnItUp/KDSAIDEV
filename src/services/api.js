/**
 * API Service
 * Handles external API calls and integrations
 * 
 * Supported integrations:
 * - REST APIs
 * - GraphQL endpoints
 * - Webhooks
 */

const axios = require('axios');
const express = require('express');
const rateLimit = require('express-rate-limit');
const discordService = require('./discord');
const openclawService = require('./openclaw');
const databaseService = require('./database');
const authService = require('./auth');

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';
const API_KEY = process.env.API_KEY;
const API_TIMEOUT = process.env.API_TIMEOUT || 10000;

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 */
async function get(endpoint, params = {}) {
  return apiClient.get(endpoint, { params });
}

/**
 * Generic POST request
 */
async function post(endpoint, data = {}) {
  return apiClient.post(endpoint, data);
}

/**
 * Generic PUT request
 */
async function put(endpoint, data = {}) {
  return apiClient.put(endpoint, data);
}

/**
 * Generic DELETE request
 */
async function remove(endpoint) {
  return apiClient.delete(endpoint);
}

// Example: Create Express router with routes
const router = express.Router();

// Rate limiter for lead submissions (prevent spam)
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 submissions per window per IP
  message: { error: 'Too many submissions, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
const googleKeepService = require('./googlekeep');
const ollamaService = require('./ollama');
const heartbeatService = require('./heartbeat');

// Example API route
router.get('/data', async (req, res) => {
  try {
    const response = await get('/data');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Post data to external API
router.post('/sync', async (req, res) => {
  try {
    const response = await post('/sync', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Discord notification route
router.post('/notify', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const success = await discordService.sendMessage(message);
    if (success) {
      res.json({ status: 'sent' });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * OpenClaw Command Processing
 */
router.post('/openclaw', async (req, res) => {
  try {
    const { command, context } = req.body;
    if (!command) return res.status(400).json({ error: 'Command is required' });
    
    const result = await openclawService.processCommand(`${command}: ${context || ''}`);
    res.json({ result, status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generic Chat Endpoint
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    const response = await openclawService.processCommand(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Token Usage Stats ─────────────────────────────────────────────────────────
router.get('/stats/tokens', authService.authenticate, (req, res) => {
  res.json({
    tokens: openclawService.getTokenStats(),
    circuitBreaker: openclawService.getCircuitBreakerStatus()
  });
});

// ── Google Keep ───────────────────────────────────────────────────────────────
router.get('/keep/notes', authService.authenticate, async (req, res) => {
  try {
    const notes = await googleKeepService.listNotes();
    res.json({ count: notes.length, notes });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.get('/keep/search', authService.authenticate, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q param required' });
  try {
    const results = await googleKeepService.searchNotes(q);
    res.json({ count: results.length, results });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.post('/keep/notes', authService.authenticate, async (req, res) => {
  const { title, body } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const note = await googleKeepService.createNote(title, body || '');
    res.json(note);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.delete('/keep/notes/:id', authService.authenticate, async (req, res) => {
  try {
    await googleKeepService.deleteNote(`notes/${req.params.id}`);
    res.json({ status: 'deleted' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.get('/keep/dump', authService.authenticate, async (req, res) => {
  try {
    const dump = await googleKeepService.dumpAllNotes();
    res.type('text/plain').send(dump);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.get('/keep/health', authService.authenticate, async (req, res) => {
  const result = await googleKeepService.healthCheck();
  res.status(result.ok ? 200 : 503).json(result);
});

// ── Ollama (Local Free AI) ───────────────────────────────────────────────
router.get('/ollama/health', authService.authenticate, async (req, res) => {
  const result = await ollamaService.healthCheck();
  res.status(result.ok ? 200 : 503).json(result);
});

router.get('/ollama/models', authService.authenticate, async (req, res) => {
  const models = await ollamaService.listModels();
  res.json({ count: models.length, models });
});

router.post('/ollama/chat', authService.authenticate, async (req, res) => {
  const { message, model } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    const response = await ollamaService.chat(
      [{ role: 'user', content: message }],
      model || ollamaService.DEFAULT_MODEL
    );
    res.json({ response, model: model || ollamaService.DEFAULT_MODEL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Heartbeat (Proactive AI) ───────────────────────────────────────────
router.get('/heartbeat/status', authService.authenticate, (req, res) => {
  res.json(heartbeatService.getStatus());
});

router.post('/heartbeat/trigger', authService.authenticate, async (req, res) => {
  try {
    await heartbeatService.trigger();
    res.json({ status: 'triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/heartbeat/enable', authService.authenticate, (req, res) => {
  heartbeatService.setEnabled(true);
  res.json({ status: 'enabled' });
});

router.post('/heartbeat/disable', authService.authenticate, (req, res) => {
  heartbeatService.setEnabled(false);
  res.json({ status: 'disabled' });
});

/**
 * Lead Capture for Agency Customers
 */
router.post('/leads', leadLimiter, async (req, res) => {
  const { name, email, project } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  // Input length validation to prevent abuse
  const MAX_FIELD_LENGTH = 500;
  if (name?.length > MAX_FIELD_LENGTH || email?.length > MAX_FIELD_LENGTH || project?.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ error: 'Input too long - maximum 500 characters per field' });
  }

  const db = databaseService.getDb();
  if (!db) return res.status(503).json({ error: 'Database offline' });

  try {
    const { data, error } = await db.from('agency_leads').upsert([
      { 
        email, 
        name, 
        project, 
        ts: new Date().toISOString(),
        status: 'new'
      }
    ], { 
      onConflict: 'email',
      ignoreDuplicates: false
    });
    if (error) throw error;
    res.json({ status: 'success', message: 'Mission briefing received. Douglas is analyzing.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  apiClient,
  get,
  post,
  put,
  remove,
  router
};
