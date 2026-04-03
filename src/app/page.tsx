'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import TeleportNav from '@/components/TeleportNav';

const InteractiveHero = dynamic(() => import('@/components/InteractiveHero'), { ssr: false });
const ScanlineOverlay = dynamic(() => import('@/components/ScanlineOverlay'), { ssr: false });
const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

const features = [
  { icon: '◈', title: 'AI Community Hub', description: 'Connect with developers, CEOs, and engineers from another dimension. Live video chat with 10 simultaneous cameras.', color: 'lime' as const },
  { icon: '◇', title: 'Digital Marketplace', description: 'Sell automation, websites, apps, games, videos — anything. Your skills, your price, your empire.', color: 'blue-accent' as const },
  { icon: '⬡', title: 'Command Center', description: 'Your holographic dashboard. Integrate APIs, deploy apps, track analytics. All from one cosmic interface.', color: 'yellow-accent' as const },
  { icon: '▸', title: 'Built-in Terminal', description: 'Real CLI connected to your machine. Teleport commands to navigate the platform at lightspeed.', color: 'lime' as const },
  { icon: '◉', title: 'Affiliate Network', description: 'Earn by referring. Multiple affiliate programs built in. Passive income from the future.', color: 'blue-accent' as const },
  { icon: '◎', title: '4D Experience', description: 'Blackhole transitions. Floating UI. Particle fields. A website that feels alive. From 2130.', color: 'yellow-accent' as const },
];

const colorMap: Record<string, string> = {
  lime: 'text-lime bg-lime/10 border-lime/20',
  'blue-accent': 'text-blue-accent bg-blue-accent/10 border-blue-accent/20',
  'yellow-accent': 'text-yellow-accent bg-yellow-accent/10 border-yellow-accent/20',
};

const orbitColors: Record<string, string> = { lime: '#BFF549', 'blue-accent': '#60a5fa', 'yellow-accent': '#FACC15' };

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const contentOpacity = Math.min(1, scrollY / 400);

  return (
    <>
      {/* ─── INTERACTIVE 3D HERO ─── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          opacity: heroOpacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: heroOpacity > 0.1 ? 'auto' : 'none',
        }}
      >
        <InteractiveHero />
      </div>

      {/* ─── SCANLINE OVERLAY ─── */}
      <div className="fixed inset-0 z-[5] pointer-events-none" style={{ opacity: heroOpacity * 0.5 }}>
        <ScanlineOverlay />
      </div>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <main
        className="relative"
        style={{
          opacity: contentOpacity,
          transition: 'opacity 0.5s ease',
          zIndex: 10,
        }}
      >
        {/* Spacer so content starts below the hero */}
        <div style={{ height: '100vh' }} />

        {/* ─── NAV --- */}
        <TeleportNav />

        {/* ─── AMBIENT SOUND ─── */}
        <AmbientSound />

        {/* LORE */}
        <section className="py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <span className="text-xs font-mono text-lime uppercase tracking-widest mb-4 block">The Story</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight mb-8">
                Once there was a tale about <span className="text-lime glow-text-lime">ARTIFICIAL INTELLIGENCE</span> that took over the world...
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-text-secondary text-xl leading-relaxed max-w-3xl mx-auto mb-6">
                So we SLIDERS teleported back one hundred years to see when AI initiated war against mankind.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
                What we found was <span className="text-white font-semibold">opportunity</span>. The beginning of the most powerful technology humanity ever created. And we decided to build something with it. <span className="text-lime">Something worth staying for.</span>
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-20">
                <span className="text-xs font-mono text-lime uppercase tracking-widest mb-4 block">Dimensions</span>
                <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight">
                  Six Portals. <span className="gradient-text-faded">Infinite Possibilities.</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={index * 0.1}>
                  <div
                    className="group relative p-8 rounded-3xl glass border border-white/[0.06] hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    style={{ marginTop: index % 2 === 1 ? '60px' : '0' }}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl mb-6 transition-all duration-300 group-hover:scale-110 ${colorMap[feature.color]}`}
                      style={{
                        animation: 'spin3dIcon 8s linear infinite',
                        transformStyle: 'preserve-3d',
                        filter: `drop-shadow(0 0 10px ${orbitColors[feature.color]}40)`,
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3 group-hover:text-white transition-colors">{feature.title}</h3>
                    <p className="text-text-secondary leading-relaxed group-hover:text-text-secondary/80 transition-colors">{feature.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-3xl p-12 md:p-16 border border-white/[0.06]">
              <ScrollReveal>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                  {[
                    { value: '2130', label: "Year We're From" },
                    { value: '∞', label: 'Possibilities' },
                    { value: '10K+', label: 'Community Members' },
                    { value: '#1', label: 'AI Platform' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-display font-black text-4xl sm:text-5xl text-lime mb-2 glow-text-lime">{stat.value}</div>
                      <div className="text-text-muted text-sm font-mono uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight mb-8">
                Ready to <span className="text-lime glow-text-lime">Teleport</span>?
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-text-secondary text-xl mb-12 max-w-2xl mx-auto">
                Join the community from 2130. Build, earn, and connect with developers, CEOs, and engineers who think like you.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <button className="group relative px-10 py-5 rounded-full bg-lime text-void font-display font-bold text-xl hover:shadow-2xl hover:shadow-lime/30 transition-all duration-500 hover:scale-105">
                <span className="relative z-10">Enter Kings Dripping Swag</span>
                <div className="absolute inset-0 rounded-full bg-lime opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </button>
            </ScrollReveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-16 px-4 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                <span className="text-lime font-display font-bold text-lg">K</span>
              </div>
              <div>
                <span className="font-display font-bold text-lg">Kings Dripping Swag</span>
                <span className="text-text-muted text-xs block font-mono">© 2130 — The Future Is Now</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-mono text-text-muted">
              <a href="#" className="hover:text-lime transition-colors">Telegram</a>
              <a href="#" className="hover:text-lime transition-colors">Discord</a>
              <a href="#" className="hover:text-lime transition-colors">WhatsApp</a>
              <a href="#" className="hover:text-lime transition-colors">GitHub</a>
            </div>
            <div className="text-xs font-mono text-text-muted">
              Created by <span className="text-white">Omar Estrada Velasquez</span> & <span className="text-white">Alan Estrada Velasquez</span>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes spin3dIcon {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </>
  );
}
