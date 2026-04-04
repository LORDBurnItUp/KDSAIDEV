'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Vignette, Noise, HueSaturation } from '@react-three/postprocessing';
import * as THREE from 'three';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// Shared mouse state
const mouseVec = { x: 0, y: 0 };

// ═══════════════════════════════════════════════════════
// 🌌 SOLAR SYSTEM CHAPTERS — 10 cinematic worlds
// ═══════════════════════════════════════════════════════
const chapters = [
  { name: 'THE SUN', subtitle: 'Where it all begins', planetColor: '#FF6600', bloomColor: '#FF4500', bgDark: '#0a0200', particleColor: '#FF8833', particleCount: 1200, particleSize: 0.07, particleMode: 'fire', glowIntensity: 3.0, bloom: 2.0, content: 'You are entering the KDS solar system. Design meets intelligence in 3D space.', stats: null },
  { name: 'MERCURY', subtitle: 'Speed and precision', planetColor: '#909090', bloomColor: '#B0B0B0', bgDark: '#050508', particleColor: '#C0C0C0', particleCount: 300, particleSize: 0.012, particleMode: 'fastOrbit', glowIntensity: 0.4, bloom: 0.3, content: 'Built for speed. Every millisecond counts in the race to build the future.', stats: null },
  { name: 'VENUS', subtitle: 'The clouded beauty', planetColor: '#E8C56D', bloomColor: '#F0D080', bgDark: '#0a0800', particleColor: '#F0D080', particleCount: 500, particleSize: 0.04, particleMode: 'cloud', glowIntensity: 0.7, bloom: 0.5, content: 'Shrouded in golden clouds. KDS reveals hidden brilliance beneath the surface.', stats: null },
  { name: 'EARTH', subtitle: 'Home of KDS', planetColor: '#3377CC', bloomColor: '#44CC77', bgDark: '#020508', particleColor: '#44CC77', particleCount: 600, particleSize: 0.025, particleMode: 'life', glowIntensity: 0.9, bloom: 0.7, content: '12.8K+ developers from around the world. The hub where AI builders connect.', stats: [{ n: '12.8K', l: 'Members' }, { n: '847', l: 'Active Today' }, { n: '99.7%', l: 'Uptime' }] },
  { name: 'MARS', subtitle: 'The red frontier', planetColor: '#CC3322', bloomColor: '#FF4533', bgDark: '#080200', particleColor: '#DD5533', particleCount: 800, particleSize: 0.035, particleMode: 'storm', glowIntensity: 0.9, bloom: 0.6, content: 'The next frontier. KDS is colonizing the future of AI communities.', stats: null },
  { name: 'JUPITER', subtitle: 'King of planets', planetColor: '#C8A060', bloomColor: '#D4B878', bgDark: '#080600', particleColor: '#D4B070', particleCount: 900, particleSize: 0.022, particleMode: 'bands', glowIntensity: 0.6, bloom: 0.4, content: 'The Great Red Spot of AI. Largest community hub in the solar system.', stats: [{ n: '6', l: 'Features' }, { n: '99', l: 'Pages' }, { n: '∞', l: 'Scale' }] },
  { name: 'SATURN', subtitle: 'The ringed giant', planetColor: '#D4B878', bloomColor: '#E8D088', bgDark: '#060600', particleColor: '#E8D088', particleCount: 700, particleSize: 0.015, particleMode: 'ringDisk', glowIntensity: 0.7, bloom: 0.5, hasRing: true, content: 'Rings of opportunity connecting creators, builders, and dreamers.', stats: null },
  { name: 'URANUS', subtitle: 'The tilted one', planetColor: '#77BBCC', bloomColor: '#99E0E8', bgDark: '#000408', particleColor: '#99E0E8', particleCount: 350, particleSize: 0.025, particleMode: 'tilted', glowIntensity: 0.5, bloom: 0.4, content: 'Think different. KDS approaches everything from a new angle.', stats: null },
  { name: 'NEPTUNE', subtitle: 'The deep mystery', planetColor: '#2255DD', bloomColor: '#3366FF', bgDark: '#000008', particleColor: '#3366EE', particleCount: 550, particleSize: 0.035, particleMode: 'jets', glowIntensity: 0.8, bloom: 0.6, content: 'The final frontier. KDS pushes the boundaries of what an AI community can be.', stats: null },
  { name: 'BEYOND', subtitle: 'Welcome home', planetColor: '#BFF549', bloomColor: '#BFF549', bgDark: '#030510', particleColor: '#BFF549', particleCount: 1000, particleSize: 0.03, particleMode: 'constellation', glowIntensity: 1.5, bloom: 1.5, content: 'Build, earn, and connect. Welcome to 2130.', stats: null, link: '/community' },
];

