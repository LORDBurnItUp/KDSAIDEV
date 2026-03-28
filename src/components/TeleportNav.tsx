'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: '◈', href: '/' },
  { label: 'Feed', icon: '◉', href: '/feed' },
  { label: 'Video Hub', icon: '◎', href: '/video' },
  { label: 'Marketplace', icon: '◇', href: '/marketplace' },
  { label: 'Command Center', icon: '⬡', href: '/command' },
  { label: 'Terminal', icon: '▸', href: '/terminal' },
  { label: 'Groups', icon: '⬢', href: '/groups' },
  { label: 'Forums', icon: '▣', href: '/forums' },
  { label: 'Messages', icon: '◆', href: '/dms' },
  { label: 'Portfolio', icon: '✦', href: '/portfolio' },
  { label: 'Login', icon: '⏣', href: '/auth' },
];

export default function TeleportNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('/');
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemsRef.current && isOpen) {
      gsap.fromTo(
        itemsRef.current.children,
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, [isOpen]);

  const handleClick = (href: string) => {
    setActiveItem(href);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center group-hover:bg-lime/20 transition-all duration-300">
            <span className="text-lime font-display font-bold text-lg">K</span>
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">
            <span className="text-white">KDS</span>
            <span className="text-lime ml-1">2130</span>
          </span>
        </a>

        {/* Teleport Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-6 py-2.5 rounded-full glass border border-white/10 hover:border-lime/30 transition-all duration-300 group"
        >
          <span className="text-sm font-mono text-text-secondary group-hover:text-lime transition-colors">
            {isOpen ? '> close portal' : '> teleport'}
          </span>
        </button>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full bg-lime text-void font-display font-semibold text-sm hover:bg-lime/90 transition-all hover:shadow-lg hover:shadow-lime/20">
            Enter 2130
          </button>
        </div>
      </div>

      {/* Teleport Portal */}
      {isOpen && (
        <div
          ref={containerRef}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
        >
          <div className="glass rounded-3xl p-6 border border-white/10">
            <div ref={itemsRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => handleClick(item.href)}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 group ${
                    activeItem === item.href
                      ? 'bg-lime/10 border border-lime/20'
                      : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <span
                    className={`text-xl ${
                      activeItem === item.href
                        ? 'text-lime'
                        : 'text-text-secondary group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`font-display font-semibold text-sm ${
                      activeItem === item.href
                        ? 'text-lime'
                        : 'text-text-secondary group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-xs font-mono text-text-muted text-center">
                teleport to any dimension — click a portal to enter
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
