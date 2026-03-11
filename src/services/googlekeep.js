/**
 * Google Keep Service
 * Reads/writes Google Keep notes via Google Tasks API + OAuth2
 *
 * NOTE: Google Keep has no official public API. This service uses:
 *   - gkeepapi (unofficial Python lib) — not available in Node
 *   - Google Tasks API as a structured alternative
 *   - Google OAuth2 for authentication
 *
 * SETUP (one-time):
 *   1. Go to console.cloud.google.com → Create project → Enable "Google Keep API" (if available)
 *      OR enable "Tasks API" as a structured notes alternative
 *   2. Create OAuth2 credentials → Web app type
 *   3. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET to .env
 *   4. Run: node src/services/googlekeep.js --auth   to get your refresh token
 *   5. Add GOOGLE_REFRESH_TOKEN to .env
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { URL } = require('url');

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:9876/callback';

let accessToken = null;
let tokenExpiry = 0;

// ── OAuth2 ────────────────────────────────────────────────────────────────────

/**
 * Get a fresh access token using the stored refresh token
 */
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry - 60000) return accessToken;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Google OAuth2 credentials not configured. See setup instructions in googlekeep.js');
  }

  const res = await axios.post('https://oauth2.googleapis.com/token', null, {
    params: {
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type:    'refresh_token'
    }
  });

  accessToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in * 1000);
  return accessToken;
}

/**
 * One-time OAuth2 flow — run with: node src/services/googlekeep.js --auth
 * Opens browser for Google login, captures refresh token
 */
async function runAuthFlow() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('✗ Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first');
    process.exit(1);
  }

  const SCOPES = [
    'https://www.googleapis.com/auth/keep',
    'https://www.googleapis.com/auth/tasks'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;

  console.log('\n🔐 Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\nWaiting for callback on http://localhost:9876 ...\n');

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:9876');
        const code = url.searchParams.get('code');
        if (!code) { res.end('No code'); return; }

        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
          params: {
            code,
            client_id:     CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri:  REDIRECT_URI,
            grant_type:    'authorization_code'
          }
        });

        const { refresh_token } = tokenRes.data;
        if (!refresh_token) {
          console.warn('⚠ No refresh_token returned. You may need to revoke access and re-authenticate.');
          res.end('Auth failed: No refresh token returned');
          server.close();
          reject(new Error('No refresh token returned'));
          return;
        }
        console.log('\n✓ Auth successful! Add this to your .env:\n');
        console.log(`GOOGLE_REFRESH_TOKEN=${refresh_token}\n`);
        console.log('💡 Manually add GOOGLE_REFRESH_TOKEN to your .env file (auto-write disabled for security)');

        /*
         * SECURITY: Removed auto-write to .env file
         * Writing credentials automatically is a security risk.
         * Users should manually add the refresh token to their .env file.
         */

        res.end('<h2>✓ Auth complete! Copy the token from your terminal and add it to .env</h2>');
        server.close();
        resolve(refresh_token);
      } catch (err) {
        res.end('Auth failed: ' + err.message);
        reject(err);
      }
    });
    server.listen(9876);
  });
}

// ── Keep API ──────────────────────────────────────────────────────────────────

/**
 * List all notes from Google Keep
 */
async function listNotes() {
  const token = await getAccessToken();
  try {
    const res = await axios.get('https://keep.googleapis.com/v1/notes', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { pageSize: 100 }
    });
    return res.data.notes || [];
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error('Keep listNotes error:', msg);
    throw new Error(msg);
  }
}

/**
 * Search notes by text content
 */
async function searchNotes(query) {
  const notes = await listNotes();
  const q = query.toLowerCase();
  return notes.filter(note => {
    const title = note.title?.toLowerCase() || '';
    const body = note.body?.text?.text?.toLowerCase() || '';
    return title.includes(q) || body.includes(q);
  });
}

/**
 * Create a new note
 */
async function createNote(title, body) {
  const token = await getAccessToken();
  const res = await axios.post('https://keep.googleapis.com/v1/notes', {
    title,
    body: { text: { text: body } }
  }, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return res.data;
}

/**
 * Delete a note by ID
 */
async function deleteNote(noteId) {
  const token = await getAccessToken();
  await axios.delete(`https://keep.googleapis.com/v1/${noteId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return true;
}

/**
 * Dump all notes as plain text (for memory seeding)
 */
async function dumpAllNotes() {
  const notes = await listNotes();
  return notes.map(n => {
    const title = n.title || '(untitled)';
    const body  = n.body?.text?.text || n.body?.list?.listItems?.map(i => `- ${i.text.text}`).join('\n') || '';
    return `## ${title}\n${body}`;
  }).join('\n\n---\n\n');
}

/**
 * Check if Google Keep is configured and reachable
 */
async function healthCheck() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return { ok: false, reason: 'OAuth2 credentials not configured' };
  }
  try {
    await getAccessToken();
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

module.exports = {
  listNotes,
  searchNotes,
  createNote,
  deleteNote,
  dumpAllNotes,
  healthCheck,
  runAuthFlow
};

// Run auth flow if called directly: node src/services/googlekeep.js --auth
if (require.main === module && process.argv.includes('--auth')) {
  require('dotenv').config();
  runAuthFlow().then(() => process.exit(0)).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
