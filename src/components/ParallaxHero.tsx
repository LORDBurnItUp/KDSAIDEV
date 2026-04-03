'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shared state
const mouse = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);
let scrollT = 0;

export function getScrollT() { return scrollT; }

// ════════════════════════════════════════
// 🎥 SCROLL CAMERA — descends through the universe
// ════════════════════════════════════════
function ScrollCamera() {
  const camTarget = useRef(new THREE.Vector3(0, 0, 6));
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera, clock }) => {
    mouseSmooth.lerp(mouse, 0.06);
    const t = scrollT;
    const m = mouseSmooth;
    const time = clock.getElapsedTime();

    // ── KEYFRAMED CAMERA PATH ──
    // Each keyframe is [camera x,y,z] and [lookAt x,y,z]
    const keyframes = [
      // 0% — Front-on hero, close
      { cx: 0, cy: 0, cz: 5.5, lx: 0, ly: 0, lz: 0 },
      // 20% — Slight orbit right, descending
      { cx: 2.5, cy: -0.5, cz: 4.5, lx: 0, ly: 0, lz: 0 },
      // 40% — Side angle, moving through
      { cx: 3.5, cy: -1, cz: 2.5, lx: -1, ly: 0, lz: 0 },
      // 60% — Deep dive — camera among particles
      { cx: 1, cy: 0, cz: 0, lx: 0, ly: 0.5, lz: 2 },
      // 80% — Behind & above, looking back
      { cx: -2, cy: 3, cz: 4, lx: 0, ly: -0.5, lz: 0 },
      // 100% — Far behind, wide epic shot
      { cx: 0, cy: 4, cz: 10, lx: 0, ly: 0, lz: 0 },
    ];

    // Smooth Catmull-Rom spline
    const N = keyframes.length - 1;
    const ti = Math.min(t * N, N - 0.001);
    const i = Math.floor(ti);
    const frac = ti - i;
    const f2 = frac * frac;
    const f3 = f2 * frac;

    function cr(p0: number, p1: number, p2: number, p3: number) {
      return 0.5 * ((2*p1) + (-p0+p2)*frac + (2*p0-5*p1+4*p2-p3)*f2 + (-p0+3*p1-3*p2+p3)*f3);
    }

    const i0 = Math.max(0, i-1), i1 = i, i2 = Math.min(i+1, N), i3 = Math.min(i+2, N);
    const kf = keyframes;
    const cx = cr(kf[i0].cx, kf[i1].cx, kf[i2].cx, kf[i3].cx) + m.x * 0.3 * (1 - t*0.5);
    const cy = cr(kf[i0].cy, kf[i1].cy, kf[i2].cy, kf[i3].cy) + m.y * 0.2 * (1 - t*0.5);
    const cz = cr(kf[i0].cz, kf[i1].cz, kf[i2].cz, kf[i3].cz);
    const lx = cr(kf[i0].lx, kf[i1].lx, kf[i2].lx, kf[i3].lx) + m.x * 0.15;
    const ly = cr(kf[i0].ly, kf[i1].ly, kf[i2].ly, kf[i3].ly) - t * 0.3;
    const lz = cr(kf[i0].lz, kf[i1].lz, kf[i2].lz, kf[i3].lz);

    camTarget.current.set(cx, cy, cz);
    lookTarget.current.set(lx, ly, lz);

    camera.position.lerp(camTarget.current, 0.045);
    camera.lookAt(lookTarget.current);

    // FOV: 38° → 58° (subtle expansion)
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov = 38 + t * 20;
    pc.updateProjectionMatrix();
  });

  return null;
}

// ═══ PARTICLE LAYERS (3 depth parallax) ═══
function ParticleLayers() {
  return (
    <>
      {[
        { count: 500, zRange: 10, size: 0.018, color: '#BFF549', opacity: 0.6, parallaxMult: 0.4 },
        { count: 350, zRange: 6, size: 0.028, color: '#60A5FA', opacity: 0.5, parallaxMult: 0.7 },
        { count: 200, zRange: 3, size: 0.038, color: '#FACC15', opacity: 0.4, parallaxMult: 1.0 },
      ].map((layer, li) => (
        <ParticleLayer key={li} {...layer} />
      ))}
    </>
  );
}

