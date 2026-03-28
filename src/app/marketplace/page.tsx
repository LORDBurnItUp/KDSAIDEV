'use client';

import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';
import GlowButton from '@/components/GlowButton';

const categories = [
  'All',
  'Automation',
  'Websites',
  'Apps',
  'AI Agents',
  'Videos',
  'Consulting',
];

const listings = [
  {
    id: 1,
    title: 'Custom AI Agent Development',
    seller: 'Omar Estrada',
    rating: 4.9,
    reviews: 47,
    price: '$2,500',
    category: 'AI Agents',
    description: 'Fully custom AI agent built to your specifications. Includes deployment, training, and 30-day support.',
    tags: ['AI', 'Automation', 'Custom'],
    featured: true,
  },
  {
    id: 2,
    title: 'Full-Stack Website in 48 Hours',
    seller: 'Alan Estrada',
    rating: 5.0,
    reviews: 31,
    price: '$1,500',
    category: 'Websites',
    description: 'Modern, responsive website built with Next.js. Includes SEO, deployment, and 2 revision rounds.',
    tags: ['Web', 'Next.js', 'Fast'],
    featured: true,
  },
  {
    id: 3,
    title: 'Lead Generation Pipeline',
    seller: 'Sarah Chen',
    rating: 4.8,
    reviews: 89,
    price: '$3,000',
    category: 'Automation',
    description: 'Automated lead scraping, qualification, and outreach system. Firecrawl + n8n + CRM integration.',
    tags: ['Leads', 'Scraping', 'CRM'],
    featured: false,
  },
  {
    id: 4,
    title: 'Faceless YouTube Channel Setup',
    seller: 'Marcus Tech',
    rating: 4.7,
    reviews: 63,
    price: '$800',
    category: 'Videos',
    description: 'Complete faceless YouTube automation. AI scripts, voiceover, editing, and scheduled publishing.',
    tags: ['YouTube', 'AI Video', 'Passive'],
    featured: false,
  },
  {
    id: 5,
    title: 'Business Automation Consultation',
    seller: 'KDS Team',
    rating: 5.0,
    reviews: 112,
    price: '$500',
    category: 'Consulting',
    description: '1-hour consultation to map your business automation opportunities. Includes action plan document.',
    tags: ['Strategy', 'Consulting', 'Planning'],
    featured: false,
  },
  {
    id: 6,
    title: 'Mobile App Development',
    seller: 'DevTeam Alpha',
    rating: 4.6,
    reviews: 28,
    price: '$5,000',
    category: 'Apps',
    description: 'Cross-platform mobile app (iOS + Android) built with React Native. Full UI/UX included.',
    tags: ['Mobile', 'React Native', 'Cross-Platform'],
    featured: true,
  },
];

export default function MarketplacePage() {
  return (
    <main className="relative min-h-screen">
      <TeleportNav />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-accent rounded-full blur-[300px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-lime uppercase tracking-widest mb-3 block">
              Commerce Dimension
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-4">
              The <span className="text-yellow-accent">Marketplace</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Buy and sell AI services, automation, websites, apps, and more. Every
              seller verified. Every transaction secured.
            </p>
          </div>
        </ScrollReveal>

        {/* Categories */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full font-mono text-sm transition-all duration-300 ${
                  i === 0
                    ? 'bg-lime/10 border border-lime/20 text-lime'
                    : 'glass border border-white/[0.06] text-text-secondary hover:border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, index) => (
            <ScrollReveal key={listing.id} delay={index * 0.1}>
              <div
                className={`group relative p-6 rounded-3xl glass border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                  listing.featured
                    ? 'border-lime/20 hover:border-lime/30'
                    : 'border-white/[0.06] hover:border-white/10'
                }`}
              >
                {/* Featured Badge */}
                {listing.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-lime/10 border border-lime/20 text-[10px] font-mono text-lime uppercase">
                    Featured
                  </div>
                )}

                {/* Category */}
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3 block">
                  {listing.category}
                </span>

                {/* Title */}
                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-white transition-colors">
                  {listing.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {listing.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Seller & Price */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                  <div>
                    <p className="text-sm font-display font-semibold">
                      {listing.seller}
                    </p>
                    <p className="text-xs text-text-muted">
                      ⭐ {listing.rating} ({listing.reviews} reviews)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-black text-xl text-lime">
                      {listing.price}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full mt-4 py-3 rounded-full bg-lime/10 border border-lime/20 text-lime font-display font-semibold text-sm hover:bg-lime/20 transition-all duration-300 group-hover:bg-lime group-hover:text-void group-hover:border-lime">
                  View Details
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Sell CTA */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 text-center glass rounded-3xl p-12 border border-white/[0.06]">
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
        </ScrollReveal>
      </div>
    </main>
  );
}
