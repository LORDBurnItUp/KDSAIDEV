'use client';

import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';

const projects = [
  { id: 1, title: 'AI Lead Generation System', client: 'Dubai RE Developer', price: '$8,500', image: '🎯', category: 'Automation', rating: 5.0 },
  { id: 2, title: '3D E-Commerce Platform', client: 'Luxury Brand', price: '$12,000', image: '🛍️', category: 'Web Dev', rating: 4.9 },
  { id: 3, title: 'YouTube Automation Empire', client: 'Content Creator', price: '$3,200', image: '🎬', category: 'Content', rating: 5.0 },
  { id: 4, title: 'Custom AI Chatbot', client: 'SaaS Startup', price: '$5,000', image: '🤖', category: 'AI Dev', rating: 4.8 },
  { id: 5, title: 'Business Process Automation', client: 'Law Firm', price: '$7,500', image: '⚙️', category: 'Automation', rating: 4.9 },
  { id: 6, title: 'Faceless Channel Network', client: 'Passive Income Investor', price: '$4,800', image: '📺', category: 'Content', rating: 5.0 },
];

export default function PortfolioPage() {
  return (
    <main className="relative min-h-screen">
      <TeleportNav />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-yellow-accent rounded-full blur-[300px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">Work Showcase</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              Portfolio <span className="text-yellow-accent">◇</span>
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">Projects completed with AI. Real results. Real revenue. Hire us for yours.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 0.1}>
              <div className="group relative rounded-3xl glass border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-video bg-gradient-to-br from-lime/5 to-blue-accent/5 flex items-center justify-center text-6xl">
                  {project.image}
                </div>
                <div className="p-6">
                  <span className="text-xs font-mono text-text-muted uppercase">{project.category}</span>
                  <h3 className="font-display font-bold text-lg mt-1 mb-2">{project.title}</h3>
                  <p className="text-sm text-text-secondary mb-4">Client: {project.client}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xl text-lime">{project.price}</span>
                    <span className="text-sm font-mono text-yellow-accent">⭐ {project.rating}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <div className="mt-16 text-center glass rounded-3xl p-12 border border-white/[0.06]">
            <h2 className="font-display font-black text-3xl mb-4">Want Similar Results?</h2>
            <p className="text-text-secondary mb-8 max-w-xl mx-auto">Hire our team for your next project. Automation, AI, websites, apps — we do it all.</p>
            <button className="px-8 py-4 rounded-full bg-lime text-void font-display font-bold text-lg hover:shadow-2xl hover:shadow-lime/30 transition-all duration-500 hover:scale-105">
              Hire Us — Start a Project
            </button>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
