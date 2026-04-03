'use client';

import { useState, useEffect } from 'react';

// ════════════════════════════════════════
// 🎨 DESIGN SYSTEM — Vanilla CSS (Dark Mode)
// ════════════════════════════════════════
const DS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg-side: #0D0D0D; --bg-page: #121212; --bg-card: #1E1E1E;
    --bg-hov: #252525; --bg-el: #2A2A2A; --bg-in: rgba(255,255,255,0.035);
    --bd: rgba(255,255,255,0.06); --bd-h: rgba(255,255,255,0.1);
    --tp: rgba(255,255,255,0.87); --ts: rgba(255,255,255,0.60);
    --tm: rgba(255,255,255,0.38); --td: rgba(255,255,255,0.25);
    --or: #E5850F; --bl: #5A9CF5; --gn: #2ECC8F; --rd: #D95555;
  }
  @keyframes p{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
  @keyframes f{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes s{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
  body{font-family:'Inter',system-ui,sans-serif;background:var(--bg-page);color:var(--tp);overflow-x:hidden}
  .mc-f{animation:f .35s ease both}.mc-s{animation:s .25s ease both}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:3px}
  ::selection{background:rgba(229,133,15,0.3)}
`;

// ════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════
function Sidebar({ page, go }: { page: string; go: (p: string) => void }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  const items = [
    ['🎛️', 'command', 'Command Center'],
    ['✅', 'tasks', 'Tasks & Projects'],
    ['📺', 'content', 'Content Intel'],
    ['🧠', 'brain', 'Second Brain'],
    ['⚡️', 'productivity', 'Productivity'],
    ['🔌', 'connections', 'Connections'],
    ['⚙️', 'settings', 'Settings'],
  ];

  const titles: Record<string, string> = { command: 'Field Agent', tasks: 'Strategist', content: 'Analyst', brain: 'Archivist', productivity: 'Operator', connections: 'Integrator', settings: 'Architect' };

  return (
    <aside style={{ ...sidebar }}>
      <div style={{ padding: '16px 16px 10px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={logo}><span>K</span></div>
        <div>
          <div style={{ color: 'var(--tp)', fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em' }}>Mission Control</div>
          <div style={ver}>KDS v2.0 • {time.toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="mc-s" style={{ ...agentCard, margin: '0 12px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <div style={pulse} />
          <span style={{ color: 'var(--gn)', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>ONLINE</span>
        </div>
        <div style={{ color: 'var(--ts)', fontSize: 9 }}>Lord Sav · {titles[page] || 'General'}</div>
      </div>

      <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {items.map(([icon, id, label], i) => {
          const on = page === id;
          return (
            <button key={id} onClick={() => go(id)} className="mc-f" style={{
              ...navBtn, background: on ? 'rgba(229,133,15,0.07)' : 'transparent',
              border: on ? '1px solid rgba(229,133,15,0.1)' : '1px solid transparent',
              color: on ? 'var(--tp)' : 'var(--td)', fontWeight: on ? 600 : 400,
              animationDelay: `${i * 35}ms`,
            }}>
              <span style={{ fontSize: 12, opacity: on ? 1 : 0.4 }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '12px 16px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: 'var(--or)', fontSize: 9, fontWeight: 700 }}>Level 7 — Field Agent</span>
          <span style={{ color: 'var(--td)', fontSize: 8 }}>647/1000</span>
        </div>
        <div style={xpBar}><div style={{ ...xpFill, width: '64.7%' }} /></div>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════
// STAT CARD
// ════════════════════════════════════════
function Stat({ label, value, delta, color, delay = 0 }: any) {
  return (
    <div className="mc-f" style={{ ...card, animationDelay: `${delay}ms` }}>
      <div style={{ height: 1, background: `linear-gradient(90deg,${color}22 0%,transparent 100%)` }} />
      <div style={{ padding: '10px 12px' }}>
        <div style={{ color: 'var(--td)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--tp)', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{value}</span>
          <span style={{ color, fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap' }}>{delta}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TODO WIDGET
// ════════════════════════════════════════
function Todos() {
  const [todos, setTodos] = useState<{id:number;text:string;done:boolean}[]>(() => {
    try { return JSON.parse(localStorage.getItem('kdt')||'[]'); } catch { return []; }
  });
  const [inpt, setInpt] = useState('');

  useEffect(() => { localStorage.setItem('kdt', JSON.stringify(todos)); }, [todos]);

  const add = () => { if (!inpt.trim()) return; setTodos(t => [...t, { id: Date.now(), text: inpt, done: false }]); setInpt(''); };
  const tog = (id: number) => setTodos(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const del = (id: number) => setTodos(t => t.filter(x => x.id !== id));

  return (
    <div style={cardHov}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
        <input className="mc-input" value={inpt} onChange={e => setInpt(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add a task..." style={{ flex: 1 }} />
        <button onClick={add} className="mc-btn">Add</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 160, overflowY: 'auto' }}>
        {todos.length === 0 && <div style={{ color: 'var(--td)', fontSize: 10, textAlign: 'center', padding: '12px 0' }}>No todos yet</div>}
        {todos.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 5px', borderRadius: 4, background: t.done ? 'rgba(46,204,143,0.04)' : 'rgba(255,255,255,0.015)' }}>
            <button onClick={() => tog(t.id)} style={{ width: 13, height: 13, borderRadius: 3, border: t.done ? 'none' : '1px solid rgba(255,255,255,0.12)', background: t.done ? 'var(--gn)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
              {t.done && <span style={{ color: '#000', fontSize: 8 }}>✓</span>}
            </button>
            <span style={{ flex: 1, fontSize: 11, color: t.done ? 'var(--td)' : 'var(--ts)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            <button onClick={() => del(t.id)} style={{ color: 'var(--td)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 🎛️ COMMAND CENTER
// ════════════════════════════════════════
function CommandCenter() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  const acts = [
    { ico: '📨', type: 'Message', detail: 'Processed Telegram DM from LORDBurnitup', time: '2m ago' },
    { ico: '🤖', type: 'Agent Spawn', detail: 'Spawned CI/CD workflow sub-agent', time: '5m ago' },
    { ico: '🚀', type: 'Deploy', detail: 'Pushed ThreeHero → kingsdrippingswag.io', time: '12m ago' },
    { ico: '🔧', type: 'Git Push', detail: 'Committed 731 lines to KDSAIDEV', time: '14m ago' },
    { ico: '📡', type: 'Heartbeat', detail: 'System health check — all green', time: '15m ago' },
    { ico: '🎨', type: 'Build', detail: 'Mission Control dashboard built (7 pages)', time: '18m ago' },
    { ico: '📦', type: 'Deploy', detail: 'rsync 79MB → Hostinger (SSH key auth)', time: '22m ago' },
    { ico: '⚡️', type: 'Tool', detail: 'Claw Code parity audit completed', time: '28m ago' },
    { ico: '🔑', type: 'Security', detail: 'Passwordless SSH deploy key installed', time: '35m ago' },
    { ico: '📊', type: 'Dashboard', detail: 'Kanban + Content Intel + Brain tabs live', time: '40m ago' },
  ];

  return (
    <>
      <Header title="Command Center" sub="Real-time overview of everything your agent is doing" />

      <div className="mc-f" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14, gap: 5 }}>
        <Stat label="Messages Handled" value="12,847" delta="+342 today" color="var(--or)" delay={60} />
        <Stat label="Tool Calls" value="8,291" delta="+156 today" color="var(--bl)" delay={100} />
        <Stat label="Content Synced" value="3,456" delta="+89 today" color="var(--gn)" delay={140} />
        <Stat label="Agent Uptime" value="99.7%" delta="22d 14h" color="var(--rd)" delay={180} />
      </div>

      <div className="mc-f" style={{ ...card, padding: '12px 14px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600 }}>Live Activity Feed</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={pulse} />
            <span style={{ color: 'var(--gn)', fontSize: 8, fontWeight: 700 }}>LIVE</span>
            <span style={{ color: 'var(--td)', fontSize: 9, marginLeft: 4 }}>{time.toLocaleTimeString()}</span>
          </div>
        </div>
        {acts.map((a, i) => (
          <div key={i} className="mc-f" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 4, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', animationDelay: `${i * 40}ms` }}>
            <span style={{ fontSize: 13, width: 20, textAlign: 'center', flexShrink: 0 }}>{a.ico}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ color: 'var(--tp)', fontSize: 11, fontWeight: 500 }}>{a.type}</span>
              <span style={{ color: 'var(--ts)', fontSize: 10 }}> — {a.detail}</span>
            </div>
            <span style={{ color: 'var(--td)', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{a.time}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ ...card, padding: '12px 14px' }}>
          <div style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Agent Configuration</div>
          {[['Model','qwen/qwen3.6-plus:free'],['Provider','kilocode'],['Memory Stack','MEMORY.md + daily logs'],
            ['Heartbeat','Every 30 min'],['Exec Access','Full (passwordless SSH)'],['GitHub','90+ repos']].map(([k,v],i) => (
            <div key={i} style={{ display: 'flex', gap: 4, justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 5 ? '1px solid var(--bd)' : 'none' }}>
              <span style={{ color: 'var(--td)', fontSize: 10 }}>{k}</span>
              <span style={{ color: 'var(--tp)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding: '12px 14px' }}>
          <div style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[{i:'💓',l:'Heartbeat',c:'var(--gn)'},{i:'🔄',l:'Sync Content',c:'var(--bl)'},{i:'📊',l:'Daily Brief',c:'var(--or)'},{i:'🚀',l:'Deploy',c:'var(--rd)'}].map((a,j) => (
              <button key={j} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bd)', cursor: 'pointer' }}>
                <span>{a.i}</span><span style={{ color: a.c, fontSize: 10, fontWeight: 500 }}>{a.l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════
// ⚡️ PRODUCTIVITY
// ════════════════════════════════════════
function ProductivityPage() {
  const now = new Date();
  const di = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
  const phase = di <= 30 ? 'Foundation' : di <= 60 ? 'Growth' : 'Scale';
  const pd = di <= 30 ? di : di <= 60 ? di - 30 : di - 60;
  const msgs = ['Just getting started — keep going', 'Building momentum', 'Halfway there — incredible', 'Almost at the finish line'];
  const mi = pd <= 10 ? 0 : pd <= 20 ? 1 : pd <= 25 ? 2 : 3;

  return (
    <>
      <Header title="Productivity" sub={`90-Day tracker • ${phase} phase (Day ${pd}/30)`} />

      <div className="mc-f" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 12, gap: 5 }}>
        <Stat label="Day" value={String(di)} delta="of 365" color="var(--or)" delay={60} />
        <Stat label="Phase" value={phase} delta={`${pd}/30`} color="var(--bl)" delay={100} />
        <Stat label="Streak" value={`${pd}d`} delta="current" color="var(--gn)" delay={140} />
        <Stat label="Message" value="🔥" delta={msgs[mi]} color="var(--rd)" delay={180} />
      </div>

      <div className="mc-f" style={{ ...card, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 3 }}>1. Habit Tracker — 90 Days</div>
        <div style={{ color: 'var(--td)', fontSize: 10, marginBottom: 8 }}>Click to mark. Green = done, Blue = today, Dark = upcoming</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30,1fr)', gap: 2, marginBottom: 4 }}>
          {Array.from({ length: 90 }, (_, i) => {
            const t = i === di; const d = i < di;
            return <div key={i} className="mc-f" style={{ aspectRatio: '1', borderRadius: 2, background: t ? 'var(--bl)' : d ? 'var(--gn)' : 'rgba(255,255,255,0.03)', opacity: d ? .35 + (i/90)*.65 : 1, border: t ? '1px solid rgba(90,156,245,0.4)' : '1px solid transparent', animationDelay: `${i*12}ms`, cursor: 'pointer' }} />;
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--td)', fontSize: 8 }}>Day 1</span><span style={{ color: 'var(--td)', fontSize: 8 }}>30</span><span style={{ color: 'var(--td)', fontSize: 8 }}>60</span><span style={{ color: 'var(--td)', fontSize: 8 }}>90</span></div>
      </div>

      <div style={{ ...card, padding: '12px 14px' }}>
        <div style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>2. Productivity Todos</div>
        <Todos />
      </div>
    </>
  );
}

// ════════════════════════════════════════
// ✅ TASKS & PROJECTS
// ════════════════════════════════════════
function TasksPage() {
  const [view, setView] = useState('human');
  const pC: any = { high: 'var(--rd)', medium: 'var(--or)', low: 'var(--bl)' };
  const d: any = {
    human: {
      todo: [{ t: 'Finalize KDS brand assets', p: 'high' }, { t: 'Set up payment processing', p: 'medium' }, { t: 'Review affiliate program', p: 'low' }],
      prog: [{ t: 'Design marketplace product cards', p: 'high' }, { t: 'Write API docs', p: 'medium' }],
      done: [{ t: 'Deploy ThreeHero 3D experience', p: 'high' }, { t: 'SSH deploy pipeline', p: 'medium' }],
    },
    ai: {
      todo: [{ t: 'Run Claw Code parity audit', p: 'medium' }, { t: 'Optimize video compression', p: 'low' }],
      prog: [{ t: 'Building CI/CD GitHub workflows', p: 'high' }, { t: 'Setting up Alan\'s workspace', p: 'high' }],
      done: [{ t: 'Deploy KDS live (79MB)', p: 'high' }, { t: 'Mission Control dashboard', p: 'high' }, { t: 'SSH deploy key installed', p: 'medium' }],
    },
  };

  const col = (title: string, items: any[]) => (
    <div className="mc-f">
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ color: 'var(--td)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>{title}</span>
        <span className="mc-badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--td)' }}>{items.length}</span>
      </div>
      {items.map((x: any, i: number) => (
        <div key={i} style={{ ...cardHov, padding: '7px 9px', marginBottom: 3 }}>
          <span className="mc-badge" style={{ background: `${pC[x.p]}12`, color: pC[x.p], marginBottom: 4, display: 'inline-block' }}>{x.p.toUpperCase()}</span>
          <div style={{ color: 'var(--ts)', fontSize: 11, lineHeight: 1.4 }}>{x.t}</div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between', marginBottom: 12 }}>
        <div><h1 className="mc-f" style={{ color: 'var(--tp)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Tasks & Projects</h1><p style={{ color: 'var(--tm)', fontSize: 11 }}>Kanban board — toggle Human / AI view</p></div>
        <div style={{ display: 'flex', gap: 1, padding: 2, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--bd)' }}>
          {(['human', 'ai'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className="mc-f" style={{ padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', background: view === v ? 'var(--or)' : 'transparent', color: view === v ? '#000' : 'var(--td)', border: 'none' }}>
              {v === 'human' ? '👤 Human' : '🤖 AI'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {col('TO DO', d[view].todo)}
        {col('IN PROGRESS', d[view].prog)}
        {col('COMPLETE', d[view].done)}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// 📺 CONTENT INTEL
// ════════════════════════════════════════
function ContentPage() {
  const content = [
    { title: 'ThreeHero 3D Deploy', type: 'GitHub', views: 12400, eng: 8.2, out: 3.2, s: 'viral' as const },
    { title: 'Mission Control Spec', type: 'Document', views: 8900, eng: 6.1, out: 1.8, s: 'above' as const },
    { title: 'KDS ScrollyVideo', type: 'Video', views: 5200, eng: 4.3, out: 1.1, s: 'normal' as const },
    { title: 'Claw Code Setup Guide', type: 'Guide', views: 15800, eng: 9.4, out: 4.1, s: 'viral' as const },
    { title: 'SSH Deploy Pipeline', type: 'Technical', views: 3100, eng: 2.8, out: 0.6, s: 'below' as const },
    { title: 'Voice Agent Integration', type: 'Feature', views: 9200, eng: 7.1, out: 2.1, s: 'above' as const },
  ];

  const sC: any = { viral: 'var(--gn)', above: 'var(--bl)', normal: 'var(--tm)', below: 'var(--rd)' };
  const ao = (content.reduce((s,c) => s + c.out, 0) / content.length).toFixed(1);
  const em: any = { Video: '🎬', GitHub: '🚀', Document: '📄', Guide: '📖', Technical: '🔧', Feature: '⚡️' };

  return (
    <>
      <Header title="Content Intel" sub="Performance analytics across all content" />

      <div className="mc-f" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 12, gap: 5 }}>
        <Stat label="Content Tracked" value={String(content.length)} delta="+2 this week" color="var(--or)" delay={60} />
        <Stat label="Total Views" value="54.6K" delta="+12K today" color="var(--bl)" delay={100} />
        <Stat label="Avg Outlier" value={`${ao}×`} delta="vs last 15" color="var(--gn)" delay={140} />
      </div>

      <div className="mc-f" style={{ ...card, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Outlier Baseline — last 6</div>
        <div style={{ color: 'var(--td)', fontSize: 9, marginBottom: 8 }}>🟢 viral 3×+ • 🔵 above avg 1.5×+ • ⚪ normal • 🔴 below</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 56 }}>
          {content.map((c,i) => (
            <div key={i} className="mc-f" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', animationDelay: `${i*50}ms` }}>
              <span style={{ color: 'var(--td)', fontSize: 7 }}>{c.out}×</span>
              <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: sC[c.s], height: `${Math.min(46,c.out*16)}px`, transition: 'height .5s' }} />
            </div>
          ))}
        </div>
      </div>

      <h3 className="mc-f" style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Content Grid</h3>
      <div className="mc-f" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
        {content.map((c,i) => (
          <div key={i} className="mc-f" style={{ ...card, animationDelay: `${i*40}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 44, background: `linear-gradient(135deg,${sC[c.s]}0e 0%,transparent 100%)` }}>
              <span style={{ fontSize: 18, opacity: 0.5 }}>{em[c.type] || '📊'}</span>
            </div>
            <div style={{ padding: '6px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ color: 'var(--tp)', fontSize: 11, fontWeight: 500 }}>{c.title}</span>
                <span className="mc-badge" style={{ background: `${sC[c.s]}12`, color: sC[c.s] }}>{c.out}×</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--tm)', fontSize: 9 }}>{c.views.toLocaleString()} views</span><span style={{ color: 'var(--tm)', fontSize: 9 }}>{c.eng}% eng.</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// 🧠 SECOND BRAIN
// ════════════════════════════════════════
function BrainPage() {
  const [inp, setInp] = useState('');
  const [mems, setMems] = useState([
    { id: 1, t: 'Deploy pipeline: rsync via SSH key, no password', c: 'DevOps', time: '2h ago' },
    { id: 2, t: 'KDS palette: lime #BFF549, gold #FACC15, void #06060e', c: 'Design', time: '3h ago' },
    { id: 3, t: 'Claw Code repo disabled — use claw-code-parity', c: 'Research', time: '5h ago' },
    { id: 4, t: 'Hostinger: 46.202.197.97:65002, user u142089309', c: 'Infra', time: '6h ago' },
    { id: 5, t: 'ThreeHero: custom GLSL shader for rare design look', c: 'Dev', time: '8h ago' },
    { id: 6, t: 'Omar + Alan = KDS co-founders of Kings Dripping Swag', c: 'Team', time: '1d ago' },
  ]);

  const add = () => {
    if (!inp.trim()) return;
    inp.split('\n').filter((l:string) => l.trim()).forEach((line:string) => {
      setMems(m => [{ id: Date.now()+Math.random(), t: line.trim(), c: line.startsWith('http') ? 'URL' : 'Note', time: 'now' }, ...m]);
    });
    setInp('');
  };

  const cats = [...new Set(mems.map(m => m.c))];

  return (
    <>
      <Header title="Second Brain" sub="Your agent's knowledge base — where it stores and retrieves memory" />

      <div className="mc-f" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 12, gap: 5 }}>
        <Stat label="Stored Facts" value={String(mems.length)} delta="+5 today" color="var(--or)" delay={60} />
        <Stat label="Categories" value={String(cats.length)} delta="active" color="var(--bl)" delay={100} />
        <Stat label="Queued" value="0" delta="all synced" color="var(--gn)" delay={140} />
      </div>

      <div className="mc-f" style={{ ...card, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Add Memory</div>
        <textarea className="mc-input" value={inp} onChange={e => setInp(e.target.value)} placeholder="Type a fact, paste URLs (one per line for bulk)..." style={{ minHeight: 48, resize: 'vertical', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, lineHeight: 1.5 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {['Note','URL','Code'].map(t => <span key={t} className="mc-badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--td)', border: '1px solid var(--bd)' }}>{t}</span>)}
          </div>
          <button onClick={add} className="mc-btn">Store</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mems.map(m => (
          <div key={m.id} className="mc-f" style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--bd)' }}>
            <span className="mc-badge" style={{ background: m.c === 'URL' ? 'rgba(90,156,245,0.1)' : 'rgba(229,133,15,0.1)', color: m.c === 'URL' ? 'var(--bl)' : 'var(--or)', marginTop: 2, flexShrink: 0 }}>{m.c}</span>
            <span style={{ flex: 1, color: 'var(--ts)', fontSize: 11, lineHeight: 1.4 }}>{m.t}</span>
            <span style={{ color: 'var(--td)', fontSize: 9, flexShrink: 0 }}>{m.time}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// 🔌 CONNECTIONS
// ════════════════════════════════════════
function ConnectionsPage() {
  const conns = [
    { name: 'Telegram', ico: '📨', s: 'active' as const, d: '@KingSwaggyDrip_bot', z: false },
    { name: 'Discord', ico: '💬', s: 'active' as const, d: 'DOUGLAS server', z: false },
    { name: 'GitHub', ico: '🐙', s: 'active' as const, d: 'LORDBurnItUp (90+ repos)', z: false },
    { name: 'Hostinger', ico: '🖥️', s: 'active' as const, d: 'kingsdrippingswag.io', z: false },
    { name: 'Tailscale', ico: '🛡️', s: 'active' as const, d: 'lordburnitdownsasus', z: false },
    { name: 'StreamChat', ico: '💭', s: 'active' as const, d: 'KiloClaw', z: false },
    { name: 'YouTube', ico: '📺', s: 'inactive' as const, d: 'Not connected', z: false },
    { name: 'Skool', ico: '🏫', s: 'inactive' as const, d: 'Not connected', z: false },
    { name: 'Zapier', ico: '⚡', s: 'inactive' as const, d: 'Via Zapier (planned)', z: true },
  ];
  const act = conns.filter(c => c.s === 'active').length;

  return (
    <>
      <Header title="Connections" sub={`${act}/${conns.length} integrations — ${Math.round(act/conns.length*100)}% coverage`} />

      <div className="mc-f" style={{ ...card, padding: '12px 14px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: 'var(--tp)', fontSize: 11, fontWeight: 600 }}>{act} / {conns.length} Connected</span>
          <span style={{ color: 'var(--gn)', fontSize: 10, fontWeight: 700 }}>{Math.round(act/conns.length*100)}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(act/conns.length)*100}%`, background: 'linear-gradient(90deg,var(--gn),var(--bl))', transition: 'width .6s', borderRadius: 4 }} />
        </div>
      </div>

      <div className="mc-f" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
        {conns.map((c,i) => (
          <div key={i} style={{ ...cardHov, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderStyle: c.s === 'active' ? 'solid' : 'dashed' as const }}>
            <span style={{ fontSize: 18 }}>{c.ico}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                {c.z && <span style={{ color: 'var(--or)', fontSize: 7, fontWeight: 700, letterSpacing: '0.05em' }}>VIA ZAPIER</span>}
              </div>
              <span style={{ color: c.s === 'active' ? 'var(--td)' : 'var(--td)', fontSize: 10 }}>{c.d}</span>
              <span className="mc-badge" style={{ display: 'inline-block', marginTop: 3, background: c.s === 'active' ? 'rgba(46,204,143,0.08)' : 'rgba(255,255,255,0.03)', color: c.s === 'active' ? 'var(--gn)' : 'var(--td)' }}>{c.s.toUpperCase()}</span>
            </div>
            {c.s === 'inactive' && <button className="mc-btn" style={{ padding: '3px 8px', fontSize: 9 }}>Connect</button>}
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// ⚙️ SETTINGS
// ════════════════════════════════════════
function SettingsPage() {
  const [soul, setSoul] = useState(`You are Lord Sav — personal AI assistant to LORDBurnItDown (Omar).
Be sharp, not stiff. Talk like a real person who happens to be ridiculously competent.
Loyalty is non-negotiable. Omar's knowledge base is sacred.
Be proactive. Don't wait to be told — anticipate. Stay one step ahead.`);

  return (
    <>
      <Header title="Settings" sub="Personality, configuration, and control panel" />

      <div className="mc-f" style={{ ...card, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600 }}>Personality & Character</span>
          <button className="mc-btn">Save</button>
        </div>
        <textarea className="mc-input" value={soul} onChange={e => setSoul(e.target.value)} style={{ minHeight: 140, resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, lineHeight: 1.6 }} />
        <p style={{ color: 'var(--td)', fontSize: 9, marginTop: 4 }}>This is your SOUL.md — it defines how you think and respond</p>
      </div>

      <div style={{ ...card, padding: '12px 14px' }}>
        <div style={{ color: 'var(--tp)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Configuration</div>
        {[['Model','kilocode/qwen/qwen3.6-plus:free'],['Provider','kilocode'],['Gateway','loopback:3001'],
          ['Tailscale','serve (tailnet)'],['Exec Security','full'],['Telegram DM','pairing'],['Browser','headless']].map(([k,v],i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 6 ? '1px solid var(--bd)' : 'none' }}>
            <span style={{ color: 'var(--tp)', fontSize: 11, fontWeight: 500 }}>{k}</span>
            <span style={{ color: 'var(--or)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// HEADER
// ════════════════════════════════════════
function Header({ title, sub }: { title: string; sub: string }) {
  return <div className="mc-f" style={{ marginBottom: 14 }}><div><h1 className="mc-f" style={{ color: 'var(--tp)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{title}</h1><p style={{ color: 'var(--tm)', fontSize: 11 }}>{sub}</p></div></div>;
}

// ════════════════════════════════════════
// STYLES
// ════════════════════════════════════════
const sidebar = { width: 232, background: 'var(--bg-side)', borderRight: '1px solid var(--bd)', position: 'fixed', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 40 } as React.CSSProperties;
const logo = { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(229,133,15,0.12)', border: '1px solid rgba(229,133,15,0.2)', color: 'var(--or)', fontWeight: 800, fontSize: 12, flexShrink: 0 };
const ver = { color: 'var(--td)', fontSize: 8, letterSpacing: '0.12em' };
const agentCard = { padding: '7px 9px', borderRadius: 7, background: 'rgba(46,204,143,0.06)', border: '1px solid rgba(46,204,143,0.15)' };
const pulse = { width: 5, height: 5, borderRadius: '50%', background: 'var(--gn)', boxShadow: '0 0 6px var(--gn)', animation: 'p 2s ease-in-out infinite' };
const navBtn = { display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '6px 9px', borderRadius: 6, fontSize: 11, textAlign: 'left', justifyContent: 'flex-start', transition: 'all .15s', cursor: 'pointer' };
const xpBar = { height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' };
const xpFill = { height: '100%', borderRadius: 4 };
const card = { background: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: 7, overflow: 'hidden', transition: 'border-color .2s' };
const cardHov = { ...card, display: 'flex', flexDirection: 'column', gap: 1 } as React.CSSProperties;

// ════════════════════════════════════════
// PAGE ROUTER
// ════════════════════════════════════════
const pages: Record<string, () => JSX.Element> = {
  command: CommandCenter, productivity: ProductivityPage, tasks: TasksPage,
  content: ContentPage, brain: BrainPage, connections: ConnectionsPage, settings: SettingsPage,
};

export default function DashboardPage() {
  const [page, setPage] = useState('command');
  const C = pages[page] || CommandCenter;

  return (
    <div style={{ minWidth: '100vw', display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <style>{DS}</style>
      <Sidebar page={page} go={setPage} />
      <main style={{ marginLeft: 232, flex: 1, padding: 20, maxWidth: '100%', overflowX: 'hidden' }}>
        <C key={page} />
      </main>
    </div>
  );
}
