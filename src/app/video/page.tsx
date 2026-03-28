'use client';

import { useState } from 'react';
import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';

const channels = [
  {
    id: 1,
    title: 'AI Dev Lounge',
    viewers: 847,
    status: 'live',
    host: 'Omar',
    topic: 'Building 4D interfaces with React Three Fiber',
    color: 'lime',
  },
  {
    id: 2,
    title: 'Automation Lab',
    viewers: 523,
    status: 'live',
    host: 'Alan',
    topic: 'Lead gen pipeline — scraping to deployment',
    color: 'blue-accent',
  },
  {
    id: 3,
    title: 'Marketplace Talk',
    viewers: 312,
    status: 'live',
    host: 'Sarah',
    topic: 'How I made $10K selling AI services on KDS',
    color: 'yellow-accent',
  },
  {
    id: 4,
    title: 'Code Review',
    viewers: 0,
    status: 'starting',
    host: 'Marcus',
    topic: 'Live code review — open source agents',
    color: 'lime',
  },
  {
    id: 5,
    title: 'Startup Grind',
    viewers: 0,
    status: 'starting',
    host: 'DevTeam',
    topic: 'Building from zero to revenue in 30 days',
    color: 'blue-accent',
  },
];

const cameras = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Camera ${i + 1}`,
  active: i < 3,
  user: i < 3 ? ['Omar', 'Alan', 'Sarah'][i] : null,
}));

export default function VideoPage() {
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [ignoredCameras, setIgnoredCameras] = useState<Set<number>>(new Set());

  const toggleIgnore = (id: number) => {
    setIgnoredCameras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="relative min-h-screen">
      <TeleportNav />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">
              Live Dimension
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              Video <span className="text-lime">Hub</span>
            </h1>
            <p className="text-text-secondary">
              10 live cameras. Real-time connection. From another dimension.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <div className="glass rounded-3xl overflow-hidden border border-white/[0.06]">
                {/* Main Stream */}
                <div className="aspect-video bg-void relative flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse">
                      ◉
                    </div>
                    <p className="font-display font-bold text-xl mb-1">
                      {channels.find((c) => c.id === selectedChannel)?.title}
                    </p>
                    <p className="text-text-muted text-sm">
                      {channels.find((c) => c.id === selectedChannel)?.topic}
                    </p>
                  </div>
                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono text-red-400 uppercase">
                      Live
                    </span>
                  </div>
                  {/* Viewers */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass text-xs font-mono text-text-secondary">
                    👁 {channels.find((c) => c.id === selectedChannel)?.viewers}{' '}
                    watching
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-6 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg">
                        {channels.find((c) => c.id === selectedChannel)?.host}
                      </h3>
                      <p className="text-text-muted text-sm">
                        Hosting:{' '}
                        {channels.find((c) => c.id === selectedChannel)?.topic}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 rounded-full bg-lime/10 border border-lime/20 text-lime text-sm font-mono hover:bg-lime/20 transition-all">
                        Follow
                      </button>
                      <button className="px-4 py-2 rounded-full glass border border-white/10 text-sm font-mono hover:border-lime/30 transition-all">
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 10 Cameras Grid */}
            <ScrollReveal delay={0.2}>
              <div className="mt-6">
                <h3 className="font-display font-bold text-lg mb-4">
                  Live Cameras
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {cameras.map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => toggleIgnore(cam.id)}
                      className={`aspect-square rounded-xl border flex items-center justify-center text-xs font-mono transition-all duration-300 ${
                        ignoredCameras.has(cam.id)
                          ? 'bg-white/[0.02] border-white/[0.04] text-text-muted opacity-30'
                          : cam.active
                          ? 'bg-lime/10 border-lime/20 text-lime hover:bg-lime/20'
                          : 'bg-white/[0.02] border-white/[0.06] text-text-muted hover:border-white/10'
                      }`}
                    >
                      {ignoredCameras.has(cam.id)
                        ? '✕'
                        : cam.active
                        ? cam.user?.[0]
                        : cam.id}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-2 font-mono">
                  Click to ignore • Ignored cameras won&apos;t appear
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Channels Sidebar */}
          <div className="space-y-4">
            <ScrollReveal delay={0.1}>
              <h3 className="font-display font-bold text-lg mb-4">
                Live Channels
              </h3>
              <div className="space-y-3">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedChannel === channel.id
                        ? 'bg-lime/10 border-lime/20'
                        : 'glass border-white/[0.06] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm ${
                          channel.status === 'live'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-white/[0.02] border-white/[0.06] text-text-muted'
                        }`}
                      >
                        {channel.status === 'live' ? '◉' : '○'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm truncate">
                          {channel.title}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {channel.topic}
                        </p>
                      </div>
                      {channel.status === 'live' && (
                        <span className="text-xs font-mono text-text-muted">
                          {channel.viewers}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </main>
  );
}
