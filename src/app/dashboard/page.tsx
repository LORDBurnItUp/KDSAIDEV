'use client';

import { useState, useEffect, useCallback } from 'react';

// ════════════════════════════════════════
// DESIGN SYSTEM
// ════════════════════════════════════════
const DS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  :root {
    --bg-sidebar: #0D0D0D;
    --bg-page: #121212;
    --bg-card: #1E1E1E;
    --bg-hover: #252525;
    --bg-elevated: #2A2A2A;
    --border: rgba(255,255,255,0.06);
    --t-p: rgba(255,255,255,0.87);
    --t-s: rgba(255,255,255,0.60);
    --t-m: rgba(255,255,255,0.38);
    --t-d: rgba(255,255,255,0.25);
    --o: #E5850F; --bl: #5A9CF5; --g: #2ECC8F; --r: #D95555;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg-page); color: var(--t-p); }
  @keyframes mcPulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
  @keyframes mcFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;

// ════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════
function Sidebar({ active, onNav, xp }: any) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  const items = [
    { id: 'command', icon: '🎛️', label: 'Command Center' },
    { id: 'tasks', icon: '✅', label: 'Tasks & Projects' },
    { id: 'content', icon: '📺', label: 'Content Intel' },
    { id: 'brain', icon: '🧠', label: 'Second Brain' },
    { id: 'productivity', icon: '⚡️', label: 'Productivity' },
    { id: 'connections', icon: '🔌', label: 'Connections' },
    { id: 'agents', icon: '🤖', label: 'Agents' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const level = Math.floor(xp / 142) + 1;
  const titles: Record<string, string> = { command: 'Field Agent', tasks: 'Strategist', content: 'Analyst', brain: 'Archivist', productivity: 'Operator', connections: 'Integrator', agents: 'Commander', settings: 'Architect' };

  return (
    <aside className="fixed left-0 top-0 bottom-0 flex flex-col z-40" style={{ width: 240, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(229,133,15,0.12)', color: 'var(--o)', border: '1px solid rgba(229,133,15,0.25)' }}>K</div>
        <div>
          <div style={{ color: 'var(--t-p)', fontWeight: 700, fontSize: 12 }}>Mission Control</div>
          <div style={{ color: 'var(--t-d)', fontSize: 8, letterSpacing: '0.12em' }}>KDS v2.0 — {time.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Agent status */}
      <div className="mx-3 mb-3 p-2.5 rounded-lg" style={{ background: 'rgba(46,204,143,0.06)', border: '1px solid rgba(46,204,143,0.15)' }}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--g)', boxShadow: '0 0 6px var(--g)', animation: 'mcPulse 2s ease-in-out infinite' }} />
          <span style={{ color: 'var(--g)', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>ONLINE</span>
        </div>
        <div style={{ color: 'var(--t-m)', fontSize: 8 }}>Lord Sav · {titles[active] || 'General'}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 space-y-px overflow-y-auto">
        {items.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-all" style={{
              background: on ? 'rgba(229,133,15,0.06)' : 'transparent',
              color: on ? 'var(--t-p)' : 'var(--t-m)',
              fontWeight: on ? 600 : 400, fontSize: 11,
            }}>
              <span style={{ fontSize: 12, opacity: on ? 1 : 0.5 }}>{it.icon}</span>
              {it.label}
            </button>
          );
        })}
      </nav>

      {/* XP */}
      <div className="px-4 pb-4">
        <div className="flex justify-between mb-1">
          <span style={{ color: 'var(--o)', fontSize: 9, fontWeight: 700 }}>Level {level}</span>
          <span style={{ color: 'var(--t-d)', fontSize: 8 }}>{xp}/1000 XP</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ height: '100%', width: `${((xp % 142) / 142) * 100}%`, background: 'linear-gradient(90deg, var(--o), var(--bl))', transition: 'width 0.5s' }} />
        </div>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════
