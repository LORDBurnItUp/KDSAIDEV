'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * KDSScrollyVideo — Scroll-linked video intro for KDS websites
 * Videos play as you scroll, creating a cinematic intro effect
 */

interface VideoSection {
  video: string;
  title: string;
  subtitle: string;
  align?: 'left' | 'center' | 'right';
}

const sections: VideoSection[] = [
  {
    video: '/videos/kds-clip-1.mp4',
    title: 'KINGS DRIPPING SWAG',
    subtitle: 'Welcome to 2130',
    align: 'center',
  },
  {
    video: '/videos/kds-clip-3.mp4',
    title: 'AI DEVELOPMENT',
    subtitle: 'Building the future',
    align: 'left',
  },
  {
    video: '/videos/kds-clip-5.mp4',
    title: '3D EXPERIENCE',
    subtitle: 'Beyond reality',
    align: 'right',
  },
  {
    video: '/videos/kds-clip-8.mp4',
    title: 'VOICE AGENTS',
    subtitle: 'AI that speaks',
    align: 'center',
  },
  {
    video: '/videos/kds-clip-11.mp4',
    title: 'CODE & CREATE',
    subtitle: 'Build the future',
    align: 'left',
  },
  {
    video: '/videos/kds-clip-18.mp4',
    title: 'THE FUTURE',
    subtitle: 'What comes next',
    align: 'center',
  },
];

export default function KDSScrollyVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [videosReady, setVideosReady] = useState<boolean[]>(() =>
    new Array(sections.length).fill(false)
  );

  // ── Scroll handler ──
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;

    // When not scrolled, rect.top is 0 → progress = 0 (section 0)
    // When container has scrolled out of view, rect.top is negative → progress 1
    const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
    setScrollProgress(progress);

    const sectionIndex = Math.min(
      sections.length - 1,
      Math.floor(progress * sections.length)
    );
    setActiveSection(sectionIndex);
  }, []);

  // ── Listen for scroll ──
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger on mount so section 0 is active immediately
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ── Mark container as ready when measured ──
  useEffect(() => {
    // Short delay to ensure layout has settled
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ── Track each video's ready state ──
  const handleVideoLoaded = useCallback((index: number) => {
    setVideosReady((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  // ── Play / pause videos based on active section ──
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeSection) {
        // Video is now active — try to play
        const attempt = () => {
          video.currentTime = 0;
          video.play().catch(() => {
            // If play was prevented, retry once on interaction
            const resume = () => {
              video.play().catch(() => {});
              document.removeEventListener('click', resume);
              document.removeEventListener('touchstart', resume);
            };
            document.addEventListener('click', resume, { once: true });
            document.addEventListener('touchstart', resume, { once: true });
          });
        };
        // If the video has already loaded its data, play immediately
        if (video.readyState >= 2) {
          attempt();
        } else {
          // Otherwise wait for canplay
          video.addEventListener('canplay', attempt, { once: true });
        }
      } else {
        video.pause();
      }
    });
  }, [activeSection]);

  if (!isReady) {
    return (
      <div className="relative z-[5]" style={{ height: `${sections.length * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full flex items-center justify-center">
          <div className="text-lime text-sm font-mono tracking-widest animate-pulse">
            Loading intro…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: `${sections.length * 100}vh` }}>
      {/* Sticky container — fills the viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background videos */}
        {sections.map((section, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              opacity: activeSection === index ? 1 : 0,
              zIndex: activeSection === index ? 1 : 0,
              transition: 'opacity 0.8s ease',
              pointerEvents: activeSection === index ? 'auto' : 'none',
            }}
          >
            {/* Video */}
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={section.video}
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => handleVideoLoaded(index)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.9 }}
            />

            {/* Dark overlay — lighter than before so video bleeds through */}
            <div className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)',
              }}
            />

            {/* Content */}
            <div
              className={`absolute inset-0 flex items-center ${
                section.align === 'left'
                  ? 'justify-start pl-12 md:pl-24'
                  : section.align === 'right'
                  ? 'justify-end pr-12 md:pr-24'
                  : 'justify-center'
              }`}
            >
              <div
                className="max-w-2xl px-8"
                style={{
                  opacity: activeSection === index ? 1 : 0,
                  transform: activeSection === index ? 'translateY(0)' : 'translateY(40px)',
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '0.2s',
                }}
              >
                {/* Section number */}
                <div className="text-lime/50 text-sm font-mono mb-4 tracking-widest">
                  0{index + 1} / 0{sections.length}
                </div>

                {/* Title with per‑letter stagger */}
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-4">
                  {section.title.split('').map((char, i) => (
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        opacity: activeSection === index ? 1 : 0,
                        transform:
                          activeSection === index
                            ? 'translateY(0)'
                            : 'translateY(20px)',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        transitionDelay: `${0.5 + i * 0.03}s`,
                      }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </h2>

                {/* Subtitle */}
                <p
                  className="text-gray-300 text-lg md:text-xl"
                  style={{
                    opacity: activeSection === index ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                    transitionDelay: '1s',
                  }}
                >
                  {section.subtitle}
                </p>

                {/* Decorative line */}
                <div
                  className="w-24 h-0.5 bg-lime mt-6"
                  style={{
                    transform: activeSection === index ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '1.2s',
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Scroll indicator (first section only) */}
        {activeSection === 0 && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            style={{
              opacity: scrollProgress < 0.08 ? 1 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: scrollProgress < 0.08 ? 'auto' : 'none',
            }}
          >
            <span className="text-gray-500 text-xs tracking-widest uppercase">
              Scroll to explore
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1">
              <div
                className="w-1.5 h-3 rounded-full bg-lime"
                style={{
                  animation: 'scrollBounce 2s infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const target =
                  (index / sections.length) *
                  (containerRef.current?.scrollHeight ?? 0);
                window.scrollTo({ top: target, behavior: 'smooth' });
              }}
              className="group relative"
            >
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background:
                    activeSection === index
                      ? '#BFF549'
                      : 'rgba(255,255,255,0.25)',
                  transform: activeSection === index ? 'scale(1.5)' : 'scale(1)',
                }}
              />
              {/* Tooltip */}
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
                {sections[index].title}
              </span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 z-20">
          <div
            className="h-full bg-lime transition-[width] duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Scroll bounce animation */}
      <style jsx global>{`
        @keyframes scrollBounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
