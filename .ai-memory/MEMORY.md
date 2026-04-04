# 🧠 KDS Persistent Memory

> Read by the agent at the start of every session.
> This file is the source of truth for persistent facts about KDS and its users.

## User Preferences
- Omar Estrada Velasquez (LORDBurnItDown) — Founder/Creator
- Alan Estrada Velasquez — Co-founder
- Building an AI-powered business under "Kings Dripping Swag" brand
- Wants futuristic, cinematic, scroll-driven experiences with 3D + video + spatial design
- Prefers minimal UI with massive negative space (Vexel-inspired aesthetic)
- Values performance — builds should deploy fast, load fast

## Key Facts
- **KDS Platform** = AI Community Hub — connect developers, build, sell, earn
- **Domain:** kingsdrippingswag.io
- **Hosting:** Hostinger VPS (46.202.197.97:65002)
- **Repo:** github.com/LORDBurnItUp/KDSAIDEV
- **Deploy:** rsync via SSH key `/root/.ssh/kds_deploy`
- **Spline Scene:** https://prod.spline.design/kMWi1sxpCPiTM5ha/scene.splinecode
- **28 Video Clips:** `/public/videos/kds-clip-1.mp4` through `kds-clip-28.mp4`
- **Tech Stack:** Next.js 14 (App Router), Three.js, Framer Motion, Tailwind
- **Memory System:** Three-tier (SQLite + Pinecone + Supabase)
- **Agent Orchestrator:** `src/lib/agent.ts` with graceful degradation

## Learned Behaviors
- Always deploy after commit — never leave changes unpushed
- Build memory is ~60-90s, use `NODE_OPTIONS="--max-old-space-size=4096"`
- Video clips are high quality — use them as scroll backgrounds, not static images
- Spline is the primary 3D background layer, Three.js is fallback
- Scrollytelling beats fade in at 10% and out at last 10% of their section
- User appreciates cinematic letterbox bars and minimal typography

## Current Projects
- KDS Platform Website — LIVE ✅ (18 routes, 4-beat scroll, video backgrounds, Spline 3D)
- AntiGravity System — MEMORY SYSTEM ✅ CODED (3-tier memory, 5 memory tools, agent orchestrator)
- Content Workflows — BUILT ✅ (YouTube research, podcast prep, executive briefing, newsletter, market research)

## Technical Context
- Build command: `NODE_OPTIONS="--max-old-space-size=4096" npx next build`
- Deploy: `rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no -i /root/.ssh/kds_deploy -p 65002" out/ u142089309@46.202.197.97:/home/u142089309/domains/kingsdrippingswag.io/public_html/`
- SSH user: u142089309, key-based auth (no password)

## Identified Gaps
1. LLM provider not wired into agent yet (placeholder implementation)
2. Pinecone/Supabase not configured with API keys yet (graceful degradation handles this)
3. YouTube Research workflow needs data source connection
4. Agent memory tools are ready but need a frontend UI in Mission Control dashboard

## Enhancement Priorities
1. Wire up actual LLM (OpenAI/Anthropic/Ollama) to agent.ts
2. Configure Pinecone + Supabase environment variables
3. Build Mission Control frontend for memory/dashboard
4. Connect YouTube API for research workflows

---

*Last updated: 2026-04-04 by Lord Sav*
*This file is the source of truth for persistent context.*
