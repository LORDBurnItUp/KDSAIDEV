'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: GlowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: 'bg-lime text-void hover:shadow-lg hover:shadow-lime/30',
    secondary:
      'glass border border-white/10 hover:border-lime/30 hover:text-lime',
    ghost: 'bg-transparent hover:bg-white/5 hover:text-lime',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative rounded-full font-display font-semibold transition-all duration-300',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Glow effect */}
      {variant === 'primary' && isHovered && (
        <div className="absolute inset-0 rounded-full bg-lime opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
