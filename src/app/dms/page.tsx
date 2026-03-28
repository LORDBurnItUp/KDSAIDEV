'use client';

import { useState } from 'react';
import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';

const conversations = [
  { id: 1, name: 'Sarah Chen', avatar: '🧬', lastMessage: 'Sent you the automation pipeline docs', time: '2m', unread: 3, online: true },
  { id: 2, name: 'Marcus Tech', avatar: '⚡', lastMessage: 'The YouTube channel is live now!', time: '15m', unread: 0, online: true },
  { id: 3, name: 'DevTeam Alpha', avatar: '🔧', lastMessage: 'App build is ready for review', time: '1h', unread: 1, online: false },
  { id: 4, name: 'KDS Support', avatar: '🌐', lastMessage: 'Your listing has been approved', time: '3h', unread: 0, online: true },
  { id: 5, name: 'Alan Estrada', avatar: '🐉', lastMessage: 'Check out this new lead gen setup', time: '5h', unread: 0, online: false },
];

const messages = [
  { id: 1, sender: 'them', text: 'Hey! I just finished the automation pipeline for the YouTube channels.', time: '10:23 AM' },
  { id: 2, sender: 'them', text: '50 channels running on full autopilot now. AI writes scripts, generates thumbnails, and publishes on schedule.', time: '10:24 AM' },
  { id: 3, sender: 'me', text: 'That\'s insane. What\'s the revenue looking like?', time: '10:30 AM' },
  { id: 4, sender: 'them', text: 'About $3K/month passive so far. Growing 20% weekly. Here are the docs 👇', time: '10:31 AM' },
  { id: 5, sender: 'them', text: 'Sent you the automation pipeline docs', time: '10:32 AM' },
];

export default function DMsPage() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  return (
    <main className="relative min-h-screen">
      <TeleportNav />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-8">
        <ScrollReveal>
          <div className="text-center mb-8">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">Private Channel</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              Messages <span className="text-yellow-accent">◉</span>
            </h1>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
          {/* Conversations List */}
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06]">
              <input type="text" placeholder="Search conversations..." className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-mono outline-none focus:border-lime/30 transition-all" />
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.map((conv) => (
                <button key={conv.id} onClick={() => setSelectedChat(conv.id)} className={`w-full p-4 text-left border-b border-white/[0.04] transition-all ${selectedChat === conv.id ? 'bg-lime/5' : 'hover:bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lg">{conv.avatar}</div>
                      {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-lime border-2 border-void" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm">{conv.name}</span>
                        <span className="text-[10px] font-mono text-text-muted">{conv.time}</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-lime flex items-center justify-center text-[10px] font-mono text-void font-bold">{conv.unread}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 glass rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lg">{conversations.find(c => c.id === selectedChat)?.avatar}</div>
              <div>
                <p className="font-display font-bold text-sm">{conversations.find(c => c.id === selectedChat)?.name}</p>
                <p className="text-[10px] font-mono text-lime">Online</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-lime/10 border border-lime/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] font-mono text-text-muted mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-mono outline-none focus:border-lime/30 transition-all" />
                <button className="px-6 py-3 rounded-xl bg-lime text-void font-display font-semibold text-sm hover:bg-lime/90 transition-all">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
