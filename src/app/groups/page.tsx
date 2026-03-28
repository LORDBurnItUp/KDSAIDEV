'use client';

import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';

const groups = [
  { id: 1, name: 'AI Developers', members: 3421, icon: '🧠', color: 'lime', description: 'Build AI agents, tools, and automations together', active: true },
  { id: 2, name: 'Web3 Builders', members: 1847, icon: '⛓️', color: 'blue-accent', description: 'Blockchain, smart contracts, DeFi projects', active: true },
  { id: 3, name: 'Content Creators', members: 2103, icon: '🎬', color: 'yellow-accent', description: 'Faceless YouTube, TikTok automation, AI video', active: true },
  { id: 4, name: 'SaaS Founders', members: 892, icon: '🚀', color: 'lime', description: 'Launch and scale software products', active: true },
  { id: 5, name: 'Automation Lab', members: 1567, icon: '⚙️', color: 'blue-accent', description: 'n8n, Zapier, custom workflows', active: false },
  { id: 6, name: 'Design System', members: 734, icon: '🎨', color: 'yellow-accent', description: 'UI/UX, 3D design, Spline, animations', active: false },
  { id: 7, name: 'Lead Hunters', members: 1203, icon: '🎯', color: 'lime', description: 'Scraping, outreach, CRM, sales funnels', active: false },
  { id: 8, name: 'Hardware Engineers', members: 456, icon: '🔧', color: 'blue-accent', description: 'IoT, robotics, embedded systems', active: false },
];

export default function GroupsPage() {
  return (
    <main className="relative min-h-screen">
      <TeleportNav />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-lime rounded-full blur-[300px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">Community</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              Groups <span className="text-lime">⬡</span>
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">Find your tribe. Each group has its own chatroom, resources, and projects.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((group, i) => (
            <ScrollReveal key={group.id} delay={i * 0.05}>
              <div className="group relative p-6 rounded-2xl glass border border-white/[0.06] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-${group.color}/10 border border-${group.color}/20 flex items-center justify-center text-2xl mb-4`}>{group.icon}</div>
                <h3 className="font-display font-bold text-base mb-1">{group.name}</h3>
                <p className="text-text-muted text-xs mb-3">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-text-muted">{group.members.toLocaleString()} members</span>
                  {group.active && <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  );
}
