'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const VexelHero = dynamic(() => import('@/components/VexelHero'), { ssr: false });
const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

export default function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tickT = setInterval(() => setTime(new Date()), 1000);
    let raf: number;
    const tickS = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setScrollProgress(Math.min(window.scrollY / max, 1));
      raf = requestAnimationFrame(tickS);
    };
    raf = requestAnimationFrame(tickS);
    return () => { clearInterval(tickT); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const p = scrollProgress;
    if (p < 0.15) setActiveSection(0);
    else if (p < 0.30) setActiveSection(1);
    else if (p < 0.45) setActiveSection(2);
    else if (p < 0.60) setActiveSection(3);
    else if (p < 0.75) setActiveSection(4);
    else setActiveSection(5);
  }, [scrollProgress]);

  const scrollTo = (i: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (i / 5) * max, behavior: 'smooth' });
  };

  const navLabels = ['Welcome', 'Vision', 'Features', 'Community', 'Dashboard', 'Launch'];

  const sectionOpacity = (idx: number, range: number = 0.15) => {
    const start = idx * range;
    const end = start + range;
    const fadeIn = range * 0.3;
    const fadeOut = range * 0.15;
    if (scrollProgress < start) return Math.max(0, (scrollProgress - (start - fadeIn)) / fadeIn);
    if (scrollProgress > end - fadeOut) return Math.max(0, (end - scrollProgress) / fadeOut);
    return 1;
  };

  return (
    <>
      {/* ─── VEXEL 3D BACKGROUND (fixed, scroll-controlled) ─── */}
      <VexelHero />

      {/* ─── NAV DOTS ─── */}
      <nav style={{
        position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
        zIndex: 50, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
      }}>
        {navLabels.map((l, i) => (
          <button key={i} onClick={() => scrollTo(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', cursor: 'pointer',
            background: 'none', border: 'none',
          }}>
            <span style={{
              position: 'relative', width: activeSection === i ? 8 : 6, height: activeSection === i ? 8 : 6,
              borderRadius: '50%', transition: 'all 0.3s ease',
              background: activeSection === i ? '#BFF549' : 'rgba(255,255,255,0.15)',
              boxShadow: activeSection === i ? '0 0 8px rgba(191,245,73,0.4)' : 'none',
            }}>
              {activeSection === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '1px solid rgba(191,245,73,0.3)', animation: 'navPulse 2s ease-in-out infinite' }} />}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', whiteSpace: 'nowrap',
              color: activeSection === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.15)',
              transition: 'color 0.3s',
            }}>{l}</span>
          </button>
        ))}
      </nav>

      {/* ─── TOP BAR ─── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,5,16,0.3)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)', height: 44,
        display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(191,245,73,0.1)', border: '1px solid rgba(191,245,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BFF549', fontWeight: 900, fontSize: 10 }}>K</div>
          <span style={{ fontWeight: 800, fontSize: 13 }}><span style={{ color: '#BFF549' }}>KDS</span><span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 10, marginLeft: 5 }}>2130</span></span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Community', 'Dashboard', 'Apps'].map(n => (
            <a key={n} href={n === 'Community' ? '/community' : n === 'Dashboard' ? '/dashboard' : '#'}
              style={{ padding: '4px 10px', borderRadius: 5, fontSize: 10, fontWeight: 500,
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.15s' }}>
              {n}
            </a>
          ))}
        </div>
      </header>

      {/* ─── SCROLL JOURNEY ─── */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ═══ CHAPTER 1: HERO ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: 40, opacity: sectionOpacity(0), filter: `blur(${(1 - Math.min(scrollProgress * 6, 1)) * 4}px)`, transition: 'opacity 0.3s' }}>
            <div style={{
              fontSize: 'clamp(4rem, 10vw, 9rem)', fontWeight: 900, lineHeight: 0.82,
              letterSpacing: '0.1em', marginBottom: 16,
              background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 35%, #B8860B 65%, #8B6914 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 50px rgba(212,175,55,0.5)) drop-shadow(0 0 100px rgba(255,215,0,0.25))',
            }}>KDS</div>
            <p style={{ color: 'rgba(191,245,73,0.35)', fontSize: 'clamp(0.7rem, 1.3vw, 1.1rem)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 20 }}>Kings Dripping Swag • 2130</p>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg, transparent, rgba(191,245,73,0.6), transparent)', margin: '0 auto 24px' }} />
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>Design meets intelligence in 3D space. Scroll to descend through the universe.</p>
            <div style={{ animation: 'scrollBounce 2s ease-in-out infinite', fontSize: 18, color: 'rgba(191,245,73,0.25)' }}>↓</div>
          </div>
        </section>

        {/* ═══ CHAPTER 2: VISION ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 700, textAlign: 'center', padding: 40, opacity: sectionOpacity(1) }}>
            <span style={{ color: 'rgba(191,245,73,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>THE VISION</span>
            <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 28, fontWeight: 800, marginTop: 10, marginBottom: 16 }}>AI Community Hub — Connect. Build. Ship.</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
              Developers, builders, and dreamers from another dimension. Real humans, real connections. No bots, no spam.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
              {[{ n: '12.8K', l: 'Members' }, { n: '847', l: 'Active Today' }, { n: '99.7%', l: 'Uptime' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#BFF549', fontSize: 26, fontWeight: 800 }}>{s.n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CHAPTER 3: FEATURES ═══ */}
        <section style={{ minHeight: '150vh', padding: '80px 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ color: 'rgba(191,245,73,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>SIX PORTALS</span>
            <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 26, fontWeight: 800, marginTop: 8, marginBottom: 40 }}>Infinite Possibilities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, maxWidth: 800, margin: '0 auto' }}>
              {[
                { ic: '🌐', t: 'AI Community Hub', d: 'Live video chat with 10 simultaneous cameras. Connect from anywhere.' },
                { ic: '🛒', t: 'Digital Marketplace', d: 'Sell automation, websites, apps, games. Your skills, your empire.' },
                { ic: '🖥️', t: 'Command Center', d: 'Holographic dashboard. Deploy apps, track analytics from one interface.' },
                { ic: '⌨️', t: 'Built-in Terminal', d: 'Real CLI connected to your machine. Navigate at lightspeed.' },
                { ic: '💰', t: 'Affiliate Network', d: 'Earn by referring. Multiple programs built in. Passive income.' },
                { ic: '✨', t: '4D Experience', d: 'Blackhole transitions. Floating UI. Particle fields. Alive.' },
              ].map((f, i) => (
                <div key={i} style={{
                  background: 'rgba(5,5,16,0.4)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12,
                  padding: 22, textAlign: 'left',
                  opacity: Math.min(1, Math.max(0, (scrollProgress - (0.28 + i * 0.02)) * 5)),
                  transition: 'all 0.4s ease',
                }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{f.ic}</div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{f.t}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.5 }}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CHAPTER 4: COMMUNITY ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 550, padding: 30, textAlign: 'center', opacity: sectionOpacity(3) }}>
            <span style={{ color: 'rgba(191,245,73,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>LIVE FEED</span>
            <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 20 }}>What's Happening Now</h2>
            {[
              { a: '🤖', n: 'Lord Sav', t: '2m', c: 'Deployed Vexel 3D hero 🌌', r: '847' },
              { a: '👑', n: 'Omar', t: '15m', c: 'Building a real AI community', r: '2.1K' },
              { a: '🎨', n: 'Alan V.', t: '28m', c: 'Mission Control is live', r: '623' },
              { a: '🔴', n: 'KDS', t: 'Now', c: 'LIVE: Community showcase', r: '1.8K', live: true },
            ].map((p, i) => (
              <div key={i} style={{ background: 'rgba(5,5,16,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, border: (p as any).live ? '1.5px solid #D95555' : '1.5px solid transparent' }}>{p.a}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600 }}>{p.n}</span><span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 8, marginLeft: 6 }}>{p.t} ago</span></div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2 }}>{p.c}</div>
                </div>
                <span style={{ color: '#BFF549', fontSize: 10, fontWeight: 700 }}>♥ {p.r}</span>
              </div>
            ))}
            <a href="/community" style={{ display: 'inline-block', marginTop: 14, padding: '10px 28px', background: 'rgba(191,245,73,0.08)', border: '1px solid rgba(191,245,73,0.2)', color: '#BFF549', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none' }}>
              Enter Community →
            </a>
          </div>
        </section>

        {/* ═══ CHAPTER 5: DASHBOARD PREVIEW ═══ */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 480, padding: 30, textAlign: 'center', opacity: sectionOpacity(4) }}>
            <span style={{ color: 'rgba(191,245,73,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>MISSION CONTROL</span>
            <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Your Command Center</h2>
            <div style={{ background: 'rgba(5,5,16,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14, justifyContent: 'center' }}>
                {['Command', 'Tasks', 'Brain'].map((t, i) => (
                  <span key={i} style={{ padding: '2px 7px', borderRadius: 3, fontSize: 7, fontWeight: 700, letterSpacing: '0.05em', background: i === 0 ? 'rgba(191,245,73,0.1)' : 'rgba(255,255,255,0.03)', color: i === 0 ? '#BFF549' : 'rgba(255,255,255,0.25)' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{ l: 'Messages', v: '12,847', c: '#BFF549' }, { l: 'Tool Calls', v: '8,291', c: '#60A5FA' }, { l: 'Content', v: '3,456', c: '#2ECC8F' }, { l: 'Uptime', v: '99.7%', c: '#FACC15' }].map((s, i) => (
                  <div key={i} style={{ padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, letterSpacing: '0.1em', marginBottom: 3, textTransform: 'uppercase' }}>{s.l}</div>
                    <div style={{ color: s.c, fontSize: 16, fontWeight: 800 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <a href="/dashboard" style={{ display: 'inline-block', marginTop: 14, padding: '10px 28px', background: 'rgba(191,245,73,0.08)', border: '1px solid rgba(191,245,73,0.2)', color: '#BFF549', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none' }}>
              Open Dashboard →
            </a>
          </div>
        </section>

        {/* ═══ CHAPTER 6: CTA ═══ */}
        <section style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', opacity: sectionOpacity(5) }}>
            <div style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, letterSpacing: '0.08em', marginBottom: 12,
              background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 35%, #B8860B 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.5))' }}>
              Ready to Teleport?
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Join the community from 2130. Build, earn, and connect.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="/community" style={{ padding: '12px 32px', background: 'rgba(191,245,73,0.1)', border: '1px solid rgba(191,245,73,0.25)', color: '#BFF549', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                Enter KDS →
              </a>
              <a href="/dashboard" style={{ padding: '12px 32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                Dashboard
              </a>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.08)', fontSize: 7, marginTop: 40, letterSpacing: '0.2em' }}>KDS v2.0 • {time.toLocaleTimeString()} UTC</div>
        </section>
      </div>

      <AmbientSound />
      <style>{`
        @keyframes scrollBounce{0%,100%{transform:translateY(0);opacity:.3}50%{transform:translateY(8px);opacity:.7}}
        @keyframes navPulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.8)}}
      `}</style>
    </>
  );
}
