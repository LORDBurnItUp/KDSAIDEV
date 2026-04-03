'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

interface ConnectionLine {
  index1: number;
  index2: number;
  distance: number;
}

const PALETTE = [
  { r: 191, g: 245, b: 73 },   // lime
  { r: 96, g: 165, b: 250 },   // blue
  { r: 250, g: 204, b: 21 },   // yellow
  { r: 255, g: 255, b: 255 },  // white
];

const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 150;
const MOUSE_RADIUS = 200;

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);

  const createParticle = useCallback((w: number, h: number): Particle => {
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: `${color.r},${color.g},${color.b}`,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = particlesRef.current;
      // Resize: keep existing, add more if needed, remove extras
      while (particles.length < PARTICLE_COUNT) {
        particles.push(createParticle(canvas.width, canvas.height));
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particlesRef.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push(createParticle(canvas.width, canvas.height));
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const animate = () => {
      time++;
      const w = canvas.width;
      const h = canvas.height;
      const particles = particlesRef.current;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse interaction
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        // Pulse
        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = p.opacity * pulse;
        const currentSize = p.size * (0.8 + pulse * 0.4);

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4);
        gradient.addColorStop(0, `rgba(${p.color}, ${currentOpacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(${p.color}, ${currentOpacity * 0.15})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${currentOpacity})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            const mixedColor = particles[i].color; // use first particle's color for line
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${mixedColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse glow
      if (mouseX > 0 && mouseY > 0) {
        const mouseGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, MOUSE_RADIUS * 0.5);
        mouseGradient.addColorStop(0, 'rgba(191, 245, 73, 0.04)');
        mouseGradient.addColorStop(1, 'rgba(191, 245, 73, 0)');
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, MOUSE_RADIUS * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = mouseGradient;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
