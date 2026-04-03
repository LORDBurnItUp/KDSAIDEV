'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Shared mouse tracking ───
const mouseTarget = new THREE.Vector2(0, 0);
const mouseCurrent = new THREE.Vector2(0, 0);

// ════════════════════════════════════════
// RARE TORUS KNOT — The hero centerpiece
// ════════════════════════════════════════
function HeroKnot() {
  const mesh = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  // Custom GLSL shader material
  const shaderMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uLime: { value: new THREE.Color('#BFF549') },
        uGold: { value: new THREE.Color('#FACC15') },
        uBlue: { value: new THREE.Color('#60A5FA') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec3 uLime;
        uniform vec3 uGold;
        uniform vec3 uBlue;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vPos;

        void main() {
          vec3 view = normalize(-vPos);
          float fresnel = pow(1.0 - abs(dot(view, vNormal)), 2.5);

          // Color cycling
          float t = sin(uTime * 0.3) * 0.5 + 0.5;
          vec3 col = mix(uGold, uLime, t);
          col = mix(col, uBlue, sin(uTime * 0.15) * 0.3 + 0.3);

          // Mouse-proximity glow
          float mDist = length(vUv - (uMouse * 0.5 + 0.5));
          float mGlow = smoothstep(0.4, 0.0, mDist);

          vec3 outColor = col * (fresnel * 2.0 + mGlow * 3.0);
          float alpha = fresnel * 0.45 + mGlow * 0.25;

          gl_FragColor = vec4(outColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current || !wire.current || !glow.current) return;
    mouseCurrent.lerp(mouseTarget, 0.06);

    mesh.current.rotation.x += delta * 0.08 + mouseCurrent.y * delta * 0.4;
    mesh.current.rotation.y += delta * 0.12 + mouseCurrent.x * delta * 0.4;
    mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;

    wire.current.rotation.x = -mesh.current.rotation.x * 1.3;
    wire.current.rotation.y = -mesh.current.rotation.y * 1.3;
    wire.current.rotation.z = mesh.current.rotation.z * 2;

    glow.current.rotation.x = mesh.current.rotation.x * 1.15;
    glow.current.rotation.y = mesh.current.rotation.y * 1.15;

    const mat = shaderMat as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uMouse.value.copy(mouseCurrent);
  });

  return (
    <group>
      {/* Dark metallic core */}
      <mesh ref={mesh}>
        <torusKnotGeometry args={[1.6, 0.4, 150, 36, 2, 3]} />
        <meshPhysicalMaterial color="#080812" metalness={0.95} roughness={0.03} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {/* Wireframe ghost */}
      <mesh ref={wire}>
        <torusKnotGeometry args={[1.65, 0.45, 80, 18, 2, 3]} />
        <meshBasicMaterial color="#BFF549" wireframe transparent opacity={0.05} />
      </mesh>
      {/* Additive glow shell */}
      <mesh ref={glow} material={shaderMat}>
        <torusKnotGeometry args={[1.85, 0.6, 64, 12, 2, 3]} />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════
// ORBITAL RINGS
// ════════════════════════════════════════
function Rings() {
  const g = useRef<THREE.Group>(null);
  useFrame((s, d) => {
    if (!g.current) return;
    g.current.rotation.x += d * 0.04 + mouseCurrent.y * d * 0.15;
    g.current.rotation.z += d * 0.03 + mouseCurrent.x * d * 0.12;
  });
  return (
    <group ref={g}>
      {[0,1,2,3].map(i => (
        <mesh key={i} rotation={[Math.PI/2+i*0.3, i*0.7, i*0.2]}>
          <torusGeometry args={[2.8+i*0.5, 0.006, 8, 180]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.18-i*0.035} />
        </mesh>
      ))}
    </group>
  );
}

// ════════════════════════════════════════
// PARTICLES (1500 star field)
// ════════════════════════════════════════
function Particles({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const d = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const pal = ['#BFF549','#FACC15','#60A5FA','#a78bfa','#ffffff'].map(h => new THREE.Color(h));
    for (let i = 0; i < count; i++) {
      const r = 10+Math.random()*25, φ = Math.random()*Math.PI*2, θ = Math.acos(2*Math.random()-1);
      p[i*3]=r*Math.sin(θ)*Math.cos(φ); p[i*3+1]=r*Math.sin(θ)*Math.sin(φ); p[i*3+2]=r*Math.cos(θ);
      const cl=pal[Math.floor(Math.random()*pal.length)];
      c[i*3]=cl.r; c[i*3+1]=cl.g; c[i*3+2]=cl.b;
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(p, 3));
    bg.setAttribute('color', new THREE.BufferAttribute(c, 3));
    return bg;
  }, [count]);

  useFrame((s,d) => {
    if (!ref.current) return;
    ref.current.rotation.y += d*0.006+mouseCurrent.x*d*0.1;
    ref.current.rotation.x += mouseCurrent.y*d*0.06;
    const a = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < a.length; i += 3) {
      a[i+1] += Math.sin(s.clock.elapsedTime*0.4+i*0.008)*0.0015;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={ref} geometry={d}>
    <pointsMaterial size={0.045} vertexColors transparent={true} opacity={0.65} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
  </points>;
}

// ════════════════════════════════════════
// FLOATING SHARDS
// ════════════════════════════════════════
function Shards() {
  const s = useMemo(() => Array.from({length:22}, (_,i) => ({
    i, pos:[(Math.random()-0.5)*14,(Math.random()-0.5)*14,(Math.random()-0.5)*6-2] as [number,number,number],
    sp:0.4+Math.random()*0.7, sc:0.05+Math.random()*0.2,
  })), []);
  return <>{s.map(x => <Shard key={x.i} pos={x.pos} sp={x.sp} sc={x.sc} />)}</>;
}

function Shard({ pos, sp, sc }: { pos:[number,number,number]; sp:number; sc:number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(s => {
    if (!ref.current) return;
    ref.current.position.y = pos[1]+Math.sin(s.clock.elapsedTime*sp)*0.5;
    ref.current.rotation.x += 0.008; ref.current.rotation.y += 0.012;
  });
  return (
    <mesh ref={ref} position={pos} scale={sc}>
      <octahedronGeometry />
      <meshPhysicalMaterial color="#BFF549" metalness={0.7} roughness={0.3} emissive="#BFF549" emissiveIntensity={0.06} transparent opacity={0.35} />
    </mesh>
  );
}

// ════════════════════════════════════════
// CAMERA MOUSE TRACKING
// ════════════════════════════════════════
function CameraCtrl() { const { camera } = useThree(); useFrame(() => {
  camera.position.x = mouseCurrent.x*0.4; camera.position.y = mouseCurrent.y*0.25; camera.lookAt(0,0,0);
}); return null; }

// ════════════════════════════════════════
// LIGHT FOLLOW MOUSE
// ════════════════════════════════════════
function MouseLight() {
  const ref = useRef<THREE.PointLight>(null);
  useEffect(() => { const iv = setInterval(() => { if (ref.current) ref.current.position.set(mouseCurrent.x*6, mouseCurrent.y*6, 6); }, 16); return () => clearInterval(iv); }, []);
  return <pointLight ref={ref} position={[0,0,6]} intensity={0.9} color="#BFF549" />;
}

// ════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════
export default function ThreeHero() {
  const [m, setM] = useState(false);
  useEffect(() => { setM(true); }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth)*2-1;
    mouseTarget.y = -(e.clientY / window.innerHeight)*2+1;
  }, []);

  const [heroOp, setHeroOp] = useState(1);
  const [contentOp, setContentOp] = useState(0);
  useEffect(() => {
    const fn = () => {
      setHeroOp(Math.max(0, 1-window.scrollY/700));
      setContentOp(Math.min(1, window.scrollY/350));
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (!m) return null;

  return (
    <>
      {/* ─── 3D HERO ─── */}
      <div className="fixed inset-0 z-[1] overflow-hidden" onPointerMove={onMove} style={{ background: '#050510', opacity: heroOp, transition: 'opacity 0.3s ease' }}>
        <Canvas camera={{ position:[0,0,7.5], fov:50, near:0.1, far:80 }} dpr={[1,1.5]} gl={{ antialias:true, alpha:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.2 }}>
          <CameraCtrl />
          <ambientLight intensity={0.12} />
          <pointLight position={[8,8,8]} intensity={1.2} color="#BFF549" />
          <pointLight position={[-8,-4,4]} intensity={0.6} color="#FACC15" />
          <pointLight position={[0,6,-4]} intensity={0.3} color="#60A5FA" />
          <MouseLight />
          <fog attach="fog" args={['#050510', 12, 25]} />

          <HeroKnot />
          <Rings />
          <Particles count={1500} />
          <Shards />
        </Canvas>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[2]" style={{ height:'40vh', background:'linear-gradient(to top,#050510 0%,transparent 100%)' }} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-[3]" style={{ background:'radial-gradient(ellipse at center,transparent 38%,rgba(5,5,16,0.65) 100%)' }} />

        {/* Title */}
        <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center pointer-events-none select-none" style={{ perspective:'1000px' }}>
          <h1 style={{
            fontFamily:"'Cinzel Decorative','Cinzel',serif", fontWeight:900, fontSize:'clamp(3.5rem,11vw,10rem)',
            lineHeight:0.85, letterSpacing:'0.12em',
            background:'linear-gradient(180deg,#FFD700 0%,#D4AF37 35%,#B8860B 65%,#8B6914 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            filter:'drop-shadow(0 0 50px rgba(212,175,55,0.6)) drop-shadow(0 0 100px rgba(255,215,0,0.3))',
            transform:`rotateX(${mouseCurrent.y*-6}deg) rotateY(${mouseCurrent.x*6}deg) translateZ(50px)`,
            transition:'transform 0.12s ease-out',
          }}>LRYS</h1>
          <p style={{
            fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(0.6rem,1.3vw,1rem)',
            color:'rgba(191,245,73,0.45)', letterSpacing:'0.35em', textTransform:'uppercase',
            marginTop:16, textShadow:'0 0 25px rgba(191,245,73,0.3)',
          }}>Kings Dripping Swag • 2130</p>
          <div style={{ width:`${50+Math.abs(mouseCurrent.x)*40}px`, height:'1px',
            background:'linear-gradient(90deg,transparent,#BFF549,#FFD700,#BFF549,transparent)',
            marginTop:16, boxShadow:'0 0 12px #BFF54980', borderRadius:1 }} />
          <p style={{
            fontFamily:"'JetBrains Mono',monospace", fontSize:'0.55rem',
            color:'rgba(255,255,255,0.12)', letterSpacing:'0.2em', marginTop:10,
          }}>MOVE YOUR MOUSE — SPIN THE WORLD</p>
        </div>
      </div>

      {/* ─── CONTENT BELOW ─── */}
      <div style={{ opacity: contentOp, transition: 'opacity 0.5s ease', position: 'relative', zIndex: 10 }}>
        <div style={{ height: '100vh' }} />
        {/* Spacer so content starts after hero fade */}
      </div>
    </>
  );
}
