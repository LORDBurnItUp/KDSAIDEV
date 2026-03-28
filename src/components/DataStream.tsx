'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function DataStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;

    const chars = '01アイウエオカキクケコサシスセソタチツテト∞∑∏∫√∂∆';
    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = Array(columns).fill(0);

    let frame: number;

    function draw() {
      ctx!.fillStyle = 'rgba(2, 4, 10, 0.05)';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      ctx!.fillStyle = 'rgba(191, 245, 73, 0.15)';
      ctx!.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx!.fillText(char, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frame = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
    />
  );
}
