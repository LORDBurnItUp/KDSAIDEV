'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// Shared mouse state
const mouseVec = { x: 0, y: 0 };

// ════════════════════════════════════════
// SOLAR SYSTEM CHAPTERS — 10 unique worlds
// ════════════════════════════════════════
const chapters = [
  { name: 'THE SUN', subtitle: 'Where it all begins', planetColor: '#FF6600', bgDark: '#0a0400', particleColor: '#FF8833', particleCount: 500, particleSize: 0.05, particleMode: 'outward', glowIntensity: 2.0, content: 'Design meets intelligence in 3D space. Enter the system to begin your journey.', stats: null },
  { name: 'MERCURY', subtitle: 'Speed and precision', planetColor: '#A09080', bgDark: '#08080a', particleColor: '#C0B0A0', particleCount: 180, particleSize: 0.02, particleMode: 'fastOrbit', glowIntensity: 0.5, content: 'Built for speed. Every millisecond counts in the race to build the future.', stats: null },
  { name: 'VENUS', subtitle: 'The clouded beauty', planetColor: '#E8C56D', bgDark: '#0a0800', particleColor: '#F0D080', particleCount: 300, particleSize: 0.03, particleMode: 'cloud', glowIntensity: 0.5, content: 'Shrouded in golden clouds. Beneath the surface, brilliance awaits.', stats: null },
  { name: 'EARTH', subtitle: 'Home of KDS', planetColor: '#4488CC', bgDark: '#050a10', particleColor: '#44AA66', particleCount: 350, particleSize: 0.025, particleMode: 'life', glowIntensity: 0.7, content: '12.8K+ developers from around the world. The hub where AI builders connect.', stats: [{ n: '12.8K', l: 'Members' }, { n: '847', l: 'Active Today' }, { n: '99.7%', l: 'Uptime' }] },
  { name: 'MARS', subtitle: 'The red frontier', planetColor: '#CC4422', bgDark: '#0a0502', particleColor: '#DD5533', particleCount: 600, particleSize: 0.03, particleMode: 'storm', glowIntensity: 0.7, content: 'The next frontier. KDS is colonizing the future of AI communities.', stats: null },
  { name: 'JUPITER', subtitle: 'King of planets', planetColor: '#C8A060', bgDark: '#0a0800', particleColor: '#D4B070', particleCount: 700, particleSize: 0.02, particleMode: 'bands', glowIntensity: 0.5, content: 'The Great Red Spot of AI. The largest community hub this side of the asteroid belt.', stats: [{ n: '6', l: 'Features' }, { n: '99', l: 'Pages' }, { n: '∞', l: 'Scale' }] },
  { name: 'SATURN', subtitle: 'The ringed giant', planetColor: '#D4B878', bgDark: '#080800', particleColor: '#E8D088', particleCount: 500, particleSize: 0.015, particleMode: 'ringDisk', glowIntensity: 0.5, hasRing: true, content: 'Rings of opportunity. KDS connects creators in an endless orbit.', stats: null },
  { name: 'URANUS', subtitle: 'The tilted one', planetColor: '#88CCDD', bgDark: '#00080a', particleColor: '#A0E0E8', particleCount: 250, particleSize: 0.02, particleMode: 'tilted', glowIntensity: 0.4, content: 'Think different. KDS approaches community building from a completely new angle.', stats: null },
  { name: 'NEPTUNE', subtitle: 'The deep blue', planetColor: '#3366CC', bgDark: '#00000a', particleColor: '#4488EE', particleCount: 400, particleSize: 0.03, particleMode: 'jets', glowIntensity: 0.6, content: 'The final frontier before the edge. KDS pushes the boundaries of what an AI community can be.', stats: null },
  { name: 'BEYOND', subtitle: 'Welcome home', planetColor: '#BFF549', bgDark: '#050510', particleColor: '#BFF549', particleCount: 600, particleSize: 0.025, particleMode: 'constellation', glowIntensity: 1.0, content: 'Build, earn, and connect with developers, CEOs, and engineers who think like you. Welcome to 2130.', stats: null, link: '/community' },
];

// ════════════════════════════════════════
// 🌟 STAR FIELD (fixed background, slightly parallax)
// ════════════════════════════════════════
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 150;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 150;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3));
  }, []);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.005;
  });
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.06} color="#FFFFFF" transparent opacity={0.35} sizeAttenuation depthWrite={false} /></points>;
}

