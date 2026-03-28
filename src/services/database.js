/**
 * Database Service
 * Handles database connections and operations using Supabase (PostgreSQL)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;
let isConnected = false;
let reconnectTimer = null;
const RECONNECT_INTERVAL = 30000; // 30 seconds

/**
 * Connect to Supabase
 */
async function connect() {
  if (isConnected && supabase) {
    return true;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠ Supabase credentials missing in .env');
    console.log('⚠ Continuing in "offline mode" without database...');
    scheduleReconnect();
    return false;
  }

  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Verify connectivity by making a simple metadata request
    // The Supabase client doesn't validate credentials until you make a request
    // Basic sanity check for URL format
    if (!SUPABASE_URL.startsWith('https://')) {
      throw new Error('Invalid Supabase URL format - must start with https://');
    }
    
    // Check key is not empty and looks like a JWT (basic validation)
    if (!SUPABASE_KEY || SUPABASE_KEY.length < 20) {
      throw new Error('Invalid Supabase key - appears to be malformed');
    }
    
    // Make a simple auth request to verify connectivity (doesn't require specific table)
    const { error } = await supabase.auth.getSession();
    if (error && !error.message.includes('invalid JWT')) {
      // Only fail on real auth errors, not missing tables
      throw error;
    }
    
    isConnected = true;
    console.log('✓ Supabase (PostgreSQL) service initialized');
    
    // Clear any pending reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    return true;
  } catch (error) {
    console.error('✗ Supabase connection error:', error.message);
    scheduleReconnect();
    return false;
  }
}

/**
 * Schedule a reconnection attempt
 */
function scheduleReconnect() {
  if (reconnectTimer) return; // Already scheduled
  
  console.log(`💤 Scheduling database reconnect in ${RECONNECT_INTERVAL / 1000}s...`);
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (!isConnected) {
      console.log('🔄 Attempting database reconnection...');
      await connect();
    }
  }, RECONNECT_INTERVAL);
}

/**
 * Get Supabase instance
 */
function getDb() {
  return supabase;
}

/**
 * Disconnect (No-op for Supabase JS client but kept for interface consistency)
 */
async function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  isConnected = false;
  supabase = null;
  console.log('Database service disconnected');
}

/**
 * Check if database is connected
 */
function checkConnected() {
  return isConnected;
}

module.exports = {
  connect,
  disconnect,
  getDb,
  checkConnected,
  isConnected: () => isConnected
};