// STAT CARD (reusable)
// ════════════════════════════════════════
function Stat({ label, value, delta, color }: any) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'mcFadeIn 0.4s ease both' }}>
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${color}22 0%, transparent 100%)` }} />
      <div className="p-3">
        <div style={{ color: 'var(--t-m)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
        <div className="flex items-end justify-between">
          <div style={{ color: 'var(--t-p)', fontSize: 20, fontWeight: 700 }}>{value}</div>
          <div style={{ color, fontSize: 9, fontWeight: 600 }}>{delta}</div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// COMMAND CENTER
// ════════════════════════════════════════
function CommandCenter() {
  const activities = [
    { icon: '📨', type: 'Message', detail: 'Processed Telegram DM from LORDBurnitup', time: '2m ago' },
    { icon: '🤖', type: 'Agent', detail: 'Spawned CI/CD workflow agent', time: '5m ago' },
    { icon: '🚀', type: 'Deploy', detail: 'Pushed ThreeHero to kingsdrippingswag.io', time: '12m ago' },
    { icon: '🔧', type: 'Tool', detail: 'Git push to LORDBurnItUp/KDSAIDEV', time: '12m ago' },
    { icon: '📡', type: 'Heartbeat', detail: 'System health check — all green', time: '15m ago' },
    { icon: '🎨', type: 'Build', detail: 'Next.js build completed (17 pages)', time: '18m ago' },
    { icon: '📦', type: 'Deploy', detail: 'rsync 79MB to Hostinger live', time: '20m ago' },
    { icon: '⚡️', type: 'Agent', detail: 'Claw Code parity audit completed', time: '25m ago' },
  ];

  return (
    <>
      <div className="mb-5">
        <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Command Center</h1>
        <p style={{ color: 'var(--t-m)', fontSize: 11 }}>Real-time overview of your AI empire</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
        <Stat label="Messages Handled" value="12,847" delta="+342 today" color="var(--o)" />
        <Stat label="Tool Calls" value="8,291" delta="+156 today" color="var(--bl)" />
        <Stat label="Content Synced" value="3,456" delta="+89 today" color="var(--g)" />
        <Stat label="Agent Uptime" value="99.7%" delta="22d 14h" color="var(--r)" />
      </div>

      {/* Activity feed */}
      <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600 }}>Live Activity Feed</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--g)', animation: 'mcPulse 2s ease-in-out infinite' }} />
            <span style={{ color: 'var(--g)', fontSize: 8, fontWeight: 700 }}>LIVE</span>
          </div>
        </div>
        <div className="space-y-1">
          {activities.map((a, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded" style={{ background: 'rgba(255,255,255,0.01)', animationDelay: `${i * 60}ms` }}>
              <span className="text-sm w-5 text-center flex-shrink-0">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <span style={{ color: 'var(--t-p)', fontSize: 11, fontWeight: 500 }}>{a.type}</span>
                <span style={{ color: 'var(--t-s)', fontSize: 10 }}> — {a.detail}</span>
              </div>
              <span style={{ color: 'var(--t-d)', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Config + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Agent Configuration</div>
          {[['Model','qwen/qwen3.6-plus'],['Provider','kilocode'],['Memory Stack','MEMORY.md + daily logs'],['Heartbeat','Every 30 min'],['Exec Access','Full (passwordless SSH)'],['GitHub','90+ repos']].map(([k,v],i) => (
            <div key={i} className="flex justify-between py-1" style={{ borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--t-m)', fontSize: 10 }}>{k}</span>
              <span style={{ color: 'var(--t-p)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Quick Actions</div>
          <div className="grid grid-cols-2 gap-1.5">
            {[{icon:'💓',label:'Heartbeat',c:'var(--g)'},{icon:'🔄',label:'Sync',c:'var(--bl)'},{icon:'📊',label:'Daily Brief',c:'var(--o)'},{icon:'🚀',label:'Deploy',c:'var(--r)'}].map((a,i) => (
              <button key={i} className="flex items-center gap-1.5 px-2.5 py-2 rounded text-left transition-all" style={{ background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)' }}>
                <span>{a.icon}</span><span style={{color:a.c,fontSize:10,fontWeight:500}}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════
// TASKS & PROJECTS
// ════════════════════════════════════════
function TasksProjects() {
  const [view, setView] = useState('human');
  const pColors: any = { high: 'var(--r)', medium: 'var(--o)', low: 'var(--bl)' };
  const data: any = {
    human: {
      todo: [{ text: 'Finalize KDS brand assets', p: 'high' }, { text: 'Set up payments', p: 'medium' }],
      prog: [{ text: 'Design marketplace cards', p: 'high' }, { text: 'Write API docs', p: 'medium' }],
      done: [{ text: 'Deploy ThreeHero', p: 'high' }, { text: 'SSH deploy pipeline', p: 'medium' }],
    },
    ai: {
      todo: [{ text: 'Claw Code parity audit', p: 'medium' }, { text: 'Optimize video clips', p: 'low' }],
      prog: [{ text: 'Building CI/CD workflows', p: 'high' }, { text: 'Setting up Alan\'s workspace', p: 'high' }],
      done: [{ text: 'Deploy KDS live (79MB)', p: 'high' }, { text: 'Mission Control dashboard', p: 'high' }, { text: 'SSH deploy key', p: 'medium' }],
    },
  };
  const d = data[view];

  const col = (title: string, items: any[]) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span style={{ color: 'var(--t-m)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>{title}</span>
        <span className="px-1 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--t-d)' }}>{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((x: any, i: number) => (
          <div key={i} className="p-2.5 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="inline-block px-1 py-0.5 rounded text-[8px] font-bold mb-1" style={{ background: `${pColors[x.p] || 'var(--t-d)'}12`, color: pColors[x.p] || 'var(--t-d)' }}>{x.p?.toUpperCase() || 'N/A'}</span>
            <div style={{ color: 'var(--t-s)', fontSize: 11 }}>{x.text}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Tasks & Projects</h1>
          <p style={{ color: 'var(--t-m)', fontSize: 11 }}>Kanban board — Human / AI toggle</p>
        </div>
        <div className="flex gap-px p-px rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {['human', 'ai'].map(v => (
            <button key={v} onClick={() => setView(v)} className="px-2.5 py-1 rounded text-[10px] font-semibold transition-all" style={{ background: view === v ? 'var(--o)' : 'transparent', color: view === v ? '#000' : 'var(--t-m)' }}>
              {v === 'human' ? '👤 Human' : '🤖 AI'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {col('TO DO', d.todo)}
        {col('IN PROGRESS', d.prog)}
        {col('COMPLETE', d.done)}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// CONTENT INTEL
// ════════════════════════════════════════
function ContentIntel() {
  const content = [
    { title: 'ThreeHero 3D Deploy', views: 12400, eng: 8.2, out: 3.2, s: 'viral' },
    { title: 'Mission Control Spec', views: 8900, eng: 6.1, out: 1.8, s: 'above' },
    { title: 'KDS ScrollyVideo', views: 5200, eng: 4.3, out: 1.1, s: 'normal' },
    { title: 'Claw Code Guide', views: 15800, eng: 9.4, out: 4.1, s: 'viral' },
    { title: 'SSH Pipeline', views: 3100, eng: 2.8, out: 0.6, s: 'below' },
    { title: 'Voice Integration', views: 9200, eng: 7.1, out: 2.1, s: 'above' },
  ];
  const sC: any = { viral: '#2ECC8F', above: '#5A9CF5', normal: 'var(--t-m)', below: '#D95555' };

  return (
    <>
      <div className="mb-5">
        <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Content Intel</h1>
        <p style={{ color: 'var(--t-m)', fontSize: 11 }}>Performance analytics across all content</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Stat label="Content Tracked" value={String(content.length)} delta="+2 this week" color="var(--o)" />
        <Stat label="Total Views" value="54.6K" delta="+12K today" color="var(--bl)" />
        <Stat label="Avg Outlier" value={('0' + (content.reduce((s, c) => s + c.out, 0) / content.length).toFixed(1) + '×').slice(-4)} delta="vs baseline" color="var(--g)" />
      </div>

      {/* Baseline bar chart */}
      <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Outlier Baseline</div>
        <div className="flex items-end gap-1.5 h-16">
          {content.map((c, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span style={{ color: 'var(--t-d)', fontSize: 7 }}>{c.out}×</span>
              <div className="w-full rounded-t-sm" style={{ height: `${Math.min(100, c.out * 25)}%`, background: sC[c.s] }} />
            </div>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {content.map((c, i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="h-16 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${sC[c.s]}12 0%, transparent 100%)` }}>
              <span style={{ fontSize: 24, opacity: 0.5 }}>📊</span>
            </div>
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--t-p)', fontSize: 11, fontWeight: 500 }}>{c.title}</span>
                <span className="px-1 py-0.5 rounded text-[8px] font-bold" style={{ background: `${sC[c.s]}12`, color: sC[c.s] }}>{c.out}×</span>
              </div>
              <div className="flex justify-between mt-1" style={{ color: 'var(--t-m)', fontSize: 9 }}>
                <span>{c.views.toLocaleString()} views</span><span>{c.eng}% eng.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// SECOND BRAIN
