# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SWAGCLAW** — Node.js Backend API Service for VOXCODE

- Remote: https://github.com/LORDBurnItUp/FRPaiUnlocks
- Branch: `main`

## Current State

Backend API service with modular service architecture and Discord integration.

## Architecture Overview

```
src/
├── index.js          # Main entry point
├── services/
│   ├── database.js   # MongoDB database connection
│   ├── api.js        # External API integrations
│   ├── auth.js       # JWT authentication & authorization
│   ├── discord.js    # Discord bot integration
│   └── openclaw.js   # OpenClaw AI command engine (Anthropic)
```

## Services

- **`database.js`** — Supabase (PostgreSQL) connection. Uses `SUPABASE_URL` and `SUPABASE_KEY`. Failures are non-fatal in development.
- **`api.js`** — Dual-purpose: exports an Express router (mounted at `/api`) **and** standalone axios helpers (`get`, `post`, `put`, `remove`) for use within other services. The configured `apiClient` instance is also exported.
- **`auth.js`** — JWT auth. Use `authenticate` middleware for protected routes and `requireRole(...roles)` for RBAC.
- **`discord.js`** — Discord bot integration. Handles connection to VOXCODE server and provides `sendMessage(message)` for notifications.
- **`openclaw.js`** — OpenClaw AI engine. Uses Anthropic Claude to process natural language commands and chat messages.

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run tests |

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | MongoDB host | localhost |
| `DB_PORT` | MongoDB port | 27017 |
| `DB_NAME` | Database name | swagclaw |
| `DB_USER` | MongoDB username | - |
| `DB_PASSWORD` | MongoDB password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRY` | Token expiry | 24h |
| `API_BASE_URL` | External API URL | - |
| `API_KEY` | External API key | - |
| `DISCORD_TOKEN` | Discord Bot Token | - |
| `DISCORD_CLIENT_ID` | Discord App Client ID | - |
| `DISCORD_GUILD_ID` | VOXCODE Guild ID | - |
| `DISCORD_CHANNEL_ID` | Notification Channel ID | - |
| `DISCORD_WEBHOOK_URL` | Fallback webhook (no bot token needed) | - |
| `ANTHROPIC_API_KEY` | Claude API key for OpenClaw AI engine | - |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/data` | GET | Get data (example) |
| `/api/sync` | POST | Sync data (example) |

