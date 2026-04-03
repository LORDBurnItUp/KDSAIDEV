'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════
// SHARED STATE
// ═══════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);
let scrollProgress = 0;
let scrollVelocity = 0;
let lastScrollY = 0;
let glowIntensity = 1.0;

// ═══════════════════════════════════════
// 🎥 PARALLAX SCROLL CAMERA
//
// As you scroll, the camera journeys
// through a layered 3D universe:
//   Section 0: Front-on hero — KDS text
//   Section 1: Orbit left — see particles from side
//   Section 2: Dive deep — fly through cloud
//   Section 3: Rise above — birdseye constellation
//   Section 4: Spiral behind — letters from behind
//   Section 5: Zoom out — epic scale reveal
// ═══════════════════════════════════════
function ParallaxCamera() {
  const smooth = useRef({
    pos: new THREE.Vector3(0, 0, 6),
    lookAt: new THREE.Vector3(0, 0, 0),
  });

  useFrame(() => {
    mouseSmooth.lerp(mouseTarget, 0.05);
    const t = scrollProgress; // 0→1
    const m = mouseSmooth;

    // ── CHOREOGRAPHED CAMERA PATH ──
    let cx = 0, cy = 0, cz = 6, lx = 0, ly = 0, lz = 0;

    if (t < 0.20) {
      // Section 0: Hero — straight-on, slight hover
      const lt = t / 0.20;
      cx = m.x * 0.4 * (1 - lt * 0.5);
      cy = 0.2 + lt * 0.3 + m.y * 0.3 * (1 - lt);
      cz = 6 - lt * 1;
      lx = m.x * 0.3;
      ly = 0 - lt * 0.2;
      lz = 0;
    } else if (t < 0.40) {
      // Section 1: Orbit right — circling around, descending
      const lt = (t - 0.20) / 0.20;
      const angle = lt * Math.PI * 0.8;
      cx = Math.sin(angle) * 3.5 + m.x * 0.3;
      cy = 0.5 - lt * 1.5 + m.y * 0.2;
      cz = 5 - lt * 2;
      lx = Math.cos(angle) * 0.5;
      ly = 0 - lt * 0.3;
    } else if (t < 0.60) {
      // Section 2: DIVE — camera flies into the particle cloud
      const lt = (t - 0.40) / 0.20;
      cx = 3.5 - lt * 5 + Math.sin(lt * Math.PI) * m.x * 0.5;
      cy = -1.0 + lt * 2 + m.y * 0.3;
      cz = 3 + lt * 0.5;
      lx = -lt * 2 + m.x * 0.2;
      ly = lt * 0.5;
    } else if (t < 0.80) {
      // Section 3: Rise above — looking down at constellation
      const lt = (t - 0.60) / 0.20;
      cx = -1.5 + lt * 2 + m.x * 0.2;
      cy = 1.5 + lt * 4 + m.y * 0.15;
      cz = 3.5 - lt * 1.5;
      lx = lt * 0.5;
      ly = -lt * 0.5;
    } else if (t < 0.95) {
      // Section 4: Behind — see letters from backside
      const lt = (t - 0.80) / 0.15;
      const angle = Math.PI * 0.5 + lt * Math.PI * 0.5;
      cx = Math.sin(angle) * 4;
      cy = 5.5 - lt * 2;
      cz = 2 - lt * 1;
      lx = 0;
      ly = -lt * 0.5;
    } else {
      // Section 5: Epic zoom out — wide shot, everything recedes
      const lt = (t - 0.95) / 0.05;
      cx = -4 * (1 - lt);
      cy = 3.5 - lt * 3.5;
      cz = 1 + lt * 8;
      lx = 0;
      ly = -0.5;
    }

    // Smooth interpolation (different speeds for pos vs lookAt)
    smooth.current.pos.set(cx, cy, cz);
    const { camera } = useThree.__getInstance() || { camera: null };

    // Direct camera manipulation
    const state = useThree.__getState();
    if (!state) return;
    const cam = state.camera;

    cam.position.lerp(smooth.current.pos, 0.04);

    const target = new THREE.Vector3(lx, ly, lz);
    smooth.current.lookAt.lerp(target, 0.05);
    cam.lookAt(smooth.current.lookAt);

    // Dynamic FOV — tight at start, wide at end
    const pc = cam as THREE.PerspectiveCamera;
    const fov = 45 + t * 20;
    pc.fov = fov;
    pc.updateProjectionMatrix();
  });

  return null;
}

