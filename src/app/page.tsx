'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// ═══════════════════════════════════════════
// Shared mouse state
// ═══════════════════════════════════════════
const mouseVec = { x: 0, y: 0 };

// ═══════════════════════════════════════════
// SOLAR SYSTEM CHAPTERS — 12 unique worlds
// ═══════════════════════════════════════════
const chapters = [
  {
    name: 'THE SUN', subtitle: 'Where it all begins',
    planetColor: '#FF6600', bgDark: '#0a0400',
    particleColor: '#FF8833', particleCount: 600, particleSize: 0.06,
    particleMode: 'outward', // Solar flares exploding outward
    glowIntensity: 2.0, content: 'Design meets intelligence in 3D space. Scroll to descend through the universe.',
    cta: '↓ Enter the System',
    stats: null, sectionHeight: '120vh',
  },
  {
    name: 'MERCURY', subtitle: 'Speed and precision',
    planetColor: '#A09080', bgDark: '#08080a',
    particleColor: '#C0B0A0', particleCount: 200, particleSize: 0.02,
    particleMode: 'fastOrbit', // Tight fast orbits
    glowIntensity: 0.6, content: 'Built for speed. Every millisecond counts in the race to build the future.',
    cta: null, stats: null, sectionHeight: '100vh',
  },
  {
    name: 'VENUS', subtitle: 'The clouded beauty',
    planetColor: '#E8C56D', bgDark: '#0a0800',
    particleColor: '#F0D080', particleCount: 350, particleSize: 0.04,
    particleMode: 'cloud', // Slow rotating cloud layers
    glowIntensity: 0.5, content: 'Shrouded in golden clouds, KDS reveals its brilliance beneath the surface.',
    cta: null, stats: null, sectionHeight: '100vh',
  },
  {
    name: 'EARTH', subtitle: 'Home of KDS',
    planetColor: '#4488CC', bgDark: '#050a10',
    particleColor: '#44AA66', particleCount: 400, particleSize: 0.025,
    particleMode: 'life', // Flowing wave pattern
    glowIntensity: 0.8, content: '12.8K+ developers from around the world. The community hub where AI builders connect.',
    cta: 'Enter Community →', link: '/community', stats: [{ n: '12.8K', l: 'Members' }, { n: '847', l: 'Active Today' }, { n: '99.7%', l: 'Uptime' }],
    sectionHeight: '120vh',
  },
  {
    name: 'MARS', subtitle: 'The red frontier',
    planetColor: '#CC4422', bgDark: '#0a0502',
    particleColor: '#DD5533', particleCount: 800, particleSize: 0.03,
    particleMode: 'storm', // Dust storms swirling chaotically
    glowIntensity: 0.7, content: 'The next frontier. KDS is colonizing the future of AI communities.',
    cta: null, stats: null, sectionHeight: '120vh',
  },
  {
    name: 'JUPITER', subtitle: 'King of planets',
    planetColor: '#C8A060', bgDark: '#0a0800',
    particleColor: '#D4B070', particleCount: 1000, particleSize: 0.02,
    particleMode: 'bands', // Horizontal flowing bands
    glowIntensity: 0.5, content: 'The Great Red Spot of AI. The largest, most powerful community hub this side of the asteroid belt.',
    cta: 'Open Dashboard →', link: '/dashboard', stats: [{ n: '6', l: 'Features' }, { n: '17', l: 'Pages' }, { n: '∞', l: 'Possibilities' }],
    sectionHeight: '120vh',
  },
  {
    name: 'SATURN', subtitle: 'The ringed giant',
    planetColor: '#D4B878', bgDark: '#080800',
    particleColor: '#E8D088', particleCount: 600, particleSize: 0.015,
    particleMode: 'ringDisk', // Flat ring plane
    glowIntensity: 0.6, content: 'Rings of opportunity. KDS connects creators, builders, and dreamers in an endless orbit.',
    cta: null, stats: null, sectionHeight: '120vh',
    hasRing: true,
  },
  {
    name: 'URANUS', subtitle: 'The tilted one',
    planetColor: '#88CCDD', bgDark: '#00080a',
    particleColor: '#A0E0E8', particleCount: 300, particleSize: 0.025,
    particleMode: 'tilted', // Sideways orbit
    glowIntensity: 0.5, content: 'Think different. KDS approaches community building from a completely new angle.',
    cta: null, stats: null, sectionHeight: '100vh',
  },
  {
    name: 'NEPTUNE', subtitle: 'The deep blue',
    planetColor: '#3366CC', bgDark: '#00000a',
    particleColor: '#4488EE', particleCount: 500, particleSize: 0.03,
    particleMode: 'jets', // Vertical wind columns
    glowIntensity: 0.7, content: 'The final frontier before the edge. KDS pushes the boundaries of what an AI community can be.',
    cta: null, stats: null, sectionHeight: '100vh',
  },
  {
    name: 'MIRANDA', subtitle: "Uranus' moon",
    planetColor: '#999999', bgDark: '#0a0a0a',
    particleColor: '#BBBBBB', particleCount: 150, particleSize: 0.02,
    particleMode: 'orbitMoon', // Small tight orbit around planet
    glowIntensity: 0.4, content: 'A tiny world with huge personality. Just like every developer in the KDS community.',
    cta: null, stats: null, sectionHeight: '80vh',
  },
  {
    name: 'BEYOND', subtitle: 'The edge of everything',
    planetColor: '#BFF549', bgDark: '#050510',
    particleColor: '#BFF549', particleCount: 700, particleSize: 0.025,
    particleMode: 'constellation', // Network connections (Vexel style)
    glowIntensity: 1.0, content: 'Join the community from 2130. Build, earn, and connect with developers, CEOs, and engineers who think like you.',
    cta: 'ENTER KDS →', link: '/community', stats: null, sectionHeight: '120vh',
  },
  {
    name: 'KDS', subtitle: 'Welcome home',
    planetColor: '#BFF549', bgDark: '#050510',
    particleColor: '#9ACD32', particleCount: 500, particleSize: 0.02,
    particleMode: 'welcome', // Gentle floating
    glowIntensity: 1.2, content: 'Design meets intelligence in 3D space. This is where the future is built.',
    cta: 'Begin Your Journey ↑', stats: null, sectionHeight: '100vh',
  },
];

