'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════
// SHARED SCROLL + MOUSE STATE
// ═══════════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);
let currentScroll = 0;
let maxScroll = 1;

// ═══════════════════════════════════════════
// 🎥 CINEMATIC CAMERA — scroll is the timeline
//
// The camera path is pre-choreographed:
//   0%   → Hovering above, logo straight-on
//   20%  → Tilting in, letters spread apart
//   40%  → Side angle — orbiting around the S
//   60%  → Close-up on the chrome texture
//   80%  → Pulling back, seeing the whole formation
//   100% → Far behind, logo recedes into particles
//
// Mouse adds subtle camera sway on top
// ═══════════════════════════════════════════
function CinematicCamera() {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 0, 6));
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    mouseSmooth.lerp(mouseTarget, 0.06);
    const m = mouseSmooth;
    const t = currentScroll / Math.max(maxScroll, 1);

    // ════════════════════════════════════
    // Camera path: a descending spiral
    // ════════════════════════════════════
    const angle = t * Math.PI * 0.8;

    // Position: starts centered, spirals right+up, then pulls far back
    const cx = Math.sin(angle * 1.5) * 3 * t + m.x * 0.4 * (1 - t * 0.5);
    const cy = Math.cos(angle) * 1.2 * (1 - t * 0.6) + m.y * 0.3;
    const cz = 6 - t * 5; // Zoom from 6 to 1 as scroll → end

    pos.current.set(cx, cy, cz);
    camera.position.lerp(pos.current, Math.min(delta * 3, 1));

    // LOOK AT: tracks the logo but shifts with scroll
    const lx = Math.cos(angle) * 0.5 + m.x * 0.3;
    const ly = -t * 0.5 + m.y * 0.2;
    lookAt.current.set(lx, ly, 0);
    camera.lookAt(lookAt.current);

    // FOV: starts tight (40°), widens to 60° for epic scale
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov = 40 + t * 20;
    pc.updateProjectionMatrix();
  });

  return null;
}

// ═══════════════════════════════════════════
// 💎 KDS 3D LETTERS — chrome/gold formation
// ═══════════════════════════════════════════
function KDSLetters({ mat }: { mat: THREE.Material }) {
  const group = useRef<THREE.Group>(null);
  const letters = useRef<Array<THREE.Group | null>>([null, null, null]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = currentScroll / Math.max(maxScroll, 1);

    // Slow atmospheric rotation
    group.current.rotation.y += delta * 0.01;

    // ═══ Scroll-driven letter behavior ═══
    // At 0%: tight formation → at 50%: spread wide → at 100%: back together but rotated
    const spread = 1 + Math.sin(t * Math.PI) * 2;
    letters.current.forEach((lg, i) => {
      if (!lg) return;
      // Each letter also rotates independently
      lg.rotation.y = Math.sin(t * Math.PI + i * 0.5) * 0.15;
      lg.rotation.x = Math.cos(t * Math.PI * 1.3 + i * 0.3) * 0.08;
      // Individual letter scale pulse
      const pulse = 1 + Math.sin(t * Math.PI * 3 + i * 1.2) * 0.05;
      lg.scale.setScalar(pulse);
    });

    // Overall formation scale
    group.current.scale.setScalar(1.2 - t * 0.4);
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* ─── K ─── */}
      <group ref={(e) => { letters.current[0] = e }} position={[-1.5 * (1 + (currentScroll / Math.max(maxScroll, 1))) * 0.3, 0, 0]}>
        <mesh material={mat}><boxGeometry args={[0.12, 0.9, 0.15]} /></mesh>
        <mesh material={mat} rotation={[0, 0, -0.55]} position={[0.22, 0.28, 0]}><boxGeometry args={[0.45, 0.1, 0.1]} /></mesh>
        <mesh material={mat} rotation={[0, 0, 0.55]} position={[0.22, -0.28, 0]}><boxGeometry args={[0.45, 0.1, 0.1]} /></mesh>
      </group>
      {/* ─── D ─── */}
      <group ref={(el) => { letters.current[1] = el }} position={[0, 0, 0]}>
        <mesh material={mat}><boxGeometry args={[0.12, 0.9, 0.15]} /></mesh>
        <mesh material={mat} position={[0.2, 0.4, 0]}><boxGeometry args={[0.52, 0.1, 0.1]} /></mesh>
        <mesh material={mat} position={[0.2, -0.4, 0]}><boxGeometry args={[0.52, 0.1, 0.1]} /></mesh>
        <mesh material={mat} position={[0.52, 0, 0]}><boxGeometry args={[0.1, 0.8, 0.15]} /></mesh>
      </group>
      {/* ─── S ─── */}
      <group ref={(el) => { letters.current[2] = el }} position={[1.5 * (1 + (currentScroll / Math.max(maxScroll, 1))) * 0.3, 0, 0]}>
        <mesh material={mat} position={[-0.18, 0.35, 0]}><boxGeometry args={[0.48, 0.1, 0.1]} /></mesh>
        <mesh material={mat} position={[0.18, -0.35, 0]}><boxGeometry args={[0.48, 0.1, 0.1]} /></mesh>
        <mesh material={mat} position={[-0.36, 0, 0]}><boxGeometry args={[0.1, 0.6, 0.1]} /></mesh>
        <mesh material={mat} position={[0.34, 0, 0]}><boxGeometry args={[0.1, 0.6, 0.1]} /></mesh>
        <mesh material={mat} position={[0, 0, 0]}><boxGeometry args={[0.22, 0.1, 0.1]} /></mesh>
      </group>

      {/* ─── Subtitle glow line ─── */}
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[4, 0.003]} />
        <meshPhysicalMaterial color="#BFF549" emissive="#BFF549" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════
