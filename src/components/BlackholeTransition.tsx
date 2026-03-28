'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';

interface BlackholeTransitionProps {
  isActive: boolean;
  children: ReactNode;
  clickPosition?: { x: number; y: number };
  onComplete?: () => void;
}

export default function BlackholeTransition({
  isActive,
  children,
  clickPosition = { x: 50, y: 50 },
  onComplete,
}: BlackholeTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const x = `${clickPosition.x}%`;
    const y = `${clickPosition.y}%`;

    if (isActive) {
      el.style.setProperty('--click-x', x);
      el.style.setProperty('--click-y', y);

      gsap.fromTo(
        el,
        { clipPath: `circle(0% at ${x} ${y})`, opacity: 0 },
        {
          clipPath: `circle(150% at ${x} ${y})`,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          onComplete,
        }
      );
    } else {
      gsap.to(el, {
        clipPath: `circle(0% at ${x} ${y})`,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.in',
      });
    }
  }, [isActive, clickPosition, onComplete]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100] bg-void"
      style={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
    >
      {/* Swirling particles during transition */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-lime/10 blur-[100px] animate-pulse" />
      </div>
      {children}
    </div>
  );
}