function ParticleLayer({ count, zRange, size, color, opacity, parallaxMult }: any) {
  const ref = useRef<THREE.Points>(null);

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      spread[i*3] = (Math.random()-0.5) * 22;
      spread[i*3+1] = (Math.random()-0.5) * 16;
      spread[i*3+2] = (Math.random()-0.5) * zRange;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(spread, 3));
    return g;
  }, [count, zRange]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = scrollT;
    const time = clock.getElapsedTime();

    // Parallax shift based on scroll depth + layer speed
    ref.current.position.x = -parallaxMult * t * 3 + mouseSmooth.x * parallaxMult * 0.3;
    ref.current.position.y = parallaxMult * (t * 2 - 0.8);
    ref.current.position.z = parallaxMult * t * 1.5;

    // Gentle atmospheric drift
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      p[i+1] += Math.sin(time * 0.3 + i * 0.015) * 0.0004;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ═══ CONSTELLATION LINES ═══
function ConstellationLines() {
  const ref = useRef<THREE.LineSegments>(null);
  const MAX_LINES = 600;
  const posBuf = useMemo(() => new Float32Array(MAX_LINES * 6), []);
  const colBuf = useMemo(() => new Float32Array(MAX_LINES * 6), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = scrollT;
    const time = clock.getElapsedTime();
    let lineIdx = 0;

    const connectionDist = 2.8 - t * 1.2;
    const particleCount = 100;

    // Generate orbital points that rotate with scroll
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 6 + time * 0.1 + t * 3;
      const r = 3 + Math.sin(t * Math.PI * 2 + i * 0.15) * 2;
      const y = Math.sin(angle * 0.5 + t * 2) * 2.5 + Math.cos(i * 0.3) * 0.5;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r * 0.3 + (Math.random() - 0.5) * 2
      ));
    }

    const lime = new THREE.Color('#BFF549');
    const blue = new THREE.Color('#60A5FA');

    for (let i = 0; i < particleCount && lineIdx < MAX_LINES; i++) {
      for (let j = i + 1; j < particleCount && lineIdx < MAX_LINES; j++) {
        const d = pts[i].distanceTo(pts[j]);
        if (d < connectionDist && d > 0) {
          const op = (1 - d / connectionDist) * 0.2;
          const idx = lineIdx * 6;

          posBuf[idx] = pts[i].x; posBuf[idx+1] = pts[i].y; posBuf[idx+2] = pts[i].z;
          posBuf[idx+3] = pts[j].x; posBuf[idx+4] = pts[j].y; posBuf[idx+5] = pts[j].z;

          const c = new THREE.Color().lerpColors(lime, blue, (pts[i].y + 3) / 6);
          colBuf[idx] = c.r * op; colBuf[idx+1] = c.g * op; colBuf[idx+2] = c.b * op;
          colBuf[idx+3] = c.r * op; colBuf[idx+4] = c.g * op; colBuf[idx+5] = c.b * op;
          lineIdx++;
        }
      }
    }

    ref.current.geometry.setDrawRange(0, lineIdx * 2);
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={MAX_LINES * 2} itemSize={3} array={posBuf} />
        <bufferAttribute attach="attributes-color" count={MAX_LINES * 2} itemSize={3} array={colBuf} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

// ═══ DYNAMIC LIGHTS ═══
function DynamicLights() {
  return (
    <>
      <pointLight position={[5, 5, 4]} intensity={2.5} color="#BFF549" distance={15} />
      <pointLight position={[-4, -2, 3]} intensity={1} color="#60A5FA" distance={12} />
      <pointLight position={[0, 3, -4]} intensity={0.8} color="#FACC15" distance={10} />
      <pointLight position={[0, -4, 2]} intensity={0.4} color="#a78bfa" distance={8} />
    </>
  );
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════
export default function ParallaxHero() {
  const [ready, setReady] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [contentOpacity, setContentOpacity] = useState(0);

  useEffect(() => {
    setReady(true);

    let raf: number;
    const tick = () => {
      scrollT = Math.min(window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1), 1);
      setScrollOpacity(Math.max(0, 1 - scrollT * 2));
      setContentOpacity(Math.min(1, scrollT * 2.5));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!ready) return <div style={{ position: 'fixed', inset: 0, background: '#050510', zIndex: 1 }} />;

  return (
    <>
      {/* ─── 3D PARALLAX CANVAS ─── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#050510', opacity: scrollOpacity, transition: 'opacity 0.3s ease' }} onPointerMove={onMove}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 38, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        >
          <ScrollCamera />
          <DynamicLights />
          <ambientLight intensity={0.06} />
          <fog attach="fog" args={['#050510', 5, 28]} />

          <ParticleLayers />
          <ConstellationLines />
        </Canvas>

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(5,5,16,0.75) 100%)' }} />
        {/* Scanlines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1.5px, rgba(0,0,0,0.1) 1.5px, rgba(0,0,0,0.1) 3px)', opacity: 0.12 }} />
      </div>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div style={{ position: 'relative', zIndex: 10, opacity: contentOpacity, transition: 'opacity 0.6s ease' }}>
        {/* These spacers drive the scroll journey */}
        <div style={{ height: '120vh' }} />
        {/* Content sections overlay the 3D scene */}
      </div>
    </>
  );
}
