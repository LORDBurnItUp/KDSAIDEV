'use client';

import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';

const threads = [
  { id: 1, title: 'How I automated 50 YouTube channels with AI', author: 'Sarah Chen', replies: 89, views: 2341, category: 'Automation', hot: true, time: '2h' },
  { id: 2, title: 'Complete guide: Building Telegram bots with Python', author: 'Omar Estrada', replies: 156, views: 4521, category: 'AI Dev', hot: true, time: '4h' },
  { id: 3, title: 'Best free alternatives to expensive SaaS tools', author: 'Marcus Tech', replies: 67, views: 1892, category: 'Resources', hot: false, time: '6h' },
  { id: 4, title: 'My $10K/month faceless YouTube setup — full breakdown', author: 'Alan Estrada', replies: 234, views: 6703, category: 'Content', hot: true, time: '8h' },
  { id: 5, title: 'Firecrawl + n8n lead gen pipeline tutorial', author: 'DevTeam', replies: 45, views: 1234, category: 'Leads', hot: false, time: '12h' },
  { id: 6, title: 'React Three Fiber tips for 3D websites', author: 'Design Lab', replies: 78, views: 2100, category: 'Design', hot: false, time: '1d' },
];

export default function ForumsPage() {
  return (
    <main className="relative min-h-screen">
      <TeleportNav />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">Knowledge Base</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              Forums <span className="text-blue-accent">◈</span>
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">Deep-learning logs. Share knowledge, ask questions, level up together.</p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {threads.map((thread, i) => (
            <ScrollReveal key={thread.id} delay={i * 0.05}>
              <div className="glass rounded-2xl p-5 border border-white/[0.06] hover:border-white/10 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {thread.hot && <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-400 uppercase">🔥 Hot</span>}
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-text-muted">{thread.category}</span>
                    </div>
                    <h3 className="font-display font-bold text-base group-hover:text-white transition-colors">{thread.title}</h3>
                    <p className="text-xs text-text-muted mt-1">{thread.author} · {thread.time}</p>
                  </div>
                  <div className="text-right text-xs font-mono text-text-muted space-y-1">
                    <div>💬 {thread.replies}</div>
                    <div>👁 {thread.views}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <button className="w-full mt-6 py-4 rounded-2xl glass border border-white/[0.06] text-sm font-mono text-text-secondary hover:border-lime/30 hover:text-lime transition-all">
            + Start New Thread
          </button>
        </ScrollReveal>
      </div>
    </main>
  );
}
