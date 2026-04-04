'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * VideoBackground — Cinematic scroll-linked video backgrounds
 * 
 * Each scroll section gets its own full-screen video.
 * Videos cross-fade between sections for seamless transitions.
 * Videos are muted, autoplay, loop, and object-cover.
 */
export default function VideoBackground({
  section,
  videos,
  crossfadeDuration = 400,
}: {
  section: number;
  videos: string[]; // Array of video src URLs
  crossfadeDuration?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeVideos, setActiveVideos] = useState<Set<number>>(new Set());
  const preloadRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Preload all videos
  useEffect(() => {
    videos.forEach((src, i) => {
      const v = document.createElement('video');
      v.src = src;
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      v.preload = 'auto';
      v.load();
      preloadRef.current.set(src, v);
    });

    return () => {
      preloadRef.current.forEach(v => { v.pause(); v.src = ''; });
      preloadRef.current.clear();
    };
  }, [videos.join(',')]);

  // Activate videos for current + adjacent sections (for crossfade)
  useEffect(() => {
    const newActive = new Set<number>();
    // Current section
    if (section >= 0 && section < videos.length) newActive.add(section);
    // Previous (fading out)
    if (section - 1 >= 0) newActive.add(section - 1);
    // Next (fading in)
    if (section + 1 < videos.length) newActive.add(section + 1);

    setActiveVideos(prev => {
      // Trigger play/pause
      newActive.forEach(i => {
        const v = videoRefs.current[i];
        if (v && v.paused) v.play().catch(() => {});
        if (v) v.currentTime = 0;
      });
      prev.forEach(i => {
        if (!newActive.has(i)) {
          const v = videoRefs.current[i];
          if (v) v.pause();
        }
      });
      return newActive;
    });
  }, [section, videos.length]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
      {videos.map((src, i) => (
        <video
          key={i}
          ref={el => { videoRefs.current[i] = el; }}
          src={src}
          muted
          playsInline
          loop
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: activeVideos.has(i) ? 0.7 : 0,
            transition: `opacity ${crossfadeDuration}ms ease`,
            zIndex: activeVideos.has(i) ? 2 : 1,
          }}
        />
      ))}
      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(5,5,5,0.2) 0%, #050505 100%)',
      }} />
    </div>
  );
}
