'use client';

import Link from 'next/link';
import GlitchText from '@/components/GlitchText';

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-lime rounded-full blur-[280px] opacity-[0.06] animate-orb-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-yellow-accent rounded-full blur-[220px] opacity-[0.05] animate-orb-float" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto text-center px-4">
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/[0.06]">
          {/* Glitch 404 */}
          <GlitchText
            text="404"
            className="font-display font-black text-6xl md:text-7xl text-lime glow-text-lime mb-6"
            tag="h1"
          />

          {/* Title */}
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-4">
            Dimension Not Found
          </h1>

          {/* Description */}
          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            The page you teleported to doesn't exist in this timeline.
          </p>

          {/* Button */}
          <Link
            href="/"
            className="inline-block px-8 py-4 rounded-full bg-lime text-void font-display font-bold text-lg hover:shadow-2xl hover:shadow-lime/30 transition-all duration-500 hover:scale-105"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}