// ════════════════════════════════════════
// 🌍 PLANET — becomes transparent when camera is close
// ════════════════════════════════════════
function Planet({ color, glow, hasRing, cameraZ }: { color: string, glow: number, hasRing?: boolean, cameraZ: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  // Opacity drops as camera approaches z=0 (passing through)
  const planetOpacity = Math.min(1, Math.abs(cameraZ) / 1.5);
  const planetScale = Math.max(0.5, 1 - (1 - planetOpacity) * 0.5);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
      meshRef.current.scale.setScalar(planetScale);
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.02;
      glowRef.current.scale.setScalar(1.3 + Math.sin(state.clock.elapsedTime * 0.6 + (1 - planetOpacity) * 4) * 0.08);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 * planetOpacity;
    }
  });

  return (
    <group>
      {/* Glow halo (fades as you pass through) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08 * planetOpacity} depthWrite={false} />
      </mesh>
      {/* Main planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow * 0.15} metalness={0.3} roughness={0.7} transparent={true} opacity={planetOpacity} />
      </mesh>
      {/* Saturn ring */}
      {hasRing && <mesh rotation={[Math.PI / 2.4, 0, 0]}><ringGeometry args={[1.3, 2.5, 64]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.4 * planetOpacity} metalness={0.6} roughness={0.4} /></mesh>}
    </group>
  );
}