// ✨ ATMOSPHERIC PARTICLES — 3 depth layers
// ═══════════════════════════════════════════
function ParticleField({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#BFF549'),
      new THREE.Color('#FACC15'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#ffffff'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random() - 0.5) * 30;
      pos[i*3+1] = (Math.random() - 0.5) * 25;
      pos[i*3+2] = (Math.random() - 0.5) * 25;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = currentScroll / Math.max(maxScroll, 1);
    // Particles drift based on scroll speed + mouse
    ref.current.rotation.y += delta * (0.02 + t * 0.05) + mouseSmooth.x * delta * 0.05;
    ref.current.rotation.x += mouseSmooth.y * delta * 0.03;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      p[i+1] += Math.sin(t * Math.PI * 3 + i * 0.008) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ═══════════════════════════════════════════
// 💫 FLOATING SHARDS — depth-reactive
// ═══════════════════════════════════════════
function FloatingShards() {
  const shards = useRef<Array<THREE.Mesh | null>>([]);
  const shardData = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      pos: [(Math.random()-0.5)*12, (Math.random()-0.5)*8, (Math.random()-0.5)*8] as [number,number,number],
      speed: 0.3 + Math.random()*0.5,
      scale: 0.015 + Math.random()*0.05,
      geo: i % 3,
    })), []);

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#BFF549', metalness: 0.8, roughness: 0.2,
    emissive: '#BFF549', emissiveIntensity: 0.04,
    transparent: true, opacity: 0.25,
  }), []);

  useFrame((state, delta) => {
    const t = currentScroll / Math.max(maxScroll, 1);
    shards.current.forEach((s, i) => {
      if (!s || !shardData[i]) return;
      s.position.y = shardData[i].pos[1] + Math.sin(state.clock.elapsedTime * shardData[i].speed) * 0.3;
      s.position.x = shardData[i].pos[0] + Math.cos(t * Math.PI + i) * 0.5;
      s.rotation.x += delta * 0.008;
      s.rotation.y += delta * 0.012;
    });
  });

  return (
    <>
      {shardData.map((d, i) => (
        <mesh key={i} ref={(el) => { if (el) shards.current[i] = el; }} position={d.pos} scale={d.scale} material={mat}>
          {d.geo === 0 ? <octahedronGeometry /> : d.geo === 1 ? <tetrahedronGeometry /> : <boxGeometry args={[1, 1, 0.15]} />}
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════
// 🌈 ORBITAL RINGS — scroll-reactive
// ═══════════════════════════════════════════
function OrbitalRings() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = currentScroll / Math.max(maxScroll, 1);
    group.current.rotation.x = Math.sin(t * Math.PI * 0.5 + state.clock.elapsedTime * 0.06) * 0.15 + mouseSmooth.y * 0.12;
    group.current.rotation.z = Math.cos(t * Math.PI * 0.3 + state.clock.elapsedTime * 0.04) * 0.1 + mouseSmooth.x * 0.1;
  });
  return (
    <group ref={group}>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.15, i * 0.4, i * 0.1]}>
          <torusGeometry args={[2.5 + i * 0.5, 0.004, 6, 100]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.06 - i * 0.012} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════
// 💡 SCROLL-REACTIVE LIGHTING
// ═══════════════════════════════════════════
function DynamicLights() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = (currentScroll / Math.max(maxScroll, 1)) * Math.PI * 0.6;
  });
  return (
    <group ref={group}>
      <pointLight position={[5, 5, 5]} intensity={2.5} color="#BFF549" />
      <pointLight position={[-5, -2, 3]} intensity={1} color="#60A5FA" />
      <pointLight position={[0, 3, -5]} intensity={0.9} color="#FACC15" />
      <pointLight position={[0, -5, 2]} intensity={0.4} color="#a78bfa" />
    </group>
  );
}

// ═══════════════════════════════════════════
// 🖼️ MAIN — PARALLAX SCROLL EXPERIENCE
// ═══════════════════════════════════════════
export default function ParallaxHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const update = () => {
      currentScroll = window.scrollY;
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!ready) return <div style={{ position: 'fixed', inset: 0, background: '#050510' }} />;

  return (
    <>
      {/* ─── 3D FIXED CANVAS ─── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#050510' }} onPointerMove={onPointerMove}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <CinematicCamera />
          <DynamicLights />
          <ambientLight intensity={0.06} />
          <fog attach="fog" args={['#050510', 10, 35]} />

          <KDSLetters mat={new THREE.MeshPhysicalMaterial({
            color: '#d4af37', metalness: 1, roughness: 0.05,
            clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.5,
            reflectivity: 1, ior: 2.33,
          })} />
          <OrbitalRings />
          <ParticleField count={2000} />
          <FloatingShards />
        </Canvas>

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(5,5,16,0.7) 100%)' }} />
      </div>

      {/* ─── SCROLL CONTENT ─── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, Math.max(0, (currentScroll / Math.max(maxScroll, 1) - 0.1 * i) * 5)) }}>
            <div style={{ background: 'rgba(10,10,20,0.35)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 36, maxWidth: 480, textAlign: 'center' }}>
              <span style={{ color: 'rgba(191,245,73,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase' }}>0{i + 1}</span>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {['AI Community Hub', 'Digital Marketplace', 'Command Center', 'Built-in Terminal', 'Affiliate Network', '4D Experience', 'Social Media Engine', 'Voice Agent Studio'][i]}
              </h3>
            </div>
          </div>
        ))}
        <div style={{ height: '30vh' }} />
      </div>
    </>
  );
}
