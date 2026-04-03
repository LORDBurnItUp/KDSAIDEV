'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ════════════════════════════════════════
// SHARED STATE
// ════════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);
let scrollProgress = 0;
let scrollVelocity = 0;
let lastScroll = 0;
let glitchIntensity = 0;

// ════════════════════════════════════════
// GLITCH POST-PROCESSING (custom shader pass)
// ════════════════════════════════════════
function GlitchOverlay() {
  const intensity = useRef(0);
  const time = useRef(0);

  useFrame((state, delta) => {
    intensity.current += (glitchIntensity - intensity.current) * 0.1;
    time.current += delta;

    if (intensity.current < 0.01) return;

    // Canvas-based glitch overlay (not in Three.js)
    const el = document.getElementById('glitch-overlay');
    if (!el) return;

    const slices = Math.floor(intensity.current * 15);
    let boxShadows: string[] = [];
    let transforms: string[] = [];

    for (let i = 0; i < slices; i++) {
      const y = (Math.sin(time.current * 20 + i * 3.7) * 0.5 + 0.5);
      const x = (Math.cos(time.current * 15 + i * 2.3) * 0.5) * intensity.current * 20;
      const color = Math.random() > 0.5 ? 'rgba(191,245,73,' : 'rgba(96,165,250,';
      boxShadows.push(`${x}px ${y * 2}px 0 ${color}${intensity.current * 0.3})`);
    }

    el.style.transform = `translate(${(Math.random() - 0.5) * intensity.current * 10}px, ${(Math.random() - 0.5) * intensity.current * 5}px)`;
    el.style.boxShadow = boxShadows.join(',');
    el.style.opacity = intensity.current.toString();
  });

  return null;
}