// ═══════════════════════════════════════════
// 🌟 STAR FIELD (fixed background)
// ═══════════════════════════════════════════
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = -20 - Math.random() * 50;
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3));
  }, []);
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.06} color="#FFFFFF" transparent={true} opacity={0.4} sizeAttenuation={true} depthWrite={false} /></points>;
}

// ═══════════════════════════════════════════
// 🌍 PLANET SPHERE + GLOW
// ═══════════════════════════════════════════
function Planet({ color, glow, hasRing }: { color: string, glow: number, hasRing?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.06);
      glowRef.current.rotation.y -= delta * 0.02;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    }
  });

  return (
    <group>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.08} depthWrite={false} />
      </mesh>
      {/* Light bloom */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.04} depthWrite={false} />
      </mesh>
      {/* Planet sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow * 0.15} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Saturn ring */}
      {hasRing && <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[1.3, 2.4, 64]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent={true} opacity={0.5} metalness={0.6} roughness={0.4} />
      </mesh>}
    </group>
  );
}

// ═══════════════════════════════════════════
// ✨ PLANET-SPECIFIC PARTICLE SYSTEMS
// ═══════════════════════════════════════════
function PlanetParticles({ mode, color, count, size, chapterProgress, hasRing }: { mode: string, color: string, count: number, size: number, chapterProgress: number, hasRing?: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      switch (mode) {
        case 'outward': { // Sun: solar flares
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 1.2 + Math.random() * 3;
          pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          pos[i * 3 + 2] = r * Math.cos(phi);
          break;
        }
        case 'fastOrbit': { // Mercury: tight fast orbits
          const angle = Math.random() * Math.PI * 2;
          const r = 1.3 + Math.random() * 1.5;
          const tilt = (Math.random() - 0.5) * 0.5;
          pos[i * 3] = r * Math.cos(angle);
          pos[i * 3 + 1] = r * Math.sin(angle) + tilt;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          break;
        }
        case 'cloud': { // Venus: cloud layers
          const angle = Math.random() * Math.PI * 2;
          const r = 1.5 + Math.random() * 2;
          const layer = (Math.random() - 0.5) * 1.5;
          pos[i * 3] = r * Math.cos(angle);
          pos[i * 3 + 1] = layer;
          pos[i * 3 + 2] = r * Math.sin(angle);
          break;
        }
        case 'life': { // Earth: flowing waves
          const angle = Math.random() * Math.PI * 2;
          const r = 1.5 + Math.random() * 2.5;
          pos[i * 3] = Math.cos(angle) * r;
          pos[i * 3 + 1] = Math.sin(angle * 2) * (0.3 + r * 0.15);
          pos[i * 3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'storm': { // Mars: dust storms
          const angle = Math.random() * Math.PI * 2;
          const r = 1.2 + Math.random() * 4;
          pos[i * 3] = Math.cos(angle) * r;
          pos[i * 3 + 1] = (Math.random() - 0.5) * r * 0.8;
          pos[i * 3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'bands': { // Jupiter: horizontal bands
          const angle = Math.random() * Math.PI * 2;
          const band = Math.floor(Math.random() * 8);
          const r = 1.3 + band * 0.3 + Math.random() * 0.3;
          pos[i * 3] = Math.cos(angle) * r;
          pos[i * 3 + 1] = (band - 4) * 0.25 + (Math.random() - 0.5) * 0.15;
          pos[i * 3 + 2] = Math.sin(angle) * r * 0.9;
          break;
        }
        case 'ringDisk': { // Saturn: flat ring
          const angle = Math.random() * Math.PI * 2;
          const r = 1.5 + Math.random() * 3;
          pos[i * 3] = Math.cos(angle) * r;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
          pos[i * 3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'tilted': { // Uranus: sideways
          const angle = Math.random() * Math.PI * 2;
          const r = 1.4 + Math.random() * 2;
          pos[i * 3] = Math.cos(angle) * r;
          pos[i * 3 + 1] = Math.sin(angle) * r;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          break;
        }
        case 'jets': { // Neptune: vertical wind columns
          const angle = Math.random() * Math.PI * 2;
          const r = 1.3 + Math.random() * 2.5;
          pos[i * 3] = Math.cos(angle) * r * 0.6;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
          pos[i * 3 + 2] = Math.sin(angle) * r * 0.6;
          break;
        }
        case 'orbitMoon': { // Small moon orbit
          const angle = Math.random() * Math.PI * 2;
          const r = 1.5 + Math.random() * 1;
          pos[i * 3] = Math.cos(angle) * r;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
          pos[i * 3 + 2] = Math.sin(angle) * r;
          break;
        }
        case 'constellation': { // Network nodes
          for (let d = 0; d < 3; d++) {
            pos[i * 3 + d] = (Math.random() - 0.5) * 5;
          }
          break;
        }
        case 'welcome':
        default: {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 1.5 + Math.random() * 3;
          pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          pos[i * 3 + 2] = r * Math.cos(phi);
          break;
        }
      }
      // Add slight color variation
      col[i * 3] = c.r + (Math.random() - 0.5) * 0.15;
      col[i * 3 + 1] = c.g + (Math.random() - 0.5) * 0.15;
      col[i * 3 + 2] = c.b + (Math.random() - 0.5) * 0.15;
    }
    return { positions: pos, colors: col };
  }, [mode, color, count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const cp = chapterProgress;

    switch (mode) {
      case 'outward': // Sun particles pulse outward
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const x = p[i3], y = p[i3 + 1], z = p[i3 + 2];
          const r = Math.sqrt(x * x + y * y + z * z);
          if (r < 0.8) { p[i3] = 1.3 + Math.random() * 0.3; p[i3 + 1] = (Math.random() - 0.5) * 0.3; p[i3 + 2] = (Math.random() - 0.5) * 0.3; }
          p[i3] *= 1.002; p[i3 + 1] *= 1.002; p[i3 + 2] *= 1.002;
        }
        break;
      case 'fastOrbit': // Fast tight orbits
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const x = p[i3], z = p[i3 + 2];
          const angle = Math.atan2(z, x) + delta * (1.5 + Math.random() * 0.5);
          const r = Math.sqrt(x * x + z * z);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
        }
        break;
      case 'cloud': // Slow cloud rotation
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const x = p[i3], z = p[i3 + 2];
          const angle = Math.atan2(z, x) + delta * 0.15;
          const r = Math.sqrt(x * x + z * z);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
          p[i3 + 1] += Math.sin(t * 0.3 + i * 0.1) * 0.001;
        }
        break;
      case 'life': // Earth wave
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          p[i3 + 1] = Math.sin(t * 0.5 + i * 0.05) * (0.3 + Math.abs(p[i3]) * 0.1);
        }
        break;
      case 'storm': // Mars chaotic dust
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const angle = Math.atan2(p[i3 + 2], p[i3]) + delta * (0.2 + Math.sin(i * 0.1 + t) * 0.3);
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
          p[i3 + 1] += Math.sin(t * 2 + i * 0.3) * 0.003;
        }
        break;
      case 'bands': // Jupiter banded flow
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const x = p[i3], z = p[i3 + 2];
          const angle = Math.atan2(z, x) + delta * 0.15 * (Math.sin(p[i3 + 1] * 3) * 0.5 + 1);
          const r = Math.sqrt(x * x + z * z);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
        }
        break;
      case 'ringDisk': // Saturn ring rotation
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const x = p[i3], z = p[i3 + 2];
          const angle = Math.atan2(z, x) + delta * (0.3 / (Math.sqrt(x * x + z * z) + 0.5));
          const r = Math.sqrt(x * x + z * z);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
        }
        break;
      case 'tilted': // Uranus sideways
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const x = p[i3], y = p[i3 + 1];
          const angle = Math.atan2(y, x) + delta * 0.2;
          const r = Math.sqrt(x * x + y * y);
          p[i3] = Math.cos(angle) * r; p[i3 + 1] = Math.sin(angle) * r;
        }
        break;
      case 'jets': // Neptune vertical
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          p[i3 + 1] += Math.sin(t * 0.3 + i) * 0.02;
          p[i3 + 1] = ((p[i3 + 1] + 2.5) % 5) - 2.5; // Wrap
        }
        break;
      case 'orbitMoon': // Moon orbit
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const angle = Math.atan2(p[i3 + 2], p[i3]) + delta * 0.4;
          const r = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]);
          p[i3] = Math.cos(angle) * r; p[i3 + 2] = Math.sin(angle) * r;
        }
        break;
      case 'constellation':
      case 'welcome':
      default: // Gentle float + rotation
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          p[i3 + 1] += Math.sin(t * 0.2 + i * 0.1) * 0.002;
        }
        if (ref.current.rotation.y !== undefined) {
          ref.current.rotation.y += delta * 0.02;
          ref.current.rotation.x = Math.sin(t * 0.15) * 0.05;
        }
        break;
    }

    // Mouse interaction
    ref.current.position.x += (mouseVec.x * 0.4 - ref.current.position.x) * 0.02;
    ref.current.position.y += (-mouseVec.y * 0.3 - ref.current.position.y) * 0.02;

    // Chapter progress zoom effect
    ref.current.scale.setScalar(0.8 + Math.sin(cp * Math.PI) * 0.3);

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)).setAttribute('color', new THREE.BufferAttribute(colors, 3))}>
      <pointsMaterial size={size * 1.5} vertexColors={true} transparent={true} opacity={0.8} sizeAttenuation={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ═══════════════════════════════════════════
// 🎥 CAMERA (per-planet behavior)
// ═══════════════════════════════════════════
function PlanetCamera({ mode, chapterProgress }: { mode: string, chapterProgress: number }) {
  const { camera } = useThree();
  const camState = useRef({ z: 3.5, fov: 50 });

  useFrame(() => {
    const cp = chapterProgress;
    const c = camera as THREE.PerspectiveCamera;

    // Distance: zoom in during chapter, pull back at end
    const targetZ = mode === 'outward' ? 4.5 : 3.2 + Math.sin(cp * Math.PI) * (-0.8);
    const targetFov = mode === 'outward' ? 55 + cp * 20 : 50 + Math.sin(cp * Math.PI) * 10;

    camState.z += (targetZ - camState.z) * 0.04;
    camState.fov += (targetFov - camState.fov) * 0.05;

    c.position.z = camState.z;
    c.position.x += (mouseVec.x * 0.3 - c.position.x) * 0.03;
    c.position.y += (-mouseVec.y * 0.2 - c.position.y) * 0.03;
    c.fov = camState.fov;
    c.lookAt(0, 0, 0);
    c.updateMatrix();
    c.updateProjectionMatrix();
  });

  return null;
}

// ═══════════════════════════════════════════
// 3D SCENE (composed per chapter)
// ═══════════════════════════════════════════
function Scene({ chapter, progress }: { chapter: typeof chapters[0], progress: number }) {
  return (
    <>
      <PlanetCamera mode={chapter.particleMode} chapterProgress={progress} />
      <ambientLight intensity={chapter.glowIntensity * 0.15} />
      <pointLight position={[0, 0, 0]} intensity={chapter.glowIntensity} color={chapter.planetColor} distance={10} />
      <pointLight position={[4, 4, 4]} intensity={0.5 + chapter.glowIntensity * 0.5} color={chapter.planetColor} distance={12} />
      <pointLight position={[-3, -2, 3]} intensity={0.3} color="#60A5FA" distance={8} />
      <StarField />
      {chapter.hasRing ? (
        <group>
          <Planet color={chapter.planetColor} glow={chapter.glowIntensity} hasRing={true} />
          <PlanetParticles mode={chapter.particleMode} color={chapter.particleColor} count={chapter.particleCount} size={chapter.particleSize} chapterProgress={progress} hasRing />
        </group>
      ) : (
        <group>
          <Planet color={chapter.planetColor} glow={chapter.glowIntensity} />
          <PlanetParticles mode={chapter.particleMode} color={chapter.particleColor} count={chapter.particleCount} size={chapter.particleSize} chapterProgress={progress} />
        </group>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function HomePage() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    let raf: number;
    const tick = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const p = Math.min(window.scrollY / max, 1);
      setScrollProgress(p);
      setActiveChapter(Math.min(chapters.length - 1, Math.floor(p * chapters.length)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearInterval(t); cancelAnimationFrame(raf); };
  }, []);

  const scrollTo = (i: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (i / (chapters.length - 1)) * max, behavior: 'smooth' });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const chapterProgress = (scrollProgress * chapters.length) - activeChapter;
  const chapter = chapters[activeChapter];

  return (
    <>
      {/* ─── 3D CANVAS (fixed, transitions per chapter) ─── */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 1, background: chapter.bgDark, transition: 'background 0.8s ease' }}
        onPointerMove={handlePointerMove}
      >
        <Canvas
          key={activeChapter}
          camera={{ position: [0, 0, 3.5], fov: 50, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        >
          <Scene chapter={chapter} progress={chapterProgress} />
        </Canvas>
        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
      </div>

      {/* ─── TOP BAR ─── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,5,10,0.2)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)', height: 40,
        display: 'flex', alignItems: 'center', padding: '0 14px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: `${chapter.planetColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: chapter.planetColor, fontWeight: 900, fontSize: 9, transition: 'all 0.5s' }}>K</div>
          <span style={{ fontWeight: 800, fontSize: 12 }}><span style={{ color: chapter.planetColor, transition: 'color 0.5s' }}>{chapter.name}</span><span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, fontSize: 9, marginLeft: 4 }}>KDS</span></span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Community', 'Dashboard'].map(n => (
            <a key={n} href={n === 'Community' ? '/community' : '/dashboard'} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{n}</a>
          ))}
        </div>
      </header>

      {/* ─── NAV DOTS (right) ─── */}
      <nav style={{ position: 'fixed', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {chapters.map((p, i) => (
          <button key={i} onClick={() => scrollTo(i)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
            <span style={{ position: 'relative', width: activeChapter === i ? 7 : 5, height: activeChapter === i ? 7 : 5, borderRadius: '50%',
              background: activeChapter === i ? p.planetColor : 'rgba(255,255,255,0.08)', transition: 'all 0.3s',
              boxShadow: activeChapter === i ? `0 0 8px ${p.planetColor}40` : 'none' }}>
              {activeChapter === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${p.planetColor}25`, animation: 'mc-p 2s ease-in-out infinite' }} />}
            </span>
          </button>
        ))}
      </nav>

      {/* ─── SCROLL SECTIONS ─── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {chapters.map((ch, i) => {
          const show = activeChapter === i;
          const visibility = activeChapter === i ? Math.min(1, Math.max(0, chapterProgress < 0.15 ? chapterProgress / 0.15 : chapterProgress > 0.85 ? (1 - chapterProgress) / 0.15 : 1)) : 0;

          return (
            <section key={`${ch.name}-${i}`} style={{ height: ch.sectionHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                textAlign: 'center', padding: 40, maxWidth: 550,
                opacity: visibility, transform: `translateY(${(1 - visibility) * 30}px)`,
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: visibility > 0 ? 'auto' : 'none',
              }}>
                <span style={{ color: `${ch.planetColor}30`, fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>{ch.subtitle}</span>
                <h2 style={{ color: i === 0 || i === 10 ? 'transparent' : 'rgba(255,255,255,0.9)', fontSize: i === 0 ? 'clamp(3rem, 9vw, 7rem)' : 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: 900, marginTop: i === 0 ? 4 : 4, marginBottom: i === 0 ? 8 : 8, lineHeight: 0.85,
                  ...(i === 0 || i === 10 ? {
                    background: `linear-gradient(180deg, ${ch.planetColor} 0%, ${ch.particleColor} 100%)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: `drop-shadow(0 0 40px ${ch.planetColor}50)`,
                  } : {}) }}>
                  {ch.name}
                </h2>
                {i !== 0 && <div style={{ width: 50, height: 1, background: `linear-gradient(90deg, transparent, ${ch.planetColor}60, transparent)`, margin: '0 auto 12px' }} />}
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 18px' }}>{ch.content}</p>

                {/* Stats */}
                {ch.stats && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginBottom: 16 }}>
                    {ch.stats.map((s: any, si: number) => (
                      <div key={si} style={{ textAlign: 'center' }}>
                        <div style={{ color: ch.planetColor, fontSize: 20, fontWeight: 800 }}>{s.n}</div>
                        <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {ch.cta && ch.link ? (
                  <a href={ch.link} style={{ display: 'inline-block', padding: '10px 24px', background: `${ch.planetColor}08`, border: `1px solid ${ch.planetColor}20`, color: ch.planetColor, borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none', transition: 'all 0.2s' }}>{ch.cta}</a>
                ) : ch.cta ? (
                  <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, animation: 'mc-b 2s ease-in-out infinite' }}>{ch.cta}</div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <AmbientSound />
      <style>{`@keyframes mc-b{0%,100%{transform:translateY(0);opacity:.2}50%{transform:translateY(8px);opacity:.5}}@keyframes mc-p{0%,100%{opacity:.3}50%{opacity:.8}}`}</style>
    </>
  );
}
