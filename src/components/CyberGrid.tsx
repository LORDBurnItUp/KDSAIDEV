'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CyberGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame: number;
    let time = 0;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      time += 0.005;

      const gridSize = 80;
      const perspective = 400;
      const vanishY = canvas!.height * 0.4;

      // Horizontal lines (moving toward viewer)
      for (let i = 0; i < 20; i++) {
        const z = ((i * 50 + time * 200) % 1000);
        const scale = perspective / (perspective + z);
        const y = vanishY + (canvas!.height - vanishY) * scale;
        const alpha = Math.max(0, 1 - z / 1000) * 0.06;

        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(canvas!.width, y);
        ctx!.strokeStyle = `rgba(191, 245, 73, ${alpha})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // Vertical lines
      const centerX = canvas!.width / 2;
      for (let i = -10; i <= 10; i++) {
        const x = centerX + i * gridSize;
        const alpha = (1 - Math.abs(i) / 12) * 0.04;

        ctx!.beginPath();
        ctx!.moveTo(x, vanishY);
        ctx!.lineTo(x + i * 200, canvas!.height);
        ctx!.strokeStyle = `rgba(191, 245, 73, ${alpha})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      frame = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-60"
    />
  );
}
