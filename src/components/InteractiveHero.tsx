'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface MousePos {
  x: number;
  y: number;
  normalizedX: number;  // -1 to 1
  normalizedY: number;  // -1 to 1
  rotation3d: number;   // total rotation tracking
  speed: number;        // how fast mouse is moving
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  vx: number;
  vy: number;
  color: string;
}

interface Orb {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  blur: number;
  lag: number; // how slow/fast to follow
}

export default function InteractiveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const [mouse, setMouse] = useState<MousePos>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    normalizedX: 0,
    normalizedY: 0,
    rotation3d: 0,
    speed: 0,
  });

  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);

  const orbs: Orb[] = [
    { x: 30, y: 30, targetX: 20, targetY: 20, size: 600, color: '#BFF549', blur: '280px', lag: 0.03 },
    { x: 70, y: 70, targetX: 80, targetY: 80, size: 400, color: '#FACC15', blur: '220px', lag: 0.02 },
    { x: 50, y: 50, targetX: 50, targetY: 30, size: 300, color: '#60a5fa', blur: '200px', lag: 0.04 },
    { x: 90, y: 20, targetX: 10, targetY: 90, size: 350, color: '#a78bfa', blur: '260px', lag: 0.025 },
  ];

  const [smoothOrbs, setSmoothOrbs] = useState(orbs);

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const nx = (e.clientX / w - 0.5) * 2;  // -1 to 1
    const ny = (e.clientY / h - 0.5) * 2;

    setMouse(prev => ({
      x: e.clientX,
      y: e.clientY,
      normalizedX: nx,
      normalizedY: ny,
      rotation3d: prev.rotation3d + Math.abs(nx - prev.normalizedX) * 180,
      speed: Math.sqrt(
        Math.pow(e.clientX - prev.x, 2) + Math.pow(e.clientY - prev.y, 2)
      ),
    }));

    // Add particles on mouse move
    if (Math.random() > 0.7) {
      const colors = ['#BFF549', '#FACC15', '#60a5fa', '#a78bfa', '#f472b6'];
      setParticles(prev => [...prev.slice(-100), {
        id: particleId.current++,
        x: e.clientX,
        y: e.clientY,
        size: 2 + Math.random() * 6,
        opacity: 0.6 + Math.random() * 0.4,
        life: 1,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      }]);
    }

    // Update orb targets
    setSmoothOrbs(prev => prev.map((orb, i) => ({
      ...orb,
      targetX: 20 + i * 20 + nx * 15,
      targetY: 20 + i * 15 + ny * 15,
    })));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Smooth orb animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSmoothOrbs(prev => prev.map(orb => ({
        ...orb,
        x: orb.x + (orb.targetX - orb.x) * orb.lag * 10,
        y: orb.y + (orb.targetY - orb.y) * orb.lag * 10,
      })));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Particle life cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02,
            opacity: p.life * 0.8,
            vy: p.vy + 0.05, // gravity
          }))
          .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Canvas particle trail
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const trails = canvas.getContext('2d')!;
    const dots: { x: number; y: number; size: number; alpha: number }[] = [];

    function renderDot() {
      dots.push({
        x: mouse.x,
        y: mouse.y,
        size: Math.min(mouse.speed / 10, 20),
        alpha: 1,
      });
    }

    function animate() {
      trails.clearRect(0, 0, canvas.width, canvas.height);

      // Render trails
      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        dot.alpha -= 0.015;
        dot.size *= 0.98;

        if (dot.alpha <= 0) {
          dots.splice(i, 1);
          continue;
        }

        const hue = ((dot.x + dot.y) / 3) % 360;

        // Glowing dot
        trails.beginPath();
        trails.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        trails.fillStyle = `hsla(${120 + hue * 0.3}, 100%, 70%, ${dot.alpha})`;
        trails.fill();

        // Outer glow
        trails.beginPath();
        trails.arc(dot.x, dot.y, dot.size * 3, 0, Math.PI * 2);
        trails.fillStyle = `hsla(${120 + hue * 0.3}, 100%, 60%, ${dot.alpha * 0.2})`;
        trails.fill();
      }

      requestRef.current = requestAnimationFrame(animate);
    }

    requestRef.current = requestAnimationFrame(animate);

    const addInterval = setInterval(renderDot, 20);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(addInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [mouse.x, mouse.y, mouse.speed]);

  // 3D perspective transforms
  const perspectiveX = mouse.normalizedY * -10;  // tilt based on mouse Y
  const perspectiveY = mouse.normalizedX * 10;   // tilt based on mouse X
  const rotateZ = mouse.speed * 0.1;             // spin based on speed
  const rotateTotal = mouse.rotation3d % 360;

  return (
    <div
      className="fixed inset-0 z-[1] overflow-hidden"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* ─── Canvas for particle trails ─── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{ opacity: 0.8 }}
      />

      {/* ─── Mouse-follow glowing orbs ─── */}
      {smoothOrbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: `translate(-50%, -50%) scale(${1 + mouse.speed / 200})`,
            background: `radial-gradient(circle, ${orb.color}40 0%, transparent 70%)`,
            filter: `blur(${orb.blur})`,
            transition: 'left 0.3s ease-out, top 0.3s ease-out, transform 0.1s ease',
            zIndex: 3,
          }}
        />
      ))}

      {/* ─── Floating dot particles ─── */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}60`,
            zIndex: 4,
          }}
        />
      ))}

      {/* ─── 3D Hero Card (follows mouse, spins) ─── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `
            rotateX(${perspectiveX}deg) 
            rotateY(${perspectiveY}deg)
            rotateZ(${rotateZ}deg)
            translateZ(${mouse.speed * 2}px)
          `,
          transformStyle: 'preserve-3d',
          transition: mouse.speed < 5 ? 'transform 0.3s ease-out' : 'none',
          zIndex: 10,
        }}
      >
        {/* Main title */}
        <div
          className="text-center select-none"
          style={{
            transform: `
              translateZ(100px) 
              rotateY(${perspectiveY * 0.5}deg)
              rotateX(${perspectiveX * 0.3}deg)
            `,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* LRYS Title */}
          <h1
            className="font-black"
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              fontSize: 'clamp(4rem, 15vw, 14rem)',
              lineHeight: 0.85,
              letterSpacing: '0.1em',
              background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 30%, #B8860B 60%, #8B6914 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `
                drop-shadow(0 0 30px rgba(212,175,55,0.4))
                drop-shadow(0 0 60px rgba(255,215,0,0.2))
              `,
              transform: `translateZ(80px) rotateX(${mouse.normalizedY * -5}deg) rotateY(${mouse.normalizedX * 5}deg)`,
              transition: 'filter 0.3s ease',
            }}
          >
            LRYS
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 font-mono tracking-widest"
            style={{
              fontSize: 'clamp(0.6rem, 1.5vw, 1.2rem)',
              color: 'rgba(191, 245, 73, 0.6)',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(191,245,73,0.3)',
              transform: `translateZ(40px) translateY(${mouse.normalizedY * -20}px)`,
            }}
          >
            Kings Dripping Swag • 2130 • The Future Is Now
          </p>

          {/* Drip indicator */}
          <div
            className="mt-8 mx-auto"
            style={{
              width: `${60 + mouse.speed * 2}px`,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #BFF549, #FFD700, #BFF549, transparent)',
              transform: `translateZ(30px) scaleX(${1 + mouse.speed / 50})`,
              borderRadius: '1px',
              boxShadow: '0 0 10px #BFF549',
            }}
          />

          {/* Mouse instruction */}
          <p
            className="mt-6 font-mono"
            style={{
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.2em',
              transform: `translateZ(20px)`,
            }}
          >
            MOVE YOUR MOUSE — SPIN THE WORLD
          </p>
        </div>
      </div>

      {/* ─── Corner HUD elements (follow rotation) ─── */}
      {[
        { label: 'SYS.ONLINE', value: '2130.4.3', pos: 'top-4 left-4' },
        { label: 'MOUSE.X', value: mouse.x.toFixed(0), pos: 'top-4 right-4' },
        { label: 'MOUSE.Y', value: mouse.y.toFixed(0), pos: 'bottom-4 right-4' },
        { label: 'ROTATION', value: `${rotateTotal.toFixed(1)}°`, pos: 'bottom-4 left-4' },
        { label: 'SPEED', value: mouse.speed.toFixed(0), pos: 'top-1/2 -translate-y-1/2 left-4' },
      ].map((hud, i) => (
        <div
          key={i}
          className={`absolute ${hud.pos} font-mono text-xs pointer-events-none`}
          style={{
            color: 'rgba(191,245,73,0.4)',
            zIndex: 15,
            transform: `translateZ(10px) rotateX(${perspectiveX * 0.3}deg) rotateY(${perspectiveY * 0.3}deg)`,
          }}
        >
          <span className="uppercase tracking-widest">{hud.label}</span>
          <span className="ml-2 text-white/60">{hud.value}</span>
        </div>
      ))}

      {/* ─── Import fonts ─── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
