/**
 * Logger Service — Central activity hub
 * Captures all console output + emits structured events to SSE clients
 */

const { EventEmitter } = require('events');

const hub = new EventEmitter();
hub.setMaxListeners(50);

const MAX_LOG = 200;
const activityLog = [];
const startTime = Date.now();

function push(level, source, message) {
  const entry = {
    ts:      Date.now(),
    level,   // info | warn | error | success | ai
    source,  // server | discord | openclaw | database | auth | api
    message: String(message).substring(0, 500)
  };
  activityLog.push(entry);
  if (activityLog.length > MAX_LOG) activityLog.shift();
  hub.emit('activity', entry);
}

// ── Intercept console methods ─────────────────────────────────────────────────
const _log   = console.log.bind(console);
const _warn  = console.warn.bind(console);
const _error = console.error.bind(console);

function detectSource(msg) {
  if (/discord|bot|guild|message|webhook/i.test(msg)) return 'discord';
  if (/groq|gemini|anthropic|openai|openrouter|douglas|openclaw|token|query/i.test(msg)) return 'openclaw';
  if (/supabase|database|db/i.test(msg)) return 'database';
  if (/auth|jwt/i.test(msg)) return 'auth';
  if (/api request|api response/i.test(msg)) return 'api';
  return 'server';
}

console.log = (...args) => {
  _log(...args);
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
  push('info', detectSource(msg), msg);
};

console.warn = (...args) => {
  _warn(...args);
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
  push('warn', detectSource(msg), msg);
};

console.error = (...args) => {
  _error(...args);
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
  push('error', detectSource(msg), msg);
};

function log(source, message)   { push('info',    source, message); }
function warn(source, message)  { push('warn',    source, message); }
function error(source, message) { push('error',   source, message); }
function success(source, msg)   { push('success', source, msg); }
function ai(source, message)    { push('ai',      source, message); }

function getLog()     { return [...activityLog]; }
function getUptime()  { return Date.now() - startTime; }
function getHub()     { return hub; }

module.exports = { log, warn, error, success, ai, getLog, getUptime, getHub, push };
