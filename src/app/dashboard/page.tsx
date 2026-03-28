'use client';

import { useState, useRef, useEffect } from 'react';

const services = [
  { name: 'OpenAI', key: 'sk-proj-5pdr...', status: 'active', calls: '847K', latency: '120ms', category: 'AI' },
  { name: 'Anthropic', key: 'sk-ant-api03...', status: 'active', calls: '623K', latency: '95ms', category: 'AI' },
  { name: 'Google Gemini', key: 'AIzaSyBAW...', status: 'active', calls: '234K', latency: '110ms', category: 'AI' },
  { name: 'Groq', key: 'gsk_A6E86...', status: 'active', calls: '456K', latency: '25ms', category: 'AI' },
  { name: 'OpenRouter', key: 'sk-or-v1-d127...', status: 'active', calls: '189K', latency: '85ms', category: 'AI' },
  { name: 'Venice AI', key: 'VENICE_INFERENCE...', status: 'active', calls: '67K', latency: '140ms', category: 'AI' },
  { name: 'Z.AI', key: '95118266de...', status: 'active', calls: '12K', latency: '95ms', category: 'AI' },
  { name: 'ElevenLabs', key: 'sk_577dd4a...', status: 'active', calls: '34K', latency: '200ms', category: 'Voice' },
  { name: 'Deepgram', key: '93411c3dd2...', status: 'active', calls: '56K', latency: '50ms', category: 'Voice' },
  { name: 'Firecrawl', key: 'fc-e3f623...', status: 'active', calls: '89K', latency: '340ms', category: 'Scraping' },
  { name: 'Brave Search', key: 'BSAG-bikq...', status: 'active', calls: '23K', latency: '150ms', category: 'Scraping' },
  { name: 'Supabase', key: 'sb_publishable...', status: 'active', calls: '1.2M', latency: '45ms', category: 'Database' },
  { name: 'Qdrant', key: 'eyJhbGci...', status: 'active', calls: '45K', latency: '30ms', category: 'Database' },
  { name: 'Stripe', key: 'sk_test_51T6...', status: 'active', calls: '12K', latency: '180ms', category: 'Payments' },
  { name: 'Telegram', key: '8647885859...', status: 'active', calls: '∞', latency: 'N/A', category: 'Bot' },
  { name: 'Discord', key: 'MTQ4MDc2...', status: 'active', calls: '5.6K', latency: 'N/A', category: 'Bot' },
  { name: 'Slack', key: 'xoxb-103022...', status: 'active', calls: '2.3K', latency: 'N/A', category: 'Bot' },
  { name: 'GitHub', key: 'ghp_juPq...', status: 'active', calls: '1.8K', latency: 'N/A', category: 'Dev' },
  { name: 'n8n', key: 'eyJhbGci...', status: 'pending', calls: '0', latency: 'N/A', category: 'Automation' },
  { name: 'Vercel', key: 'vck_8EZIb...', status: 'pending', calls: '0', latency: 'N/A', category: 'Deploy' },
];

const categories = ['All', 'AI', 'Voice', 'Scraping', 'Database', 'Payments', 'Bot', 'Dev', 'Automation', 'Deploy'];

