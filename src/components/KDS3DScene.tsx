'use client';
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const mouse = { x: 0, y: 0 };
export const setMouse3D = (x: number, y: number) => { mouse.x = x; mouse.y = y; };

function StarField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      pos[i*3]=(Math.random()-.5)*200; pos[i*3+1]=(Math.random()-.5)*200; pos[i*3+2]=-50-Math.random()*150;
    }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); return g;
  },[]);
  useFrame((s)=>{ if(ref.current){ref.current.rotation.y=s.clock.elapsedTime*.003+mouse.x*.05; ref.current.rotation.x=Math.sin(s.clock.elapsedTime*.002)*.02+mouse.y*.03;}});
  return <points ref={ref} geometry={geo}><pointsMaterial size={.08} color="#fff" transparent opacity={.6} sizeAttenuation depthWrite={false}/></points>;
}

function Nebula({ c1='#FF6600', c2='#FF4500' }:{c1?:string;c2?:string}){
  const ref=useRef<THREE.Points>(null);
  const data=useMemo(()=>{
    const n=3000,pos=new Float32Array(n*3),col=new Float32Array(n*3);
    const a=new THREE.Color(c1),b=new THREE.Color(c2);
    for(let i=0;i<n;i++){const i3=i*3,ang=Math.random()*Math.PI*2,r=1+Math.random()*6,sp=(Math.random()-.5)*3;
      pos[i3]=Math.cos(ang)*r+(Math.random()-.5)*2;pos[i3+1]=sp+Math.sin(ang*2)*.5;pos[i3+2]=Math.sin(ang)*r+(Math.random()-.5)*2;
      const c=a.clone().lerp(b,r/6);col[i3]=c.r;col[i3+1]=c.g;col[i3+2]=c.b;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;
  },[c1,c2]);
  useFrame((s)=>{
    if(ref.current){ref.current.rotation.y=s.clock.elapsedTime*.01+mouse.x*.1;
      const p=ref.current.geometry.attributes.position.array as Float32Array;
      for(let i=0;i<p.length;i+=3)p[i+1]+=Math.sin(s.clock.elapsedTime*.3+i*.02)*.0008;
      ref.current.geometry.attributes.position.needsUpdate=true;}});
  return <points ref={ref} geometry={data}><pointsMaterial size={.05} vertexColors transparent opacity={.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false}/></points>;
}

function MorphingCore({ color='#FF6600' }:{color?:string}){
  const group=useRef<THREE.Group>(null);
  const m1=useRef<THREE.Mesh>(null);
  const m2=useRef<THREE.Mesh>(null);
  useFrame((s)=>{
    if(!group.current)return;const t=s.clock.elapsedTime;
    group.current.rotation.y=t*.05+mouse.x*.3;group.current.rotation.x=t*.03+mouse.y*.2;
    group.current.scale.setScalar(1+Math.sin(t*.5)*.08);
    if(m1.current)m1.current.rotation.y=t*.2;if(m2.current)m2.current.rotation.y=-t*.15;});
  return <group ref={group}>
    <mesh ref={m1}><icosahedronGeometry args={[1.8,2]} /><meshBasicMaterial color={color} wireframe transparent opacity={.12} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
    <mesh ref={m2}><icosahedronGeometry args={[1.2,1]} /><meshPhysicalMaterial color={color} metalness={.9} roughness={.1} emissive={color} emissiveIntensity={.15} transparent opacity={.85}/></mesh>
    <mesh><sphereGeometry args={[.4,32,32]} /><meshBasicMaterial color={color} transparent opacity={.3} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
    <mesh rotation={[Math.PI/3,0,0]}><torusGeometry args={[2.5,.008,8,128]} /><meshBasicMaterial color={color} transparent opacity={.4} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
    <mesh rotation={[0,Math.PI/4,Math.PI/6]}><torusGeometry args={[3,.005,8,128]} /><meshBasicMaterial color="#fff" transparent opacity={.15} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
  </group>;
}

function FloatingShards({ color='#FF6600', count=50 }:{color?:string;count?:number}){
  const group=useRef<THREE.Group>(null);
  const ref=useRef<Array<THREE.Mesh|null>>([]);
  const data=useMemo(()=>Array.from({length:count},()=>({scale:.03+Math.random()*.12,speed:.1+Math.random()*.3,
    radius:2.5+Math.random()*4,phase:Math.random()*Math.PI*2,tilt:(Math.random()-.5)*2})),[count]);
  useFrame((s)=>{if(!group.current)return;const t=s.clock.elapsedTime;group.current.rotation.y=t*.02;
    data.forEach((d,i)=>{if(ref.current[i]){ref.current[i].position.x=Math.cos(t*d.speed+d.phase)*d.radius;
      ref.current[i].position.z=Math.sin(t*d.speed+d.phase)*d.radius;
      ref.current[i].position.y=Math.sin((t*d.speed+d.phase)*.7)*d.tilt;
      ref.current[i].rotation.x+=.01;ref.current[i].rotation.y+=.015;}});});
  return <group ref={group}>{data.map((d,i)=>(
    <mesh key={i} ref={el=>{ref.current[i]=el}} scale={d.scale}>
      {i%3===0?<tetrahedronGeometry args={[1,0]} />:i%3===1?<octahedronGeometry args={[1,0]} />:<boxGeometry args={[1,1,.2]} />}
      <meshBasicMaterial color={color} transparent opacity={.3} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
  ))}</group>;
}

function PostFX() {
  return <EffectComposer enableNormalPass={false}>
    <Bloom intensity={1.5} luminanceThreshold={.85} luminanceSmoothing={.95} mipmapBlur radius={.4}/>
    <ChromaticAberration offset={new THREE.Vector2(.0015,.0015)}/>
    <Vignette eskil={false} offset={.15} darkness={.4}/>
    <Noise opacity={.03}/></EffectComposer>;
}

function Scene({ palettes = 0 }:{palettes?:number}) {
  const pal=[['#FF6600','#FF4500'],['#565656','#909090'],['#3377CC','#44CC77'],['#BFF549','#BFF549']];
  const c=pal[palettes%pal.length];
  return <>
    <ambientLight intensity={.06}/><pointLight position={[5,5,5]} intensity={2} color={c[1]} distance={15}/>
    <pointLight position={[-5,-3,3]} intensity={.8} color="#60A5FA" distance={12}/>
    <pointLight position={[0,0,-3]} intensity={.4} color={c[0]} distance={8}/>
    <StarField/><Nebula c1={c[0]} c2={c[1]} /><MorphingCore color={c[0]} /><FloatingShards color={c[0]} count={50}/><PostFX/></>;
}

export default function KDS3DScene({ palette=0 }:{palette?:number}){
  return <Canvas key={palette} camera={{position:[0,0,6],fov:50,near:.1,far:100}} dpr={[1,1.5]}
    gl={{antialias:false,alpha:false,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.25}}>
    <Scene palettes={palette}/></Canvas>;
}
