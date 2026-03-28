'use client';

import { useEffect, useRef } from 'react';

export default function ScanlineOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03]"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.3) 2px,
          rgba(0, 0, 0, 0.3) 4px
        )`,
      }}
    />
  );
}
