'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// ════════════════════════════════════════
// 🌌 SOLAR SYSTEM SCROLL JOURNEY
//
// Each chapter = a different planet with its own 3D world.
// ════════════════════════════════════════

// ─── Dynamic Canvas import ───
const { Canvas, useFrame } = dynamic(
  () => import('@react-three/fiber').then(m => ({ default: m.Canvas, useFrame: m.useFrame })),
  { ssr: false }
) as any;
import * as THREE from 'three';

// ════════════════════════════════════════
// SOLAR SYSTEM DATA — each planet gets unique 3D config
// ════════════════════════════════════════
const planets = [
  {
    name: 'THE SUN',
    subtitle: 'Where it all begins',
    color: '#FFD700',
    glowColor: '#FF4500',
    particleColor: '#FF6600',
    particleCount: 400,
    particleSpread: 12,
    bgDark: '#1a0800',
    content: 'Design meets intelligence in 3D space. Scroll to begin your journey through the KDS solar system.',
    cta: '↓ Begin Journey',
    stats: null,
  },
  {
    name: 'MERCURY',
    subtitle: 'Speed and precision',
    color: '#8B7355',
    glowColor: '#A08060',
    particleColor: '#B09070',
    particleCount: 200,
    particleSpread: 6,
    bgDark: '#0d0d14',
    content: 'KDS was built for speed. Every millisecond counts in the race to build the future.',
    cta: '→ Mars Awaits',
    stats: [{ n: '88d', l: 'Orbit' }, { n: '0.38', l: 'Earth Size' }, { n: '440°C', l: 'Day Temp' }],
  },
  {
    name: 'VENUS',
    subtitle: 'Beautiful and dangerous',
    color: '#E8C56D',
    glowColor: '#D4A020',
    particleColor: '#F0D080',
    particleCount: 300,
    particleSpread: 8,
    bgDark: '#14100a',
    content: 'Like Venus shrouded in clouds, KDS reveals hidden gems beneath the surface. A community waiting to be discovered.',
    cta: '→ Earth',
    stats: [{ n: '225d', l: 'Orbit' }, { n: '0.95', l: 'Earth Size' }, { n: '462°C', l: 'Surface' }],
  },
  {
    name: 'EARTH',
    subtitle: 'Home of KDS',
    color: '#60A5FA',
    glowColor: '#2ECC8F',
    particleColor: '#34D399',
    particleCount: 350,
    particleSpread: 9,
    bgDark: '#050d14',
    content: '12.8K+ developers from around the world. The community hub where AI builders connect and create.',
    cta: 'Enter Community →',
    stats: [{ n: '12.8K', l: 'Members' }, { n: '847', l: 'Active Today' }, { n: '99.7%', l: 'Uptime' }],
    link: '/community',
  },
  {
    name: 'MARS',
    subtitle: 'The red frontier',
    color: '#D95555',
    glowColor: '#FF4444',
    particleColor: '#FF6347',
    particleCount: 500,
    particleSpread: 10,
    bgDark: '#1a0808',
    content: 'The next frontier. KDS is colonizing the future of AI communities, one builder at a time.',
    cta: '→ Jupiter',
    stats: [{ n: '687d', l: 'Orbit' }, { n: '0.53', l: 'Earth Size' }, { n: '2 moons', l: 'Phobos, Deimos' }],
  },
  {
    name: 'JUPITER',
    subtitle: 'King of planets',
    color: '#D4A060',
    glowColor: '#B8860B',
    particleColor: '#D4AF37',
    particleCount: 600,
    particleSpread: 14,
    bgDark: '#14100a',
    content: 'The Great Red Spot of AI. KDS is the largest, most powerful community hub this side of the asteroid belt.',
    cta: 'Dashboard →',
    stats: [{ n: '12yr', l: 'Orbit' }, { n: '11.2x', l: 'Earth Size' }, { n: '95', l: 'Moons' }],
    link: '/dashboard',
  },
  {
    name: 'SATURN',
    subtitle: 'The ringed giant',
    color: '#F0D080',
    glowColor: '#E8C56D',
    particleColor: '#FFD700',
    particleCount: 400,
    particleSpread: 11,
    bgDark: '#14120a',
    content: 'Rings of opportunity. KDS connects creators, builders, and dreamers in an endless orbit of innovation.',
    cta: '→ Uranus',
    stats: [{ n: '29yr', l: 'Orbit' }, { n: '9.4x', l: 'Earth Size' }, { n: '146', l: 'Moons' }],
  },
  {
    name: 'URANUS',
    subtitle: 'The tilted one',
    color: '#60B5D0',
    glowColor: '#87CEEB',
    particleColor: '#87CEEB',
    particleCount: 250,
    particleSpread: 7,
    bgDark: '#0a1014',
    content: 'Think different. Like Uranus tilted on its side, KDS approaches community building from a completely new angle.',
    cta: '→ Neptune',
    stats: [{ n: '84yr', l: 'Orbit' }, { n: '4x', l: 'Earth Size' }, { n: '-224°C', l: 'Temp' }],
  },
  {
    name: 'NEPTUNE',
    subtitle: 'The blue mystery',
    color: '#4169E1',
    glowColor: '#1E90FF',
    particleColor: '#6495ED',
    particleCount: 350,
    particleSpread: 9,
    bgDark: '#050d1a',
    content: 'The final frontier before the edge. KDS pushes the boundaries of what an AI community can be.',
    cta: 'Launch →',
    stats: [{ n: '165yr', l: 'Orbit' }, { n: '3.9x', l: 'Earth Size' }, { n: '2,100km/h', l: 'Winds' }],
  },
  {
    name: 'BEYOND',
    subtitle: 'The edge of everything',
    color: '#BFF549',
    glowColor: '#FACC15',
    particleColor: '#BFF549',
    particleCount: 500,
    particleSpread: 15,
    bgDark: '#050510',
    content: 'Join the community from 2130. Build, earn, and connect with developers, CEOs, and engineers who think like you.',
    cta: 'ENTER KDS →',
    stats: null,
    link: '/community',
  },
];

