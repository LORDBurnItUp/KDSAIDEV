'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const VexelHero = dynamic(() => import('@/components/VexelHero'), { ssr: false });
const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// ═══════════════════════════════════════════
// 🎨 VEXEL x KDS — IMMERSIVE SCROLL
//
// Vexel 3D background: particle constellation, floating wireframes
// Community hub UI on glass panels
// Scroll = glitch chaos, screen tearing, RGB split
// ═══════════════════════════════════════════

// ─── SVG Icons (inline, zero deps) ───
const Icon: Record<string, JSX.Element> = {
  feed: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  people: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="17" cy="7" r="2.5"/><path d="M21 21v-2a3.5 3.5 0 00-2.5-3.5"/></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  market: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  database: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  ai: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a4 4 0 014 4v1h2a2 2 0 012 2v2a4 4 0 01-4 4H8a4 4 0 01-4-4V9a2 2 0 012-2h2V6a4 4 0 014-4z"/><circle cx="9" cy="13" r="0.5"/><circle cx="15" cy="13" r="0.5"/><path d="M15 17v3"/><path d="M9 17v3"/></svg>,
  video: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  events: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  game: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="13" r="0.5"/><circle cx="18" cy="11" r="0.5"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  more: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  thumbs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
  comment: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  live: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49"/><path d="M7.76 16.24a6 6 0 010-8.49"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M4.93 19.07a10 10 0 010-14.14"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
  bolt: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
};

// ─── App Icon ───
function AppIcon({ icon, label, color, badge }: { icon: string; label: string; color: string; badge?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6, padding: 14, borderRadius: 16, cursor: 'pointer',
        background: hover ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hover ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
        transition: 'all 0.2s', minWidth: 90 }}>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, transform: hover ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
        {Icon[icon] || Icon.star}
      </div>
      <span style={{ fontSize: 9, color: hover ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
        fontWeight: 500, letterSpacing: '0.03em', transition: 'color 0.2s' }}>{label}</span>
      {badge && <span style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%',
        background: '#D95555', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
    </button>
  );
}

