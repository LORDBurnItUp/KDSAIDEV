'use client';

import { useState } from 'react';
import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';
import GlowButton from '@/components/GlowButton';

interface Product {
  id: number;
  title: string;
  seller: string;
  avatar: string;
  rating: number;
  reviews: number;
  price: string;
  originalPrice?: string;
  category: string;
  description: string;
  fullDescription: string;
  tags: string[];
  featured: boolean;
  delivery: string;
  image: string;
  sales: number;
  badge?: string;
}

const categories = [
  'All',
  'Automation',
  'Websites',
  'Apps',
  'AI Agents',
  'Videos',
  'Consulting',
];

const products: Product[] = [
  {
    id: 1,
    title: 'Custom AI Agent Development',
    seller: 'Omar Estrada',
    avatar: '🧠',
    rating: 4.9,
    reviews: 47,
    price: '$2,500',
    originalPrice: '$3,500',
    category: 'AI Agents',
    description: 'Fully custom AI agent built to your specifications.',
    fullDescription: 'Includes deployment, training, and 30-day support. Built with cutting-edge LLMs, custom tools, and seamless integrations.',
    tags: ['AI', 'Automation', 'Custom'],
    featured: true,
    delivery: '7-14 days',
    image: '🤖',
    sales: 47,
    badge: '🔥 Bestseller',
  },
  {
    id: 2,
    title: 'Full-Stack Website in 48 Hours',
    seller: 'Alan Estrada',
    avatar: '⚡',
    rating: 5.0,
    reviews: 31,
    price: '$1,500',
    category: 'Websites',
    description: 'Modern, responsive website built with Next.js.',
    fullDescription: 'Includes SEO, deployment, and 2 revision rounds. Lightning-fast delivery without compromising quality.',
    tags: ['Web', 'Next.js', 'Fast'],
    featured: true,
    delivery: '48 hours',
    image: '🌐',
    sales: 31,
    badge: '⚡ Lightning',
  },
  {
    id: 3,
    title: 'Lead Generation Pipeline',
    seller: 'Sarah Chen',
    avatar: '🎯',
    rating: 4.8,
    reviews: 89,
    price: '$3,000',
    originalPrice: '$4,000',
    category: 'Automation',
    description: 'Automated lead scraping, qualification, and outreach.',
    fullDescription: 'Firecrawl + n8n + CRM integration. Build a fully automated pipeline that finds, qualifies, and reaches out to leads 24/7.',
    tags: ['Leads', 'Scraping', 'CRM'],
    featured: false,
    delivery: '10 days',
    image: '📊',
    sales: 89,
  },
  {
    id: 4,
    title: 'Faceless YouTube Channel Setup',
    seller: 'Marcus Tech',
    avatar: '🎬',
    rating: 4.7,
    reviews: 63,
    price: '$800',
    category: 'Videos',
    description: 'Complete faceless YouTube automation.',
    fullDescription: 'AI scripts, voiceover, editing, and scheduled publishing. Everything needed to launch a profitable faceless channel.',
    tags: ['YouTube', 'AI Video', 'Passive'],
    featured: false,
    delivery: '5-7 days',
    image: '▶️',
    sales: 63,
  },
  {
    id: 5,
    title: 'Business Automation Consultation',
    seller: 'KDS Team',
    avatar: '💼',
    rating: 5.0,
    reviews: 112,
    price: '$500',
    category: 'Consulting',
    description: '1-hour consultation to map your automation.',
    fullDescription: 'Includes action plan document. We analyze your business and create a step-by-step automation roadmap.',
    tags: ['Strategy', 'Consulting', 'Planning'],
    featured: false,
    delivery: 'Same day',
    image: '📋',
    sales: 112,
    badge: '⭐ Top Rated',
  },
  {
    id: 6,
    title: 'Mobile App Development',
    seller: 'DevTeam Alpha',
    avatar: '📱',
    rating: 4.6,
    reviews: 28,
    price: '$5,000',
    originalPrice: '$7,000',
    category: 'Apps',
    description: 'Cross-platform mobile app (iOS + Android).',
    fullDescription: 'Built with React Native. Full UI/UX included, push notifications, offline support, and app store deployment.',
    tags: ['Mobile', 'React Native', 'Cross-Platform'],
    featured: true,
    delivery: '21 days',
    image: '📲',
    sales: 28,
    badge: '💎 Premium',
  },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <ScrollReveal delay={index * 0.08}>
      <div
        className={`group relative rounded-3xl glass border transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl overflow-hidden ${
          product.featured
            ? 'border-lime/20 hover:border-lime/30 hover:shadow-lime/10'
            : 'border-white/[0.06] hover:border-white/10'
        }`}
      >
        {/* Product Image Area */}
        <div className={`relative h-48 flex items-center justify-center ${
          product.featured
            ? 'bg-gradient-to-br from-lime/[0.08] to-blue-accent/[0.04]'
            : 'bg-gradient-to-br from-white/[0.02] to-white/[0.01]'
        }`}>
          <span className="text-6xl group-hover:scale-125 transition-transform duration-500">
            {product.image}
          </span>

          {/* Badges */}
          {product.badge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-lime/15 border border-lime/25 text-[10px] font-mono text-lime backdrop-blur-sm">
              {product.badge}
            </div>
          )}
          {product.featured && !product.badge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-yellow-accent/15 border border-yellow-accent/25 text-[10px] font-mono text-yellow-accent backdrop-blur-sm">
              Featured
            </div>
          )}

          {/* Sales count */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[9px] font-mono text-text-muted backdrop-blur-sm">
            {product.sales} sold
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Seller & Category */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{product.avatar}</span>
              <span className="text-xs font-mono text-text-muted">{product.seller}</span>
            </div>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.04]">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-lg mb-2 group-hover:text-white transition-colors line-clamp-1">
            {product.title}
          </h3>

          {/* Short Description */}
          <p className="text-text-secondary text-sm leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Delivery Time */}
          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            Delivery: {product.delivery}
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.04] mb-4" />

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl text-lime">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xs font-mono text-text-muted line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-accent text-xs">
                  {'★'.repeat(Math.floor(product.rating))}
                </span>
                <span className="text-xs text-text-muted">
                  {product.rating} ({product.reviews})
                </span>
              </div>
            </div>

            <button
              className="px-5 py-2.5 rounded-xl bg-lime/10 border border-lime/20 text-lime font-display font-semibold text-xs hover:bg-lime hover:text-void transition-all duration-300 group-hover:bg-lime group-hover:text-void group-hover:border-lime"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const featured = products.filter(p => p.featured);

  return (
    <main className="relative min-h-screen">
      <TeleportNav />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-yellow-accent rounded-full blur-[300px] opacity-[0.03]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime rounded-full blur-[280px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Hero Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/[0.06] border border-lime/10 text-[10px] font-mono text-lime uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              Commerce Dimension — Live
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              The <span className="text-yellow-accent">Marketplace</span>
            </h1>
            <p className="text-text-secondary tex-lg max-w-2xl mx-auto">
              Buy and sell AI services, automation, websites, apps, and more. Every
              seller verified. Every transaction secured. From the future.
            </p>
          </div>
        </ScrollReveal>

        {/* Featured Section */}
        {activeCategory === 'All' && (
          <ScrollReveal>
            <div className="mb-16">
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                <span className="text-lime">🔥</span> Featured Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Categories */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {['All', ...new Set(products.map(p => p.category))].map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-display font-semibold text-sm transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-lime/10 border border-lime/20 text-lime'
                    : 'glass border border-white/[0.06] text-text-secondary hover:border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="font-display font-bold text-xl mb-2">No services found</h3>
            <p className="text-text-muted">Try a different category or check back later.</p>
          </div>
        )}

        {/* Stats */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🛒', value: '$47K+', label: 'Total GMV' },
              { icon: '👥', value: '400+', label: 'Happy Clients' },
              { icon: '⭐', value: '4.8', label: 'Average Rating' },
              { icon: '🚀', value: '248', label: 'Projects Delivered' },
            ].map(stat => (
              <div key={stat.label} className="glass rounded-2xl p-5 border border-white/[0.06] text-center hover:border-lime/20 transition-colors">
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <p className="font-display font-black text-2xl text-lime">{stat.value}</p>
                <p className="text-xs font-mono text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Sell CTA */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 text-center glass rounded-3xl p-12 border border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-lime/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="font-display font-black text-3xl mb-4">
                Start Selling on{' '}
                <span className="text-yellow-accent">KDS</span>
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                List your services, set your prices, and reach thousands of buyers
                from another dimension. Zero fees for the first 100 sellers.
              </p>
              <GlowButton variant="primary" size="lg">
                List Your Service — Free
              </GlowButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
