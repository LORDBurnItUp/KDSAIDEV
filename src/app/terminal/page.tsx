'use client';

import { useState, useRef, useEffect } from 'react';
import TeleportNav from '@/components/TeleportNav';

const welcomeMessage = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██╗  ██╗██████╗ ███████╗    ████████╗███████╗██████╗ ███╗ ║
║   ██║ ██╔╝██╔══██╗██╔════╝    ╚══██╔══╝██╔════╝██╔══██╗████║║
║   █████╔╝ ██║  ██║███████╗       ██║   █████╗  ██████╔╝██╔██║║
║   ██╔═██╗ ██║  ██║╚════██║       ██║   ██╔══╝  ██╔══██╗██║██║║
║   ██║  ██╗██████╔╝███████║       ██║   ███████╗██║  ██║██║██║║
║   ╚═╝  ╚═╝╚═════╝ ╚══════╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝║
║                                                              ║
║   Kings Dripping Swag Terminal v2.130                        ║
║   Year 2130 — The Future Is Now                             ║
║                                                              ║
║   Type 'help' for available commands                        ║
║   Type 'teleport <page>' to navigate                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

const commands: Record<string, (args: string[]) => string> = {
  help: () => `
Available Commands:
  help          Show this help message
  teleport      Navigate to a page (home/feed/video/marketplace/command)
  status        Show system status
  whoami        Show current user info
  dragon        Show Dragon rank
  services      List connected services
  clear         Clear terminal
  about         About KDS
  lore          The story of 2130
`,
  teleport: (args) => {
    const pages = ['home', 'feed', 'video', 'marketplace', 'command'];
    if (!args[0]) return 'Usage: teleport <page>\nPages: ' + pages.join(', ');
    if (!pages.includes(args[0])) return `Unknown page: ${args[0]}\nAvailable: ${pages.join(', ')}`;
    // In a real app, this would trigger navigation
    return `🌀 Teleporting to ${args[0]}...\n[Blackhole opening...]`;
  },
  status: () => `
System Status: ONLINE ✓
Uptime: 99.97%
Active Users: 10,247
API Services: 6/6 Active
Memory: 3-Tier (SQLite + Qdrant + Supabase)
LLM: Claude Sonnet 4.6 (Anthropic)
Dragon Rank: #847 ↑213
`,
  whoami: () => `
User: Omar Estrada Velasquez
Handle: @LORDBurnItDown
Role: Founder / CEO
Access: SOVEREIGN (Full)
Projects: 12 Active
Revenue MTD: $8,450
`,
  dragon: () => `
🐉 DRAGON RANK TRACKER
━━━━━━━━━━━━━━━━━━━━━━
Current Rank: #847 / 2,000+
Monthly Change: ↑ 213 positions
Revenue Impact: $8,450 MTD
Deployment Speed: Top 5%
Soul Alignment: 98.7%

Target: #1
━━━━━━━━━━━━━━━━━━━━━━
`,
  services: () => `
Connected Services:
  ✓ OpenAI         847K calls   120ms
  ✓ Anthropic      623K calls    95ms
  ✓ Supabase       1.2M calls    45ms
  ✓ LiveKit         34K calls    28ms
  ⚠ Firecrawl       89K calls   340ms
  ✓ Stripe          12K calls   180ms

Status: 5/6 optimal, 1 warning
`,
  about: () => `
Kings Dripping Swag (2130) — The Future Is Now

An AI community hub from another dimension.
Build, sell, connect, and earn in the most
advanced platform ever created.

Creators:
  Omar Estrada Velasquez (@LORDBurnItDown)
  Alan Estrada Velasquez (@GknowsThis)

Domain: kingsdrippingswag.io
Era: 2130
`,
  lore: () => `
Once there was a tale about ARTIFICIAL
INTELLIGENCE TECHNOLOGY that took over the
world. So SLIDERS teleported back one hundred
years to see when AI initiated war against
mankind.

What we found was opportunity. The beginning
of the most powerful technology humanity ever
created. And we decided to build something
with it. Something worth staying for.

Welcome to 2130.
`,
};

export default function TerminalPage() {
  const [history, setHistory] = useState<string[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const [cmd, ...args] = trimmed.toLowerCase().split(' ');
    const output = commands[cmd]
      ? commands[cmd](args)
      : `Command not found: ${cmd}\nType 'help' for available commands.`;

    setHistory((prev) => [...prev, `\n> ${trimmed}`, output]);
    setInput('');
  };

  return (
    <main className="relative min-h-screen">
      <TeleportNav />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-8">
        <div className="glass rounded-3xl border border-white/[0.06] overflow-hidden">
          {/* Terminal Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-accent/60" />
              <div className="w-3 h-3 rounded-full bg-lime/60" />
            </div>
            <span className="font-mono text-xs text-text-muted">
              kds-terminal — bash — 2130
            </span>
          </div>

          {/* Terminal Body */}
          <div
            ref={scrollRef}
            className="h-[70vh] overflow-y-auto p-6 font-mono text-sm"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((line, i) => (
              <pre
                key={i}
                className={`whitespace-pre-wrap ${
                  line.startsWith('\n>')
                    ? 'text-lime'
                    : 'text-text-secondary'
                }`}
              >
                {line}
              </pre>
            ))}

            {/* Input Line */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
              <span className="text-lime font-mono text-sm">▸</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-lime font-mono text-sm placeholder-text-muted"
                placeholder="Type a command..."
                autoFocus
              />
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
