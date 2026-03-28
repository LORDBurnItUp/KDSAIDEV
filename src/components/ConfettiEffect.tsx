'use client';

import { useRef, useEffect } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  originX?: number;
  originY?: number;
}

const colors = ['#BFF549', '#FACC15', '#60a5fa', '#f472b6', '#a78bfa', '#34d399', '#fb923c', '#fff'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  opacity: number;
  decay: number;
  shape: 'rect' | 'circle';
}

export default function ConfettiEffect({
  trigger,
  originX,
  originY,
}: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = originX ?? canvas.width / 2;
    const cy = originY ?? canvas.height / 2;

    particlesRef.current = [];
    for (let i = 0; i < 150; i++) {
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 200,
        y: cy,
        vx: (Math.random() - 0.5) * 20,
        vy: -(Math.random() * 18 + 6),
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.35 + Math.random() * 0.15,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.008,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    if (!animatingRef.current) {
      animatingRef.current = true;
      animate();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = 0;

      for (const p of particlesRef.current) {
        if (p.opacity <= 0) continue;
        alive++;

        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = Math.max(0, p.opacity);
        ctx!.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }

      if (alive > 0) {
        requestAnimationFrame(animate);
      } else {
        animatingRef.current = false;
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }
  }, [trigger, originX, originY]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
