/**
 * SWAGCLAW Service Tests
 */

// Mock external dependencies before any requires
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }))
}));

jest.mock('discord.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    once: jest.fn(),
    on: jest.fn(),
    login: jest.fn().mockResolvedValue(true),
    user: { tag: 'TestBot#0000', id: '123' },
    channels: { fetch: jest.fn() },
    users: { fetch: jest.fn() },
    guilds: { cache: { filter: jest.fn(() => ({ size: 0 })) } }
  })),
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    DirectMessages: 4,
    MessageContent: 8
  },
  Partials: { Channel: 'CHANNEL', Message: 'MESSAGE' },
  EmbedBuilder: jest.fn(),
  AttachmentBuilder: jest.fn()
}));

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  post: jest.fn(),
  get: jest.fn()
}));

const axios = require('axios');

// ── Auth Service ─────────────────────────────────────────────────────────────
describe('Auth Service', () => {
  let authService;

  beforeEach(() => {
    jest.resetModules();
    process.env.JWT_SECRET = 'test-secret-key-for-jest';
    authService = require('../services/auth');
  });

  test('initialize() sets isInitialized to true', async () => {
    await authService.initialize();
    expect(authService.isInitialized()).toBe(true);
  });

  test('generateToken() returns a JWT string', () => {
    const token = authService.generateToken({ userId: '123', role: 'admin' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT = header.payload.signature
  });

  test('verifyToken() returns decoded payload for valid token', () => {
    const payload = { userId: 'abc', role: 'user' };
    const token = authService.generateToken(payload);
    const decoded = authService.verifyToken(token);
    expect(decoded.userId).toBe('abc');
    expect(decoded.role).toBe('user');
  });

  test('verifyToken() returns null for invalid token', () => {
    const result = authService.verifyToken('not-a-valid-token');
    expect(result).toBeNull();
  });

  test('authenticate() rejects request with no token', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authService.authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRole() blocks user with wrong role', () => {
    const req = { user: { role: 'user' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authService.requireRole('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('requireRole() passes user with correct role', () => {
    const req = { user: { role: 'admin' } };
    const res = {};
    const next = jest.fn();
    authService.requireRole('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

// ── Database Service ──────────────────────────────────────────────────────────
describe('Database Service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('connect() returns false when SUPABASE_URL is missing', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
    const db = require('../services/database');
    const result = await db.connect();
    expect(result).toBe(false);
  });

  test('isConnected() returns false before connection', () => {
    delete process.env.SUPABASE_URL;
    const db = require('../services/database');
    expect(db.isConnected()).toBe(false);
  });
});

// ── OpenClaw Service ──────────────────────────────────────────────────────────
describe('OpenClaw Service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('processCommand() returns error message when all providers fail', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    const openclaw = require('../services/openclaw');
    const result = await openclaw.processCommand('hello');
    expect(result).toMatch(/OpenClaw Error/i);
  });

  test('classifyQuery() detects simple vs complex queries', () => {
    const openclaw = require('../services/openclaw');
    expect(openclaw.classifyQuery('hello')).toBe('simple');
    expect(openclaw.classifyQuery('implement a full REST API with authentication')).toBe('complex');
  });

  test('getTokenStats() returns usage object with provider keys', () => {
    const openclaw = require('../services/openclaw');
    const stats = openclaw.getTokenStats();
    expect(stats).toHaveProperty('groq');
    expect(stats).toHaveProperty('gemini');
    expect(stats).toHaveProperty('openrouter');
    expect(stats).toHaveProperty('anthropic');
  });

  test('processCommand() uses Groq when key is set', async () => {
    process.env.GROQ_API_KEY = 'gsk_test_key';
    delete process.env.GOOGLE_API_KEY;
    jest.doMock('axios', () => ({
      create: jest.fn(() => mockAxiosInstance),
      post: jest.fn().mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Hello from Douglas via Groq.' } }],
          usage: { prompt_tokens: 20, completion_tokens: 10 }
        }
      }),
      get: jest.fn()
    }));
    const openclaw = require('../services/openclaw');
    const result = await openclaw.processCommand('hello');
    expect(result).toBe('Hello from Douglas via Groq.');
    jest.unmock('axios');
  });
});

// ── API Service ───────────────────────────────────────────────────────────────
describe('API Service', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.API_BASE_URL = 'https://api.example.com';
  });

  test('router is exported and is an Express router', () => {
    const api = require('../services/api');
    expect(api.router).toBeDefined();
    expect(typeof api.router).toBe('function');
  });

  test('axios helpers are exported', () => {
    const api = require('../services/api');
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.remove).toBe('function');
  });
});
