'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface GlowOrbProps {
  color?: string;
  size?: number;
  x?: string;
  y?: string;
  delay?: number;
  duration?: number;
}

export default function GlowOrb({
  color = '#BFF549',
  size = 400,
  x = '50%',
  y = '50%',
  delay = 0,
  duration = 20,
}: GlowOrbProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      x: 'random(-50, 50)',
      y: 'random(-30, 30)',
      duration,
      delay,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [delay, duration]);

  return (
    <div
      ref={ref}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: color,
        filter: `blur(${size * 0.7}px)`,
        opacity: 0.06,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}