// ════════════════════════════════════════
// ✨ PLANET PARTICLES + SCATTER ON FLYTHROUGH
// ════════════════════════════════════════
function PlanetParticles({ mode, color, count, size, cameraZ }: { mode: string, color: string, count: number, size: number, cameraZ: number }) {
  const ref = useRef<THREE.Points>(null);
  const scatterAmount = useMemo(() => {
    // Scattering: as camera approaches z=0, particles push outward
    return count;
  }, [count]);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      switch (mode) {
        case 'outward': {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 1.5 + Math.random() * 3;
          pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          pos[i * 3 + 2] = r * Math.cos(phi);
          vel[i * 3] = pos[i * 3] * 0.002; vel[i * 3 + 1] = pos[i * 3 + 1] * 0.002; vel[i * 3 + 2] = pos[i * 3 + 2] * 0.002;
          break;
        }
        case 'fastOrbit': {
          const angle = Math.random() * Math.PI * 2;
          const r = 1.3 + Math.random() * 1.5;
          pos[i * 3] = Math.cos(angle) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4; pos[i * 3 + 2] = Math.sin(angle) * r;
          vel[i * 3] = -Math.sin(angle) * 0.008; vel[i * 3 + 2] = Math.cos(angle) * 0.008;
          break;
        }
        case 'cloud': {
          const angle = Math.random() * Math.PI * 2;
          const r = 1.5 + Math.random() * 2;
          pos[i * 3] = Math.cos(angle) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5; pos[i * 3 + 2] = Math.sin(angle) * r;
          vel[i * 3] = 0; vel[i * 3 + 2] = 0;
          break;
        }
        case 'life': {
          const angle = Math.random() * Math.PI * 2;
          const r = 1.5 + Math.random() * 2.5;
          pos[i * 3] = Math.cos(angle) * r; pos[i * 3 + 1] = Math.sin(angle * 2) * 0.3; pos[i * 3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'storm': {
          const angle = Math.random() * Math.PI * 2;
          const r = 1.2 + Math.random() * 4;
          pos[i * 3] = Math.cos(angle) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * r * 0.8; pos[i * 3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'bands': {
          const angle = Math.random() * Math.PI * 2;
          const band = Math.floor(Math.random() * 8);
          const r = 1.3 + band * 0.3;
          pos[i * 3] = Math.cos(angle) * r; pos[i * 3 + 1] = (band - 4) * 0.25; pos[i * 3 + 2] = Math.sin(angle) * r * 0.9;
          break;
        }
        case 'ringDisk': {
          const angle = Math.random() * Math.PI * 2;
          const r = 1.5 + Math.random() * 3;
          pos[i * 3] = Math.cos(angle) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 0.08; pos[i * 3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'tilted': {
          const angle = Math.random() * Math.PI * 2;
          const r = 1.4 + Math.random() * 2;
          pos[i * 3] = Math.cos(angle) * r; pos[i * 3 + 1] = Math.sin(angle) * r; pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          break;
        }
        case 'jets': {
          const angle = Math.random() * Math.PI * 2;
          const r = 1.3 + Math.random() * 2;
          pos[i * 3] = Math.cos(angle) * r * 0.6; pos[i * 3 + 1] = (Math.random() - 0.5) * 5; pos[i * 3 + 2] = Math.sin(angle) * r * 0.6;
          break;
        }
        case 'constellation': {
          pos[i * 3] = (Math.random() - 0.5) * 5; pos[i * 3 + 1] = (Math.random() - 0.5) * 5; pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
          break;
        }
        default: {
          const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1); const r = 1.5 + Math.random() * 3;
          pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); pos[i * 3 + 2] = r * Math.cos(phi);
        }
      }
    }
    return { positions: pos, velocities: vel };
  }, [mode, count]);

  const colors = useMemo(() => {
    const c = new THREE.Color(color);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) col[i] = Math.max(0, Math.min(1, c.r + (Math.random() - 0.5) * 0.15));
    return col;
  }, [color, count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    const v = velocities;
    const t = state.clock.elapsedTime;
    const cz = cameraZ; // Camera Z relative to planet center

    // SCATTER: when camera is near z=0, particles explode outward
    const scatterIntensity = Math.max(0, 1 - Math.abs(cz) / 0.6);
    const scatterForce = scatterIntensity * 8;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Apply scatter push
      if (scatterForce > 0.1) {
        const dx = p[i3], dy = p[i3 + 1], dz = p[i3 + 2];
        const dist = Math.max(0.1, Math.sqrt(dx * dx + dy * dy + dz * dz));
        v[i3] += (dx / dist) * scatterForce * delta;
        v[i3 + 1] += (dy / dist) * scatterForce * delta;
        v[i3 + 2] += (dz / dist) * scatterForce * delta;
      }

      // Base behavior per mode
      switch (mode) {
        case 'outward':
          p[i3] += v[i3]; p[i3 + 1] += v[i3 + 1]; p[i3 + 2] += v[i3 + 2];
          if (Math.sqrt(p[i3] * p[i3] + p[i3 + 1] * p[i3 + 1] + p[i3 + 2] * p[i3 + 2]) > 4.5) {
            const angle = Math.random() * Math.PI * 2, phi2 = Math.acos(2 * Math.random() - 1), r = 1.5;
            p[i3] = r * Math.sin(phi2) * Math.cos(angle); p[i3 + 1] = r * Math.sin(phi2) * Math.sin(angle); p[i3 + 2] = r * Math.cos(phi2);
            v[i3] = p[i3] * 0.002; v[i3 + 1] = p[i3 + 1] * 0.002; v[i3 + 2] = p[i3 + 2] * 0.002;
          }
          break;
        case 'fastOrbit': {
          const angle = Math.atan2(p[i3 + 2], p[i3]) + delta * 1.5;
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'cloud': {
          const angle = Math.atan2(p[i3 + 2], p[i3]) + delta * 0.12;
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
          p[i3 + 1] += Math.sin(t * 0.3 + i * 0.1) * 0.001;
          break;
        }
        case 'life':
          p[i3 + 1] = Math.sin(t * 0.5 + i * 0.05) * (0.3 + Math.abs(p[i3]) * 0.1);
          break;
        case 'storm': {
          const angle = Math.atan2(p[i3 + 2], p[i3]) + delta * (0.2 + Math.sin(i * 0.1 + t) * 0.3);
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
          p[i3 + 1] += Math.sin(t * 2 + i * 0.3) * 0.002;
          break;
        }
        case 'bands': {
          const angle = Math.atan2(p[i3 + 2], p[i3]) + delta * 0.15 * (Math.sin(p[i3 + 1] * 3) * 0.5 + 1);
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'ringDisk': {
          const angle = Math.atan2(p[i3 + 2], p[i3]) + delta * (0.3 / (Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]) + 0.5));
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'tilted': {
          const angle = Math.atan2(p[i3 + 1], p[i3]) + delta * 0.2;
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 1] * p[i3 + 1]);
          p[i3] = Math.cos(angle) * r; p[i3 + 1] = Math.sin(angle) * r;
          break;
        }
        case 'jets':
          p[i3 + 1] += Math.sin(t * 0.3 + i) * 0.02;
          p[i3 + 1] = ((p[i3 + 1] + 2.5) % 5) - 2.5;
          break;
        case 'constellation':
          p[i3] += Math.sin(t * 0.15 + i * 0.08) * 0.003;
          p[i3 + 1] += Math.cos(t * 0.12 + i * 0.06) * 0.003;
          break;
        default:
          p[i3] += Math.sin(t * 0.1 + i * 0.1) * 0.002;
      }

      // Damping after scatter
      if (scatterIntensity > 0.1) {
        v[i3] *= 0.96; v[i3 + 1] *= 0.96; v[i3 + 2] *= 0.96;
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)).setAttribute('color', new THREE.BufferAttribute(colors, 3))}>
      <pointsMaterial size={size * 1.5} vertexColors transparent opacity={0.85} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ════════════════════════════════════════