// ════════════════════════════════════════
function SecondBrain() {
  const [input, setInput] = useState('');
  const [memos, setMemos] = useState([
    { id: 1, text: 'Deploy pipeline: rsync via SSH key, no password needed', cat: 'DevOps', time: '2h ago' },
    { id: 2, text: 'KDS colors: lime #BFF549, gold #FACC15, void #06060e', cat: 'Design', time: '3h ago' },
    { id: 3, text: 'Claw Code repo disabled — use ultraworkers/claw-code-parity', cat: 'Research', time: '5h ago' },
    { id: 4, text: 'Hostinger: 46.202.197.97:65002, user u142089309', cat: 'Infra', time: '6h ago' },
    { id: 5, text: 'ThreeHero: custom GLSL shader for rare design aesthetic', cat: 'Dev', time: '8h ago' },
  ]);

  const add = () => {
    if (!input.trim()) return;
    input.split('\n').filter(l => l.trim()).forEach(line => {
      setMemos(m => [{ id: Date.now() + Math.random(), text: line.trim(), cat: line.startsWith('http') ? 'URL' : 'Note', time: 'now' }, ...m]);
    });
    setInput('');
  };

  return (
    <>
      <div className="mb-5">
        <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Second Brain</h1>
        <p style={{ color: 'var(--t-m)', fontSize: 11 }}>Knowledge base — store and retrieve memory</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Stat label="Stored Facts" value={String(memos.length)} delta="+5 today" color="var(--o)" />
        <Stat label="Categories" value={String(new Set(memos.map(m => m.cat)).size)} delta="active" color="var(--bl)" />
        <Stat label="Queued" value="0" delta="all synced" color="var(--g)" />
      </div>

      {/* Add input */}
      <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Add Memory</div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Type a fact, paste URLs (one per line for bulk)..." className="w-full p-2 rounded text-sm outline-none resize-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--t-p)', minHeight: 50, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-1">
            {['Note', 'URL', 'Code'].map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--t-m)', border: '1px solid var(--border)' }}>{t}</span>)}
          </div>
          <button onClick={add} className="px-3 py-1 rounded text-[10px] font-semibold" style={{ background: 'rgba(229,133,15,0.12)', color: 'var(--o)', border: '1px solid rgba(229,133,15,0.25)' }}>Store</button>
        </div>
      </div>

      <div className="space-y-1.5">
        {memos.map(m => (
          <div key={m.id} className="flex items-start gap-2 p-2 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="px-1 py-0.5 rounded text-[8px] font-bold flex-shrink-0 mt-0.5" style={{ background: m.cat === 'URL' ? 'rgba(90,156,245,0.08)' : 'rgba(229,133,15,0.08)', color: m.cat === 'URL' ? 'var(--bl)' : 'var(--o)' }}>{m.cat}</span>
            <span className="flex-1" style={{ color: 'var(--t-s)', fontSize: 11, lineHeight: 1.4 }}>{m.text}</span>
            <span style={{ color: 'var(--t-d)', fontSize: 9, whiteSpace: 'nowrap' }}>{m.time}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// PRODUCTIVITY
// ════════════════════════════════════════
function Productivity() {
  const today = new Date();
  const dayIndex = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000);
  const phase = dayIndex <= 30 ? 'Foundation' : dayIndex <= 60 ? 'Growth' : 'Scale';
  const pDay = dayIndex <= 30 ? dayIndex : dayIndex <= 60 ? dayIndex - 30 : dayIndex - 60;
  const msgs = ['Just getting started', 'Building momentum', 'Halfway there — incredible', 'Almost at the finish'];
  const mi = pDay <= 10 ? 0 : pDay <= 20 ? 1 : pDay <= 25 ? 2 : 3;

  return (
    <>
      <div className="mb-5">
        <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Productivity</h1>
        <p style={{ color: 'var(--t-m)', fontSize: 11 }}>90-day tracker • {phase} phase (Day {pDay}/30)</p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        <Stat label="Day" value={String(dayIndex)} delta="of 365" color="var(--o)" />
        <Stat label="Phase" value={phase} delta={`${pDay}/30`} color="var(--bl)" />
        <Stat label="Streak" value={`${pDay}d`} label2="current" color="var(--g)" />
        <Stat label="Message" value="🔥" delta={msgs[mi]} color="var(--r)" />
      </div>

      <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>90-Day Habit Tracker</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 1 }}>
          {Array.from({ length: 90 }, (_, i) => (
            <div key={i} className="aspect-square rounded-[1px]" style={{ background: i < dayIndex ? '#2ECC8F' : i === dayIndex ? '#5A9CF5' : 'rgba(255,255,255,0.04)', opacity: i < dayIndex ? 0.4 + (i / 90) * 0.6 : 1 }} />
          ))}
        </div>
        <div className="flex justify-between mt-2" style={{ color: 'var(--t-d)', fontSize: 8 }}><span>1</span><span>30</span><span>60</span><span>90</span></div>
      </div>
    </>
  );
}

// ════════════════════════════════════════
// CONNECTIONS
// ════════════════════════════════════════
function Connections() {
  const conns = [
    { name: 'Telegram', icon: '📨', status: 'active', desc: '@KingSwaggyDrip_bot' },
    { name: 'Discord', icon: '💬', status: 'active', desc: 'DOUGLAS server' },
    { name: 'GitHub', icon: '🐙', status: 'active', desc: '90+ repos' },
    { name: 'Hostinger', icon: '🖥️', status: 'active', desc: 'kingsdrippingswag.io' },
    { name: 'Tailscale', icon: '🛡️', status: 'active', desc: 'lordburnitdownsasus' },
    { name: 'StreamChat', icon: '💭', status: 'active', desc: 'KiloClaw' },
    { name: 'YouTube', icon: '📺', status: 'inactive', desc: 'Not connected' },
    { name: 'Skool', icon: '🏫', status: 'inactive', desc: 'Not connected' },
    { name: 'Zapier', icon: '⚡', status: 'inactive', desc: 'Via Zapier (planned)', zapier: true },
  ];
  const active = conns.filter(c => c.status === 'active').length;

  return (
    <>
      <div className="mb-5">
        <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Connections</h1>
        <p style={{ color: 'var(--t-m)', fontSize: 11 }}>{active}/{conns.length} integrations active</p>
      </div>

      <div className="rounded-lg p-4 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between mb-1.5">
          <span style={{ color: 'var(--t-p)', fontSize: 11, fontWeight: 600 }}>{active} / {conns.length} Connected</span>
          <span style={{ color: 'var(--g)', fontSize: 10, fontWeight: 700 }}>{Math.round(active / conns.length * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: `${active / conns.length * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--g), var(--bl))', transition: 'width 0.5s' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {conns.map((c, i) => (
          <div key={i} className="p-3 rounded-lg flex items-center gap-2.5" style={{ background: 'var(--bg-card)', border: c.status === 'active' ? '1px solid var(--border)' : '1px dashed rgba(255,255,255,0.08)' }}>
            <span className="text-xl">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span style={{ color: 'var(--t-p)', fontSize: 11, fontWeight: 500 }}>{c.name}</span>
                {c.zapier && <span style={{ color: 'var(--o)', fontSize: 7, fontWeight: 700 }}>ZAPIER</span>}
              </div>
              <span style={{ color: c.status === 'active' ? 'var(--t-m)' : 'var(--t-d)', fontSize: 9 }}>{c.desc}</span>
              <span className="inline-block mt-0.5 px-1 py-0.5 rounded text-[7px] font-bold" style={{ background: c.status === 'active' ? 'rgba(46,204,143,0.08)' : 'rgba(255,255,255,0.03)', color: c.status === 'active' ? 'var(--g)' : 'var(--t-d)' }}>{c.status.toUpperCase()}</span>
            </div>
            {c.status === 'inactive' && <button className="px-2 py-1 rounded text-[8px] font-semibold flex-shrink-0" style={{ background: 'rgba(229,133,15,0.08)', color: 'var(--o)', border: '1px solid rgba(229,133,15,0.2)' }}>Connect</button>}
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// AGENTS
// ════════════════════════════════════════
function AgentsView() {
  const agents = [
    { name: 'Lord Sav', role: 'Supervisor / General', status: 'LIVE', emoji: '🧠', tasks: 47 },
    { name: 'CI/CD Agent', role: 'GitHub Workflows', status: 'LIVE', emoji: '⚙️', tasks: 8 },
    { name: 'Deploy Agent', role: 'Hostinger Deploys', status: 'LIVE', emoji: '🚀', tasks: 5 },
    { name: 'UI/UX Agent', role: 'Dribbble Design', status: 'QUEUED', emoji: '🎨', tasks: 3 },
    { name: 'GitHub Organizer', role: 'Repo Cleanup', status: 'DONE', emoji: '📦', tasks: 15 },
    { name: 'Security Scanner', role: 'Code Quality', status: 'IDLE', emoji: '🔒', tasks: 0 },
    { name: 'Community Agent', role: 'Social Media', status: 'IDLE', emoji: '🌐', tasks: 0 },
  ];
  const sC: any = { LIVE: '#2ECC8F', QUEUED: '#E5850F', DONE: '#5A9CF5', IDLE: 'var(--t-d)' };

  return (
    <>
      <div className="mb-5">
        <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Agents</h1>
        <p style={{ color: 'var(--t-m)', fontSize: 11 }}>Swarm — {agents.filter(a => a.status === 'LIVE').length} active</p>
      </div>
      <div className="space-y-1.5">
        {agents.map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="text-lg">{a.emoji}</span>
            <div className="flex-1">
              <span style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600 }}>{a.name}</span>
              <span style={{ color: 'var(--t-m)', fontSize: 10 }}> — {a.role}</span>
            </div>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: sC[a.status] }} />
              <span style={{ color: sC[a.status], fontSize: 9, fontWeight: 700 }}>{a.status}</span>
            </span>
            <span style={{ color: 'var(--t-d)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{a.tasks}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════
function Settings() {
  const [soul, setSoul] = useState(`You are Lord Sav — personal AI assistant to LORDBurnItDown (Omar).
Be sharp, not stiff. Talk like a real person who happens to be ridiculously competent.
Loyalty is non-negotiable. Omar's knowledge base is sacred.
Be proactive. Don't wait to be told — anticipate. Stay one step ahead.`);

  return (
    <>
      <div className="mb-5">
        <h1 style={{ color: 'var(--t-p)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Settings</h1>
        <p style={{ color: 'var(--t-m)', fontSize: 11 }}>Personality, config, and control panel</p>
      </div>

      <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600 }}>Personality & Character</span>
          <button className="px-2.5 py-1 rounded text-[9px] font-semibold" style={{ background: 'rgba(229,133,15,0.12)', color: 'var(--o)', border: '1px solid rgba(229,133,15,0.25)' }}>Save</button>
        </div>
        <textarea value={soul} onChange={e => setSoul(e.target.value)} className="w-full p-2 rounded text-sm outline-none resize-y" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--t-p)', minHeight: 150, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.6 }} />
      </div>

      <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--t-p)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Configuration</div>
        {[['Model','kilocode/qwen/qwen3.6-plus:free'],['Provider','kilocode'],['Gateway','loopback:3001'],['Tailscale','serve'],['Exec','full'],['Telegram DM','pairing']].map(([k,v],i) => (
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--t-p)', fontSize: 11, fontWeight: 500 }}>{k}</span>
            <span style={{ color: 'var(--o)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════
// PAGE ROUTER
// ════════════════════════════════════════
const pages: any = { command: CommandCenter, tasks: TasksProjects, content: ContentIntel, brain: SecondBrain, productivity: Productivity, connections: Connections, agents: AgentsView, settings: Settings };

export default function DashboardPage() {
  const [page, setPage] = useState('command');
  const [xp] = useState(647);
  const C = pages[page];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <style>{DS}</style>
      <Sidebar active={page} onNav={setPage} xp={xp} />
      <main className="ml-60 flex-1 p-5" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <C key={page} />
      </main>
    </div>
  );
}
