'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

const SplineScene = dynamic(() => import('@/components/SplineScene'), { ssr: false });
const ScrollCanvas = dynamic(() => import('@/components/ScrollCanvas'), { ssr: false });
const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });
const VideoBackground = dynamic(() => import('@/components/VideoBackground'), { ssr: false });
const CoreIntelligenceSphere = dynamic(() => import('@/components/CoreIntelligenceSphere'), { ssr: false });

// ════════════════════════════════════════════════════════
// SPLINE + IMAGE SEQUENCE CONFIG
// ════════════════════════════════════════════════════════
const SPLINE_URL = 'https://prod.spline.design/kMWi1sxpCPiTM5ha/scene.splinecode';
const USE_SPLINE = SPLINE_URL.length > 20;
const USE_IMAGE_SEQUENCE = false; // Set true + provide framePath below
const FRAME_COUNT = 120;
const framePath = (i: number) => `/sequence/frame_${i}.webp`;

// Shared mouse state
const mouseVec = { x: 0, y: 0 };

// ════════════════════════════════════════════════════════
// SCROLL SECTIONS — 4 beats (Antigravity scrollytelling)
// ════════════════════════════════════════════════════════
const sections = [
  { label: '// KDS AI', title: 'Design meets\nintelligence in 3D space.', body: 'A modern framework built for AI brands — minimal, dynamic, and deeply interactive. Make your presence feel intelligent from the very first pixel.', cta: 'EXPLORE KDS', gradient: ['#FF6600', '#FF4500'], videos: ['/videos/kds-clip-1.mp4', '/videos/kds-clip-2.mp4', '/videos/kds-clip-3.mp4', '/videos/kds-clip-4.mp4', '/videos/kds-clip-5.mp4', '/videos/kds-clip-6.mp4', '/videos/kds-clip-7.mp4'], glow: 'rgba(255,102,0,0.3)', align: 'center' as const, features: null },
  { label: '// ABOUT', title: "KDS isn't a tool—\nit's an autonomous AI.", body: 'It interprets data, form, and function to generate immersive web experiences through motion, geometry, and spatial intelligence. KDS doesn\'t just build — it thinks in design.', cta: null, gradient: ['#565656', '#707070'], videos: ['/videos/kds-clip-8.mp4', '/videos/kds-clip-9.mp4', '/videos/kds-clip-10.mp4', '/videos/kds-clip-11.mp4', '/videos/kds-clip-12.mp4', '/videos/kds-clip-13.mp4', '/videos/kds-clip-14.mp4'], glow: 'rgba(112,112,112,0.2)', align: 'left' as const, features: [{ icon: '●', text: 'Modular\nAI Components' }, { icon: '│', text: 'Adaptive\nWeb Architecture' }, { icon: '×', text: 'Realtime\n3D Interactions' }, { icon: '↗', text: 'Minimum Effort\nMaximum Impact' }] },
  { label: '// FEATURES', title: "KDS isn't just smart.\nIt learns, evolves, adapts.", body: 'Scroll through the KDS universe — each section reveals a new chapter of our AI-powered platform.', cta: null, gradient: ['#3377CC', '#44CC77'], videos: ['/videos/kds-clip-15.mp4', '/videos/kds-clip-16.mp4', '/videos/kds-clip-17.mp4', '/videos/kds-clip-18.mp4', '/videos/kds-clip-19.mp4', '/videos/kds-clip-20.mp4', '/videos/kds-clip-21.mp4'], glow: 'rgba(51,119,204,0.2)', align: 'right' as const, features: null },
  { label: '// GET STARTED', title: 'Launch with\nKDS', body: null, cta: 'ENTER KDS →', gradient: ['#BFF549', '#BFF549'], videos: ['/videos/kds-clip-22.mp4', '/videos/kds-clip-23.mp4', '/videos/kds-clip-24.mp4', '/videos/kds-clip-25.mp4', '/videos/kds-clip-26.mp4', '/videos/kds-clip-27.mp4', '/videos/kds-clip-28.mp4'], glow: 'rgba(191,245,73,0.3)', align: 'center' as const, features: null, link: '/community' },
];

// ════════════════════════════════════════════════════════
// LOADING SCREEN
// ════════════════════════════════════════════════════════
function LoadingScreen({ progress }: { progress: number }) {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#06040A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.5s', opacity: progress < 100 ? 1 : 0, pointerEvents: progress < 100 ? 'auto' : 'none' }}>
    <svg width="140" height="140" viewBox="0 0 164 164" style={{ marginBottom: 24 }}>
      <circle r="80" cx="82" cy="82" fill="transparent" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="502.65" />
      <circle r="80" cx="82" cy="82" fill="transparent" stroke="#fff" strokeWidth="2" strokeDasharray="502.65" strokeDashoffset={`${502.65 * (1 - progress / 100)}`} style={{ transition: 'stroke-dashoffset 0.05s' }} />
    </svg>
    <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(191,245,73,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", color: '#BFF549', fontWeight: 700, fontSize: 16 }}>K</div>
    </div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fff', fontSize: 12, fontWeight: 500, marginTop: 24 }}>{Math.round(progress)}%</div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.2)', fontSize: 9, marginTop: 6 }}>Loading 3D experience...</div>
  </div>;
}