// 🎥 FLYTHROUGH CAMERA
// Camera z goes from +5 → -5 each chapter
// At z=0: camera is inside the planet → planet transparent, particles scatter
// ════════════════════════════════════════
function FlythroughCamera({ chapterProgress }: { chapterProgress: number }) {
  const { camera } = useThree();
  const state = useRef({ z: 5, fov: 50 });

  useFrame(() => {
    const c = camera as THREE.PerspectiveCamera;
    // chapterProgress: 0→1 maps z from +5 (far) → -5 (emerging on other side)
    const targetZ = 5 - chapterProgress * 10;
    state.z += (targetZ - state.z) * 0.06;

    // FOV: wider when passing through (more dramatic)
    const proximity = 1 - Math.abs(chapterProgress - 0.5) * 2; // 1 at center, 0 at edges
    const targetFov = 40 + proximity * 25;
    state.fov += (targetFov - state.fov) * 0.05;

    c.position.z = state.z;
    c.position.x += (mouseVec.x * 0.2 * proximity - c.position.x) * 0.03;
    c.position.y += (-mouseVec.y * 0.15 * proximity - c.position.y) * 0.03;
    c.fov = state.fov;
    c.lookAt(0, 0, -5);
    c.updateMatrix();
    c.updateProjectionMatrix();
  });

  return null;
}

// ════════════════════════════════════════
// SCENE COMPOSITION
// ════════════════════════════════════════
function Scene({ chapter, cameraZ, chapterProgress }: { chapter: typeof chapters[0], cameraZ: number, chapterProgress: number }) {
  return (
    <>
      <FlythroughCamera chapterProgress={chapterProgress} />
      <ambientLight intensity={chapter.glowIntensity * 0.1} />
      <pointLight position={[0, 0, 0]} intensity={chapter.glowIntensity * (0.5 + Math.abs(cameraZ) * 0.15)}
        color={chapter.planetColor} distance={10} />
      <pointLight position={[camState.z > 0 ? 4 : -4, 4, 4]} intensity={0.4} color={chapter.particleColor} distance={12} />
      <StarField />
      <Planet color={chapter.planetColor} glow={chapter.glowIntensity} hasRing={chapter.hasRing} cameraZ={cameraZ} />
      <PlanetParticles mode={chapter.particleMode} color={chapter.particleColor}
        count={chapter.particleCount} size={chapter.particleSize} cameraZ={cameraZ} />
    </>
  );
}

const camState = { z: 5 }; // shared for lighting

