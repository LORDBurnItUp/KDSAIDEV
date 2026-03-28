'use client';

import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';

const stats = [
  { label: 'Total Views', value: '142.8K', change: '+23.4%', up: true },
  { label: 'Active Projects', value: '12', change: '+3', up: true },
  { label: 'Revenue (MTD)', value: '$8,450', change: '+41.2%', up: true },
  { label: 'API Calls', value: '2.3M', change: '+12.1%', up: true },
];

const apiServices = [
  { name: 'OpenAI', status: 'active', calls: '847K', latency: '120ms' },
  { name: 'Anthropic', status: 'active', calls: '623K', latency: '95ms' },
  { name: 'Supabase', status: 'active', calls: '1.2M', latency: '45ms' },
  { name: 'LiveKit', status: 'active', calls: '34K', latency: '28ms' },
  { name: 'Firecrawl', status: 'warning', calls: '89K', latency: '340ms' },
  { name: 'Stripe', status: 'active', calls: '12K', latency: '180ms' },
];

const recentActivity = [
  { time: '2m ago', action: 'New lead captured', detail: 'Dubai RE Developer — via Firecrawl', type: 'lead' },
  { time: '15m ago', action: 'Agent deployed', detail: 'Lead Gen Bot v2.1 — Railway', type: 'deploy' },
  { time: '1h ago', action: 'Payment received', detail: '$2,500 — Custom AI Agent', type: 'payment' },
  { time: '2h ago', action: 'API key rotated', detail: 'OpenAI — automatic rotation', type: 'security' },
  { time: '3h ago', action: 'New member joined', detail: 'KDS Community — 10,001 members', type: 'community' },
];

export default function CommandPage() {
  return (
    <main className="relative min-h-screen">
      <TeleportNav />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-accent rounded-full blur-[300px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">
              Command Center
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              Your <span className="text-blue-accent">Dashboard</span>
            </h1>
            <p className="text-text-secondary">
              Integrate APIs, monitor projects, track revenue. Your holographic control panel.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 border border-white/[0.06]"
              >
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="font-display font-black text-3xl mb-1">
                  {stat.value}
                </p>
                <p
                  className={`text-xs font-mono ${
                    stat.up ? 'text-lime' : 'text-red-400'
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Services */}
          <ScrollReveal delay={0.2}>
            <div className="glass rounded-3xl p-6 border border-white/[0.06]">
              <h3 className="font-display font-bold text-lg mb-6">
                Connected Services
              </h3>
              <div className="space-y-4">
                {apiServices.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          service.status === 'active'
                            ? 'bg-lime'
                            : service.status === 'warning'
                            ? 'bg-yellow-accent'
                            : 'bg-red-500'
                        }`}
                      />
                      <span className="font-display font-semibold text-sm">
                        {service.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-mono text-text-muted">
                      <span>{service.calls} calls</span>
                      <span>{service.latency}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 rounded-full glass border border-white/[0.06] text-sm font-mono text-text-secondary hover:border-lime/30 hover:text-lime transition-all">
                + Add Service
              </button>
            </div>
          </ScrollReveal>

          {/* Activity Feed */}
          <ScrollReveal delay={0.3}>
            <div className="glass rounded-3xl p-6 border border-white/[0.06]">
              <h3 className="font-display font-bold text-lg mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        activity.type === 'lead'
                          ? 'bg-lime/10 text-lime'
                          : activity.type === 'deploy'
                          ? 'bg-blue-accent/10 text-blue-accent'
                          : activity.type === 'payment'
                          ? 'bg-yellow-accent/10 text-yellow-accent'
                          : activity.type === 'security'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-white/[0.05] text-text-secondary'
                      }`}
                    >
                      {activity.type === 'lead'
                        ? '🎯'
                        : activity.type === 'deploy'
                        ? '🚀'
                        : activity.type === 'payment'
                        ? '💰'
                        : activity.type === 'security'
                        ? '🔒'
                        : '👥'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm">
                        {activity.action}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {activity.detail}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Dragon Tracker */}
        <ScrollReveal delay={0.4}>
          <div className="mt-8 glass rounded-3xl p-8 border border-lime/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-xl">
                  🐉 Dragon Rank Tracker
                </h3>
                <p className="text-text-muted text-sm">
                  Live ranking against 2,000+ AI startups
                </p>
              </div>
              <div className="text-right">
                <p className="font-display font-black text-4xl text-lime glow-text-lime">
                  #847
                </p>
                <p className="text-xs font-mono text-text-muted">
                  ↑ 213 positions this month
                </p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime/50 to-lime transition-all duration-1000"
                style={{ width: '57.65%' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-mono text-text-muted">
              <span>#2,000</span>
              <span>Target: #1</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
