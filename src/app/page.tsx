'use client';

import dynamic from 'next/dynamic';
import GlitchText from '@/components/GlitchText';
import ScrollReveal from '@/components/ScrollReveal';
import TeleportNav from '@/components/TeleportNav';
import BreathingText from '@/components/BreathingText';
import LightningText from '@/components/LightningText';

const HeroScene = dynamic(() => import('@/components/HeroScene'), {
  ssr: false,
});

const ScanlineOverlay = dynamic(() => import('@/components/ScanlineOverlay'), {
  ssr: false,
});

const CyberGrid = dynamic(() => import('@/components/CyberGrid'), {
  ssr: false,
});

const StarField = dynamic(() => import('@/components/StarField'), {
  ssr: false,
});

const ParallaxScene = dynamic(() => import('@/components/ParallaxScene'), {
  ssr: false,
});

const AsteroidField = dynamic(() => import('@/components/AsteroidField'), {
  ssr: false,
});

const features = [
  {
    icon: '◈',
    title: 'AI Community Hub',
    description: 'Connect with developers, CEOs, and engineers from another dimension. Live video chat with 10 simultaneous cameras.',
    color: 'lime',
    orbitColor: '#BFF549',
  },
  {
    icon: '◇',
    title: 'Digital Marketplace',
    description: 'Sell automation, websites, apps, games, videos — anything. Your skills, your price, your empire.',
    color: 'blue-accent',
    orbitColor: '#60a5fa',
  },
  {
    icon: '⬡',
    title: 'Command Center',
    description: 'Your holographic dashboard. Integrate APIs, deploy apps, track analytics. All from one cosmic interface.',
    color: 'yellow-accent',
    orbitColor: '#FACC15',
  },
  {
    icon: '▸',
    title: 'Built-in Terminal',
    description: 'Real CLI connected to your machine. Teleport commands to navigate the platform at lightspeed.',
    color: 'lime',
    orbitColor: '#BFF549',
  },
  {
    icon: '◉',
    title: 'Affiliate Network',
    description: 'Earn by referring. Multiple affiliate programs built in. Passive income from the future.',
    color: 'blue-accent',
    orbitColor: '#60a5fa',
  },
  {
    icon: '◎',
    title: '4D Experience',
    description: 'Blackhole transitions. Floating UI. Particle fields. A website that feels alive. From 2130.',
    color: 'yellow-accent',
    orbitColor: '#FACC15',
  },
];

