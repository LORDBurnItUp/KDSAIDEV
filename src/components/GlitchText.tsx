'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface GlitchTextProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export default function GlitchText({
  text,
  className = '',
  tag: Tag = 'h1',
}: GlitchTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    // Initial glitch on mount
    gsap.fromTo(
      el,
      {
        opacity: 0,
        x: -5,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out',
      }
    );

    // Subtle hover glitch
    const handleEnter = () => {
      gsap.to(el, {
        x: 2,
        duration: 0.05,
        repeat: 5,
        yoyo: true,
        ease: 'power1.inOut',
      });
    };

    el.addEventListener('mouseenter', handleEnter);
    return () => el.removeEventListener('mouseenter', handleEnter);
  }, []);

  return (
    <Tag ref={ref as any} className={`opacity-0 ${className}`}>
      {text}
    </Tag>
  );
}