// ═══════════════════════════════════════════════════════
// 🌟 DYNAMIC STAR FIELD with twinkling
// ═══════════════════════════════════════════════════════
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(6000 * 3);
    const sizes = new Float32Array(6000);
    const phases = new Float32Array(6000);
    for (let i = 0; i < 6000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 250;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 250;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 250;
      sizes[i] = 0.04 + Math.random() * 0.12;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    return g;
  }, []);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.002;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.001) * 0.015;
    }
  });
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.06} color="#FFFFFF" transparent={true} opacity={0.5} sizeAttenuation={true} depthWrite={false} /></points>;
}

// ═══════════════════════════════════════════════════════
// 🌍 PLANET — custom shader with volumetric feel
// ═══════════════════════════════════════════════════════
function Planet({ color, glow, cameraZ, bloomColor, hasRing }: { color: string, glow: number, cameraZ: number, bloomColor: string, hasRing?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const lensFlareRef = useRef<THREE.Mesh>(null);
  const planetOpacity = Math.min(1, Math.abs(cameraZ) / 1.8);
  const planetScale = Math.max(0.2, 1 - (1 - planetOpacity) * 0.8);

  // Custom shaders
  const { vs, fs } = useMemo(() => ({
    vs: `
      uniform float uTime, uOpacity, uPlanetScale;
      varying vec3 vNormal, vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec3 pos = position * uPlanetScale;
        // Subtle organic surface displacement
        pos += normal * sin(pos.x * 4.0 + uTime * 0.8) * 0.04;
        pos += normal * cos(pos.y * 3.0 + uTime * 0.6) * 0.03;
        pos += normal * sin(pos.z * 5.0 + uTime * 1.2) * 0.02;
        vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fs: `
      uniform vec3 uColor, uBloomColor;
      uniform float uTime, uOpacity;
      varying vec3 vNormal, vWorldPos;
      varying vec2 vUv;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);
        
        // Animated surface detail (procedural noise)
        float detail = sin(vUv.x * 20.0 + uTime * 0.5) * sin(vUv.y * 15.0 + uTime * 0.4) * 0.15;
        detail += sin(vUv.x * 8.0 - uTime * 0.3 + vUv.y * 12.0) * 0.1;
        vec3 surfaceColor = uColor + uColor * detail;
        
        // Atmospheric scattering
        float atmosphere = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 5.0);
        vec3 atmColor = mix(uColor, uBloomColor, 0.5) * atmosphere * 1.2;
        
        // Combine
        vec3 finalColor = surfaceColor + fresnel * uBloomColor * 0.6 + atmColor;
        float alpha = mix(atmosphere * 0.4 + 0.8, 1.0, 1.0 - fresnel);
        alpha *= uOpacity;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  }), []);

  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
      meshRef.current.scale.setScalar(planetScale);
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uOpacity.value = planetOpacity;
      mat.uniforms.uPlanetScale.value = 1.0;
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.rotation.y -= delta * 0.012;
      outerGlowRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.06 + (1 - planetOpacity) * 1.0);
      (outerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04 * planetOpacity + (1 - planetOpacity) * 0.12;
    }
    // Lens flare intensity increases as you approach
    if (lensFlareRef.current) {
      const intensity = Math.max(0, 1 - Math.abs(cameraZ) / 2.5);
      lensFlareRef.current.visible = intensity > 0.1;
      if (lensFlareRef.current.visible) {
        lensFlareRef.current.scale.setScalar(intensity * 3.0);
        (lensFlareRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.15;
      }
    }
  });

  return (
    <group>
      {/* Outer volumetric glow */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.04} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Lens flare cross */}
      <mesh ref={lensFlareRef} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={bloomColor} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Main planet with procedural surface */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={vs} fragmentShader={fs} uniforms={{
          uColor: { value: new THREE.Color(color) },
          uBloomColor: { value: new THREE.Color(bloomColor) },
          uTime: { value: 0 },
          uOpacity: { value: planetOpacity },
          uPlanetScale: { value: 1.0 },
        }} transparent={true} side={THREE.FrontSide} />
      </mesh>
      {/* Saturn ring with glow */}
      {hasRing && <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[1.35, 2.8, 128]} />
        <meshStandardMaterial side={THREE.DoubleSide} transparent={true} opacity={0.5 * planetOpacity} metalness={0.8} roughness={0.25} color={color}>
          <color attach="color" args={color} />
        </meshStandardMaterial>
      </mesh>}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// ✨ PARTICLE SYSTEMS — scatter on flythrough
