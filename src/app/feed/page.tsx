'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';
import ConfettiEffect from '@/components/ConfettiEffect';

const posts = [
  {
    id: 1,
    author: 'Omar Estrada Velasquez',
    handle: '@LORDBurnItDown',
    avatar: '🐉',
    time: '2h',
    content: 'Just deployed the first 4D interface for Kings Dripping Swag. The blackhole transitions are INSANE. Nobody has ever seen a website like this. Welcome to 2130. 🔥',
    likes: 847,
    comments: 124,
    shares: 89,
    type: 'text',
  },
  {
    id: 2,
    author: 'Alan Estrada Velasquez',
    handle: '@GknowsThis',
    avatar: '⚡',
    time: '4h',
    content: 'New AI agent just dropped. Full automation pipeline — from lead scraping to deployment. Zero human intervention. The Dragon is climbing. 🐉',
    likes: 1203,
    comments: 256,
    shares: 312,
    type: 'text',
  },
  {
    id: 3,
    author: 'KDS Marketplace',
    handle: '@KDSMarketplace',
    avatar: '💎',
    time: '6h',
    content: 'NEW LISTING: Full-stack AI automation service — $5,000. Includes custom agent, deployment, and 30-day support. Verified seller with 50+ completed projects.',
    likes: 456,
    comments: 78,
    shares: 134,
    type: 'listing',
    price: '$5,000',
  },
  {
    id: 4,
    author: 'Sarah Chen',
    handle: '@sarahcodes',
    avatar: '🧬',
    time: '8h',
    content: 'Just shipped my first faceless YouTube channel automation using KDS tools. 10 videos in 2 days. The AI writes scripts, generates visuals, and publishes. This platform is from the future.',
    likes: 2103,
    comments: 445,
    shares: 567,
    type: 'text',
  },
  {
    id: 5,
    author: 'KDS Community',
    handle: '@KDSAIDEV',
    avatar: '🌐',
    time: '12h',
    content: 'COMMUNITY UPDATE: 10,000+ members strong. New features coming: live 10-camera video chat, built-in terminal CLI, and 4D marketplace gallery. The future is now.',
    likes: 3421,
    comments: 892,
    shares: 1203,
    type: 'announcement',
  },
];

export default function FeedPage() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        setConfettiTrigger(true);
        setTimeout(() => setConfettiTrigger(false), 100);
      }
      return next;
    });
  };

  return (
    <main className="relative min-h-screen">
      <TeleportNav />
      <ConfettiEffect trigger={confettiTrigger} />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-lime rounded-full blur-[300px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">
              Neural Feed
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              What&apos;s Happening in{' '}
              <span className="text-lime">2130</span>
            </h1>
            <p className="text-text-secondary">
              Real-time updates from the community from another dimension
            </p>
          </div>
        </ScrollReveal>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <ScrollReveal key={post.id} delay={index * 0.1}>
              <article className="glass rounded-3xl p-6 border border-white/[0.06] hover:border-white/10 transition-all duration-300">
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-xl">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm">
                        {post.author}
                      </span>
                      {post.type === 'announcement' && (
                        <span className="px-2 py-0.5 rounded-full bg-lime/10 border border-lime/20 text-[10px] font-mono text-lime uppercase">
                          Official
                        </span>
                      )}
                      {post.type === 'listing' && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-accent/10 border border-yellow-accent/20 text-[10px] font-mono text-yellow-accent uppercase">
                          {post.price}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">
                      {post.handle} · {post.time}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-text-secondary leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-3 border-t border-white/[0.04]">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 text-sm transition-all duration-200 hover:scale-110 ${
                      likedPosts.has(post.id)
                        ? 'text-lime'
                        : 'text-text-muted hover:text-lime'
                    }`}
                  >
                    <span>{likedPosts.has(post.id) ? '💚' : '🤍'}</span>
                    <span className="font-mono text-xs">
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-text-muted hover:text-blue-accent transition-colors">
                    <span>💬</span>
                    <span className="font-mono text-xs">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-text-muted hover:text-yellow-accent transition-colors">
                    <span>🔄</span>
                    <span className="font-mono text-xs">{post.shares}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors ml-auto">
                    <span>📤</span>
                  </button>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  );
}