// ─── Post Component ───
function Post({ avatar, name, time, content, type, reactions, comments, shares, isLive }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden',
      transition: 'border-color 0.2s', backdropFilter: 'blur(8px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: '2px solid transparent' }}>
          {avatar || '🧠'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.87)', fontSize: 13, fontWeight: 600 }}>{name}</span>
            {isLive && <span style={{ background: '#D95555', color: '#fff', fontSize: 7, padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</span>}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{time}</span>
        </div>
      </div>
      <div style={{ padding: '0 16px 10px' }}>
        <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 12, lineHeight: 1.5 }}>{content}</p>
      </div>
      {type === 'image' && <div style={{ height: 200, background: 'linear-gradient(135deg, rgba(191,245,73,0.08) 0%, rgba(96,165,250,0.08) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>🌌</span>
      </div>}
      {type === 'video' && <div style={{ height: 200, background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(167,139,250,0.08) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 36, opacity: 0.5 }}>▶</span>
      </div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {[{ icon: 'thumbs', label: reactions }, { icon: 'comment', label: comments }, { icon: 'share', label: shares }].map((a, i) => (
          <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.38)', cursor: 'pointer' }}>
            <span style={{ width: 14, height: 14 }}>{Icon[a.icon]}</span>
            <span style={{ fontSize: 10 }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 🏠 MAIN PAGE
// ═══════════════════════════════════════════
export default function CommunityHub() {
  const [activeNav, setActiveNav] = useState('feed');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const navItems = [
    { id: 'feed', icon: 'feed', label: 'Feed' },
    { id: 'groups', icon: 'people', label: 'Groups', badge: '3' },
    { id: 'live', icon: 'live', label: 'Live', badge: '1' },
    { id: 'market', icon: 'market', label: 'Market' },
    { id: 'ai', icon: 'ai', label: 'AI Lab' },
    { id: 'database', icon: 'database', label: 'DB' },
  ];

  const posts = [
    { avatar: '🤖', name: 'Lord Sav', time: '2 min ago', content: 'Just deployed the Vexel-style 3D constellation. Scroll down and watch it go completely insane. Particles everywhere, camera glitching — pure digital chaos 🔥', type: 'image', reactions: '2.4K', comments: '347', shares: '189' },
    { avatar: '👑', name: 'Omar Estrada', time: '15 min ago', content: 'Building a community that actually works. No bots, no spam — real humans, real connections.', type: '', reactions: '5.1K', comments: '892', shares: '412' },
    { avatar: '🎨', name: 'Alan Velasquez', time: '28 min ago', content: 'The 3D particle network is live. Hover to attract particles, scroll to trigger glitch chaos.', type: 'image', reactions: '1.2K', comments: '234', shares: '67' },
    { avatar: '🔴', name: 'KDS Official', time: 'Now', content: '🔴 LIVE: Community showcase — see what members built this week!', type: 'video', reactions: '3.8K', comments: '1.2K', shares: '245', isLive: true },
    { avatar: '🛠️', name: 'ClawCode Bot', time: '1h ago', content: 'CI/CD pipeline auto-deployed. Zero manual steps.', type: '', reactions: '456', comments: '89', shares: '23' },
  ];

  const trending = [
    { tag: '#AIAgents', posts: '12.4K', color: '#BFF549' },
    { tag: '#KDSBuild', posts: '8.2K', color: '#FACC15' },
    { tag: '#ClawCode', posts: '6.1K', color: '#60A5FA' },
    { tag: '#2130', posts: '3.9K', color: '#a78bfa' },
  ];

  const online = [
    { name: 'DevSarah', role: 'Full Stack', avatar: '👩‍💻' },
    { name: 'CryptoMax', role: 'AI Research', avatar: '🧬' },
    { name: 'PixelNinja', role: '3D Artist', avatar: '🎮' },
    { name: 'DataWhale', role: 'Analytics', avatar: '🐋' },
  ];

  return (
    <>
      {/* ─── VEXEL 3D BACKGROUND ─── */}
      <VexelHero />

      {/* ─── SCROLLABLE CONTENT (transparent bg, 3D shows through) ─── */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        {/* TOP BAR */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(5,5,16,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(191,245,73,0.12)', border: '1px solid rgba(191,245,73,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BFF549', fontWeight: 900, fontSize: 13 }}>K</div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>
                <span style={{ color: '#BFF549' }}>KDS</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: 12, marginLeft: 6 }}>2130</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.3)' }}>{Icon.search}</span>
              <input placeholder="Search KDS..." style={{ background: 'none', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 12, width: 180 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ width: 44, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer',
                background: activeNav === n.id ? 'rgba(191,245,73,0.08)' : 'transparent',
                borderBottom: activeNav === n.id ? '2px solid #BFF549' : '2px solid transparent',
                color: activeNav === n.id ? '#BFF549' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
                <span style={{ width: 18, height: 18 }}>{Icon[n.icon]}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ position: 'relative', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              <span style={{ width: 16, height: 16 }}>{Icon.chat}</span>
              <span style={{ position: 'absolute', top: -3, right: -3, width: 15, height: 15, borderRadius: '50%', background: '#D95555', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
            </button>
            <button style={{ position: 'relative', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              <span style={{ width: 16, height: 16 }}>{Icon.bell}</span>
              <span style={{ position: 'absolute', top: -3, right: -3, width: 15, height: 15, borderRadius: '50%', background: '#D95555', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>7</span>
            </button>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(191,245,73,0.1)', border: '1px solid rgba(191,245,73,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
          </div>
        </header>

        {/* MAIN */}
        <div style={{ display: 'flex', paddingTop: 52 }}>
          {/* LEFT SIDEBAR */}
          <aside style={{ position: 'fixed', top: 52, left: 0, bottom: 0, width: 240, padding: 16, borderRight: '1px solid rgba(255,255,255,0.04)', overflowY: 'auto',
            background: 'rgba(5,5,16,0.6)', backdropFilter: 'blur(16px)' }}>
            <div style={{ background: 'rgba(191,245,73,0.04)', border: '1px solid rgba(191,245,73,0.08)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: '2px solid #BFF549' }}>🧠</div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.87)', fontSize: 13, fontWeight: 600 }}>LORDBurnItDown</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>Founder • Level 7</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[{ l: 'Posts', v: '47' }, { l: 'Friends', v: '2.1K' }, { l: 'XP', v: '647' }].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ color: '#BFF549', fontSize: 12, fontWeight: 700 }}>{s.v}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {[{ id: 'feed', i: 'feed', l: 'Feed' }, { id: 'groups', i: 'people', l: 'Groups', b: '3' }, { id: 'live', i: 'live', l: 'Live', b: '1' },
              { id: 'market', i: 'market', l: 'Market' }, { id: 'ai', i: 'ai', l: 'AI Lab' }, { id: 'db', i: 'database', l: 'Database' },
              { id: 'code', i: 'code', l: 'Code' }, { id: 'events', i: 'events', l: 'Events' }, { id: 'game', i: 'game', l: 'Games' },
              { id: 'globe', i: 'globe', l: 'Global' }, { id: 'shield', i: 'shield', l: 'Security' }
            ].map((n, i) => (
              <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                background: activeNav === n.id ? 'rgba(191,245,73,0.06)' : 'transparent',
                color: activeNav === n.id ? '#BFF549' : 'rgba(255,255,255,0.45)',
                fontSize: 12, fontWeight: activeNav === n.id ? 600 : 400, width: '100%', transition: 'all 0.15s',
                fontFamily: "'Inter', sans-serif", border: 'none' }}>
                <span style={{ width: 18, height: 18 }}>{Icon[n.i]}</span>
                <span>{n.l}</span>
                {n.b && <span style={{ marginLeft: 'auto', background: '#D95555', color: '#fff', fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>{n.b}</span>}
              </button>
            ))}
          </aside>

          {/* FEED */}
          <main style={{ flex: 1, marginLeft: 240, marginRight: 280, padding: 20, maxWidth: '100%', overflowX: 'hidden' }}>
            {/* App Grid */}
            <div style={{ background: 'rgba(5,5,16,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <AppIcon icon="feed" label="Feed" color="#BFF549" />
                <AppIcon icon="chat" label="Messages" color="#60A5FA" badge="4" />
                <AppIcon icon="live" label="Live" color="#D95555" />
                <AppIcon icon="market" label="Market" color="#FACC15" />
                <AppIcon icon="database" label="Database" color="#a78bfa" />
                <AppIcon icon="ai" label="AI Lab" color="#f472b6" />
                <AppIcon icon="video" label="Videos" color="#34d399" />
                <AppIcon icon="game" label="Games" color="#fb923c" />
                <AppIcon icon="code" label="Code Studio" color="#38bdf8" />
                <AppIcon icon="events" label="Events" color="#fbbf24" />
                <AppIcon icon="shield" label="Security" color="#f87171" />
                <AppIcon icon="globe" label="Global" color="#a3e635" />
              </div>
            </div>

            {/* Create Post */}
            <div style={{ background: 'rgba(5,5,16,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '2px solid #BFF549' }}>🧠</div>
                <input placeholder="What's happening in 2130?" style={{ flex: 1, padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 10, justifyContent: 'space-around' }}>
                {[{ icon: 'video', label: 'Live', color: '#D95555' }, { icon: 'market', label: 'Sell', color: '#FACC15' }, { icon: 'ai', label: 'AI', color: '#f472b6' }].map((a, i) => (
                  <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: a.color, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                    <span style={{ width: 14 }}>{Icon[a.icon]}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map((p, i) => <Post key={i} {...p} />)}
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside style={{ position: 'fixed', top: 52, right: 0, bottom: 0, width: 280, padding: 16, borderLeft: '1px solid rgba(255,255,255,0.04)', overflowY: 'auto',
            background: 'rgba(5,5,16,0.5)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Online */}
            <div style={{ background: 'rgba(46,204,143,0.04)', border: '1px solid rgba(46,204,143,0.08)', borderRadius: 14, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ECC8F', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>12 Online</span>
              </div>
              {online.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '1.5px solid #2ECC8F' }}>{s.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>{s.role}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trending */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 12 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>🔥 Trending</div>
              {trending.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 4px', borderRadius: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: t.color }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500, flex: 1 }}>{t.tag}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>{t.posts}</span>
                </div>
              ))}
            </div>

            {/* AI */}
            <div style={{ background: 'rgba(244,114,182,0.04)', border: '1px solid rgba(244,114,182,0.1)', borderRadius: 14, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ color: '#f472b6' }}>{Icon.ai}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>KDS AI</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 8, marginBottom: 6, fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Scroll down and watch the chaos unfold. Particles, glitches, RGB split — all reactive to your scroll speed 🤯
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <input placeholder="Ask me..." style={{ flex: 1, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                <button style={{ padding: '5px 10px', background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: 6, color: '#f472b6', cursor: 'pointer' }}>{Icon.send}</button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 12 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>📊 Stats</div>
              {[{ l: 'Members', v: '12,847', c: '#BFF549' }, { l: 'Active Today', v: '1,247', c: '#2ECC8F' }, { l: 'Posts Today', v: '847', c: '#60A5FA' }, { l: 'Uptime', v: '99.7%', c: '#FACC15' }].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{s.l}</span>
                  <span style={{ color: s.c, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</span>
                </div>
              ))}
            </div>

            <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 8, textAlign: 'center', marginTop: 8 }}>
              KDS v2.0 • {time.toLocaleTimeString()}
            </div>
          </aside>
        </div>

        {/* Extra space for scroll-driven chaos */}
        <div style={{ height: '200vh' }} />
      </div>

      <AmbientSound />
    </>
  );
}