// ═══════════════════════════════════════
// 🌌 SCROLL-REACTIVE PARTICLE NETWORK
//
// Particles orbit at different depths.
// As camera moves past, closer particles
// parallax faster than distant ones.
// Connections tighten and re-form
// dynamically based on camera position.
// ═══════════════════════════════════════
function ScrollConstellation({ count = 180 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const particles = useRef<Array<{
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    basePos: THREE.Vector3;
    depth: number; // 0=far, 1=close
  }>>([]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const depth = Math.random();
      const spread = 12 + depth * 6;
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread * 0.7;
      const z = (Math.random() - 0.5) * 10 - 1;
      pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;
      particles.current.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(
          (Math.random()-0.5)*0.002,
          (Math.random()-0.5)*0.002,
          (Math.random()-0.5)*0.001
        ),
        basePos: new THREE.Vector3(x, y, z),
        depth,
      });
    }
    return pos;
  }, [count]);

  const linePositions = useMemo(() => new Float32Array(count * 12 * 3 * 2), [count]);
  const lineColors = useMemo(() => new Float32Array(count * 12 * 3 * 2), [count]);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;

    mouseSmooth.lerp(mouseTarget, 0.05);
    const t = scrollProgress;
    const scrollVel = Math.abs(scrollProgress - lastScrollY);
    lastScrollY = scrollProgress;
    glowIntensity += (glimpse - glowIntensity) * 0.05;

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const cameraZ = useThree.__getState()?.camera?.position?.z || 6;
    let lineIdx = 0;

    const lime = new THREE.Color('#BFF549');
    const blue = new THREE.Color('#60A5FA');
    const gold = new THREE.Color('#FACC15');

    particles.current.forEach((p, i) => {
      // Gentle drift
      p.pos.add(p.vel);

      // Mouse attraction (stronger for close particles)
      const mousePull = p.depth * 0.0001;
      p.vel.x += (mouseSmooth.x * 6 - p.pos.x) * mousePull;
      p.vel.y += (mouseSmooth.y * 4 - p.pos.y) * mousePull;

      // Damping
      p.vel.multiplyScalar(0.997);

      // Scroll velocity push — particles scatter on fast scroll
      if (scrollVel > 0.005) {
        p.vel.x += (Math.random() - 0.5) * scrollVel * 50 * p.depth;
        p.vel.y += (Math.random() - 0.5) * scrollVel * 50 * p.depth;
        p.vel.z += (Math.random() - 0.5) * scrollVel * 30 * p.depth;
      }

      // Return to base
      const returnStrength = 0.0003 * (1 + p.depth);
      p.vel.x += (p.basePos.x - p.pos.x) * returnStrength;
      p.vel.y += (p.basePos.y - p.pos.y) * returnStrength;
      p.vel.z += (p.basePos.z - p.pos.z) * returnStrength;

      // Wrap
      const bounds = 10 + p.depth * 6;
      if (p.pos.x > bounds) p.pos.x = -bounds;
      if (p.pos.x < -bounds) p.pos.x = bounds;
      if (p.pos.y > bounds*0.7) p.pos.y = -bounds*0.7;
      if (p.pos.y < -bounds*0.7) p.pos.y = bounds*0.7;

      // Update
      pos[i*3] = p.pos.x;
      pos[i*3+1] = p.pos.y;
      pos[i*3+2] = p.pos.z;
    });

    // ── CONNECTIONS (camera-relative) ──
    const maxDist = 3.5 - scrollVel * 500; // Lines snap during fast scroll
    const camPos = useThree.__getState()?.camera?.position || new THREE.Vector3(0, 0, 6);

    particles.current.forEach((p, i) => {
      // Only connect particles within camera range
      const camDist = p.pos.distanceTo(camPos);
      if (camDist > 12) return;

      for (let j = i + 1; j < particles.current.length; j++) {
        const q = particles.current[j];
        const dist = p.pos.distanceTo(q.pos);
        if (dist < maxDist && dist > 0) {
          const opacity = (1 - dist / maxDist) * (1 - camDist / 12) * 0.4;
          if (opacity < 0.01) continue;

          // Color based on Y position + scroll phase
          const baseColor = new THREE.Color().lerpColors(lime, blue, (p.pos.y + 6) / 12);
          if (scrollVel > 0.01) {
            baseColor.lerp(gold, Math.min(scrollVel * 200, 0.5)); // Gold flash on fast scroll
          }

          linePositions[lineIdx] = p.pos.x;
          linePositions[lineIdx+1] = p.pos.y;
          linePositions[lineIdx+2] = p.pos.z;
          linePositions[lineIdx+3] = q.pos.x;
          linePositions[lineIdx+4] = q.pos.y;
          linePositions[lineIdx+5] = q.pos.z;

          lineColors[lineIdx] = baseColor.r * opacity;
          lineColors[lineIdx+1] = baseColor.g * opacity;
          lineColors[lineIdx+2] = baseColor.b * opacity;
          lineColors[lineIdx+3] = baseColor.r * opacity;
          lineColors[lineIdx+4] = baseColor.g * opacity;
          lineColors[lineIdx+5] = baseColor.b * opacity;

          lineIdx += 6;
        }
      }
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, lineIdx / 3);
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3))}>
        <pointsMaterial size={0.03} color="#BFF549" transparent opacity={0.75} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} itemSize={3} array={linePositions} />
          <bufferAttribute attach="attributes-color" count={lineColors.length / 3} itemSize={3} array={lineColors} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </>
  );
}

