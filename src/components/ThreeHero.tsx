'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshPhysicalMaterial, MeshTransmissionMaterial, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Shared mouse state
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);

// ═══════════════════════════════════════════
// 💎 CFENTER-STYLE 3D KDS HERO
// Dark void studio, floating metallic text,
// dramatic rim lighting, glass/shard particles,
// cinematic slow rotation, mouse tracking
// ═══════════════════════════════════════════

// ─── Floating geometric shards ───
function FloatingShards() {
  const shards = useRef<Array<{
    mesh: THREE.Mesh;
    rotSpeed: THREE.Vector3;
    floatSpeed: number;
    floatAmp: number;
    orbitRadius: number;
    orbitSpeed: number;
    orbitPhase: number;
  }>>([]);

  const geometries = useMemo(() => [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.BoxGeometry(1, 1, 0.15),
    new THREE.ConeGeometry(0.7, 1.2, 4),
  ], []);

  const materials = useMemo(() => [
    // Chrome/gold metallic
    new THREE.MeshPhysicalMaterial({
      color: '#d4af37', metalness: 1.0, roughness: 0.15,
      envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.1,
    }),
    // Glass/lime
    new THREE.MeshPhysicalMaterial({
      color: '#BFF549', metalness: 0.3, roughness: 0.0,
      transparent: true, opacity: 0.3, transmission: 0.9,
      envMapIntensity: 1.0, ior: 1.5, thickness: 0.5,
    }),
    // Dark chrome
    new THREE.MeshPhysicalMaterial({
      color: '#888888', metalness: 1.0, roughness: 0.8,
      envMapIntensity: 1.5,
    }),
    // Gold accent
    new THREE.MeshPhysicalMaterial({
      color: '#FACC15', metalness: 0.9, roughness: 0.2,
      emissive: '#FACC15', emissiveIntensity: 0.05,
      envMapIntensity: 2.0,
    }),
  ], []);

  const shardData = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      geometry: geometries[i % geometries.length],
      material: materials[i % materials.length],
      scale: 0.15 + Math.random() * 0.35,
      orbitRadius: 3 + Math.random() * 3,
      orbitSpeed: 0.1 + Math.random() * 0.3,
      orbitHeight: (Math.random() - 0.5) * 4,
      orbitPhase: Math.random() * Math.PI * 2,
    })), [geometries, materials]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    shards.current.forEach((shard, i) => {
      if (!shard) return;
      shard.mesh.rotation.x += shard.rotSpeed.x * delta;
      shard.mesh.rotation.y += shard.rotSpeed.y * delta;
      shard.mesh.position.y = shardData[i].orbitHeight + Math.sin(t * shard.floatSpeed) * shard.floatAmp;
      shard.mesh.position.x = Math.cos(t * shardData[i].orbitSpeed + shardData[i].orbitPhase) * shardData[i].orbitRadius;
      shard.mesh.position.z = Math.sin(t * shardData[i].orbitSpeed + shardData[i].orbitPhase) * shardData[i].orbitRadius;
    });
  });

  return (
    <>
      {shardData.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) {
              el.scale.setScalar(d.scale);
              if (!shards.current[i]) {
                shards.current[i] = {
                  mesh: el,
                  rotSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 0.5
                  ),
                  floatSpeed: 0.5 + Math.random() * 1.2,
                  floatAmp: 0.4 + Math.random() * 0.4,
                  orbitRadius: d.orbitRadius,
                  orbitSpeed: d.orbitSpeed,
                  orbitPhase: d.orbitPhase,
                };
              }
            }
          }}
          geometry={d.geometry}
          material={d.material}
        />
      ))}
    </>
  );
}

