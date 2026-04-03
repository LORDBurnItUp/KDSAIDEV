'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const VexelHero = dynamic(() => import('@/components/VexelHero'), { ssr: false });
const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

export default function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const p = Math.min(window.scrollY / max, 1);
      setScrollProgress(p);
      setActiveSection(Math.min(5, Math.floor(p * 6)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrollTo = (i: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (i / 5) * max, behavior: 'smooth' });
  };

  const navLabels = ['Welcome', 'Vision', 'Features', 'Community', 'Dashboard', 'Launch'];

  // Fade in/out opacity per section
  const chapter = (idx: number) => {
    const start = idx / 6;
    const end = (idx + 1) / 6;
    const fadeIn = 0.04;
    const fadeOut = 0.03;
    if (scrollProgress < start) return Math.min(1, Math.max(0, (scrollProgress - (start - fadeIn)) / fadeIn));
    if (scrollProgress > end - fadeOut) return Math.min(1, Math.max(0, (end - scrollProgress) / fadeOut));
    return 1;
  };

  return (
    <>
      {/* ─── VEXEL 3D BACKGROUND (fixed, scroll-controlled) ─── */}
      <VexelHero />

      {/* ─── TOP BAR ─── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,5,16,0.2)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)', height: 44,
        display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(191,245,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BFF549', fontWeight: 900, fontSize: 10 }}>K</div>
          <span style={{ fontWeight: 800, fontSize: 13 }}><span style={{ color: '#BFF549' }}>KDS</span><span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: 10, marginLeft: 4 }}>2130</span></span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ l: 'Community', h: '/community' }, { l: 'Dashboard', h: '/dashboard' }, { l: 'GitHub', h: 'https://github.com/LORDBurnItUp/KDSAIDEV' }].map(n => (
            <a key={n.l} href={n.h} target={n.l === 'GitHub' ? '_blank' : undefined}
              style={{ padding: '4px 10px', borderRadius: 5, fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'all 0.15s' }}>{n.l}</a>
          ))}
        </div>
      </header>

      {/* ─── NAV DOTS (right side) ─── */}
      <nav style={{ position: 'fixed', right: 18, top: '50%', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {navLabels.map((l, i) => (
          <button key={i} onClick={() => scrollTo(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0', background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <span style={{ position: 'relative', width: 6, height: 6, borderRadius: '50%', background: activeSection === i ? '#BFF549' : 'rgba(255,255,255,0.12)', transition: 'all 0.3s', boxShadow: activeSection === i ? '0 0 8px rgba(191,245,73,0.4)' : 'none' }}>
              {activeSection === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '1px solid rgba(191,245,73,0.25)' }} />}
            </span>
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', whiteSpace: 'nowrap', color: activeSection === i ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)', transition: 'color 0.3s' }}>{l}</span>
          </button>
        ))}
      </nav>

      {/* ─── SCROLL JOURNEY ─── */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ═══ CH 1: HERO ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: 40, opacity: chapter(0), transition: 'opacity 0.4s ease' }}>
            <div style={{
              fontSize: 'clamp(4rem, 12vw, 10rem)', fontWeight: 900, lineHeight: 0.8, letterSpacing: '0.12em',
              background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 30%, #B8860B 60%, #8B6914 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 50px rgba(212,175,55,0.5)) drop-shadow(0 0 100px rgba(255,215,0,0.25))',
            }}>KDS</div>
            <p style={{ color: 'rgba(191,245,73,0.3)', fontSize: 'clamp(0.6rem, 1.2vw, 1rem)', letterSpacing: '0.45em', textTransform: 'uppercase', marginBottom: 16 }}>
              Kings Dripping Swag • 2130
            </p>
            <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(191,245,73,0.5), transparent)', margin: '0 auto 20px' }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Design meets intelligence in 3D space. Scroll to descend through the KDS universe.
            </p>
            <div style={{ animation: 'mc-bounce 2s ease-in-out infinite', fontSize: 16, color: 'rgba(191,245,73,0.2)' }}>↓</div>
          </div>
        </section>

        {/* ═══ CH 2: VISION ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 650, textAlign: 'center', padding: 40, opacity: chapter(1), transition: 'opacity 0.5s ease' }}>
            <span style={{ color: 'rgba(191,245,73,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em' }}>THE VISION</span>
            <h2 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 24, fontWeight: 800, marginTop: 8, marginBottom: 14, lineHeight: 1.3 }}>
              AI Community Hub — Connect. Build. Ship.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
              Developers, builders, and visionaries from another dimension. 12.8K+ humans creating the future — together.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 44 }}>
              {[{ n: '12.8K', l: 'Members' }, { n: '847', l: 'Active' }, { n: '99.7%', l: 'Uptime' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#BFF549', fontSize: 24, fontWeight: 800 }}>{s.n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 8, letterSpacing: '0.15em', marginTop: 4, textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CH 3: FEATURES ═══ */}
        <section style={{ minHeight: '150vh', padding: '60px 20px' }}>
          <div style={{ maxWidth: 850, margin: '0 auto', textAlign: 'center', opacity: chapter(2), transition: 'opacity 0.5s ease' }}>
            <span style={{ color: 'rgba(191,245,73,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em' }}>SIX PORTALS</span>
            <h2 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 36 }}>Infinite Possibilities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, maxWidth: 780, margin: '0 auto' }}>
              {[
                { ic: '🌐', t: 'AI Community Hub', d: 'Live video chat with 10 simultaneous cameras.' },
                { ic: '🛒', t: 'Marketplace', d: 'Sell automation, apps, websites. Your empire.' },
                { ic: '🖥️', t: 'Command Center', d: 'Deploy apps, track analytics. One interface.' },
                { ic: '⌨️', t: 'Terminal', d: 'Real CLI. Navigate at lightspeed.' },
                { ic: '💰', t: 'Affiliate Network', d: 'Earn by referring. Passive income.' },
                { ic: '✨', t: '4D Experience', d: 'Floating UI. Particle fields. Alive.' },
              ].map((f, i) => (
                <div key={i} style={{
                  background: 'rgba(5,5,16,0.35)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10,
                  padding: 18, textAlign: 'left',
                }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{f.ic}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{f.t}</div>
                  <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, lineHeight: 1.5 }}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CH 4: COMMUNITY ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 520, padding: 30, textAlign: 'center', opacity: chapter(3), transition: 'opacity 0.5s ease' }}>
            <span style={{ color: 'rgba(191,245,73,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em' }}>LIVE ACTIVITY</span>
            <h2 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: 800, marginTop: 8, marginBottom: 18 }}>What's Happening</h2>
            {[
              { a: '🤖', n: 'Lord Sav', t: '2m', c: 'Deployed Vexel 3D hero 🌌', r: '847' },
              { a: '👑', n: 'Omar', t: '15m', c: 'Building real AI community', r: '2.1K' },
              { a: '🎨', n: 'Alan V.', t: '28m', c: 'Mission Control is live', r: '623' },
              { a: '🔴', n: 'KDS', t: 'LIVE', c: 'Community showcase', r: '1.8K', live: true },
            ].map((p, i) => (
              <div key={i} style={{
                background: 'rgba(5,5,16,0.3)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.03)', borderRadius: 9,
                padding: 10, marginBottom: 6, display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: (p as any).live ? '1px solid #D95555' : '1px solid transparent' }}>{p.a}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 600 }}>{p.n}</span><span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 8, marginLeft: 5 }}>{p.t}</span></div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 1 }}>{p.c}</div>
                </div>
                <span style={{ color: '#BFF549', fontSize: 9, fontWeight: 700 }}>{p.r}</span>
              </div>
            ))}
            <a href="/community" style={{ display: 'inline-block', marginTop: 12, padding: '8px 24px', background: 'rgba(191,245,73,0.08)', border: '1px solid rgba(191,245,73,0.18)', color: '#BFF549', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none' }}>
              Enter Community →
            </a>
          </div>
        </section>

        {/* ═══ CH 5: DASHBOARD ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 450, padding: 30, textAlign: 'center', opacity: chapter(4), transition: 'opacity 0.5s ease' }}>
            <span style={{ color: 'rgba(191,245,73,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em' }}>MISSION CONTROL</span>
            <h2 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: 800, marginTop: 8, marginBottom: 14 }}>Your Command Center</h2>
            <div style={{ background: 'rgba(5,5,16,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[{ l: 'Messages', v: '12,847', c: '#BFF549' }, { l: 'Tool Calls', v: '8,291', c: '#60A5FA' }, { l: 'Content', v: '3,456', c: '#2ECC8F' }, { l: 'Uptime', v: '99.7%', c: '#FACC15' }].map((s, i) => (
                  <div key={i} style={{ padding: 10, borderRadius: 5, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, letterSpacing: '0.1em', marginBottom: 2 }}>{s.l}</div>
                    <div style={{ color: s.c, fontSize: 15, fontWeight: 800 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <a href="/dashboard" style={{ display: 'inline-block', marginTop: 12, padding: '8px 24px', background: 'rgba(191,245,73,0.08)', border: '1px solid rgba(191,245,73,0.18)', color: '#BFF549', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none' }}>
              Open Dashboard →
            </a>
          </div>
        </section>

        {/* ═══ CH 6: CTA ═══ */}
        <section style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', opacity: chapter(5), transition: 'opacity 0.5s ease' }}>
            <div style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '0.08em', marginBottom: 10,
              background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 30%, #B8860B 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.5))' }}>
              Ready to Teleport?
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, maxWidth: 380, margin: '0 auto 18px', lineHeight: 1.6 }}>
              Join the community from 2130. Build, earn, and connect.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="/community" style={{ padding: '10px 28px', background: 'rgba(191,245,73,0.08)', border: '1px solid rgba(191,245,73,0.2)', color: '#BFF549', borderRadius: 6, fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>Enter KDS →</a>
              <a href="/dashboard" style={{ padding: '10px 28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Dashboard</a>
            </div>
          </div>
        </section>
      </div>

      <AmbientSound />
      <style>{`@keyframes mc-bounce{0%,100%{transform:translateY(0);opacity:.2}50%{transform:translateY(8px);opacity:.6}}`}</style>
    </>
  );
}