// ═══════════════════════════════════════
// 💎 FLOATING WIREFRAME LAYERS
//
// Three depth layers of wireframe geometry.
// Each layer parallax at different speeds
// based on scroll position.
// ═══════════════════════════════════════
function ParallaxWireframes() {
  const layers = useMemo(() => [
    { // Far layer — slow parallax
      count: 12, scale: 0.15, opacity: 0.03, zSpread: -6, speed: 0.2, color: '#BFF549'
    },
    { // Mid layer
      count: 8, scale: 0.25, opacity: 0.05, zSpread: -3, speed: 0.5, color: '#60A5FA'
    },
    { // Near layer — fast parallax
      count: 6, scale: 0.4, opacity: 0.07, zSpread: 0, speed: 1.0, color: '#FACC15'
    },
  ], []);

  const shapeRefs = useRef<Array<THREE.Mesh | null>>([]);
  const shapeData = useMemo(() => {
    const data: Array<{
      pos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      scale: number;
      layer: number;
      geo: number;
    }> = [];
    let idx = 0;
    layers.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        data.push({
          pos: new THREE.Vector3(
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 10,
            layer.zSpread + (Math.random() - 0.5) * 3
          ),
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.008 * (li + 1),
            (Math.random() - 0.5) * 0.012 * (li + 1),
            (Math.random() - 0.5) * 0.006
          ),
          scale: layer.scale * (0.5 + Math.random()),
          layer: li,
          geo: Math.floor(Math.random() * 4),
        });
        idx++;
      }
    });
    return data;
  }, [layers]);

  useFrame((state, delta) => {
    const t = scrollProgress;
    shapeRefs.current.forEach((ref, i) => {
      if (!ref || !shapeData[i]) return;
      const d = shapeData[i];
      const layer = layers[d.layer];

      // Parallax offset based on scroll
      const parallaxX = Math.sin(t * Math.PI * (1 + d.layer * 0.5)) * layer.speed * 1.5;
      const parallaxY = Math.cos(t * Math.PI * (0.7 + d.layer * 0.3)) * layer.speed * 0.8;

      ref.position.x = d.pos.x + parallaxX;
      ref.position.y = d.pos.y + parallaxY;
      ref.position.z = d.pos.z + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.2;

      // Rotation
      ref.rotation.x += d.rotSpeed.x;
      ref.rotation.y += d.rotSpeed.y;
      ref.rotation.z += delta * 0.002;

      // Scale pulse when camera passes
      const camZ = useThree.__getState()?.camera?.position?.z || 6;
      const distToCam = Math.abs(d.pos.z - camZ);
      const pulse = 1 + Math.max(0, (3 - distToCam) / 3) * 0.3;
      ref.scale.setScalar(d.scale * pulse);
    });
  });

  return (
    <>
      {shapeData.map((d, i) => (
        <mesh key={i}
          ref={(el) => { if (el && !shapeRefs.current[i]) shapeRefs.current[i] = el; }}
          position={d.pos}
          scale={d.scale}
        >
          <meshBasicMaterial
            color={layers[d.layer].color}
            wireframe
            transparent={true}
            opacity={layers[d.layer].opacity}
            depthWrite={false}
          />
          {d.geo === 0 && <icosahedronGeometry args={[1, 0]} />}
          {d.geo === 1 && <dodecahedronGeometry args={[1, 0]} />}
          {d.geo === 2 && <octahedronGeometry args={[1, 0]} />}
          {d.geo === 3 && <tetrahedronGeometry args={[1, 0]} />}
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════════════════════
// 💡 DYNAMIC LIGHTING — follows camera
// ═══════════════════════════════════════
function DynamicLights() {
  const ref1 = useRef<THREE.PointLight>(null);
  const ref2 = useRef<THREE.PointLight>(null);
  const ref3 = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = scrollProgress;
    const camPos = useThree.__getState()?.camera?.position || new THREE.Vector3(0, 0, 6);

    if (ref1.current) {
      ref1.current.position.set(camPos.x + 3, camPos.y + 3, camPos.z + 2);
      ref1.current.intensity = 1.5 + Math.sin(t * Math.PI) * 0.5;
    }
    if (ref2.current) {
      ref2.current.position.set(camPos.x - 4, camPos.y - 1, camPos.z + 1);
      ref2.current.intensity = 0.8 - t * 0.4;
    }
    if (ref3.current) {
      ref3.current.position.set(camPos.x, camPos.y + 4, camPos.z - 3);
      ref3.current.intensity = 0.5 + Math.sin(t * Math.PI * 2) * 0.3;
    }
  });

  return (
    <>
      <pointLight ref={ref1} position={[3, 3, 5]} intensity={1.5} color="#BFF549" distance={15} />
      <pointLight ref={ref2} position={[-4, -1, 4]} intensity={0.8} color="#60A5FA" distance={12} />
      <pointLight ref={ref3} position={[0, 4, -3]} intensity={0.5} color="#FACC15" distance={10} />
    </>
  );
}

// ═══════════════════════════════════════
// 🌊 FOG — scroll-reactive depth
// ═══════════════════════════════════════
function ScrollFog() {
  useFrame((state) => {
    const t = scrollProgress;
    // Fog density based on scroll phase
    const near = 6 + t * 4;
    const far = 22 - t * 8;
    const fog = useThree.__getState()?.scene?.fog as THREE.Fog | undefined;
    if (fog) {
      fog.near = Math.max(near, 4);
      fog.far = Math.max(far, 10);
    }
  });
  return <fog attach="fog" args={['#050510', 10, 20]} />;
}

// ═══════════════════════════════════════
// 🖼️ MAIN COMPONENT — PARALLAX HERO
// ═══════════════════════════════════════
export default function VexelHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    let ticking = false;

    const update = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
          scrollProgress = Math.min(scrollY / maxScroll, 1);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!ready) return <div style={{ position: 'fixed', inset: 0, background: '#050510' }} />;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050510', zIndex: 1 }} onPointerMove={onMove}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <ParallaxCamera />
        <DynamicLights />
        <ScrollFog />

        <ScrollConstellation count={180} />
        <ParallaxWireframes />
      </Canvas>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(5,5,16,0.7) 100%)',
      }} />

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px)',
        opacity: 0.2,
      }} />
    </div>
  );
}
