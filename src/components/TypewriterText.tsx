'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 50,
  className = '',
  onComplete,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    let index = 0;

    const interval = setInterval(() => {
      if (index <= text.length) {
        el.textContent = text.slice(0, index);
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span ref={ref} className={className}>
      {/* Cursor */}
      <span className="inline-block w-[2px] h-[1em] bg-lime ml-1 animate-pulse" />
    </span>
  );
}
