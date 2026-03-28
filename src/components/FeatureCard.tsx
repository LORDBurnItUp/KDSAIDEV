'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color?: 'lime' | 'blue' | 'yellow';
  children?: ReactNode;
}

const colorMap = {
  lime: {
    icon: 'text-lime bg-lime/10 border-lime/20',
    glow: 'group-hover:bg-lime/[0.03]',
    border: 'group-hover:border-lime/20',
  },
  blue: {
    icon: 'text-blue-accent bg-blue-accent/10 border-blue-accent/20',
    glow: 'group-hover:bg-blue-accent/[0.03]',
    border: 'group-hover:border-blue-accent/20',
  },
  yellow: {
    icon: 'text-yellow-accent bg-yellow-accent/10 border-yellow-accent/20',
    glow: 'group-hover:bg-yellow-accent/[0.03]',
    border: 'group-hover:border-yellow-accent/20',
  },
};

export default function FeatureCard({
  icon,
  title,
  description,
  color = 'lime',
  children,
}: FeatureCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'group relative p-8 rounded-3xl glass border border-white/[0.06]',
        'hover:border-white/10 transition-all duration-500',
        'hover:-translate-y-2 hover:shadow-2xl',
        colors.border
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl',
          'mb-6 transition-all duration-300 group-hover:scale-110',
          colors.icon
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <h3 className="font-display font-bold text-xl mb-3 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary leading-relaxed group-hover:text-text-secondary/80 transition-colors">
        {description}
      </p>

      {/* Extra content */}
      {children}

      {/* Hover glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100',
          'transition-opacity duration-500 pointer-events-none',
          colors.glow
        )}
      />
    </div>
  );
}