// ════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════
export default function HomePage() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [cameraZ, setCameraZ] = useState(5);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    let raf: number;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const totalProgress = Math.min(window.scrollY / max, 0.999);
      const ch = Math.min(chapters.length - 1, Math.floor(totalProgress * chapters.length));
      const progress = (totalProgress * chapters.length) - ch;
      setActiveChapter(ch);
      setChapterProgress(progress);
      // Map chapter progress 0→1 to camera z: +5 → -5
      setCameraZ(5 - progress * 10);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => { clearInterval(tick); cancelAnimationFrame(raf); };
  }, []);

  const scrollTo = (i: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (i / (chapters.length - 1)) * max, behavior: 'smooth' });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const chapter = chapters[activeChapter];
  // Content visibility: peak in middle of flythrough
  const contentOpacity = Math.min(1, chapterProgress < 0.15 ? chapterProgress / 0.15 : chapterProgress > 0.85 ? (1 - chapterProgress) / 0.15 : 1);

  return (
    <>
      {/* ─── 3D CANVAS ─── */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 1, background: chapter.bgDark, transition: 'background 0.5s ease' }}
        onPointerMove={handlePointerMove}
      >
        <Canvas
          key={activeChapter}
          camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        >
          <Scene chapter={chapter} cameraZ={cameraZ} chapterProgress={chapterProgress} />
        </Canvas>
        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 50% 50%, transparent ${40 + (1 - contentOpacity) * 20}%, rgba(0,0,0,${0.3 + (1 - contentOpacity) * 0.3}) 100%)` }} />
      </div>

      {/* ─── TOP BAR ─── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,5,10,0.15)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.02)', height: 38,
        display: 'flex', alignItems: 'center', padding: '0 12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: `${chapter.planetColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: chapter.planetColor, fontWeight: 900, fontSize: 8, transition: 'all 0.4s' }}>K</div>
          <span style={{ fontWeight: 800, fontSize: 11 }}><span style={{ color: chapter.planetColor, transition: 'color 0.4s' }}>{chapter.name}</span><span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, fontSize: 8, marginLeft: 4 }}>KDS</span></span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Community', 'Dashboard'].map(n => (
            <a key={n} href={n === 'Community' ? '/community' : '/dashboard'} style={{ padding: '2px 6px', borderRadius: 3, fontSize: 8, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{n}</a>
          ))}
        </div>
      </header>

      {/* ─── NAV DOTS ─── */}
      <nav style={{ position: 'fixed', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {chapters.map((p, i) => (
          <button key={i} onClick={() => scrollTo(i)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
            <span style={{ position: 'relative', width: activeChapter === i ? 6 : 4, height: activeChapter === i ? 6 : 4, borderRadius: '50%',
              background: activeChapter === i ? p.planetColor : 'rgba(255,255,255,0.06)', transition: 'all 0.3s',
              boxShadow: activeChapter === i ? `0 0 6px ${p.planetColor}30` : 'none' }}>
              {activeChapter === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${p.planetColor}15` }} />}
            </span>
          </button>
        ))}
      </nav>

      {/* ─── FLOATING CONTENT OVERLAY ─── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 500,
          opacity: contentOpacity, transform: `translateY(${(1 - contentOpacity) * 20}px)`,
          transition: 'opacity 0.3s ease, transform 0.3s ease', pointerEvents: contentOpacity > 0.3 ? 'auto' : 'none' }}>
          {contentOpacity > 0.5 && (
            <>
              <span style={{ color: `${chapter.planetColor}25`, fontSize: 8, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>{chapter.subtitle}</span>
              <h2 style={{ color: activeChapter === 0 || activeChapter === 9 ? 'transparent' : 'rgba(255,255,255,0.85)',
                fontSize: activeChapter === 0 ? 'clamp(2.5rem, 8vw, 5rem)' : 'clamp(1.5rem, 4vw, 2.8rem)',
                fontWeight: 900, marginTop: activeChapter === 0 ? 4 : 4, marginBottom: activeChapter === 0 ? 10 : 6, lineHeight: 0.85,
                ...(activeChapter === 0 || activeChapter === 9 ? {
                  background: `linear-gradient(180deg, ${chapter.planetColor} 0%, ${chapter.particleColor} 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 30px ${chapter.planetColor}40)`,
                } : {}) }}>
                {chapter.name}
              </h2>
              {activeChapter !== 0 && <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${chapter.planetColor}50, transparent)`, margin: '0 auto 10px' }} />}
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 14px' }}>{chapter.content}</p>
              {chapter.stats && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 14 }}>
                  {chapter.stats.map((s: any, si: number) => (
                    <div key={si} style={{ textAlign: 'center' }}>
                      <div style={{ color: chapter.planetColor, fontSize: 18, fontWeight: 800 }}>{s.n}</div>
                      <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 6, letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
              {chapter.link && (
                <a href={chapter.link} style={{ display: 'inline-block', padding: '8px 22px', background: `${chapter.planetColor}08`, border: `1px solid ${chapter.planetColor}18`, color: chapter.planetColor, borderRadius: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none' }}>
                  {activeChapter === 9 ? 'JOIN KDS →' : 'Explore →'}
                </a>
              )}
              {/* Scroll indicator */}
              {activeChapter < 9 && (
                <div style={{ marginTop: 12, animation: 'mc-b 2s ease-in-out infinite', color: 'rgba(255,255,255,0.08)', fontSize: 10 }}>
                  ↓ Keep scrolling to fly through
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AmbientSound />
      <style>{`@keyframes mc-b{0%,100%{transform:translateY(0);opacity:.08}50%{transform:translateY(6px);opacity:.15}}`}</style>
    </>
  );
}
