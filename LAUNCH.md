# 🚀 SWAGCLAW | Agency Hub Launch Guide

Follow these steps to initialize and launch the Hub correctly.

## 1. Prerequisites
- **Node.js:** v18 or higher.
- **Ollama:** Installed and running (for local AI fallback).
- **Discord Bot:** Active token in `.env`.

## 2. Environment Setup
- Ensure your `.env` file is populated. 
- **CRITICAL:** Check `DISCORD_ADMIN_ID` — it must be YOUR user ID, not the bot's.
- `GROQ_API_KEY` or `OPENROUTER_API_KEY` are required for the Sub-Agent Swarm.

## 3. Installation
Open your terminal in the project root and run:
```powershell
npm install
```

## 4. Google Keep Authentication (Optional but Recommended)
To enable the "Second Brain" and Auto-Repair logging:
```powershell
node src/services/googlekeep.js --auth
```
- Open the generated URL, login, and copy the `REFRESH_TOKEN` to your `.env`.

## 5. Launch Protocol
Run the startup script:
```powershell
./startup.bat
```
This will:
1. Start Ollama (if not running).
2. Start the SWAGCLAW Express server.
3. Initialize the Auto-Repair system.

## 6. Accessing the Hub
- **Main Hub:** [http://localhost:3000](http://localhost:3000)
- **Command Center:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 💡 Pro-Tips
- **Floating Bar:** Click the 🤖 icon in the bottom-right of the Main Hub to chat with Douglas.
- **Secondary Dimension:** Click the **Golden Core** in the center of the Main Hub to trigger the Matrix transition.
- **Auto-Repair:** Check the dashboard logs for `🛠️ REPAIR PROPOSAL` messages if errors occur.