const stats = [
  { label: 'Total API Calls', value: '3.8M', change: '+18.2%', up: true },
  { label: 'Active Services', value: '18', change: '+3', up: true },
  { label: 'Revenue (MTD)', value: '$8,450', change: '+41.2%', up: true },
  { label: 'Uptime', value: '99.97%', change: 'Stable', up: true },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('services');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cliInput, setCLIInput] = useState('');
  const [cliHistory, setCLIHistory] = useState<string[]>(['Lord Sav Dashboard CLI v1.0', 'Type "help" for commands', '']);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'system', text: 'Welcome to the Lord Sav control room.', time: '23:00' },
    { sender: 'sav', text: 'All systems operational. 18 services active.', time: '23:01' },
  ]);
  const cliRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cliRef.current) cliRef.current.scrollTop = cliRef.current.scrollHeight;
  }, [cliHistory]);

  const filteredServices = selectedCategory === 'All' ? services : services.filter(s => s.category === selectedCategory);

  const handleCLI = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim();
    if (!cmd) return;
    
    let output = '';
    switch (cmd.toLowerCase()) {
      case 'help': output = 'Commands: status, services, deploy, restart, logs, clear'; break;
      case 'status': output = 'All systems operational. 18/20 services active.'; break;
      case 'services': output = services.map(s => `${s.name}: ${s.status}`).join('\n'); break;
      case 'deploy': output = 'Deploying to Hostinger VPS... Done.'; break;
      case 'restart': output = 'Restarting gateway... Done.'; break;
      case 'logs': output = 'Fetching logs... [200 OK] Gateway running on port 18789'; break;
      case 'clear': setCLIHistory([]); setCLIInput(''); return;
      default: output = `Command not found: ${cmd}. Type "help" for available commands.`;
    }
    setCLIHistory(prev => [...prev, `> ${cmd}`, output, '']);
    setCLIInput('');
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'you', text: chatInput, time: now }]);
    setChatInput('');
    // Simulated response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'sav', text: 'Acknowledged. Processing...', time: now }]);
    }, 1000);
  };

  const tabs = [
    { id: 'services', label: '⚙️ Services', count: services.length },
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'chat', label: '💬 Chat' },
    { id: 'terminal', label: '▸ Terminal' },
    { id: 'deployments', label: '🚀 Deployments' },
  ];

  return (
    <main className="min-h-screen bg-[#02040a] text-white font-body">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
              <span className="text-lime font-display font-bold text-lg">🧠</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Lord Sav — Command Center</h1>
              <p className="text-xs font-mono text-text-muted">18 services • 3.8M calls • 99.97% uptime</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-mono text-lime">All Systems Operational</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-5 border border-white/[0.06]">
              <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="font-display font-black text-2xl">{stat.value}</p>
              <p className={`text-xs font-mono ${stat.up ? 'text-lime' : 'text-red-400'}`}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-lime/10 border border-lime/20 text-lime' : 'glass border border-white/[0.06] text-text-secondary hover:text-white'
              }`}
            >
              {tab.label} {tab.count && <span className="ml-1 text-xs opacity-60">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <div>
            {/* Category Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                    selectedCategory === cat ? 'bg-lime/10 border border-lime/20 text-lime' : 'text-text-muted hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Table */}
            <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs font-mono text-text-muted uppercase">
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Calls</th>
                    <th className="text-right p-4">Latency</th>
                    <th className="text-right p-4">Key</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map(s => (
                    <tr key={s.name} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-display font-semibold text-sm">{s.name}</td>
                      <td className="p-4 text-xs font-mono text-text-muted">{s.category}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono ${s.status === 'active' ? 'text-lime' : 'text-yellow-accent'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-lime' : 'bg-yellow-accent'}`} />
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm font-mono">{s.calls}</td>
                      <td className="p-4 text-right text-sm font-mono text-text-muted">{s.latency}</td>
                      <td className="p-4 text-right text-xs font-mono text-text-muted">{s.key}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="font-display font-bold text-lg mb-4">API Call Volume</h3>
              <div className="h-48 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg bg-lime/20 hover:bg-lime/40 transition-all" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-mono text-text-muted">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="font-display font-bold text-lg mb-4">Service Distribution</h3>
              <div className="space-y-3">
                {['AI (7)', 'Voice (2)', 'Scraping (2)', 'Database (2)', 'Bot (3)', 'Other (4)'].map((cat, i) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-text-muted w-24">{cat}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-lime/40" style={{ width: `${[35, 10, 10, 10, 15, 20][i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="glass rounded-2xl border border-white/[0.06] h-[60vh] flex flex-col">
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="font-display font-bold">💬 Command Room Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === 'you' ? 'bg-lime/10 border border-lime/20' : msg.sender === 'sav' ? 'bg-blue-accent/10 border border-blue-accent/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] font-mono text-text-muted mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChat} className="p-4 border-t border-white/[0.06] flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm outline-none focus:border-lime/30" placeholder="Type a command or message..." />
              <button className="px-6 py-3 rounded-xl bg-lime text-void font-display font-semibold text-sm">Send</button>
            </form>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-accent/60" />
              <div className="w-3 h-3 rounded-full bg-lime/60" />
              <span className="text-xs font-mono text-text-muted ml-2">Lord Sav Terminal</span>
            </div>
            <div ref={cliRef} className="h-[50vh] overflow-y-auto p-4 font-mono text-sm">
              {cliHistory.map((line, i) => (
                <pre key={i} className={`whitespace-pre-wrap ${line.startsWith('>') ? 'text-lime' : 'text-text-secondary'}`}>{line}</pre>
              ))}
              <form onSubmit={handleCLI} className="flex items-center gap-2 mt-1">
                <span className="text-lime">▸</span>
                <input value={cliInput} onChange={e => setCLIInput(e.target.value)} className="flex-1 bg-transparent outline-none text-lime text-sm" placeholder="Type a command..." autoFocus />
              </form>
            </div>
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="space-y-4">
            {[
              { name: 'KDS Landing Page', domain: 'kingsdrippingswag.io', status: 'live', lastDeploy: '22:28 UTC', method: 'rsync' },
              { name: 'KMDSSLI Hub', domain: 'kmdssli.online', status: 'live', lastDeploy: '22:06 UTC', method: 'manual' },
              { name: 'GitHub Repo', domain: 'github.com/LORDBurnItUp/KDSAIDEV', status: 'synced', lastDeploy: '22:28 UTC', method: 'git push' },
              { name: 'Docker sharp_wilson', domain: 'localhost container', status: 'running', lastDeploy: '23:19 UTC', method: 'docker' },
              { name: 'Vercel (pending)', domain: 'N/A', status: 'pending', lastDeploy: 'N/A', method: 'N/A' },
            ].map(dep => (
              <div key={dep.name} className="glass rounded-2xl p-5 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold">{dep.name}</h3>
                  <p className="text-xs font-mono text-text-muted">{dep.domain}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs font-mono text-text-muted">{dep.method}</span>
                  <span className="text-xs font-mono text-text-muted">{dep.lastDeploy}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono ${dep.status === 'live' || dep.status === 'synced' || dep.status === 'running' ? 'bg-lime/10 text-lime border border-lime/20' : 'bg-yellow-accent/10 text-yellow-accent border border-yellow-accent/20'}`}>
                    {dep.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