// ════════════════════════════════════════
// 🌍 PLANET PARTICLE SYSTEM — unique per planet
// ════════════════════════════════════════
function PlanetParticles({ planet, progress, config }: { planet: typeof planets[0], progress: number, config: { count?: number, spread?: number } }) {
  const count = config.count || 200;
  const spread = config.spread || 8;

  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color(planet.particleColor);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * (spread - 1.5);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      colors[i * 3] = c.r + (Math.random() - 0.5) * 0.2;
      colors[i * 3 + 1] = c.g + (Math.random() - 0.5) * 0.2;
      colors[i * 3 + 2] = c.b + (Math.random() - 0.5) * 0.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count, spread, planet.particleColor]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03 + progress * 2;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1 + progress;

    // Sun special effect — particles pulse outward
    if (planet.name === 'THE SUN') {
      const p = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < p.length; i += 3) {
        p[i] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.002;
        p[i + 1] += Math.cos(state.clock.elapsedTime * 2 + i) * 0.002;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }

    // Jupiter — storm swirl
    if (planet.name === 'JUPITER') {
      const p = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < p.length; i += 3) {
        p[i + 2] = (p[i + 2] || 0) * 0.4; // Flatten into disk
        const angle = Math.atan2(p[i + 1], p[i]) + 0.003;
        const r = Math.sqrt(p[i] * p[i] + p[i + 1] * p[i + 1]);
        p[i] = Math.cos(angle) * r;
        p[i + 1] = Math.sin(angle) * r;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }

    // Saturn — ring effect
    if (planet.name === 'SATURN') {
      const p = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < p.length; i += 3) {
        const theta = Math.atan2(p[i + 1], p[i]) + 0.002;
        const r = Math.sqrt(p[i] * p[i] + p[i + 1] * p[i + 1]);
        p[i] = Math.cos(theta) * r;
        p[i + 1] = Math.sin(theta) * r * 0.3; // Flatten to ring
        p[i + 2] = p[i + 2] * 0.2;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial
        size={planet.name === 'THE SUN' ? 0.06 : 0.035}
        vertexColors
        transparent
        opacity={planet.name === 'THE SUN' ? 0.9 : 0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ════════════════════════════════════════
// 🌌 PLANET 3D SPHERE
// ════════════════════════════════════════
function PlanetMesh({ planet, progress }: { planet: typeof planets[0], progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05);
      glowRef.current.rotation.y -= 0.001;
    }
  });

  return (
    <group>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor} transparent opacity={0.15} />
      </mesh>

      {/* Planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          metalness={0.6}
          roughness={0.3}
          emissive={planet.glowColor}
          emissiveIntensity={planet.name === 'THE SUN' ? 1.5 : 0.2}
        />
      </mesh>

      {/* Saturn rings */}
      {planet.name === 'SATURN' && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[1.4, 2.2, 32]} />
          <meshStandardMaterial color="#E8C56D" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ════════════════════════════════════════
