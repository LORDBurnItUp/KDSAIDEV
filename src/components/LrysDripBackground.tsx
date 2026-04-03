'use client';

import { useEffect, useState } from 'react';

/**
 * LrysDripBackground — Cinematic LRYS text with gold/chrome dripping effect.
 *
 * Animation sequence:
 *   1. LRYS appears dramatically (scale + glow)
 *   2. Circle portal expands downward
 *   3. Metallic drips become alive and flow
 *   4. Fades to 50% transparent — permanent background layer
 */
export default function LrysDripBackground() {
  const [phase, setPhase] = useState<'reveal' | 'drip' | 'background'>('reveal');

  useEffect(() => {
    // Phase 1 → 2: After 3.5s, start dripping
    const dripTimer = setTimeout(() => setPhase('drip'), 3500);
    // Phase 2 → 3: After 7s, settle into background
    const bgTimer = setTimeout(() => setPhase('background'), 7000);

    return () => {
      clearTimeout(dripTimer);
      clearTimeout(bgTimer);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
      style={{
        opacity: phase === 'background' ? 0.85 : 1,
        transition: 'opacity 2s ease-in-out',
      }}
    >
      {/* SVG Filters for metallic drip effect */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Liquid distortion filter */}
          <filter id="drip-distort">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.08"
              numOctaves="3"
              seed="2"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="8s"
                values="0.015 0.08;0.02 0.12;0.015 0.08"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Chrome/gold metallic gradient */}
          <linearGradient id="gold-chrome" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5E6A3" />
            <stop offset="20%" stopColor="#D4AF37" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="55%" stopColor="#C5A028" />
            <stop offset="70%" stopColor="#E8D48B" />
            <stop offset="85%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>

          {/* Glow gradient for text */}
          <linearGradient id="lrys-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#F5E6A3" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          {/* Drip clip path for each letter */}
          <clipPath id="drip-clip-L">
            <rect x="0" y="0" width="100%" height="100%" />
          </clipPath>
          <clipPath id="drip-clip-R">
            <rect x="0" y="0" width="100%" height="100%" />
          </clipPath>
          <clipPath id="drip-clip-Y">
            <rect x="0" y="0" width="100%" height="100%" />
          </clipPath>
          <clipPath id="drip-clip-S">
            <rect x="0" y="0" width="100%" height="100%" />
          </clipPath>
        </defs>
      </svg>

      {/* ---- Portal Circle ---- */}
      <div
        className="absolute rounded-full"
        style={{
          width: '90vmin',
          height: '90vmin',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%)',
          animation: 'portalExpand 3s cubic-bezier(0.16, 1, 0.3, 1) 1.5s both',
        }}
      />

      {/* ---- LRYS Text Container ---- */}
      <div
        className="relative flex items-center justify-center"
        style={{
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
          fontWeight: 900,
          fontSize: 'clamp(5rem, 18vw, 20rem)',
          letterSpacing: '0.15em',
          lineHeight: 1,
        }}
      >
        {/* Base text — revealed first */}
        <div
          className="relative"
          style={{
            animation: 'lrysReveal 2.5s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          <span
            className="relative inline-block"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 40%, #8B6914 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: phase === 'reveal' ? 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))' : 'none',
              transition: 'filter 2s ease',
            }}
          >
            LRYS
          </span>

          {/* Dripping overlay — appears in drip phase */}
          <div
            className="absolute inset-0"
            style={{
              opacity: phase === 'drip' || phase === 'background' ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
            }}
          >
            {/* Drip streams from each letter */}
            <svg
              viewBox="0 0 800 200"
              className="absolute w-full"
              style={{
                top: '70%',
                height: '200px',
                filter: 'url(#drip-distort)',
              }}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Drips from L */}
              <g className="drip-group" style={{ animationDelay: '0s' }}>
                <path
                  d="M100,0 Q102,40 98,80 Q95,120 100,160 Q103,180 100,200"
                  stroke="url(#gold-chrome)"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.8"
                  style={{ animation: 'dripFlow 3s ease-in infinite', animationDelay: '0s' }}
                />
                <ellipse cx="100" cy="200" rx="6" ry="4" fill="#D4AF37" opacity="0.6" style={{ animation: 'dripDrop 3s ease-in infinite', animationDelay: '0s' }} />
                <path
                  d="M115,0 Q118,50 112,100 Q108,140 115,190"
                  stroke="url(#gold-chrome)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.6"
                  style={{ animation: 'dripFlow 3.5s ease-in infinite', animationDelay: '0.8s' }}
                />
              </g>

              {/* Drips from R */}
              <g className="drip-group" style={{ animationDelay: '0.3s' }}>
                <path
                  d="M300,0 Q298,30 303,70 Q307,110 300,150 Q296,175 300,200"
                  stroke="url(#gold-chrome)"
                  strokeWidth="5"
                  fill="none"
                  opacity="0.9"
                  style={{ animation: 'dripFlow 2.8s ease-in infinite', animationDelay: '0.3s' }}
                />
                <ellipse cx="300" cy="200" rx="7" ry="5" fill="#FFD700" opacity="0.7" style={{ animation: 'dripDrop 2.8s ease-in infinite', animationDelay: '0.3s' }} />
                <path
                  d="M320,0 Q322,45 318,90 Q314,130 320,180"
                  stroke="url(#gold-chrome)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.5"
                  style={{ animation: 'dripFlow 4s ease-in infinite', animationDelay: '1.2s' }}
                />
              </g>

              {/* Drips from Y */}
              <g className="drip-group" style={{ animationDelay: '0.5s' }}>
                <path
                  d="M500,0 Q497,35 503,75 Q508,115 500,160 Q496,180 500,200"
                  stroke="url(#gold-chrome)"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.8"
                  style={{ animation: 'dripFlow 3.2s ease-in infinite', animationDelay: '0.5s' }}
                />
                <ellipse cx="500" cy="200" rx="5" ry="3" fill="#E8D48B" opacity="0.6" style={{ animation: 'dripDrop 3.2s ease-in infinite', animationDelay: '0.5s' }} />
                <path
                  d="M485,0 Q482,60 488,120 Q492,160 485,200"
                  stroke="url(#gold-chrome)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.5"
                  style={{ animation: 'dripFlow 3.8s ease-in infinite', animationDelay: '1.5s' }}
                />
              </g>

              {/* Drips from S */}
              <g className="drip-group" style={{ animationDelay: '0.7s' }}>
                <path
                  d="M700,0 Q703,40 697,80 Q693,120 700,170 Q703,185 700,200"
                  stroke="url(#gold-chrome)"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.7"
                  style={{ animation: 'dripFlow 3s ease-in infinite', animationDelay: '0.7s' }}
                />
                <ellipse cx="700" cy="200" rx="6" ry="4" fill="#B8860B" opacity="0.5" style={{ animation: 'dripDrop 3s ease-in infinite', animationDelay: '0.7s' }} />
                <path
                  d="M680,0 Q683,55 678,110 Q675,150 680,200"
                  stroke="url(#gold-chrome)"
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.4"
                  style={{ animation: 'dripFlow 4.2s ease-in infinite', animationDelay: '2s' }}
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* ---- Ambient gold particles ---- */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: `radial-gradient(circle, rgba(255, 215, 0, ${0.3 + Math.random() * 0.4}), transparent)`,
              animation: `particleFloat ${4 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: phase === 'reveal' ? 0 : 0.6,
              transition: 'opacity 3s ease',
            }}
          />
        ))}
      </div>

      {/* ---- Local keyframes (only renders once) ---- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700;800;900&display=swap');

        @keyframes lrysReveal {
          0% {
            opacity: 0;
            transform: scale(0.7) translateY(30px);
            filter: blur(20px);
          }
          40% {
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        @keyframes portalExpand {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes dripFlow {
          0% {
            stroke-dasharray: 0 300;
            stroke-dashoffset: 0;
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            stroke-dasharray: 150 150;
          }
          100% {
            stroke-dasharray: 0 300;
            stroke-dashoffset: -300;
            opacity: 0;
          }
        }

        @keyframes dripDrop {
          0%, 60% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1);
            opacity: 0.7;
          }
          85% {
            transform: scale(1.3);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.5) translateY(20px);
            opacity: 0;
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-15px) translateX(8px);
          }
          50% {
            transform: translateY(-5px) translateX(-6px);
          }
          75% {
            transform: translateY(-20px) translateX(4px);
          }
        }
      `}</style>
    </div>
  );
}
