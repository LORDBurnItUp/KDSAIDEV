/**
 * SWAGCLAW Command Center
 * Real-time dashboard with live logs, terminal, and Douglas AI chat
 * Served at /dashboard
 */

const express    = require('express');
const { spawn }  = require('child_process');
const path       = require('path');
const router     = express.Router();
const logger     = require('./services/logger');
const openclaw   = require('./services/openclaw');
const discord    = require('./services/discord');
const database   = require('./services/database');

// Safe command whitelist for the terminal
const ALLOWED_CMDS = {
  'npm test':          ['npm', ['test']],
  'npm run dev':       ['npm', ['run', 'dev']],
  'npm start':         ['npm', ['start']],
  'npm install':       ['npm', ['install']],
  'git status':        ['git', ['status']],
  'git log':           ['git', ['log', '--oneline', '-15']],
  'git diff':          ['git', ['diff', '--stat']],
  'node --version':    ['node', ['--version']],
  'npm --version':     ['npm',  ['--version']],
  'ls src':            ['ls',   ['src']],
  'ls src/services':   ['ls',   ['src/services']],
};

// Whitelist of safe env vars to pass to terminal commands
const SAFE_ENV_VARS = [
  'PATH', 'PATHEXT', 'TEMP', 'TMP', 'HOME', 'USERPROFILE',
  'NODE_ENV', 'npm_config_*'
];

/**
 * Sanitize environment variables for terminal commands
 * Removes sensitive keys while preserving safe ones
 */
function sanitizeEnv(env) {
  const safeEnv = {};
  const sensitivePatterns = [
    /^(API|KEY|SECRET|PASS|TOKEN|JWT|AUTH|CRED|PRIVATE)/i,
    /^(SUPABASE|MONGO|POSTGRES|DATABASE)/i,
    /^DISCORD_/, /^OPENAI_/, /^ANTHROPIC_/, /^GOOGLE_/,
    /^GROQ_/, /^OLLAMA_/, /^DEEPGRAM_/, /^ELEVENLABS_/
  ];
  
  for (const key of SAFE_ENV_VARS) {
    if (key.startsWith('npm_config_') && env[key]) {
      safeEnv[key] = env[key];
    } else if (SAFE_ENV_VARS.includes(key) && env[key]) {
      safeEnv[key] = env[key];
    }
  }
  
  for (const [key, value] of Object.entries(env)) {
    if (value && !sensitivePatterns.some(p => p.test(key))) {
      safeEnv[key] = value;
    }
  }
  
  return safeEnv;
}

// ── SSE stream ────────────────────────────────────────────────────────────────
router.get('/events', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  send({ type: 'history', entries: logger.getLog().slice(-60) });
  send({ type: 'stats', ...buildStats() });

  const onActivity = (entry) => send({ type: 'log', entry });
  logger.getHub().on('activity', onActivity);

  const heartbeat = setInterval(() => send({ type: 'stats', ...buildStats() }), 4000);

  req.on('close', () => {
    logger.getHub().off('activity', onActivity);
    clearInterval(heartbeat);
  });
});

// ── Terminal: run whitelisted command, stream output ─────────────────────────
router.post('/terminal', express.json(), (req, res) => {
  const raw = (req.body.cmd || '').trim().toLowerCase();
  const match = ALLOWED_CMDS[raw];

  if (!match) {
    return res.json({
      ok: false,
      output: `✗ Not allowed: "${raw}"\n\nAllowed commands:\n` +
              Object.keys(ALLOWED_CMDS).map(c => `  ${c}`).join('\n')
    });
  }

  const [bin, args] = match;
  const cwd = path.join(__dirname, '..');
  logger.log('server', `Terminal: ${raw}`);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (line) => res.write(`data: ${JSON.stringify({ line })}\n\n`);

  const proc = spawn(bin, args, { cwd, env: sanitizeEnv(process.env) });

  proc.stdout.on('data', d => d.toString().split('\n').forEach(l => l && send(l)));
  proc.stderr.on('data', d => d.toString().split('\n').forEach(l => l && send('\x1b[33m' + l + '\x1b[0m')));
  proc.on('close', code => {
    send(`\x1b[${code === 0 ? '32' : '31'}m\n[exited with code ${code}]\x1b[0m`);
    res.write(`data: ${JSON.stringify({ done: true, code })}\n\n`);
    res.end();
  });

  req.on('close', () => proc.kill());
});

