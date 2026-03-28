'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ParticleWaveProps {
  color?: string;
  count?: number;
  speed?: number;
}

export default function ParticleWave({
  color = '#BFF549',
  count = 100,
  speed = 0.5,
}: ParticleWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;

    const particles: { x: number; y: number; baseY: number; amplitude: number; phase: number; size: number }[] = [];
    
    for (let i = 0; i < count; i++) {
      const baseY = Math.random() * canvas.height;
      particles.push({
        x: Math.random() * canvas.width,
        y: baseY,
        baseY,
        amplitude: Math.random() * 30 + 10,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 2 + 0.5,
      });
    }

    let frame: number;
    let time = 0;

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      time += 0.02 * speed;

      for (const p of particles) {
        p.y = p.baseY + Math.sin(time + p.phase) * p.amplitude;
        p.x += 0.5 * speed;
        if (p.x > canvas!.width) p.x = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.globalAlpha = 0.6;
        ctx!.fill();
      }

      frame = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [color, count, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
    />
  );
}