// ═══════════════════════════════════════════════════════
function PlanetParticles({ mode, color, count, size, cameraZ }: { mode: string, color: string, count: number, size: number, cameraZ: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random();
      const angle = Math.random() * Math.PI * 2;
      switch (mode) {
        case 'fire': {
          const phi = Math.acos(2 * r - 1), rad = 1.5 + Math.random() * 4;
          pos[i3] = rad * Math.sin(phi) * Math.cos(angle); pos[i3+1] = rad * Math.sin(phi) * Math.sin(angle); pos[i3+2] = rad * Math.cos(phi);
          vel[i3] = pos[i3] * 0.004; vel[i3+1] = pos[i3+1] * 0.004; vel[i3+2] = pos[i3+2] * 0.004; break;
        }
        case 'fastOrbit': {
          const rad = 1.4 + r * 1.5;
          pos[i3] = Math.cos(angle) * rad; pos[i3+1] = (Math.random()-0.5) * 0.3; pos[i3+2] = Math.sin(angle) * rad;
          vel[i3] = -Math.sin(angle)*0.015; vel[i3+2] = Math.cos(angle)*0.015; break;
        }
        case 'cloud': {
          const rad = 1.5 + r * 2;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (Math.random()-0.5)*1.8; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'life': {
          const rad = 1.5 + r * 2.5;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = Math.sin(angle*2)*0.3; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'storm': {
          const rad = 1.2 + r * 5;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (Math.random()-0.5)*rad*0.9; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'bands': {
          const band = Math.floor(Math.random()*8), rad = 1.3 + band*0.35;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (band-4)*0.25; pos[i3+2] = Math.sin(angle)*rad*0.9; break;
        }
        case 'ringDisk': {
          const rad = 1.5 + r * 3;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (Math.random()-0.5)*0.3; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'tilted': {
          const rad = 1.4 + r * 2.5;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = Math.sin(angle)*rad; pos[i3+2] = (Math.random()-0.5)*0.5; break;
        }
        case 'jets': {
          const rad = 1.3 + r * 2;
          pos[i3] = Math.cos(angle)*rad*0.5; pos[i3+1] = (Math.random()-0.5)*6; pos[i3+2] = Math.sin(angle)*rad*0.5; break;
        }
        default:
          pos[i3] = (Math.random()-0.5)*5; pos[i3+1] = (Math.random()-0.5)*5; pos[i3+2] = (Math.random()-0.5)*5;
      }
    }
    return { positions: pos, velocities: vel };
  }, [mode, count]);

  const colors = useMemo(() => {
    const c = new THREE.Color(color);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) col[i] = Math.max(0, Math.min(1, c.r + (Math.random() - 0.5) * 0.2));
    return col;
  }, [color, count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    const v = velocities;
    const t = state.clock.elapsedTime;

    // SCATTER EXPLOSION when camera approaches z=0
    const scatterIntensity = Math.max(0, 1 - Math.abs(cameraZ) / 0.6);
    const scatterForce = scatterIntensity * 18;
    const turb = scatterForce * 0.3;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      if (scatterForce > 0.2) {
        const dx = p[i3], dy = p[i3+1], dz = p[i3+2];
        const dist = Math.max(0.01, Math.sqrt(dx*dx + dy*dy + dz*dz));
        // Expansive scatter
        v[i3] += (dx/dist) * scatterForce * delta + (Math.random()-0.5) * turb;
        v[i3+1] += (dy/dist) * scatterForce * delta + (Math.random()-0.5) * turb;
        v[i3+2] += (dz/dist) * scatterForce * delta + (Math.random()-0.5) * turb;
      }

      switch (mode) {
        case 'fire':
          p[i3]+=v[i3]; p[i3+1]+=v[i3+1]; p[i3+2]+=v[i3+2];
          if (p[i3]*p[i3]+p[i3+1]*p[i3+1]+p[i3+2]*p[i3+2]>25) {
            const a=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=1.5;
            p[i3]=r*Math.sin(ph)*Math.cos(a);p[i3+1]=r*Math.sin(ph)*Math.sin(a);p[i3+2]=r*Math.cos(ph);
            v[i3]=p[i3]*0.004;v[i3+1]=p[i3+1]*0.004;v[i3+2]=p[i3+2]*0.004;
          } break;
        case 'fastOrbit': { const a=Math.atan2(p[i3+2],p[i3])+delta*(2+Math.sin(i*0.4)*0.4);const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r; break; }
        case 'cloud': { const a=Math.atan2(p[i3+2],p[i3])+delta*0.15;const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;p[i3+1]+=Math.sin(t*0.3+i*0.08)*0.001; break; }
        case 'life': p[i3+1]=Math.sin(t*0.6+i*0.04)*(0.25+Math.abs(p[i3])*0.1); break;
        case 'storm': { const a=Math.atan2(p[i3+2],p[i3])+delta*(0.25+(Math.random()-0.5)*0.5);const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break; }
        case 'bands': { const a=Math.atan2(p[i3+2],p[i3])+delta*0.2*(Math.sin(p[i3+1]*3)*0.6+1);const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break; }
        case 'ringDisk': { const a=Math.atan2(p[i3+2],p[i3])+delta*(0.4/(Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2])+0.5));const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break; }
        case 'tilted': { const a=Math.atan2(p[i3+1],p[i3])+delta*0.25;const r=Math.sqrt(p[i3]*p[i3]+p[i3+1]*p[i3+1]);p[i3]=Math.cos(a)*r;p[i3+1]=Math.sin(a)*r;break; }
        case 'jets': p[i3+1]+=Math.sin(t*0.35+i)*0.025;p[i3+1]=((p[i3+1]+3)%6)-3;break;
        default: break;
      }

      // Heavy damping after scatter
      if (scatterIntensity > 0.1) { const d = 1 - scatterIntensity * 0.15; v[i3]*=d;v[i3+1]*=d;v[i3+2]*=d; }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)).setAttribute('color', new THREE.BufferAttribute(colors, 3))}>
      <pointsMaterial size={size * 2} vertexColors={true} transparent={true} opacity={0.9} sizeAttenuation={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ═══════════════════════════════════════════════════════
// 🎥 FLYTHROUGH CAMERA
// ═══════════════════════════════════════════════════════
function FlythroughCamera({ chapterProgress }: { chapterProgress: number }) {
  const { camera } = useThree();
  const state = useRef({ z: 5, fov: 50 });
  useFrame(() => {
    const c = camera as THREE.PerspectiveCamera;
    const targetZ = 5 - chapterProgress * 10;
    state.current.z += (targetZ - state.current.z) * 0.06;
    // Dramatic FOV change when passing through
    const proximity = 1 - Math.abs(chapterProgress - 0.5) * 2;
    const targetFov = 38 + proximity * 28;
    state.current.fov += (targetFov - state.current.fov) * 0.06;
    c.position.z = state.current.z;
    c.position.x += (mouseVec.x * 0.2 * proximity - c.position.x) * 0.025;
    c.position.y += (-mouseVec.y * 0.15 * proximity - c.position.y) * 0.025;
    c.fov = state.current.fov;
    c.lookAt(0, 0, -5);
    c.updateMatrix(); c.updateProjectionMatrix();
  });
  return null;
}

// ═══════════════════════════════════════════════════════
// 🌈 POST-PROCESSING
// ═══════════════════════════════════════════════════════
function PostProcessing({ bloom, chapterProgress, cameraZ }: { bloom: number, chapterProgress: number, cameraZ: number }) {
  const proximity = 1 - Math.abs(chapterProgress - 0.5) * 2;
  const chromaticAmount = proximity * 0.003;
  return (
    <EffectComposer disableNormalPass multisampling={2}>
      <Bloom intensity={bloom * 0.8} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur radius={0.5} />
      <DepthOfField focusDistance={Math.max(0, Math.abs(cameraZ) - 0.8) * 0.15} focalLength={0.02 + proximity * 0.03} bokehScale={proximity * 3} />
      <ChromaticAberration offset={new THREE.Vector2(chromaticAmount, chromaticAmount)} />
      <Vignette eskil={false} offset={0.1} darkness={0.35} />
      <Noise opacity={0.025 + proximity * 0.015} />
    </EffectComposer>
  );
}

// ═══════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════
function Scene({ chapter, cameraZ, chapterProgress }: { chapter: typeof chapters[0], cameraZ: number, chapterProgress: number }) {
  return (
    <>
      <FlythroughCamera chapterProgress={chapterProgress} />
      <ambientLight intensity={chapter.glowIntensity * 0.06} />
      <pointLight position={[0, 0, 0]} intensity={chapter.glowIntensity * (0.3 + Math.abs(cameraZ) * 0.1)} color={chapter.planetColor} distance={12} />
      <pointLight position={[cameraZ > 0 ? 6 : -6, 5, 5]} intensity={0.5} color={chapter.particleColor} distance={14} />
      <pointLight position={[-4, -3, 3]} intensity={0.25} color="#5555AA" distance={8} />
      <pointLight position={[0, 0, cameraZ > 0 ? 3 : -3]} intensity={0.3 * (1 - Math.abs(cameraZ) / 3)} color={chapter.bloomColor} distance={6} />
      <StarField />
      <Planet color={chapter.planetColor} glow={chapter.glowIntensity} cameraZ={cameraZ} bloomColor={chapter.bloomColor} hasRing={chapter.hasRing} />
      <PlanetParticles mode={chapter.particleMode} color={chapter.particleColor} count={chapter.particleCount} size={chapter.particleSize} cameraZ={cameraZ} />
      <PostProcessing bloom={chapter.bloom} chapterProgress={chapterProgress} cameraZ={cameraZ} />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function HomePage() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [cameraZ, setCameraZ] = useState(5);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tickT = setInterval(() => setTime(new Date()), 1000);
    let raf: number;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const totalProgress = Math.min(window.scrollY / max, 0.999);
      const ch = Math.min(chapters.length - 1, Math.floor(totalProgress * chapters.length));
      const progress = (totalProgress * chapters.length) - ch;
      setActiveChapter(ch); setChapterProgress(progress); setCameraZ(5 - progress * 10);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => { clearInterval(tickT); cancelAnimationFrame(raf); };
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
  const contentOpacity = Math.min(1, chapterProgress < 0.15 ? chapterProgress / 0.15 : chapterProgress > 0.85 ? (1 - chapterProgress) / 0.15 : 1);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: chapter.bgDark, transition: 'background 0.6s ease' }} onPointerMove={handlePointerMove}>
        <Canvas key={activeChapter} camera={{ position: [0, 0, 5], fov: 38, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.25 }}>
          <Scene chapter={chapter} cameraZ={cameraZ} chapterProgress={chapterProgress} />
        </Canvas>
        {/* Cinematic bars */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 5, pointerEvents: 'none' }} />
      </div>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(5,5,10,0.08)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.015)', height: 34, display: 'flex', alignItems: 'center', padding: '0 12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: `${chapter.bloomColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: chapter.bloomColor, fontWeight: 900, fontSize: 7, transition: 'all 0.5s' }}>K</div>
          <span style={{ fontWeight: 800, fontSize: 10 }}><span style={{ color: chapter.bloomColor, transition: 'color 0.5s' }}>{chapter.name}</span><span style={{ color: 'rgba(255,255,255,0.1)', fontWeight: 400, fontSize: 7, marginLeft: 4 }}>KDS</span></span>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {['Community', 'Dashboard'].map(n => (
            <a key={n} href={n === 'Community' ? '/community' : '/dashboard'} style={{ padding: '2px 6px', borderRadius: 3, fontSize: 6.5, fontWeight: 500, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>{n}</a>
          ))}
        </div>
      </header>

      <nav style={{ position: 'fixed', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {chapters.map((p, i) => (
          <button key={i} onClick={() => scrollTo(i)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 0' }}>
            <span style={{ position: 'relative', width: activeChapter === i ? 5 : 3.5, height: activeChapter === i ? 5 : 3.5, borderRadius: '50%', background: activeChapter === i ? p.bloomColor : 'rgba(255,255,255,0.04)', transition: 'all 0.3s', boxShadow: activeChapter === i ? `0 0 8px ${p.bloomColor}30` : 'none' }}>
              {activeChapter === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${p.bloomColor}15` }} />}
            </span>
          </button>
        ))}
      </nav>

      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 460, opacity: contentOpacity, transform: `translateY(${(1 - contentOpacity) * 15}px)`, transition: 'opacity 0.3s ease, transform 0.3s ease', pointerEvents: contentOpacity > 0.3 ? 'auto' : 'none' }}>
          {contentOpacity > 0.5 && (
            <>
              <span style={{ color: `${chapter.bloomColor}20`, fontSize: 6.5, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase' }}>{chapter.subtitle}</span>
              <h2 style={{ color: activeChapter === 0 || activeChapter === 9 ? 'transparent' : 'rgba(255,255,255,0.85)', fontSize: activeChapter === 0 ? 'clamp(2.2rem, 7vw, 4.5rem)' : 'clamp(1.3rem, 3.5vw, 2.5rem)', fontWeight: 900, marginTop: activeChapter === 0 ? 3 : 3, marginBottom: activeChapter === 0 ? 6 : 5, lineHeight: 0.85,
                ...(activeChapter === 0 || activeChapter === 9 ? { background: `linear-gradient(180deg, ${chapter.bloomColor} 0%, ${chapter.planetColor} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 30px ${chapter.bloomColor}40)` } : {}) }}>
                {chapter.name}
              </h2>
              {activeChapter !== 0 && <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${chapter.bloomColor}60, transparent)`, margin: '0 auto 8px' }} />}
              <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, lineHeight: 1.7, maxWidth: 360, margin: '0 auto 10px' }}>{chapter.content}</p>
              {chapter.stats && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 10 }}>
                  {chapter.stats.map((s: { n: string, l: string }, si: number) => (
                    <div key={si} style={{ textAlign: 'center' }}>
                      <div style={{ color: chapter.bloomColor, fontSize: 16, fontWeight: 800 }}>{s.n}</div>
                      <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: 5.5, letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
              {chapter.link && <a href={chapter.link} style={{ display: 'inline-block', padding: '7px 20px', background: `${chapter.bloomColor}05`, border: `1px solid ${chapter.bloomColor}15`, color: chapter.bloomColor, borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none' }}>
                {activeChapter === 9 ? 'JOIN KDS →' : 'Explore →'}</a>}
              {activeChapter < 9 && !chapter.link && <div style={{ marginTop: 8, animation: 'mcB 2s ease-in-out infinite', color: 'rgba(255,255,255,0.05)', fontSize: 8 }}>↓ Keep scrolling</div>}
            </>
          )}
        </div>
      </div>

      <AmbientSound />
      <style>{`@keyframes mcB{0%,100%{transform:translateY(0);opacity:.05}50%{transform:translateY(5px);opacity:.12}}`}</style>
    </>
  );
}