// ── Douglas chat ──────────────────────────────────────────────────────────────
router.post('/chat', express.json(), async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  logger.ai('openclaw', `Dashboard chat: "${message.substring(0, 80)}"`);

  // Automation shortcuts
  const automations = {
    '/test':    () => triggerAction('npm test'),
    '/status':  () => buildStats(),
    '/restart': () => ({ message: 'Send SIGTERM to restart — use your terminal for full restart.' }),
    '/tokens':  () => openclaw.getTokenStats(),
    '/help':    () => ({
      commands: ['/test', '/status', '/tokens', '/restart', '/help'],
      note: 'Or just chat naturally with Douglas.'
    })
  };

  const cmd = message.trim().toLowerCase();
  if (automations[cmd]) {
    return res.json({ response: JSON.stringify(automations[cmd](), null, 2), type: 'system' });
  }

  try {
    const response = await openclaw.processCommand(message);
    logger.ai('openclaw', `Douglas response: "${response.substring(0, 80)}"`);
    res.json({ response, type: 'ai' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Discord info (for ID fix detection) ──────────────────────────────────────
router.get('/discord-info', (req, res) => {
  const client       = discord.getClient();
  const botId        = client?.user?.id || null;
  const configuredId = process.env.DISCORD_ADMIN_ID || null;
  const mismatch     = botId && configuredId && botId === configuredId;

  res.json({
    botId,
    botTag:       client?.user?.tag || null,
    configuredAdminId: configuredId ? configuredId.substring(0, 6) + '...' : null,
    idConflict:   mismatch,
    fix:          mismatch
      ? 'DISCORD_ADMIN_ID is set to the bot\'s own ID. Change it to YOUR personal Discord user ID.'
      : 'OK'
  });
});

function triggerAction(cmd) {
  return { triggered: cmd, note: 'Use the terminal panel to see output.' };
}

function buildStats() {
  const upMs   = logger.getUptime();
  const upSecs = Math.floor(upMs / 1000);
  const h = Math.floor(upSecs / 3600);
  const m = Math.floor((upSecs % 3600) / 60);
  const s = upSecs % 60;

  const client    = discord.getClient();
  const botId     = client?.user?.id || null;
  const adminId   = process.env.DISCORD_ADMIN_ID || null;

  return {
    uptime:   `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    discord:  { ready: discord.isReady(), botId, idConflict: botId && adminId && botId === adminId },
    database: { connected: database.checkConnected() },
    tokens:   openclaw.getTokenStats(),
    env: {
      GROQ:       !!process.env.GROQ_API_KEY,
      GOOGLE:     !!process.env.GOOGLE_API_KEY,
      OPENROUTER: !!process.env.OPENROUTER_API_KEY,
      ANTHROPIC:  !!process.env.ANTHROPIC_API_KEY,
      ELEVENLABS: !!process.env.ELEVENLABS_API_KEY,
      DEEPGRAM:   !!process.env.DEEPGRAM_API_KEY,
      KEEP:       !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
    }
  };
}

// ── Dashboard HTML ────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SWAGCLAW Command Center</title>
<style>
:root {
  --bg:#0a0a0f; --panel:#111118; --panel2:#0e0e16; --border:#1e1e2e;
  --accent:#7c3aed; --green:#22c55e; --red:#ef4444; --yellow:#eab308;
  --blue:#3b82f6; --purple:#a855f7; --cyan:#06b6d4;
  --text:#e2e8f0; --muted:#64748b; --dim:#334155;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;font-size:13px;overflow:hidden;}
button,input{font-family:inherit;}

/* ── Layout ── */
.layout{display:grid;grid-template-rows:46px 1fr;height:100vh;}
.topbar{background:var(--panel);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 18px;gap:14px;}
.topbar h1{font-size:14px;font-weight:700;letter-spacing:3px;color:var(--accent);}
.tag{font-size:10px;color:var(--muted);letter-spacing:1px;}
.topbar .right{margin-left:auto;display:flex;align-items:center;gap:16px;}
#uptime{font-size:12px;color:var(--cyan);letter-spacing:1px;}
.pulse{width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* ── Warn bar ── */
#warn-bar{display:none;background:#422006;color:var(--yellow);font-size:11px;padding:5px 16px;border-bottom:1px solid #713f12;letter-spacing:.5px;}

/* ── Body grid ── */
.body{display:grid;grid-template-columns:270px 1fr;overflow:hidden;}

/* ── Left sidebar ── */
.sidebar{border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column;gap:1px;background:var(--border);}
.card{background:var(--panel);padding:12px 14px;}
.card h2{font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:9px;}
.row{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #13131f;}
.row:last-child{border:none;}
.badge{padding:1px 7px;border-radius:2px;font-size:9px;font-weight:700;letter-spacing:1px;}
.ok{background:#14532d;color:var(--green);}
.off{background:#450a0a;color:var(--red);}
.warn{background:#422006;color:var(--yellow);}
.tok-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #13131f;font-size:11px;}
.tok-row:last-child{border:none;}
.tok-name{color:var(--purple);}
.tok-nums{color:var(--muted);}
.tok-nums b{color:var(--text);}
a.link{color:var(--blue);text-decoration:none;font-size:11px;display:block;padding:2px 0;}
a.link:hover{color:var(--purple);}

/* ── Right area — tabs ── */
.right{display:flex;flex-direction:column;overflow:hidden;}
.tabs{display:flex;background:var(--panel);border-bottom:1px solid var(--border);}
.tab{padding:10px 20px;font-size:11px;letter-spacing:1px;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;user-select:none;}
.tab.active{color:var(--text);border-bottom-color:var(--accent);}
.tab-body{flex:1;overflow:hidden;display:none;flex-direction:column;}
.tab-body.active{display:flex;}

/* ── Log panel ── */
#log-wrap{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.log-toolbar{padding:7px 14px;background:var(--panel2);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;}
.log-toolbar .filters{display:flex;gap:5px;margin-left:auto;}
.fbtn{padding:2px 9px;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:9px;border-radius:2px;cursor:pointer;letter-spacing:1px;}
.fbtn.active{border-color:var(--accent);color:var(--accent);}
#log{flex:1;overflow-y:auto;padding:6px 8px;display:flex;flex-direction:column;gap:1px;}
.entry{display:grid;grid-template-columns:62px 58px 80px 1fr;gap:6px;padding:3px 6px;border-radius:2px;align-items:start;}
.entry:hover{background:#0c0c18;}
.ets{color:var(--dim);font-size:11px;}
.elvl{font-size:9px;font-weight:700;letter-spacing:1px;}
.esrc{font-size:9px;color:var(--muted);}
.emsg{word-break:break-word;line-height:1.5;}
.info{color:var(--blue)}.warn2{color:var(--yellow)}.error{color:var(--red)}.success{color:var(--green)}.ai{color:var(--purple)}
.src-discord{color:#5865f2}.src-openclaw{color:var(--purple)}.src-database{color:var(--cyan)}.src-auth{color:#f59e0b}.src-api{color:var(--blue)}.src-server{color:var(--muted)}
label.asc{display:flex;align-items:center;gap:5px;cursor:pointer;color:var(--muted);font-size:10px;user-select:none;}
label.asc input{accent-color:var(--accent);}
#conn{font-size:10px;padding:2px 10px;border-radius:2px;}
#conn.on{color:var(--green)}.#conn.off{color:var(--red)}

/* ── Terminal panel ── */
#term-wrap{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.term-toolbar{padding:7px 14px;background:var(--panel2);border-bottom:1px solid var(--border);display:flex;gap:6px;align-items:center;}
.term-toolbar select,.term-toolbar button{padding:4px 10px;border:1px solid var(--border);background:var(--panel);color:var(--text);font-size:11px;border-radius:2px;cursor:pointer;}
.term-toolbar button{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700;letter-spacing:1px;}
.term-toolbar button:disabled{opacity:.4;cursor:not-allowed;}
#term-out{flex:1;overflow-y:auto;padding:12px 16px;background:#050508;color:#22c55e;font-size:12px;line-height:1.7;white-space:pre-wrap;word-break:break-all;}
.term-clear{margin-left:auto;background:transparent!important;border-color:var(--muted)!important;color:var(--muted)!important;font-size:10px!important;}

/* ── Chat panel ── */
#chat-wrap{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.chat-history{flex:1;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px;}
.msg{max-width:78%;padding:8px 12px;border-radius:6px;line-height:1.6;font-size:12px;}
.msg.user{background:#1e1e3a;color:var(--text);align-self:flex-end;border:1px solid var(--accent);}
.msg.douglas{background:#0f1a0f;color:#86efac;align-self:flex-start;border:1px solid #166534;}
.msg.system{background:#1a1a0f;color:var(--yellow);align-self:flex-start;border:1px solid #713f12;font-size:11px;font-family:monospace;white-space:pre-wrap;}
.msg .who{font-size:9px;color:var(--muted);margin-bottom:4px;letter-spacing:1px;text-transform:uppercase;}
.msg.thinking{opacity:.5;animation:pulse 1.5s infinite;}
.chat-input-bar{padding:10px 14px;background:var(--panel2);border-top:1px solid var(--border);display:flex;gap:8px;}
#chat-input{flex:1;background:var(--panel);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:4px;font-size:13px;outline:none;}
#chat-input:focus{border-color:var(--accent);}
#chat-input::placeholder{color:var(--muted);}
#chat-send{padding:8px 16px;background:var(--accent);border:none;color:#fff;border-radius:4px;cursor:pointer;font-weight:700;letter-spacing:1px;}
#chat-send:disabled{opacity:.4;cursor:not-allowed;}
.cmd-pills{padding:4px 14px 6px;background:var(--panel2);display:flex;gap:5px;flex-wrap:wrap;}
.pill{padding:2px 9px;background:var(--panel);border:1px solid var(--border);color:var(--muted);font-size:10px;border-radius:2px;cursor:pointer;}
.pill:hover{border-color:var(--accent);color:var(--accent);}
</style>
</head>
<body>
<div class="layout">

  <!-- Topbar -->
  <div class="topbar">
    <div class="pulse" id="pulse"></div>
    <h1>⚡ SWAGCLAW</h1>
    <span class="tag">COMMAND CENTER</span>
    <div class="right">
      <span id="conn" class="on">● LIVE</span>
      <span id="uptime">--:--:--</span>
    </div>
  </div>

  <!-- Discord ID warning bar -->
  <div id="warn-bar">
    ⚠ DISCORD_ADMIN_ID is set to the bot's own ID (<span id="bot-id-display"></span>).
    Change it in .env to YOUR personal Discord user ID — then restart the server.
  </div>

  <div class="body">

    <!-- ── Left sidebar ── -->
    <div class="sidebar">

      <div class="card">
        <h2>Services</h2>
        <div class="row"><span>Express</span><span class="badge ok">ONLINE</span></div>
        <div class="row"><span>Discord Bot</span><span class="badge" id="svc-discord">...</span></div>
        <div class="row"><span>Supabase DB</span><span class="badge" id="svc-db">...</span></div>
        <div class="row"><span>Auth (JWT)</span><span class="badge ok">ACTIVE</span></div>
      </div>

      <div class="card">
        <h2>AI Providers</h2>
        <div class="row"><span>Groq <span style="color:var(--green);font-size:9px">FREE</span></span><span class="badge" id="ai-groq">...</span></div>
        <div class="row"><span>Gemini Flash <span style="color:var(--green);font-size:9px">FREE</span></span><span class="badge" id="ai-google">...</span></div>
        <div class="row"><span>OpenRouter</span><span class="badge" id="ai-or">...</span></div>
        <div class="row"><span>Anthropic</span><span class="badge" id="ai-ant">...</span></div>
        <div class="row"><span>ElevenLabs</span><span class="badge" id="ai-el">...</span></div>
        <div class="row"><span>Deepgram</span><span class="badge" id="ai-dg">...</span></div>
        <div class="row"><span>Google Keep</span><span class="badge" id="ai-keep">...</span></div>
      </div>

      <div class="card">
        <h2>Token Usage</h2>
        <div class="tok-row"><span class="tok-name">Groq</span><span class="tok-nums" id="t-groq">0/0 · 0</span></div>
        <div class="tok-row"><span class="tok-name">Gemini</span><span class="tok-nums" id="t-gem">0/0 · 0</span></div>
        <div class="tok-row"><span class="tok-name">OpenRouter</span><span class="tok-nums" id="t-or">0/0 · 0</span></div>
        <div class="tok-row"><span class="tok-name">Anthropic</span><span class="tok-nums" id="t-ant">0/0 · 0</span></div>
        <div class="tok-row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px;">
          <span style="color:var(--cyan)">Total calls</span><span id="t-total" style="color:var(--text)">0</span>
        </div>
      </div>

      <div class="card">
        <h2>Links</h2>
        <a class="link" href="/health" target="_blank">→ /health</a>
        <a class="link" href="/api/stats/tokens" target="_blank">→ /api/stats/tokens</a>
        <a class="link" href="/api/keep/health" target="_blank">→ /api/keep/health</a>
        <a class="link" href="/dashboard/discord-info" target="_blank">→ /dashboard/discord-info</a>
      </div>

    </div>

    <!-- ── Right area ── -->
    <div class="right">
      <div class="tabs">
        <div class="tab active" onclick="showTab('logs',this)">📋 LOGS</div>
        <div class="tab" onclick="showTab('terminal',this)">💻 TERMINAL</div>
        <div class="tab" onclick="showTab('chat',this)">🤖 DOUGLAS</div>
      </div>

      <!-- LOGS -->
      <div class="tab-body active" id="tab-logs">
        <div id="log-wrap">
          <div class="log-toolbar">
            <span id="log-count" style="color:var(--muted);font-size:11px">0 events</span>
            <div class="filters">
              <button class="fbtn active" onclick="setFilter('all',this)">ALL</button>
              <button class="fbtn" onclick="setFilter('discord',this)">DISCORD</button>
              <button class="fbtn" onclick="setFilter('openclaw',this)">AI</button>
              <button class="fbtn" onclick="setFilter('error',this)">ERRORS</button>
            </div>
            <label class="asc" style="margin-left:10px"><input type="checkbox" id="autoscroll" checked> scroll</label>
          </div>
          <div id="log"></div>
        </div>
      </div>

      <!-- TERMINAL -->
      <div class="tab-body" id="tab-terminal">
        <div id="term-wrap">
          <div class="term-toolbar">
            <select id="term-cmd">
              <option value="">-- select command --</option>
              <option value="npm test">npm test</option>
              <option value="git status">git status</option>
              <option value="git log">git log (last 15)</option>
              <option value="git diff">git diff --stat</option>
              <option value="ls src/services">ls src/services</option>
              <option value="node --version">node --version</option>
              <option value="npm --version">npm --version</option>
            </select>
            <button id="term-run" onclick="runCmd()">▶ RUN</button>
            <button class="term-clear" onclick="clearTerm()">CLEAR</button>
          </div>
          <div id="term-out"><span style="color:var(--muted)">Select a command and press RUN...\n\nSafe commands only — choose from the dropdown above.</span></div>
        </div>
      </div>

      <!-- DOUGLAS CHAT -->
      <div class="tab-body" id="tab-chat">
        <div id="chat-wrap">
          <div class="chat-history" id="chat-history">
            <div class="msg douglas"><div class="who">Douglas</div>Good day. I'm Douglas — your AI engine embedded in VoxCode. Ask me anything or use a slash command. Type <b>/help</b> for automation commands.</div>
          </div>
          <div class="cmd-pills">
            <span class="pill" onclick="sendPill('/help')">/help</span>
            <span class="pill" onclick="sendPill('/test')">/test</span>
            <span class="pill" onclick="sendPill('/status')">/status</span>
            <span class="pill" onclick="sendPill('/tokens')">/tokens</span>
            <span class="pill" onclick="sendPill('What services are running?')">services?</span>
            <span class="pill" onclick="sendPill('Optimise my token usage')">token tips</span>
          </div>
          <div class="chat-input-bar">
            <input id="chat-input" placeholder="Message Douglas or type /command..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}">
            <button id="chat-send" onclick="sendChat()">SEND</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
// ── Tabs ──────────────────────────────────────────────────────────────────────
function showTab(id, el) {
  document.querySelectorAll('.tab-body').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  el.classList.add('active');
}

// ── SSE ───────────────────────────────────────────────────────────────────────
let evtCount = 0;
function connect() {
  const conn = document.getElementById('conn');
  const es = new EventSource('/dashboard/events');
  es.onopen = () => { conn.textContent = '● LIVE'; conn.style.color = 'var(--green)'; document.getElementById('pulse').style.background='var(--green)'; };
  es.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.type === 'history') d.entries.forEach(addLog);
    else if (d.type === 'log')   addLog(d.entry);
    else if (d.type === 'stats') updateStats(d);
  };
  es.onerror = () => {
    conn.textContent = '✗ OFFLINE'; conn.style.color='var(--red)';
    document.getElementById('pulse').style.background='var(--red)';
    es.close(); setTimeout(connect, 3000);
  };
}
connect();

// ── Log panel ─────────────────────────────────────────────────────────────────
let logFilter = 'all';
function setFilter(f, btn) {
  logFilter = f;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#log .entry').forEach(el => {
    el.style.display = matchFilter(el.dataset) ? '' : 'none';
  });
}
function matchFilter(d) {
  if (logFilter==='all') return true;
  if (logFilter==='error') return d.level==='error';
  return d.source === logFilter;
}
function fmtTs(ts) { return new Date(ts).toTimeString().slice(0,8); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addLog(entry) {
  const el = document.getElementById('log');
  const row = document.createElement('div');
  row.className = 'entry';
  row.dataset.level = entry.level; row.dataset.source = entry.source;
  row.style.display = matchFilter(row.dataset) ? '' : 'none';
  const lvlCls = entry.level==='warn'?'warn2':entry.level;
  row.innerHTML =
    '<span class="ets">'+fmtTs(entry.ts)+'</span>'+
    '<span class="elvl '+lvlCls+'">'+entry.level.toUpperCase()+'</span>'+
    '<span class="esrc src-'+entry.source+'">'+entry.source+'</span>'+
    '<span class="emsg">'+esc(entry.message)+'</span>';
  el.appendChild(row);
  evtCount++;
  document.getElementById('log-count').textContent = evtCount + ' events';
  while(el.children.length > 400) el.removeChild(el.firstChild);
  if (document.getElementById('autoscroll').checked) el.scrollTop = el.scrollHeight;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats(d) {
  if (d.uptime) document.getElementById('uptime').textContent = d.uptime;

  const db = d.discord||{};
  setBadge('svc-discord', db.ready, 'OFFLINE');
  if (db.idConflict) {
    const wb = document.getElementById('warn-bar');
    wb.style.display = 'block';
    document.getElementById('bot-id-display').textContent = db.botId;
  }

  setBadge('svc-db', (d.database||{}).connected, 'OFFLINE');

  const e = d.env||{};
  setBadge('ai-groq',  e.GROQ);
  setBadge('ai-google',e.GOOGLE);
  setBadge('ai-or',    e.OPENROUTER);
  setBadge('ai-ant',   e.ANTHROPIC);
  setBadge('ai-el',    e.ELEVENLABS);
  setBadge('ai-dg',    e.DEEPGRAM);
  const keepOk = e.KEEP;
  const keepEl = document.getElementById('ai-keep');
  keepEl.textContent = keepOk ? 'ACTIVE' : 'NEEDS OAUTH';
  keepEl.className = 'badge ' + (keepOk ? 'ok' : 'warn');

  const t = d.tokens||{};
  setTok('t-groq', t.groq);
  setTok('t-gem',  t.gemini);
  setTok('t-or',   t.openrouter);
  setTok('t-ant',  t.anthropic);
  const calls = Object.values(t).reduce((s,p)=>s+(p?.calls||0),0);
  document.getElementById('t-total').textContent = calls;
}
function setBadge(id, ok, offLabel) {
  const el = document.getElementById(id); if(!el) return;
  el.textContent = ok ? 'ACTIVE' : (offLabel||'MISSING');
  el.className = 'badge ' + (ok ? 'ok' : 'off');
}
function setTok(id, p) {
  const el = document.getElementById(id); if(!el||!p) return;
  el.innerHTML = '<b>'+(p.input||0).toLocaleString()+'</b>/<b>'+(p.output||0).toLocaleString()+'</b> · <b>'+(p.calls||0)+'</b>';
}

// ── Terminal ──────────────────────────────────────────────────────────────────
let termRunning = false;
function runCmd() {
  const sel = document.getElementById('term-cmd').value;
  // map display value to actual command key
  const cmdMap = {
    'git log (last 15)': 'git log'
  };
  const cmd = cmdMap[sel] || sel;
  if (!cmd) return;
  if (termRunning) return;
  termRunning = true;

  const out = document.getElementById('term-out');
  const btn = document.getElementById('term-run');
  btn.disabled = true;
  out.textContent = '$ ' + cmd + '\\n';

  const es = new EventSource('/dashboard/terminal?' + new URLSearchParams({ _dummy: Date.now() }));

  // Use POST via fetch, stream via SSE trick — but SSE is GET only.
  // So use fetch with streaming reader instead:
  es.close();

  out.textContent = '$ ' + cmd + '\n';

  fetch('/dashboard/terminal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd })
  }).then(res => {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) { termRunning=false; btn.disabled=false; return; }
        buf += dec.decode(value, {stream:true});
        const parts = buf.split('\n\n');
        buf = parts.pop();
        parts.forEach(p => {
          if (p.startsWith('data: ')) {
            try {
              const obj = JSON.parse(p.slice(6));
              if (obj.line !== undefined) {
                out.textContent += ansiStrip(obj.line) + '\n';
                out.scrollTop = out.scrollHeight;
              }
              if (obj.done) { termRunning=false; btn.disabled=false; }
            } catch(e){}
          }
        });
        read();
      });
    }
    read();
  }).catch(err => {
    out.textContent += '\nError: ' + err.message;
    termRunning=false; btn.disabled=false;
  });
}
function ansiStrip(s) { return s.replace(/\x1b\[[0-9;]*m/g,''); }
function clearTerm() { document.getElementById('term-out').textContent = ''; }

// ── Douglas Chat ──────────────────────────────────────────────────────────────
function sendPill(text) {
  document.getElementById('chat-input').value = text;
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  document.getElementById('chat-send').disabled = true;

  const hist = document.getElementById('chat-history');

  // User bubble
  const ub = document.createElement('div');
  ub.className = 'msg user';
  ub.innerHTML = '<div class="who">You</div>' + esc(msg);
  hist.appendChild(ub);

  // Thinking bubble
  const tb = document.createElement('div');
  tb.className = 'msg douglas thinking';
  tb.innerHTML = '<div class="who">Douglas</div>...';
  hist.appendChild(tb);
  hist.scrollTop = hist.scrollHeight;

  try {
    const res = await fetch('/dashboard/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    tb.classList.remove('thinking');
    const reply = data.response || data.error || 'No response.';
    const cls   = data.type === 'system' ? 'msg system' : 'msg douglas';
    tb.className = cls;
    tb.innerHTML = '<div class="who">' + (data.type==='system'?'System':'Douglas') + '</div>' + esc(reply);
  } catch(e) {
    tb.classList.remove('thinking');
    tb.innerHTML = '<div class="who">Error</div>' + esc(e.message);
  }

  hist.scrollTop = hist.scrollHeight;
  document.getElementById('chat-send').disabled = false;
  input.focus();
}
</script>
</body>
</html>`);
});

module.exports = router;