// ════════════════════════════════════════
// CONSTELLATION PARTICLE NETWORK
// ════════════════════════════════════════
function Constellation({ count = 150 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const particles = useRef<Array<{
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    basePos: THREE.Vector3;
    originalColor: THREE.Color;
  }>>([]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 8;
      pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;

      const c = new THREE.Color().setHSL(0.28 + Math.random() * 0.15, 0.8, 0.5 + Math.random() * 0.3);
      particles.current.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3((Math.random()-0.5)*0.003, (Math.random()-0.5)*0.003, 0),
        basePos: new THREE.Vector3(x, y, z),
        originalColor: c,
      });
    }
    return pos;
  }, [count]);

  const linePos = useMemo(() => new Float32Array(count * count * 3 * 2), [count]);
  const lineColor = useMemo(() => new Float32Array(count * count * 3 * 2), [count]);
  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    particles.current.forEach((p, i) => {
      c[i*3] = p.originalColor.r;
      c[i*3+1] = p.originalColor.g;
      c[i*3+2] = p.originalColor.b;
    });
    return c;
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !linesRef.current) return;

    mouseSmooth.lerp(mouseTarget, 0.04);

    // Update scroll velocity
    scrollVelocity = Math.abs(scrollProgress - lastScroll);
    glitchIntensity = Math.min(1, scrollVelocity * 15);
    lastScroll = scrollProgress;

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const col = (pointsRef.current.geometry.attributes.color?.array || colors) as Float32Array;

    // ── CHAOS ZONE: When you scroll fast, everything goes feral ──
    const chaos = glitchIntensity; // 0 to 1
    const connectionDist = 3.5 - chaos * 2; // Lines disappear as you scroll fast
    let lineIdx = 0;

    const lime = new THREE.Color('#BFF549');
    const blue = new THREE.Color('#60A5FA');
    const red = new THREE.Color('#ff3333');
    const glitchColors = [lime, blue, red, new THREE.Color('#ff00ff'), new THREE.Color('#00ffff')];

    particles.current.forEach((p, i) => {
      // ── BASE MOVEMENT ──
      // Mouse attraction
      const dx = mouseSmooth.x * 6 - p.pos.x;
      const dy = mouseSmooth.y * 4 - p.pos.y;
      p.vel.x += dx * 0.00002;
      p.vel.y += dy * 0.00002;

      // Return to base (weaker when glitching)
      const returnStrength = 0.001 * (1 - chaos * 0.8);
      p.vel.x += (p.basePos.x - p.pos.x) * returnStrength;
      p.vel.y += (p.basePos.y - p.pos.y) * returnStrength;

      // ── CHAOS EFFECTS ──
      if (chaos > 0.1) {
        // Random jerking
        p.vel.x += (Math.random() - 0.5) * chaos * 0.1;
        p.vel.y += (Math.random() - 0.5) * chaos * 0.1;
        p.vel.z += (Math.random() - 0.5) * chaos * 0.05;

        // Z-axis distortion (particles fly toward/away from camera)
        p.pos.z += Math.sin(state.clock.elapsedTime * 20 + i * 0.3) * chaos * 0.05;

        // Color glitch
        if (chaos > 0.3 && Math.random() < chaos * 0.1) {
          const gc = glitchColors[Math.floor(Math.random() * glitchColors.length)];
          col[i*3] = gc.r;
          col[i*3+1] = gc.g;
          col[i*3+2] = gc.b;
        } else {
          // Smooth return
          col[i*3] += (p.originalColor.r - col[i*3]) * 0.05;
          col[i*3+1] += (p.originalColor.g - col[i*3+1]) * 0.05;
          col[i*3+2] += (p.originalColor.b - col[i*3+2]) * 0.05;
        }
      }

      // Damping (reduced during chaos)
      const damp = 0.99 - chaos * 0.03; // Less damping = more chaos
      p.vel.x *= Math.max(damp, 0.85);
      p.vel.y *= Math.max(damp, 0.85);
      p.vel.z *= Math.max(damp, 0.9);

      p.pos.add(p.vel);

      // Wrap with chaos distortion
      const wrapX = 10 + chaos * 5;
      const wrapY = 7 + chaos * 5;
      if (p.pos.x > wrapX) p.pos.x = -wrapX;
      if (p.pos.x < -wrapX) p.pos.x = wrapX;
      if (p.pos.y > wrapY) p.pos.y = -wrapY;
      if (p.pos.y < -wrapY) p.pos.y = wrapY;

      pos[i*3] = p.pos.x;
      pos[i*3+1] = p.pos.y;
      pos[i*3+2] = p.pos.z;

      // ── CONNECTIONS (fewer as chaos increases) ──
      if (chaos < 0.5) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const q = particles.current[j];
          const dist = p.pos.distanceTo(q.pos);
          if (dist < connectionDist) {
            const opacity = (1 - dist / connectionDist) * (1 - chaos) * 0.35;
            const mixT = (p.pos.y + 6) / 12;
            const c = new THREE.Color().lerpColors(lime, blue, mixT);

            // Glitch-colored lines
            if (chaos > 0.2 && Math.random() < chaos * 0.05) {
              const gc = glitchColors[Math.floor(Math.random() * glitchColors.length)];
              linePos[lineIdx] = p.pos.x; linePos[lineIdx+1] = p.pos.y; linePos[lineIdx+2] = p.pos.z;
              linePos[lineIdx+3] = q.pos.x; linePos[lineIdx+4] = q.pos.y; linePos[lineIdx+5] = q.pos.z;
              lineColor[lineIdx] = gc.r * opacity * 2;
              lineColor[lineIdx+1] = gc.g * opacity * 2;
              lineColor[lineIdx+2] = gc.b * opacity * 2;
              lineColor[lineIdx+3] = gc.r * opacity * 2;
              lineColor[lineIdx+4] = gc.g * opacity * 2;
              lineColor[lineIdx+5] = gc.b * opacity * 2;
              lineIdx += 6;
            } else {
              linePos[lineIdx] = p.pos.x; linePos[lineIdx+1] = p.pos.y; linePos[lineIdx+2] = p.pos.z;
              linePos[lineIdx+3] = q.pos.x; linePos[lineIdx+4] = q.pos.y; linePos[lineIdx+5] = q.pos.z;
              lineColor[lineIdx] = c.r * opacity; lineColor[lineIdx+1] = c.g * opacity; lineColor[lineIdx+2] = c.b * opacity;
              lineColor[lineIdx+3] = c.r * opacity; lineColor[lineIdx+4] = c.g * opacity; lineColor[lineIdx+5] = c.b * opacity;
              lineIdx += 6;
            }
          }
        }
      }
    });

    if (pointsRef.current.geometry.attributes.color) {
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, lineIdx);
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef} geometry={
        new THREE.BufferGeometry()
          .setAttribute('position', new THREE.BufferAttribute(positions, 3))
          .setAttribute('color', new THREE.BufferAttribute(colors, 3))
      }>
        <pointsMaterial size={0.035} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePos.length / 3} itemSize={3} array={linePos} />
          <bufferAttribute attach="attributes-color" count={lineColor.length / 3} itemSize={3} array={lineColor} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  );
}