// ─── Atmospheric Particles ───
function Particles({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = [
      new THREE.Color('#BFF549'),
      new THREE.Color('#FACC15'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical distribution
      const r = 5 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
      sizes[i] = 0.008 + Math.random() * 0.025;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geometry;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    // Gentle drift
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.01) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial 
        vertexColors 
        size={0.02} 
        sizeAttenuation 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </points>
  );
}

// ─── Main KDS Text ───
function KDSLogo() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    mouseSmooth.lerp(mouseTarget, 0.04);

    // Cinematic rotation (very slow like CFenter)
    groupRef.current.rotation.y += delta * 0.03;
    
    // Add mouse influence to rotation
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15 + mouseSmooth.y * Math.PI * 0.15) * 0.08;
    groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.12 + mouseSmooth.x * Math.PI * 0.12) * 0.03;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.08}>
      <group ref={groupRef}>
        {/* Main 3D Text - Premium metallic look */}
        <Text
          font="/fonts/Inter-Black.ttf"
          fontSize={1.8}
          letterSpacing={0.04}
          fontWeight={900}
          material-toneMapped={false}
        >
          KDS
          <MeshPhysicalMaterial
            color="#d4af37"
            metalness={1.0}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
            ior={2.4}
            reflectivity={1}
          />
        </Text>
        
        {/* Gloss overlay */}
        <Text
          font="/fonts/Inter-Black.ttf"
          fontSize={1.81}
          letterSpacing={0.04}
          fontWeight={900}
          position={[0, 0, 0.01]}
        >
          KDS
          <MeshPhysicalMaterial
            color="#ffffff"
            metalness={0}
            roughness={0}
            transparent
            opacity={0.06}
          />
        </Text>

        {/* Subtitle line */}
        <mesh position={[0, -1.2, 0]}>
          <planeGeometry args={[3, 0.003]} />
          <MeshPhysicalMaterial 
            color="#BFF549" 
            emissive="#BFF549" 
            emissiveIntensity={0.3} 
            toneMapped={false} 
          />
        </mesh>

        <Text
          font="/fonts/Inter-Regular.ttf"
          fontSize={0.11}
          letterSpacing={0.18}
          position={[0, -1.45, 0]}
        >
          KINGS DRIPPING SWAG • 2130
          <meshBasicMaterial color="#BFF549" transparent opacity={0.45} />
        </Text>

        <Text
          font="/fonts/Inter-Regular.ttf"
          fontSize={0.065}
          letterSpacing={0.12}
          position={[0, -1.65, 0]}
        >
          MOVE YOUR MOUSE — SPIN THE WORLD
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </Text>
      </group>
    </Float>
  );
}

// ─── Camera rig ───
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    // Smooth camera parallax
    camera.position.x += (mouseSmooth.x * 0.4 - camera.position.x) * 0.05;
    camera.position.y += (mouseSmooth.y * 0.25 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Dramatic Studio Lighting ───
function DramaticLights() {
  return (
    <>
      {/* Key light - top right */}
      <pointLight position={[8, 8, 5]} intensity={2.5} color="#BFF549" />
      {/* Fill - left */}
      <pointLight position={[-6, -2, 3]} intensity={1} color="#60A5FA" />
      {/* Back rim - gold */}
      <pointLight position={[0, 3, -6]} intensity={1.5} color="#FACC15" />
      {/* Bottom bounce */}
      <pointLight position={[0, -4, 2]} intensity={0.4} color="#a78bfa" />
      {/* Far left rim */}
      <pointLight position={[-4, 0, -3]} intensity={0.6} color="#ffffff" />
      {/* Ambient */}
      <ambientLight intensity={0.08} />
    </>
  );
}

// ═══════════════════════════════════════════
// MAIN EXPORT - CFENTER-STYLE HERO
// ═══════════════════════════════════════════
export default function ThreeHero() {
  const [mounted, setMounted] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [contentOpacity, setContentOpacity] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Scroll-based fade for hero
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHeroOpacity(Math.max(0, 1 - scrollY / 800));
      setContentOpacity(Math.min(1, scrollY / 350));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!mounted) return (
    <div className="fixed inset-0 z-[1]" style={{ background: '#050510' }} />
  );

  return (
    <>
      {/* ─── 3D HERO ─── */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          opacity: heroOpacity,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: heroOpacity > 0.1 ? 'auto' : 'none',
          background: '#050510',
        }}
        onPointerMove={handleMouseMove}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 80 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
        >
          <CameraRig />
          <DramaticLights />
          <fog attach="fog" args={['#050510', 12, 25]} />

          <KDSLogo />
          <FloatingShards />
          <Particles count={800} />

          {/* ─── Environment map (studio reflection) ─── */}
          <Environment preset="city" />
        </Canvas>

        {/* ─── CSS overlay effects ─── */}
        {/* Bottom gradient — seamless scroll transition */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '30vh',
            background: 'linear-gradient(to top, #050510 0%, transparent 100%)',
            zIndex: 2,
          }}
        />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,16,0.7) 100%)',
            zIndex: 3,
          }}
        />
      </div>

      {/* ─── SCROLL CONTENT FADE IN ─── */}
      <div
        style={{
          opacity: contentOpacity,
          transition: 'opacity 0.5s ease-out',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ height: '100vh' }} />
      </div>
    </>
  );
}
