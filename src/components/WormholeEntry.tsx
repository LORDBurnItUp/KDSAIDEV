'use client';

import { useEffect, useRef } from 'react';

export default function WormholeEntry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let scrollProgress = 0;
    let frame: number;

    // Stars for space phase
    const stars: { x: number; y: number; z: number; size: number }[] = [];
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
      });
    }

    // Fire particles for atmosphere entry
    const fireParticles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];

    // Debris particles (suit breaking)
    const debris: { x: number; y: number; vx: number; vy: number; rotation: number; rotSpeed: number; size: number; opacity: number }[] = [];

    function spawnFire(cx: number, cy: number) {
      for (let i = 0; i < 3; i++) {
        fireParticles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + Math.random() * 20,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 4 + 2,
          life: 1,
          maxLife: Math.random() * 40 + 20,
          size: Math.random() * 4 + 2,
        });
      }
    }

    function spawnDebris(cx: number, cy: number) {
      for (let i = 0; i < 2; i++) {
        debris.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 15,
          size: Math.random() * 6 + 2,
          opacity: 1,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const p = scrollProgress;
      const cx = width / 2;
      const cy = height / 2;

      // ===== PHASE 1: SPACE (0-20%) =====
      if (p < 0.2) {
        const phase = p / 0.2;
        
        // Dark space background with gradient
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, width * 0.7);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(1, '#02040a');
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, width, height);

        // Stars
        for (const star of stars) {
          const size = star.size * (1 - phase * 0.3);
          const opacity = (1 - phase) * 0.8;
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(191, 245, 73, ${opacity})`;
          ctx!.fill();
        }

        // Character (small dot floating in space)
        const charSize = 8 + phase * 4;
        ctx!.beginPath();
        ctx!.arc(cx, cy + Math.sin(Date.now() / 1000) * 10, charSize, 0, Math.PI * 2);
        ctx!.fillStyle = '#fff';
        ctx!.fill();
        // Helmet glow
        ctx!.beginPath();
        ctx!.arc(cx, cy + Math.sin(Date.now() / 1000) * 10, charSize + 4, 0, Math.PI * 2);
        ctx!.strokeStyle = 'rgba(191, 245, 73, 0.5)';
        ctx!.lineWidth = 2;
        ctx!.stroke();

        // Text: "Somewhere in deep space..."
        ctx!.fillStyle = `rgba(191, 245, 73, ${0.7 * (1 - phase)})`;
        ctx!.font = '14px monospace';
        ctx!.textAlign = 'center';
        ctx!.fillText('SOMEWHERE IN DEEP SPACE...', cx, height - 80);
      }

      // ===== PHASE 2: WORMHOLE (20-40%) =====
      else if (p < 0.4) {
        const phase = (p - 0.2) / 0.2;

        // Wormhole tunnel
        const rings = 20;
        for (let i = rings; i >= 0; i--) {
          const ringProgress = (i / rings + phase) % 1;
          const scale = ringProgress;
          const radius = Math.min(width, height) * 0.5 * scale;
          const opacity = (1 - scale) * 0.8;

          ctx!.beginPath();
          ctx!.arc(cx, cy, radius, 0, Math.PI * 2);
          
          const hue = (i * 20 + phase * 360) % 360;
          ctx!.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
          ctx!.lineWidth = 2 + (1 - scale) * 3;
          ctx!.stroke();
        }

        // Central light
        const centralGlow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 100);
        centralGlow.addColorStop(0, `rgba(191, 245, 73, ${0.8 * phase})`);
        centralGlow.addColorStop(0.5, `rgba(96, 165, 250, ${0.3 * phase})`);
        centralGlow.addColorStop(1, 'transparent');
        ctx!.fillStyle = centralGlow;
        ctx!.fillRect(0, 0, width, height);

        // Character pulled into center
        const pullScale = 1 - phase * 0.7;
        ctx!.beginPath();
        ctx!.arc(cx, cy, 8 * pullScale, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${1 - phase * 0.5})`;
        ctx!.fill();

        // Light streaks
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + phase * 3;
          const innerR = 30 * phase;
          const outerR = Math.min(width, height) * 0.5;
          ctx!.beginPath();
          ctx!.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
          ctx!.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
          ctx!.strokeStyle = `rgba(191, 245, 73, ${0.15 * phase})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }

        // Text
        ctx!.fillStyle = `rgba(191, 245, 73, ${phase * 0.8})`;
        ctx!.font = '14px monospace';
        ctx!.textAlign = 'center';
        ctx!.fillText('ENTERING WORMHOLE...', cx, height - 80);
      }

      // ===== PHASE 3: ATMOSPHERE ENTRY (40-60%) =====
      else if (p < 0.6) {
        const phase = (p - 0.4) / 0.2;

        // Orange/red atmosphere gradient
        const atmoGrad = ctx!.createLinearGradient(0, 0, 0, height);
        atmoGrad.addColorStop(0, '#0a0a1a');
        atmoGrad.addColorStop(0.3, '#1a0a0a');
        atmoGrad.addColorStop(0.6, '#2a1005');
        atmoGrad.addColorStop(1, '#0a0505');
        ctx!.fillStyle = atmoGrad;
        ctx!.fillRect(0, 0, width, height);

        // Character falling with fire trail
        const fallY = cy - 100 + phase * 300;
        
        // Fire trail
        if (phase > 0.1) {
          spawnFire(cx, fallY - 20);
        }

        // Update and draw fire particles
        for (let i = fireParticles.length - 1; i >= 0; i--) {
          const fp = fireParticles[i];
          fp.x += fp.vx;
          fp.y += fp.vy;
          fp.life -= 1 / fp.maxLife;

          if (fp.life <= 0) {
            fireParticles.splice(i, 1);
            continue;
          }

          const gradient = ctx!.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.size * fp.life);
          gradient.addColorStop(0, `rgba(255, 200, 50, ${fp.life})`);
          gradient.addColorStop(0.5, `rgba(255, 100, 0, ${fp.life * 0.7})`);
          gradient.addColorStop(1, `rgba(255, 30, 0, 0)`);
          ctx!.fillStyle = gradient;
          ctx!.fillRect(fp.x - fp.size, fp.y - fp.size, fp.size * 2, fp.size * 2);
        }

        // Character (suit breaking apart)
        const suitIntegrity = 1 - phase;
        ctx!.beginPath();
        ctx!.arc(cx, fallY, 10, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${suitIntegrity})`;
        ctx!.fill();

        // Suit pieces breaking off
        if (phase > 0.3) {
          spawnDebris(cx, fallY);
        }

        for (let i = debris.length - 1; i >= 0; i--) {
          const d = debris[i];
          d.x += d.vx;
          d.y += d.vy;
          d.rotation += d.rotSpeed;
          d.opacity -= 0.01;

          if (d.opacity <= 0) {
            debris.splice(i, 1);
            continue;
          }

          ctx!.save();
          ctx!.translate(d.x, d.y);
          ctx!.rotate((d.rotation * Math.PI) / 180);
          ctx!.fillStyle = `rgba(191, 245, 73, ${d.opacity * 0.6})`;
          ctx!.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
          ctx!.restore();
        }

        // Heat glow around character
        const heatGlow = ctx!.createRadialGradient(cx, fallY, 5, cx, fallY, 80);
        heatGlow.addColorStop(0, `rgba(255, 100, 0, ${phase * 0.5})`);
        heatGlow.addColorStop(0.5, `rgba(255, 50, 0, ${phase * 0.2})`);
        heatGlow.addColorStop(1, 'transparent');
        ctx!.fillStyle = heatGlow;
        ctx!.fillRect(0, 0, width, height);

        // Text
        ctx!.fillStyle = `rgba(255, 200, 50, 0.8)`;
        ctx!.font = '14px monospace';
        ctx!.textAlign = 'center';
        ctx!.fillText('ATMOSPHERE ENTRY — SUIT INTEGRITY: ' + Math.floor(suitIntegrity * 100) + '%', cx, height - 80);
      }

      // ===== PHASE 4: FREEFALL (60-80%) =====
      else if (p < 0.8) {
        const phase = (p - 0.6) / 0.2;

        // Sky gradient (dark to lighter blue)
        const skyGrad = ctx!.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#0a1628');
        skyGrad.addColorStop(0.5, '#152238');
        skyGrad.addColorStop(1, '#1a3050');
        ctx!.fillStyle = skyGrad;
        ctx!.fillRect(0, 0, width, height);

        // Clouds passing by
        for (let i = 0; i < 8; i++) {
          const cloudY = (i * height / 4 + phase * height * 2) % (height + 200) - 100;
          const cloudX = cx + Math.sin(i * 1.5) * width * 0.3;
          const cloudW = 200 + Math.random() * 200;
          const cloudH = 40 + Math.random() * 40;

          ctx!.beginPath();
          ctx!.ellipse(cloudX, cloudY, cloudW, cloudH, 0, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.03})`;
          ctx!.fill();
        }

        // Character freefalling
        const fallY = cy - 100 + phase * 400;
        ctx!.beginPath();
        ctx!.arc(cx, fallY, 10, 0, Math.PI * 2);
        ctx!.fillStyle = '#fff';
        ctx!.fill();

        // Wind streaks
        for (let i = 0; i < 6; i++) {
          const streakX = cx + (Math.random() - 0.5) * 80;
          const streakY = fallY + Math.random() * 60;
          ctx!.beginPath();
          ctx!.moveTo(streakX, streakY);
          ctx!.lineTo(streakX, streakY + 40 + Math.random() * 30);
          ctx!.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.1})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }

        // Ground approaching
        const groundY = height - 50 + phase * 50;
        const groundGrad = ctx!.createLinearGradient(0, groundY - 100, 0, height);
        groundGrad.addColorStop(0, 'transparent');
        groundGrad.addColorStop(1, '#0a0a0a');
        ctx!.fillStyle = groundGrad;
        ctx!.fillRect(0, groundY - 100, width, height - groundY + 100);

        // Text
        ctx!.fillStyle = 'rgba(191, 245, 73, 0.8)';
        ctx!.font = '14px monospace';
        ctx!.textAlign = 'center';
        ctx!.fillText('FREEFALL — 200KM TO IMPACT', cx, height - 80);
      }

      // ===== PHASE 5: LANDING (80-100%) =====
      else {
        const phase = (p - 0.8) / 0.2;

        // Impact flash
        if (phase < 0.2) {
          ctx!.fillStyle = `rgba(255, 255, 255, ${(1 - phase / 0.2) * 0.8})`;
          ctx!.fillRect(0, 0, width, height);
        }

        // Dark ground
        ctx!.fillStyle = '#0a0a0a';
        ctx!.fillRect(0, 0, width, height);

        // Impact crater glow
        const craterGlow = ctx!.createRadialGradient(cx, height - 50, 0, cx, height - 50, 200 * phase);
        craterGlow.addColorStop(0, `rgba(191, 245, 73, ${phase * 0.3})`);
        craterGlow.addColorStop(0.5, `rgba(191, 245, 73, ${phase * 0.1})`);
        craterGlow.addColorStop(1, 'transparent');
        ctx!.fillStyle = craterGlow;
        ctx!.fillRect(0, height - 250, width, 250);

        // Landing dust particles
        if (phase < 0.5) {
          for (let i = 0; i < 5; i++) {
            const dustX = cx + (Math.random() - 0.5) * 200 * phase;
            const dustY = height - 50 - Math.random() * 100 * (1 - phase);
            ctx!.beginPath();
            ctx!.arc(dustX, dustY, Math.random() * 3, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(191, 245, 73, ${(1 - phase * 2) * 0.5})`;
            ctx!.fill();
          }
        }

        // Character landed
        const landY = height - 50;
        ctx!.beginPath();
        ctx!.arc(cx, landY - 10, 10, 0, Math.PI * 2);
        ctx!.fillStyle = '#fff';
        ctx!.fill();

        // "2031" text appearing
        if (phase > 0.3) {
          const textPhase = (phase - 0.3) / 0.7;
          const fontSize = 120 * textPhase;
          ctx!.font = `900 ${fontSize}px 'Space Grotesk', sans-serif`;
          ctx!.textAlign = 'center';
          ctx!.fillStyle = `rgba(191, 245, 73, ${textPhase})`;
          ctx!.fillText('2031', cx, cy - 50);
        }

        // KDS Logo appearing
        if (phase > 0.6) {
          const logoPhase = (phase - 0.6) / 0.4;
          ctx!.font = `700 ${32 * logoPhase}px 'Space Grotesk', sans-serif`;
          ctx!.textAlign = 'center';
          ctx!.fillStyle = `rgba(255, 255, 255, ${logoPhase})`;
          ctx!.fillText('KINGS DRIPPING SWAG', cx, cy + 40);
        }

        // "The Future Is Now"
        if (phase > 0.8) {
          const subPhase = (phase - 0.8) / 0.2;
          ctx!.font = '14px monospace';
          ctx!.textAlign = 'center';
          ctx!.fillStyle = `rgba(191, 245, 73, ${subPhase * 0.7})`;
          ctx!.fillText('THE FUTURE IS NOW', cx, cy + 80);
        }
      }

      frame = requestAnimationFrame(draw);
    }

    function onScroll() {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const scrolled = -sectionTop;
      scrollProgress = Math.max(0, Math.min(1, scrolled / (sectionHeight - height)));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative" style={{ height: '600vh' }}>
      <canvas
        ref={canvasRef}
        className="sticky top-0 w-full h-screen"
        style={{ zIndex: 10 }}
      />
    </div>
  );
}