// ════════════════════════════════════════════════════════
// TEXT OVERLAY — Antigravity scroll beats
// Opacity: [start, start+0.1, end-0.1, end] → [0, 1, 1, 0]
// Y offset: enter 20px → 0, exit 0 → -20px
// ════════════════════════════════════════════════════════
function TextBeat({ section, totalProgress, link }: { section: typeof sections[0], totalProgress: number, link?: string }) {
  const idx = sections.indexOf(section);
  const sectionLen = 1 / sections.length;
  const sectionStart = idx * sectionLen;
  const sectionEnd = (idx + 1) * sectionLen;
  const fadeInEnd = sectionStart + sectionLen * 0.1;
  const fadeOutStart = sectionEnd - sectionLen * 0.1;

  let opacity = 0;
  if (totalProgress >= sectionStart && totalProgress < fadeInEnd) {
    opacity = (totalProgress - sectionStart) / (fadeInEnd - sectionStart);
  } else if (totalProgress >= fadeInEnd && totalProgress < fadeOutStart) {
    opacity = 1;
  } else if (totalProgress >= fadeOutStart && totalProgress < sectionEnd) {
    opacity = (sectionEnd - totalProgress) / (sectionEnd - fadeOutStart);
  }

  const yOffset = opacity < 0.05 ? (totalProgress < fadeInEnd ? 20 : -20) : opacity < 1 ? (totalProgress < fadeInEnd ? 20 * (1 - opacity) : -20 * (1 - opacity)) : 0;
  const isActive = opacity > 0.5;

  const horizontalStyle: React.CSSProperties = section.align === 'left'
    ? { textAlign: 'left', alignItems: 'flex-start', paddingLeft: '10%' }
    : section.align === 'right'
      ? { textAlign: 'right', alignItems: 'flex-end', paddingRight: '10%' }
      : { textAlign: 'center', alignItems: 'center' };

  return <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: opacity > 0.3 ? 'auto' : 'none', zIndex: 10, opacity, transform: `translateY(${yOffset}px)`, transition: 'opacity 0.3s ease, transform 0.3s ease', ...horizontalStyle }}>
    <div style={{ padding: 60, maxWidth: 550 }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: `${section.gradient[1]}15`, fontSize: 9, fontWeight: 500, letterSpacing: 0.15 }}>{section.label}</span>
      <h1 style={{ fontFamily: "'Inter', sans-serif", color: (section.label === '// KDS AI' || section.label === '// GET STARTED') ? 'transparent' : 'rgba(255,255,255,0.9)', fontSize: section.label === '// KDS AI' ? 'clamp(2.8rem,8vw,6rem)' : section.label === '// GET STARTED' ? 'clamp(2.5rem,7vw,5rem)' : 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, marginTop: 4, marginBottom: 8, lineHeight: 1.05, whiteSpace: 'pre-line', ...(isActive && (section.label === '// KDS AI' || section.label === '// GET STARTED')) ? { background: `linear-gradient(180deg,${section.gradient[0]},${section.gradient[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 25px ${section.gradient[0]}30)` } : {} }}>{isActive ? section.title : ''}</h1>
      {section.body && isActive && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>{section.body}</p>}
      {section.features && isActive && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 560, margin: '0 auto 24px' }}>{section.features.map((f, i) => <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '16px 12px' }}><span style={{ color: section.gradient[1], fontSize: 16, fontFamily: "'JetBrains Mono', monospace", display: 'block', marginBottom: 10 }}>{f.icon}</span><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-line', lineHeight: 1.4 }}>{f.text}</span></div>)}</div>}
      {section.cta && isActive && (link ? <a href={link} style={{ display: 'inline-block', padding: '8px 22px', background: `${section.gradient[1]}06`, border: `1px solid ${section.gradient[1]}12`, color: section.gradient[1], borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.08em', textDecoration: 'none' }}>{section.cta}</a> : <span style={{ display: 'inline-block', padding: '8px 22px', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.08em' }}>{section.cta}</span>)}
      {isActive && totalProgress < 0.9 && <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.06)', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", animation: 'mc-b 2.5s ease-in-out infinite' }}>SCROLL ↓</div>}
      {section.label === '// GET STARTED' && isActive && <div style={{ marginTop: 50, color: 'rgba(255,255,255,0.08)', fontSize: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.1 }}>© 2130 — KDS INC. All rights reserved</div>}
    </div>
  </div>;
}

