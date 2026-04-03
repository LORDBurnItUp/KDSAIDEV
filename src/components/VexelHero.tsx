'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Shared state
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);
let scrollProgress = 0;

// ═══════════════════════════════════════
// CONSTELLATION PARTICLE NETWORK
// ═══════════════════════════════════════
function ParticleConstellation({ count = 150 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const particleData = useRef<Array<{
    pos: THREE.Vector3;
    vel: THREE.Vector3;
  }>>([]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 8;
      pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;
      particleData.current.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
          0
        ),
      });
    }
    return pos;
  }, [count]);

  const MAX_LINES = 1200;
  const linePositions = useMemo(() => new Float32Array(MAX_LINES * 6), []);
  const lineColors = useMemo(() => new Float32Array(MAX_LINES * 6), []);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;

    mouseSmooth.lerp(mouseTarget, 0.06);
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    const connectionDist = 3.2;
    let lineIdx = 0;
    const lime = new THREE.Color('#BFF549');
    const blue = new THREE.Color('#60A5FA');

    for (let i = 0; i < particleData.current.length && lineIdx < MAX_LINES; i++) {
      const p = particleData.current[i];

      // Mouse attraction (gentle)
      const dx = mouseSmooth.x * 6 - p.pos.x;
      const dy = mouseSmooth.y * 4 - p.pos.y;
      p.vel.x += dx * 0.00003;
      p.vel.y += dy * 0.00003;
      p.vel.z *= 0.99;

      // Damping
      p.vel.x *= 0.998;
      p.vel.y *= 0.998;
      
      // Vertical drift on scroll
      p.pos.y += Math.sin(scrollProgress * Math.PI * 4 + i * 0.05) * 0.0008;

      p.pos.add(p.vel);

      // Wrap
      if (p.pos.x > 9) p.pos.x = -9;
      if (p.pos.x < -9) p.pos.x = 9;
      if (p.pos.y > 7) p.pos.y = -7;
      if (p.pos.y < -7) p.pos.y = 7;

      posArr[i*3] = p.pos.x;
      posArr[i*3+1] = p.pos.y;
      posArr[i*3+2] = p.pos.z;

      // Find connections
      for (let j = i + 1; j < particleData.current.length && lineIdx < MAX_LINES; j++) {
        const q = particleData.current[j];
        const dist = p.pos.distanceTo(q.pos);
        if (dist < connectionDist) {
          const opacity = (1 - dist / connectionDist) * 0.35;
          const c = new THREE.Color().lerpColors(lime, blue, (p.pos.y + 7) / 14);
          
          const idx = lineIdx * 6;
          linePositions[idx] = p.pos.x; linePositions[idx+1] = p.pos.y; linePositions[idx+2] = p.pos.z;
          linePositions[idx+3] = q.pos.x; linePositions[idx+4] = q.pos.y; linePositions[idx+5] = q.pos.z;
          lineColors[idx] = c.r * opacity; lineColors[idx+1] = c.g * opacity; lineColors[idx+2] = c.b * opacity;
          lineColors[idx+3] = c.r * opacity; lineColors[idx+4] = c.g * opacity; lineColors[idx+5] = c.b * opacity;

          lineIdx++;
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, lineIdx * 2);
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3))}>
        <pointsMaterial size={0.025} color="#BFF549" transparent opacity={0.7} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} itemSize={3} array={linePositions} />
          <bufferAttribute attach="attributes-color" count={lineColors.length / 3} itemSize={3} array={lineColors} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  );
}

// ═══════════════════════════════════════
// FLOATING WIREFRAME GEOMETRIES
// ═══════════════════════════════════════
function FloatingWireframes() {
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const shapes = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6 - 1
      ),
      scale: 0.08 + Math.random() * 0.2,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.012,
        (Math.random() - 0.5) * 0.006
      ),
      geo: i % 5,
      opacity: 0.03 + Math.random() * 0.05,
    })), []);

  useFrame((state) => {
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh || !shapes[i]) return;
      mesh.rotation.x += shapes[i].rotSpeed.x;
      mesh.rotation.y += shapes[i].rotSpeed.y;
      mesh.position.y = shapes[i].pos.y + Math.sin(state.clock.elapsedTime * 0.4 + i * 0.5) * 0.3;
    });
  });

  return (
    <>
      {shapes.map((s, i) => (
        <mesh key={i} ref={(el) => { if (el && !meshRefs.current[i]) meshRefs.current[i] = el; }} position={s.pos} scale={s.scale}>
          <meshBasicMaterial color="#BFF549" wireframe transparent opacity={s.opacity * 0.6} />
          {s.geo === 0 && <icosahedronGeometry args={[1, 0]} />}
          {s.geo === 1 && <octahedronGeometry args={[1, 0]} />}
          {s.geo === 2 && <dodecahedronGeometry args={[1, 0]} />}
          {s.geo === 3 && <tetrahedronGeometry args={[1, 0]} />}
          {s.geo === 4 && <boxGeometry args={[1, 1, 0.15]} />}
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════════════════════
// SCROLL CAMERA
// ═══════════════════════════════════════
function ScrollCamera() {
  const { camera } = useThree();
  const smoothPos = useRef(new THREE.Vector3(0, 0, 6));
  const smoothLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    mouseSmooth.lerp(mouseTarget, 0.06);
    const t = scrollProgress;

    // Camera path: descends and shifts as you scroll deeper
    const targetX = Math.sin(t * Math.PI * 0.5) * 2 + mouseSmooth.x * 0.4;
    const targetY = Math.cos(t * Math.PI * 0.3) * 0.5 - t * 1.5 + mouseSmooth.y * 0.3;
    const targetZ = 6 + t * 2;

    smoothPos.current.set(targetX, targetY, targetZ);
    camera.position.lerp(smoothPos.current, 0.04);

    // Look target
    const lookX = mouseSmooth.x * 0.5;
    const lookY = -t * 0.8 + mouseSmooth.y * 0.2;
    smoothLook.current.set(lookX, lookY, 0);
    camera.lookAt(smoothLook.current);

    // FOV widens with scroll
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov = 45 + t * 15;
    pc.updateProjectionMatrix();
  });

  return null;
}

// ═══════════════════════════════════════
// MOUSE LIGHT
// ═══════════════════════════════════════
function MouseLight() {
  const ref = useRef<THREE.PointLight>(null);
  useEffect(() => {
    const iv = setInterval(() => {
      if (ref.current) ref.current.position.set(mouseSmooth.x * 5, mouseSmooth.y * 4, 3);
    }, 16);
    return () => clearInterval(iv);
  }, []);
  return <pointLight ref={ref} position={[0, 0, 3]} intensity={1.5} color="#BFF549" distance={12} />;
}

// ═══════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════
export default function VexelHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    let raf: number;
    const update = () => {
      scrollProgress = Math.min(window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1), 0.99);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!ready) return <div style={{ position: 'fixed', inset: 0, background: '#050510' }} />;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#050510' }}
      onPointerMove={onMove}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 80 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <ScrollCamera />
        <MouseLight />
        <ambientLight intensity={0.05} />
        <fog attach="fog" args={['#050510', 5, 20]} />

        <ParticleConstellation count={180} />
        <FloatingWireframes />
      </Canvas>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(5,5,16,0.7) 100%)',
      }} />

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.1,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
      }} />
    </div>
  );
}