// ─── FLOATING WIREFRAMES ───
function FloatingShapes() {
  const shapes = useRef<Array<THREE.Mesh | null>>([]);
  const shapeData = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      pos: new THREE.Vector3(
        (Math.random()-0.5)*18,
        (Math.random()-0.5)*14,
        (Math.random()-0.5)*10 - 2
      ),
      rotSpeed: new THREE.Vector3(
        (Math.random()-0.5)*0.008,
        (Math.random()-0.5)*0.012,
        (Math.random()-0.5)*0.006
      ),
      scale: 0.1 + Math.random() * 0.3,
      geo: i % 5,
    })), []);

  useFrame((state, delta) => {
    shapes.current.forEach((s, i) => {
      if (!s || !shapeData[i]) return;
      const chaos = glitchIntensity;

      // Normal rotation
      s.rotation.x += shapeData[i].rotSpeed.x + chaos * (Math.random()-0.5) * 0.1;
      s.rotation.y += shapeData[i].rotSpeed.y + chaos * (Math.random()-0.5) * 0.1;
      s.rotation.z += shapeData[i].rotSpeed.z;

      // Float
      if (chaos < 0.3) {
        s.position.y = shapeData[i].pos.y + Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.3;
      } else {
        // Glitch: shapes telepathically jump
        s.position.y = shapeData[i].pos.y + (Math.random()-0.5) * chaos * 3;
        s.position.x = shapeData[i].pos.x + (Math.random()-0.5) * chaos * 2;
      }

      // Scale pulse during chaos
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 10 + i) * chaos * 0.5;
      s.scale.setScalar(shapeData[i].scale * pulse);
    });
  });

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#BFF549', wireframe: true, transparent: true, opacity: 0.06,
  }), []);

  return (
    <>
      {shapeData.map((d, i) => (
        <mesh key={i} ref={(el) => { if (el && !shapes.current[i]) shapes.current[i] = el; }}
          position={d.pos} scale={d.scale} material={i % 3 === 0 ?
            new THREE.MeshBasicMaterial({ color: '#60A5FA', wireframe: true, transparent: true, opacity: 0.04 }) :
            i % 3 === 1 ?
            new THREE.MeshBasicMaterial({ color: '#BFF549', wireframe: true, transparent: true, opacity: 0.06 }) :
            new THREE.MeshBasicMaterial({ color: '#FACC15', wireframe: true, transparent: true, opacity: 0.05 })
          }>
          {d.geo === 0 && <tetrahedronGeometry />}
          {d.geo === 1 && <octahedronGeometry />}
          {d.geo === 2 && <icosahedronGeometry />}
          {d.geo === 3 && <dodecahedronGeometry />}
          {d.geo === 4 && <boxGeometry args={[1, 1, 0.15]} />}
        </mesh>
      ))}
    </>
  );
}