// 🎥 PER-PLANET CAMERA
// ═══════════════════════════════════════＝
function PlanetCamera({ planet, chapterProgress }: { planet: typeof planets[0], chapterProgress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const c = camera as THREE.PerspectiveCamera;

    // Camera zooms in then out during chapter
    const dist = 3.5 - Math.sin(chapterProgress * Math.PI) * 1;
    c.position.z = dist;
    c.fov = 45 + chapterProgress * 10;
    c.updateProjectionMatrix();

    // Mouse sway
    mouseSmooth.lerp(mouse, 0.05);
    c.position.x = mouseSmooth.x * 0.3;
    c.position.y = mouseSmooth.y * 0.2;
    c.lookAt(0, 0, 0);
  });

  return null;
}

// ════════════════════════════════════════
// 🌟 STAR FIELD (background, all chapters)
// ════════════════════════════════════════
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = -10 - Math.random() * 40;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial size={0.08} color="#FFFFFF" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// Shared globals
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);

// ════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════
export default function SolarSystemPage() {
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
      setActiveChapter(Math.min(planets.length - 1, Math.floor(p * planets.length)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearInterval(t); cancelAnimationFrame(raf); };
  }, []);

  const scrollTo = (i: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (i / (planets.length - 1)) * max, behavior: 'smooth' });
  };

  const onMove = useCallback((e: React.PointerEvent) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  // Chapter progress (0→1 within this chapter)
  const chapterProgress = (scrollProgress * planets.length) - activeChapter;

  const planet = planets[activeChapter];

  return (
    <>
      {/* ─── 3D CANVAS (fixed background, unique per chapter) ─── */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 1, background: planet.bgDark, transition: 'background 0.8s ease' }}
        onPointerMove={onMove}
      >
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 45, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <PlanetCamera planet={planet} chapterProgress={chapterProgress} />
          <ambientLight intensity={planet.name === 'THE SUN' ? 0.3 : 0.2} />
          <pointLight position={[5, 5, 5]} intensity={2} color={planet.glowColor} distance={15} />
          <pointLight position={[-5, -3, 3]} intensity={0.8} color={planet.color} distance={12} />
          <StarField />

          <PlanetMesh planet={planet} progress={scrollProgress} />
          <PlanetParticles planet={planet} progress={scrollProgress} config={{ count: planet.particleCount, spread: planet.particleSpread }} />
        </Canvas>

        {/* Scanlines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1.5px, rgba(255,255,255,0.03) 1.5px, rgba(255,255,255,0.03) 3px)' }} />

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
      </div>

      {/* ─── TOP BAR ─── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,5,10,0.25)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)', height: 42,
        display: 'flex', alignItems: 'center', padding: '0 14px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: `${planet.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: planet.color, fontWeight: 900, fontSize: 9, transition: 'all 0.5s' }}>K</div>
          <span style={{ fontWeight: 800, fontSize: 12 }}><span style={{ color: planet.color, transition: 'color 0.5s' }}>{planet.name}</span><span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 9, marginLeft: 4 }}>KDS</span></span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ l: 'Community', h: '/community' }, { l: 'Dashboard', h: '/dashboard' }].map(n => (
            <a key={n.l} href={n.h} style={{ padding: '3px 8px', borderRadius: 4, fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{n.l}</a>
          ))}
        </div>
      </header>

      {/* ─── NAV DOTS ─── */}
      <nav style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {planets.map((p, i) => (
          <button key={i} onClick={() => scrollTo(i)} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0'
          }}>
            <span style={{ position: 'relative', width: activeChapter === i ? 7 : 5, height: activeChapter === i ? 7 : 5, borderRadius: '50%',
              background: activeChapter === i ? p.color : 'rgba(255,255,255,0.1)', transition: 'all 0.3s',
              boxShadow: activeChapter === i ? `0 0 8px ${p.color}50` : 'none' }}>
              {activeChapter === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${p.color}30` }} />}
            </span>
            <span style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.06em', whiteSpace: 'nowrap',
              color: activeChapter === i ? p.color : 'rgba(255,255,255,0.1)', transition: 'color 0.3s',
              display: activeChapter === i ? 'block' : 'none' }}>{p.name}</span>
          </button>
        ))}
      </nav>

      {/* ─── SCROLL SECTIONS ─── */}
      <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
        {planets.map((p, i) => {
          const isActive = activeChapter === i;
          const chapterP = isActive ? chapterProgress : (i < activeChapter ? 1 : 0);
          const show = i === activeChapter;

          return (
            <section key={i} style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
              <div style={{
                maxWidth: i === planets.length - 1 ? 500 : 600,
                textAlign: 'center',
                padding: 40,
                position: 'absolute',
                pointerEvents: 'auto',
                opacity: show ? Math.min(1, Math.max(0, chapterP < 0.15 ? chapterP / 0.15 : chapterP > 0.85 ? (1 - chapterP) / 0.15 : 1)) : 0,
                transform: show ? `translateY(${(1 - Math.min(1, Math.max(0, chapterP < 0.15 ? chapterP / 0.15 : chapterP > 0.85 ? (1 - chapterP) / 0.15 : 1))) * 30}px)` : 'translateY(30px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                background: 'rgba(5,5,10,0.15)',
                backdropFilter: 'blur(4px)',
                borderRadius: 16,
                border: `1px solid ${p.color}10`,
              }}>
                <span style={{ color: `${p.color}40`, fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>{p.subtitle}</span>
                <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: i === 0 ? 'clamp(3rem, 8vw, 6rem)' : 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginTop: i === 0 ? 0 : 6, marginBottom: i === 0 ? 12 : 12, lineHeight: 0.85,
                  background: i === 0 ? `linear-gradient(180deg, ${p.color} 0%, ${p.glowColor} 100%)` : 'none',
                  WebkitBackgroundClip: i === 0 ? 'text' : undefined,
                  WebkitTextFillColor: i === 0 ? 'transparent' : undefined,
                  color: i === 0 ? undefined : 'rgba(255,255,255,0.9)',
                  filter: i === 0 ? `drop-shadow(0 0 40px ${p.color}60)` : 'none',
                }}>{p.name}</h2>

                {i !== 0 && <div style={{ width: 50, height: 1, background: `linear-gradient(90deg, transparent, ${p.color}80, transparent)`, margin: '0 auto 16px' }} />}

                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: i === 0 ? 13 : 13, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 20px' }}>{p.content}</p>

                {/* Stats */}
                {p.stats && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginBottom: 20 }}>
                    {p.stats.map((s: any, si: number) => (
                      <div key={si} style={{ textAlign: 'center' }}>
                        <div style={{ color: p.color, fontSize: 18, fontWeight: 800 }}>{s.n}</div>
                        <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA button */}
                <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 8, animation: 'mc-bounce 2s ease-in-out infinite' }}>
                  {i === 0 ? '↓ Scroll to explore' : i < planets.length - 1 ? '↓ ' + p.cta : (p.link ? <a href={p.link} style={{ pointerEvents: 'auto', display: 'inline-block', padding: '10px 24px', background: `${p.color}15`, border: `1px solid ${p.color}30`, color: p.color, borderRadius: 6, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>{p.cta}</a> : p.cta)}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <AmbientSound />
      <style>{`@keyframes mc-bounce{0%,100%{transform:translateY(0);opacity:.2}50%{transform:translateY(8px);opacity:.6}}`}</style>
    </>
  );
}