// ════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════
export default function HomePage() {
  const [totalProgress, setTotalProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [splineLoaded, setSplineLoaded] = useState(false);

  // Loading animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let p = 0;
    const ease = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    interval = setInterval(() => { p += Math.round((ease((p + 50) / 6000) - ease(p / 6000)) * 100); p = Math.min(p, 75); setLoadPct(p); if (p >= 75) clearInterval(interval); }, 50);
    setTimeout(() => { clearInterval(interval); setLoadPct(100); setTimeout(() => setLoaded(true), 500); }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll tracking: 0 → 1 across entire page
  useEffect(() => {
    let raf: number;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const t = Math.min(window.scrollY / max, 0.999);
      setTotalProgress(t);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Mouse tracking
  const onMove = useCallback((e: React.PointerEvent) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  // Active section
  const secLen = 1 / sections.length;
  const activeIdx = Math.min(sections.length - 1, Math.floor(totalProgress / secLen));
  const ch = sections[activeIdx];

  return <>
    <style>{`@keyframes mc-b{0%,100%{transform:translateY(0);opacity:.06}50%{transform:translateY(5px);opacity:.12}}*{scrollbar-width:none}::-webkit-scrollbar{display:none}`}</style>

    {/* Loading Screen */}
    <LoadingScreen progress={loaded && (USE_SPLINE ? splineLoaded : true) ? 100 : loadPct} />

    {loaded && <>
      {/* ─── 3D BACKGROUND (Spline OR Image Sequence OR fallback) ─── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#050505', transition: 'background .5s' }} onPointerMove={onMove}>
        <VideoBackground section={activeIdx} videos={ch.videos} />
        {USE_SPLINE && <SplineScene
          url={SPLINE_URL}
          className=""
          style={{ width: '100%', height: '100%', background: '#050505' }}
          onLoad={() => { console.log('Spline scene loaded'); setSplineLoaded(true); }}
          interactive={true}
        />}

        {/* Fallback: Core Intelligence Sphere if Spline isn't available */}
        {!USE_SPLINE && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CoreIntelligenceSphere autoRotate mouseReact size={1.5} color={ch.gradient[0]} accentColor={ch.gradient[1]} />
          </div>
        )}

        {/* Fallback: Image Sequence if neither Spline nor Three.js */}
        {!USE_SPLINE && USE_IMAGE_SEQUENCE && <ScrollCanvas frameCount={FRAME_COUNT} framePath={framePath} canvasHeight={undefined as any} />}

        {/* Letterbox bars */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 15, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 15, pointerEvents: 'none' }} />

        {/* Vignette overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(5,5,5,0.6) 100%)' }} />
      </div>

      {/* ─── SCROLL HEIGHT (400vh for 4 sections) ─── */}
      <div style={{ height: `${sections.length * 100}vh`, position: 'relative', zIndex: 20 }} />

      {/* ─── TEXT OVERLAYS (fixed, scroll-driven) ─── */}
      {sections.map((s, i) => <TextBeat key={i} section={s} totalProgress={totalProgress} link={s['link' as keyof typeof s] as string} />)}

      {/* ─── TOP BAR ─── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 44, alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', display: 'flex' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: `${ch.gradient[1]}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ch.gradient[1], fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 10, transition: 'all .4s' }}>K</div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: ch.gradient[1], letterSpacing: '.1em', transition: 'color .4s' }}>{ch.label.replace('// ', '')}</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Community', 'Dashboard'].map(n => <a key={n} href={n === 'Community' ? '/community' : '/dashboard'} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{n}</a>)}
        </div>
      </header>

      {/* ─── NAV DOTS ─── */}
      <nav style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sections.map((s, i) => {
          const isActive = activeIdx === i;
          return <button key={i} onClick={() => { const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); window.scrollTo({ top: (i / (sections.length - 1)) * max, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ position: 'relative', width: isActive ? 5 : 3, height: isActive ? 5 : 3, borderRadius: '50%', background: isActive ? s.gradient[1] : 'rgba(255,255,255,0.04)', transition: 'all .3s', boxShadow: isActive ? `0 0 6px ${s.gradient[1]}20` : 'none' }}>
              {isActive && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${s.gradient[1]}10` }} />}
            </span>
          </button>;
        })}
      </nav>

      {/* ─── SCROLL PROGRESS BAR ─── */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 1, background: `linear-gradient(90deg, ${ch.gradient[0]}, ${ch.gradient[1]})`, width: `${totalProgress * 100}%`, zIndex: 55, transition: 'background .3s' }} />
    </>}

    <AmbientSound />
  </>;
}