// ─── CAMERA — goes insane on scroll ───
function ChaosCamera() {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 0, 6));
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const chaos = glitchIntensity;
    mouseSmooth.lerp(mouseTarget, 0.04);

    // Normal camera
    const normalX = Math.sin(scrollProgress * Math.PI * 0.5) * 2 + mouseSmooth.x * 0.3;
    const normalY = Math.cos(scrollProgress * Math.PI * 0.3) * 0.5 - scrollProgress * 1 + mouseSmooth.y * 0.2;
    const normalZ = 6 + scrollProgress * 2;

    // Glitch camera - goes full chaos
    const glitchX = (Math.random() - 0.5) * chaos * 8;
    const glitchY = (Math.random() - 0.5) * chaos * 6;
    const glitchZ = (Math.random() - 0.5) * chaos * 5;

    const targetX = normalX + glitchX;
    const targetY = normalY + glitchY;
    const targetZ = normalZ + glitchZ;

    pos.current.set(targetX, targetY, targetZ);
    camera.position.lerp(pos.current, 0.05 + chaos * 0.2);

    // FOV goes wild
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov = 50 + scrollProgress * 15 + chaos * 30;
    pc.updateProjectionMatrix();

    // Look target goes crazy
    const lx = mouseSmooth.x * 0.5 + (Math.random()-0.5) * chaos * 3;
    const ly = -scrollProgress * 0.5 + (Math.random()-0.5) * chaos * 2;
    lookAt.current.set(lx, ly, 0);

    if (chaos > 0.5) {
      camera.lookAt(
        lx + (Math.random()-0.5) * chaos,
        ly + (Math.random()-0.5) * chaos,
        (Math.random()-0.5) * chaos
      );
    } else {
      camera.lookAt(lookAt.current);
    }
  });
  return null;
}

// ─── MOUSE LIGHT ───
function MouseLight() {
  const ref = useRef<THREE.PointLight>(null);
  useEffect(() => {
    const iv = setInterval(() => {
      if (ref.current) {
        ref.current.position.set(mouseSmooth.x * 5, mouseSmooth.y * 4, 3);
        ref.current.intensity = 2 + glitchIntensity * 5; // Brighter when glitching
      }
    }, 16);
    return () => clearInterval(iv);
  }, []);
  return <pointLight ref={ref} position={[0, 0, 3]} intensity={2} color="#BFF549" distance={15} />;
}

// ─── CHAOS BACKGROUND COLOR ───
function ChaosFog() {
  const mat = useRef(new THREE.Color('#050510'));

  useFrame(() => {
    const chaos = glitchIntensity;
    // Background shifts from dark void to glitch colors
    const r = 0.02 + chaos * (Math.random() * 0.15);
    const g = 0.02 + chaos * (Math.random() * 0.1);
    const b = 0.06 + chaos * (Math.random() * 0.08);
    mat.current.setRGB(Math.min(r, 0.25), Math.min(g, 0.2), Math.min(b, 0.2));
  });

  return <fog attach="fog" args={[mat.current, 4, 20]} />;
}

// ════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════
export default function VexelHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    let ticking = false;

    const update = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          scrollProgress = window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
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
    <div
      id="vexel-container"
      style={{ position: 'fixed', inset: 0, background: '#050510', zIndex: 1, transition: 'transform 0.05s linear' }}
      onPointerMove={onMove}
    >
      {/* Glitch overlay layer */}
      <div
        id="glitch-overlay"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
          opacity: 0, mixBlendMode: 'screen',
        }}
      />

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)',
        opacity: 0.3 + glitchIntensity * 0.5,
      }} />

      {/* Chromatic aberration overlay at high chaos */}
      {glitchIntensity > 0.3 && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35,
          background: `linear-gradient(90deg, 
            rgba(255,0,0,${glitchIntensity * 0.1}) 0%, 
            transparent 33%, 
            rgba(0,255,0,${glitchIntensity * 0.05}) 50%, 
            transparent 66%, 
            rgba(0,0,255,${glitchIntensity * 0.1}) 100%)`,
          mixBlendMode: 'screen',
        }} />
      )}

      <Canvas
        camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <ChaosCamera />
        <MouseLight />
        <ambientLight intensity={0.04} />
        <ChaosFog />

        <Constellation count={180} />
        <FloatingShapes />
      </Canvas>

      {/* Vignette (gets weaker during chaos) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
        background: `radial-gradient(ellipse at 50% 40%, transparent ${45 - glitchIntensity * 20}%, rgba(5,5,16,${0.7 - glitchIntensity * 0.3}) 100%)`,
      }} />
    </div>
  );
}