const colorMap: Record<string, string> = {
  lime: 'text-lime bg-lime/10 border-lime/20',
  'blue-accent': 'text-blue-accent bg-blue-accent/10 border-blue-accent/20',
  'yellow-accent': 'text-yellow-accent bg-yellow-accent/10 border-yellow-accent/20',
};

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* 3D Icon Spin Animation */}
      <style jsx global>{`
        @keyframes spin3dIcon {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>

      {/* Navigation */}
      <TeleportNav />

      {/* Visual Effects */}
      <ScanlineOverlay />
      <CyberGrid />
      <StarField />
      <ParallaxScene />
      <AsteroidField />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-lime rounded-full blur-[280px] opacity-[0.06] animate-orb-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-yellow-accent rounded-full blur-[220px] opacity-[0.05] animate-orb-float" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative z-10 min-h-[200vh] px-4">
        <HeroScene />

        {/* Fixed hero text — stays while content scrolls past */}
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="relative z-10 text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-lime/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span className="text-xs font-mono text-lime uppercase tracking-widest">
                System Online — Year 2130
              </span>
            </div>

            {/* Main Headline */}
            <GlitchText
              text="THE FUTURE IS NOW"
              tag="h1"
              className="font-display font-black text-[13vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] leading-[0.9] tracking-[-0.04em] mb-6"
            />

            <div className="mt-4 mb-8">
              <span className="font-display font-black text-[10vw] sm:text-[7vw] md:text-[5vw] lg:text-[4vw] leading-[0.9] tracking-[-0.03em] gradient-text-faded">
                KINGS DRIPPING SWAG
              </span>
            </div>

            <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed animate-fade-in">
              The AI community hub from another dimension. Build, sell, connect, and earn
              in the most advanced platform ever created. Welcome to 2130.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <button className="group relative px-8 py-4 rounded-full bg-lime text-void font-display font-bold text-lg hover:shadow-2xl hover:shadow-lime/30 transition-all duration-500 hover:scale-105">
                <span className="relative z-10">Enter the Portal</span>
                <div className="absolute inset-0 rounded-full bg-lime opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </button>
              <button className="px-8 py-4 rounded-full glass border border-white/10 font-display font-semibold text-lg hover:border-lime/30 hover:text-lime transition-all duration-300">
                View the Archive
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-20 flex flex-col items-center gap-2 animate-fade-in">
              <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
                Scroll to explore
              </span>
              <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-2">
                <div className="w-1.5 h-1.5 rounded-full bg-lime animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== LORE SECTION ==================== */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-4 block">
              The Story
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight mb-8">
              Once there was a tale about{' '}
              <span className="text-lime glow-text-lime">ARTIFICIAL INTELLIGENCE</span>{' '}
              that took over the world...
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-text-secondary text-xl leading-relaxed max-w-3xl mx-auto mb-6">
              So we SLIDERS teleported back one hundred years to see when AI initiated
              war against mankind.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
              What we found was{' '}
              <span className="text-white font-semibold">opportunity</span>. The
              beginning of the most powerful technology humanity ever created. And we
              decided to build something with it.{' '}
              <span className="text-lime">Something worth staying for.</span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="text-xs font-mono text-lime uppercase tracking-widest mb-4 block">
                Dimensions
              </span>
              <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight">
                Six Portals.{' '}
                <span className="gradient-text-faded">Infinite Possibilities.</span>
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
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl mb-6 transition-all duration-300 group-hover:scale-110 ${
                      colorMap[feature.color]
                    }`}
                    style={{
                      animation: 'spin3dIcon 8s linear infinite',
                      transformStyle: 'preserve-3d',
                      filter: `drop-shadow(0 0 10px ${feature.orbitColor}40)`,
                    }}
                  >
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-xl mb-3 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed group-hover:text-text-secondary/80 transition-colors">
                    {feature.description}
                  </p>

                  {/* Hover Glow */}
                  <div
                    className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                      feature.color === 'lime'
                        ? 'bg-lime/[0.03]'
                        : feature.color === 'blue-accent'
                        ? 'bg-blue-accent/[0.03]'
                        : 'bg-yellow-accent/[0.03]'
                    }`}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-3xl p-12 md:p-16 border border-white/[0.06]">
            <ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                {[
                  { value: '2130', label: 'Year We\'re From' },
                  { value: '∞', label: 'Possibilities' },
                  { value: '10K+', label: 'Community Members' },
                  { value: '#1', label: 'AI Platform' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display font-black text-4xl sm:text-5xl text-lime mb-2 glow-text-lime">
                      {stat.value}
                    </div>
                    <div className="text-text-muted text-sm font-mono uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight mb-8">
              Ready to{' '}
              <span className="text-lime glow-text-lime">Teleport</span>?
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="text-text-secondary text-xl mb-12 max-w-2xl mx-auto">
              Join the community from 2130. Build, earn, and connect with developers,
              CEOs, and engineers who think like you.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group relative px-10 py-5 rounded-full bg-lime text-void font-display font-bold text-xl hover:shadow-2xl hover:shadow-lime/30 transition-all duration-500 hover:scale-105">
                <span className="relative z-10">Enter Kings Dripping Swag</span>
                <div className="absolute inset-0 rounded-full bg-lime opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative z-10 py-16 px-4 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                <span className="text-lime font-display font-bold text-lg">K</span>
              </div>
              <div>
                <span className="font-display font-bold text-lg">
                  Kings Dripping Swag
                </span>
                <span className="text-text-muted text-xs block font-mono">
                  © 2130 — The Future Is Now
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-mono text-text-muted">
              <a href="#" className="hover:text-lime transition-colors">Telegram</a>
              <a href="#" className="hover:text-lime transition-colors">Discord</a>
              <a href="#" className="hover:text-lime transition-colors">WhatsApp</a>
              <a href="#" className="hover:text-lime transition-colors">GitHub</a>
            </div>

            <div className="text-xs font-mono text-text-muted">
              Created by{' '}
              <span className="text-white">Omar Estrada Velasquez</span> &{' '}
              <span className="text-white">Alan Estrada Velasquez</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
