/**
 * Heartbeat Service — Proactive AI Assistant
 * 
 * Periodically sends messages to the user via Discord
 * to learn more about them and improve assistance.
 * 
 * Based on OpenClaw's heartbeat configuration (every 30m)
 */

const openclawService = require('./openclaw');
const discordService = require('./discord');
const memoryService = require('./memory');

// Heartbeat interval (default: 30 minutes like OpenClaw)
const HEARTBEAT_INTERVAL = parseInt(process.env.HEARTBEAT_INTERVAL_MS) || (30 * 60 * 1000);

// Whether heartbeat is enabled
let heartbeatEnabled = process.env.HEARTBEAT_ENABLED === 'true';
let heartbeatInterval = null;
let lastHeartbeat = 0;

/**
 * Prompts the AI uses to start conversations
 * These help Douglas learn about the user
 */
const HEARTBEAT_PROMPTS = [
  "What's the most interesting project you're working on right now?",
  "Have you discovered anything new about AI agents lately?",
  "What's one thing I could help you automate today?",
  "Any questions about your code or setup?",
  "How's your day going? Anything exciting?",
  "I've been thinking about optimization — want to discuss?",
  "What's your focus area today?",
  "Any blockers I can help you overcome?",
  "I learned something new about Ollama integration — want to hear?",
  "What's the coolest thing you've built recently?",
];

/**
 * Start the heartbeat service
 * Sends proactive messages at regular intervals
 */
function start() {
  if (heartbeatInterval) {
    console.log('Heartbeat already running');
    return;
  }
  
  if (!heartbeatEnabled) {
    console.log('Heartbeat is disabled. Set HEARTBEAT_ENABLED=true to enable.');
    return;
  }
  
  console.log(`💓 Heartbeat starting (every ${HEARTBEAT_INTERVAL / 60000} minutes)`);
  
  // Initial heartbeat after 2 minutes
  setTimeout(async () => {
    try {
      await sendHeartbeat();
    } catch (err) {
      console.error('💓 Initial heartbeat error:', err.message);
    }
  }, 2 * 60 * 1000);
  
  // Regular heartbeats
  heartbeatInterval = setInterval(async () => {
    try {
      await sendHeartbeat();
    } catch (err) {
      console.error('💓 Heartbeat interval error:', err.message);
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * Stop the heartbeat service
 */
function stop() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log('💓 Heartbeat stopped');
  }
}

/**
 * Send a heartbeat message
 * Uses AI to generate a contextual prompt
 */
async function sendHeartbeat() {
  // Check if Discord is ready
  if (!discordService.isReady()) {
    console.log('💓 Heartbeat skipped: Discord not connected');
    return;
  }
  
  // Rate limit: don't send too frequently
  const now = Date.now();
  if (now - lastHeartbeat < HEARTBEAT_INTERVAL * 0.8) {
    console.log('💓 Heartbeat skipped: too soon since last');
    return;
  }
  
  lastHeartbeat = now;
  
  try {
    // Get user context from memory
    let userContext = 'No prior context';
    try {
      const memories = await memoryService.list();
      userContext = memories.length > 0 
        ? `User info: ${memories.slice(0, 5).map(m => `${m.key}: ${JSON.stringify(m.value)}`).join(', ')}`
        : 'No prior context';
    } catch (memErr) {
      console.warn('💓 Could not load memories:', memErr.message);
    }
    
    // Generate a contextual message
    const prompt = `You are Douglas, a proactive AI assistant. 
${userContext}

Generate a SHORT, friendly message (1-2 sentences max) that:
1. Shows genuine interest in the user
2. Asks a question to learn more about them
3. Is conversational, not robotic

Pick from these topics or create your own:
- Their current projects
- AI/technology interests  
- How you can help them today
- Something interesting you noticed

Response:`;
    
    const response = await openclawService.processCommand(prompt);
    
    if (response && response.length < 500) {
      await discordService.sendMessage(`💓 *Heartbeat* — ${response}`);
      console.log('💓 Heartbeat sent');
    } else {
      // Fallback to random prompt
      const randomPrompt = HEARTBEAT_PROMPTS[Math.floor(Math.random() * HEARTBEAT_PROMPTS.length)];
      await discordService.sendMessage(`💓 *Heartbeat* — ${randomPrompt}`);
      console.log('💓 Heartbeat sent (fallback)');
    }
  } catch (err) {
    console.error('💓 Heartbeat error:', err.message);
    // Send fallback message on error
    try {
      const randomPrompt = HEARTBEAT_PROMPTS[Math.floor(Math.random() * HEARTBEAT_PROMPTS.length)];
      await discordService.sendMessage(`💓 *Heartbeat* — ${randomPrompt}`);
    } catch (e) {
      console.error('💓 Fallback heartbeat also failed:', e.message);
    }
  }
}

/**
 * Manually trigger a heartbeat
 */
async function trigger() {
  await sendHeartbeat();
}

/**
 * Get heartbeat status
 */
function getStatus() {
  return {
    enabled: heartbeatEnabled,
    interval: HEARTBEAT_INTERVAL,
    lastHeartbeat: lastHeartbeat,
    running: !!heartbeatInterval
  };
}

/**
 * Enable/disable heartbeat
 */
function setEnabled(enabled) {
  heartbeatEnabled = enabled;
  if (enabled && !heartbeatInterval) {
    start();
  } else if (!enabled && heartbeatInterval) {
    stop();
  }
}

module.exports = {
  start,
  stop,
  trigger,
  getStatus,
  setEnabled,
  HEARTBEAT_INTERVAL
};
