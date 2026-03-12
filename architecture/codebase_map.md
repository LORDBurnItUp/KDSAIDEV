# 🗺️ ANTIGRAVITY CODEBASE MAP

This document categorizes all core files within the KFEAIDEV Antigravity ecosystem.

## 🛸 1. THE ORCHESTRATOR (CORE)
- **`src/index.js`**: Primary Express backend. Routes for Agency, Dashboard, Voice activation, and the new Content Lab.
- **`.opencode/oh-my-opencode.json`**: System Pilot prompt and tool configuration.
- **`.opencode/opencode.json`**: MCP Server registrations (Keep, Voice, Stitch).

## 🧠 2. SECOND BRAIN (MEMORY)
- **`src/services/googlekeep.js`**: OAuth2 service for Google Keep notes.
- **`src/services/qdrant.js`**: Vector database client for semantic search.
- **`src/services/memory.js`**: High-level memory orchestration layer.
- **`src/services/googlekeep-server.js`**: MCP server bridge for Google Keep.

## 🎙️ 3. VOICE & UI OVERLAY
- **`src/services/voice.js`**: TTS (ElevenLabs) and STT (Deepgram) logic.
- **`src/services/voice_recorder.py`**: Python background listener with Tkinter floating UI and global hotkey (`Shift+Alt`).
- **`src/services/voice-server.js`**: MCP server bridge for voice commands.

## 🤖 4. AGGREGATOR & AGENTS
- **`src/services/openclaw.js`**: Multi-model AI aggregator (Anthropic, OpenAI, Groq).
- **`src/services/ollama.js`**: Local LLM integration.
- **`sharp_wilson` (Docker)**: External container running Agent Zero for massive parallel tasks.

## 🎨 5. CONTENT & DESIGN LAB
- **`src/pages/prompter.html`**: The new Scroll-Stop Hook generator.
- **`src/agency.html`**: The main futuristic agency landing page.
- **`src/dashboard.js`**: Frontend logic for the command center.

## 🛠️ 6. INFRASTRUCTURE
- **`startup.bat`**: Windows startup script to launch Hub, Voice, and Docker.
- **`.env`**: Centralized API key and credential store.
- **`.github/workflows/deploy.yml`**: Automated CI/CD to Hostinger VPS.
