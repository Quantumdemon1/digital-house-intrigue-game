 /**
  * @file BackyardArea.tsx
  * @description Backyard/Pool area with competition elements for Big Brother House
  */
 
 import React, { useMemo, useRef } from 'react';
 import * as THREE from 'three';
 import { useFrame } from '@react-three/fiber';
 import { LEDCoveLighting } from './HouseFurnitureExpanded';
 
 interface BackyardProps {
   position: [number, number, number];
   eventColor?: string;
 }
 
 /**
  * Animated water material for pool
  */
 const WaterMaterial: React.FC<{ opacity?: number }> = ({ opacity = 0.85 }) => {
   const materialRef = useRef<THREE.ShaderMaterial>(null);
   
   const uniforms = useMemo(() => ({
     time: { value: 0 },
     color1: { value: new THREE.Color('#3b82f6') },
     color2: { value: new THREE.Color('#0ea5e9') },
     opacity: { value: opacity },
   }), [opacity]);
   
   useFrame(({ clock }) => {
     if (materialRef.current) {
       materialRef.current.uniforms.time.value = clock.getElapsedTime();
     }
   });
   
   return (
     <shaderMaterial
       ref={materialRef}
       uniforms={uniforms}
       transparent
       vertexShader={`
         varying vec2 vUv;
         uniform float time;
         void main() {
           vUv = uv;
           vec3 pos = position;
           pos.y += sin(pos.x * 2.0 + time) * 0.03;
           pos.y += sin(pos.z * 1.5 + time * 1.2) * 0.02;
           gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
         }
       `}
       fragmentShader={`
         varying vec2 vUv;
         uniform vec3 color1;
         uniform vec3 color2;
         uniform float time;
         uniform float opacity;
         void main() {
           float wave = sin(vUv.x * 8.0 + time) * 0.5 + 0.5;
           vec3 color = mix(color1, color2, wave);
           gl_FragColor = vec4(color, opacity);
         }
       `}
     />
   );
 };
 
 /**
  * Swimming Pool with animated water
  */
 export const SwimmingPool: React.FC<{ position: [number, number, number] }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Pool basin */}
       <mesh position={[0, -0.6, 0]}>
         <boxGeometry args={[8, 1.2, 4]} />
         <meshStandardMaterial color="#0c4a6e" roughness={0.3} />
       </mesh>
       
       {/* Pool edge/coping */}
       <mesh position={[0, 0.05, 0]}>
         <boxGeometry args={[8.4, 0.1, 4.4]} />
         <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
       </mesh>
       
       {/* Water surface */}
       <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
         <planeGeometry args={[7.8, 3.8, 32, 32]} />
         <WaterMaterial />
       </mesh>
       
       {/* Pool LED edge lighting */}
       <LEDCoveLighting position={[0, -0.5, 0]} width={7.6} depth={3.6} color="#0ea5e9" />
       
       {/* Pool ladder */}
       <group position={[3.8, 0, 0]}>
         {[0, 0.4].map((z, i) => (
           <mesh key={i} position={[0, 0.4, z - 0.2]}>
             <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
             <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
           </mesh>
         ))}
         {[0.2, 0.5, 0.8].map((y, i) => (
           <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
             <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
           </mesh>
         ))}
       </group>
     </group>
   );
 };
 
 /**
  * Hot Tub with bubbling effect
  */
 export const HotTub: React.FC<{ position: [number, number, number] }> = ({ position }) => {
   const bubblesRef = useRef<THREE.Points>(null);
   
   useFrame(({ clock }) => {
     if (bubblesRef.current) {
       const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
       for (let i = 1; i < positions.length; i += 3) {
         positions[i] += 0.02;
         if (positions[i] > 0.3) {
           positions[i] = 0;
         }
       }
       bubblesRef.current.geometry.attributes.position.needsUpdate = true;
     }
   });
   
   const bubblePositions = useMemo(() => {
     const positions = [];
     for (let i = 0; i < 50; i++) {
       positions.push(
         (Math.random() - 0.5) * 2,
         Math.random() * 0.3,
         (Math.random() - 0.5) * 2
       );
     }
     return new Float32Array(positions);
   }, []);
   
   return (
     <group position={position}>
       {/* Wood surround */}
       <mesh position={[0, 0.2, 0]}>
         <cylinderGeometry args={[1.5, 1.5, 0.5, 24]} />
         <meshStandardMaterial color="#78350f" roughness={0.8} />
       </mesh>
       
       {/* Tub interior */}
       <mesh position={[0, 0.1, 0]}>
         <cylinderGeometry args={[1.3, 1.3, 0.6, 24]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.3} />
       </mesh>
       
       {/* Water surface */}
       <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
         <circleGeometry args={[1.2, 24]} />
         <WaterMaterial opacity={0.9} />
       </mesh>
       
       {/* Bubbles */}
       <points ref={bubblesRef} position={[0, 0.1, 0]}>
         <bufferGeometry>
           <bufferAttribute
             attach="attributes-position"
             count={50}
             array={bubblePositions}
             itemSize={3}
           />
         </bufferGeometry>
         <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.6} />
       </points>
       
       {/* Underwater LED */}
       <pointLight position={[0, 0, 0]} intensity={0.3} color="#3b82f6" distance={3} />
     </group>
   );
 };
 
 /**
  * Pool Lounger with umbrella
  */
 export const PoolLounge: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ 
   position, 
   rotation = [0, 0, 0] 
 }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* Lounger frame */}
       <mesh position={[0, 0.25, 0]}>
         <boxGeometry args={[0.8, 0.1, 2]} />
         <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
       </mesh>
       
       {/* Back rest (angled) */}
       <mesh position={[0, 0.5, -0.7]} rotation={[0.4, 0, 0]}>
         <boxGeometry args={[0.7, 0.05, 0.6]} />
         <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
       </mesh>
       
       {/* Cushion */}
       <mesh position={[0, 0.32, 0.1]}>
         <boxGeometry args={[0.7, 0.08, 1.6]} />
         <meshStandardMaterial color="#fbbf24" roughness={0.8} />
       </mesh>
       
       {/* Legs */}
       {[[-0.35, -0.8], [0.35, -0.8], [-0.35, 0.8], [0.35, 0.8]].map(([x, z], i) => (
         <mesh key={i} position={[x, 0.1, z]}>
           <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
           <meshStandardMaterial color="#a3a3a3" metalness={0.6} />
         </mesh>
       ))}
       
       {/* Umbrella pole */}
       <mesh position={[0, 1.5, -1.5]}>
         <cylinderGeometry args={[0.03, 0.03, 2.5, 8]} />
         <meshStandardMaterial color="#a3a3a3" metalness={0.5} />
       </mesh>
       
       {/* Umbrella canopy */}
       <mesh position={[0, 2.6, -1.5]} rotation={[0.1, 0, 0]}>
         <coneGeometry args={[1.2, 0.4, 8]} />
         <meshStandardMaterial color="#dc2626" roughness={0.7} side={THREE.DoubleSide} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Competition Podium for houseguests
  */
 export const CompetitionPodium: React.FC<{ 
   position: [number, number, number]; 
   rotation?: [number, number, number];
   playerNumber?: number;
   isActive?: boolean;
 }> = ({ position, rotation = [0, 0, 0], playerNumber = 1, isActive = false }) => {
   const buttonRef = useRef<THREE.Mesh>(null);
   
   useFrame(({ clock }) => {
     if (buttonRef.current && isActive) {
       buttonRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.1);
     }
   });
   
   return (
     <group position={position} rotation={rotation}>
       {/* Podium base */}
       <mesh position={[0, 0.4, 0]}>
         <cylinderGeometry args={[0.5, 0.6, 0.8, 6]} />
         <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
       </mesh>
       
       {/* Podium top */}
       <mesh position={[0, 0.85, 0]}>
         <cylinderGeometry args={[0.55, 0.5, 0.1, 6]} />
         <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.4} />
       </mesh>
       
       {/* Buzzer button */}
       <mesh ref={buttonRef} position={[0, 1, 0]}>
         <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
         <meshStandardMaterial 
           color={isActive ? '#22c55e' : '#dc2626'} 
           emissive={isActive ? '#22c55e' : '#dc2626'}
           emissiveIntensity={isActive ? 0.5 : 0.2}
         />
       </mesh>
       
       {/* Player number display */}
       <mesh position={[0, 0.4, 0.35]} rotation={[0, 0, 0]}>
         <planeGeometry args={[0.3, 0.3]} />
         <meshStandardMaterial 
           color="#fbbf24" 
           emissive="#fbbf24"
           emissiveIntensity={0.3}
         />
       </mesh>
       
       {/* LED ring at base */}
       <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
         <ringGeometry args={[0.55, 0.65, 24]} />
         <meshStandardMaterial 
           color={isActive ? '#22c55e' : '#3b82f6'} 
           emissive={isActive ? '#22c55e' : '#3b82f6'}
           emissiveIntensity={0.4}
         />
       </mesh>
     </group>
   );
 };
 
 /**
  * Competition Platform with multiple podiums
  */
 export const CompetitionPlatform: React.FC<{ position: [number, number, number] }> = ({ position }) => {
   const podiumCount = 8;
   
   return (
     <group position={position}>
       {/* Platform base */}
       <mesh position={[0, 0.15, 0]}>
         <boxGeometry args={[14, 0.3, 6]} />
         <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} />
       </mesh>
       
       {/* Platform edge lighting */}
       <LEDCoveLighting position={[0, 0.05, 0]} width={14} depth={6} color="#fbbf24" />
       
       {/* Podiums in semi-circle arrangement */}
       {Array.from({ length: podiumCount }, (_, i) => {
         const angle = (Math.PI / (podiumCount + 1)) * (i + 1);
         const x = Math.cos(angle) * 5;
         const z = Math.sin(angle) * 2 - 1;
         return (
           <CompetitionPodium 
             key={i}
             position={[x, 0.3, z]}
             rotation={[0, -angle + Math.PI / 2, 0]}
             playerNumber={i + 1}
           />
         );
       })}
       
       {/* Stage lights above */}
       {[-4, 0, 4].map((x, i) => (
         <group key={i} position={[x, 4, 0]}>
           <mesh>
             <boxGeometry args={[0.4, 0.3, 0.3]} />
             <meshStandardMaterial color="#1a1a1a" />
           </mesh>
           <spotLight 
             position={[0, -0.2, 0]} 
             angle={0.5} 
             penumbra={0.5} 
             intensity={0.8} 
             color="#fef3c7"
             target-position={[x, 0, 0]}
           />
         </group>
       ))}
     </group>
   );
 };
 
 /**
  * Host Stage for eviction ceremonies
  */
 export const HostStage: React.FC<{ position: [number, number, number] }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Stage platform */}
       <mesh position={[0, 0.3, 0]}>
         <boxGeometry args={[4, 0.6, 3]} />
         <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
       </mesh>
       
       {/* Steps */}
       <mesh position={[0, 0.1, 1.7]}>
         <boxGeometry args={[2, 0.2, 0.5]} />
         <meshStandardMaterial color="#334155" roughness={0.6} />
       </mesh>
       
       {/* Host podium */}
       <mesh position={[0, 0.9, -0.5]}>
         <boxGeometry args={[1.2, 0.6, 0.6]} />
         <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.4} />
       </mesh>
       
       {/* BB Logo backdrop */}
       <mesh position={[0, 2, -1.4]}>
         <planeGeometry args={[3.5, 2]} />
         <meshStandardMaterial color="#0f172a" />
       </mesh>
       
       {/* BB Eye logo */}
       <group position={[0, 2, -1.35]}>
         {/* Eye shape */}
         <mesh>
           <circleGeometry args={[0.5, 32]} />
           <meshStandardMaterial 
             color="#3b82f6" 
             emissive="#3b82f6"
             emissiveIntensity={0.5}
           />
         </mesh>
         {/* Pupil */}
         <mesh position={[0, 0, 0.01]}>
           <circleGeometry args={[0.2, 32]} />
           <meshStandardMaterial color="#0f172a" />
         </mesh>
       </group>
       
       {/* Stage lighting */}
       <spotLight 
         position={[0, 4, 2]} 
         angle={0.4} 
         penumbra={0.3} 
         intensity={1} 
         color="#fef3c7"
       />
       
       {/* Edge lighting */}
       <LEDCoveLighting position={[0, 0.02, 0]} width={4} depth={3} color="#dc2626" />
     </group>
   );
 };
 
 /**
  * Outdoor Seating area
  */
 export const OutdoorSeating: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ 
   position, 
   rotation = [0, 0, 0] 
 }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* L-shaped sectional base */}
       <mesh position={[0, 0.25, 0]}>
         <boxGeometry args={[3, 0.5, 1]} />
         <meshStandardMaterial color="#44403c" roughness={0.8} />
       </mesh>
       <mesh position={[1.5, 0.25, -1]}>
         <boxGeometry args={[1, 0.5, 2]} />
         <meshStandardMaterial color="#44403c" roughness={0.8} />
       </mesh>
       
       {/* Cushions */}
       <mesh position={[0, 0.55, 0]}>
         <boxGeometry args={[2.8, 0.15, 0.8]} />
         <meshStandardMaterial color="#fef3c7" roughness={0.9} />
       </mesh>
       <mesh position={[1.45, 0.55, -1]}>
         <boxGeometry args={[0.8, 0.15, 1.8]} />
         <meshStandardMaterial color="#fef3c7" roughness={0.9} />
       </mesh>
       
       {/* Back cushions */}
       <mesh position={[0, 0.8, -0.35]}>
         <boxGeometry args={[2.8, 0.4, 0.2]} />
         <meshStandardMaterial color="#fef3c7" roughness={0.9} />
       </mesh>
       <mesh position={[1.9, 0.8, -1]}>
         <boxGeometry args={[0.2, 0.4, 1.5]} />
         <meshStandardMaterial color="#fef3c7" roughness={0.9} />
       </mesh>
     </group>
   );
 };
 
 /**
  * BBQ Grill station
  */
 export const BBQGrill: React.FC<{ position: [number, number, number] }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Grill body */}
       <mesh position={[0, 0.6, 0]}>
         <boxGeometry args={[1.5, 0.8, 0.7]} />
         <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.7} />
       </mesh>
       
       {/* Lid */}
       <mesh position={[0, 1.1, 0]}>
         <boxGeometry args={[1.4, 0.15, 0.65]} />
         <meshStandardMaterial color="#18181b" roughness={0.2} metalness={0.8} />
       </mesh>
       
       {/* Side shelf */}
       <mesh position={[-1, 0.55, 0]}>
         <boxGeometry args={[0.5, 0.05, 0.6]} />
         <meshStandardMaterial color="#a3a3a3" metalness={0.6} />
       </mesh>
       
       {/* Legs */}
       {[[-0.6, -0.25], [0.6, -0.25], [-0.6, 0.25], [0.6, 0.25]].map(([x, z], i) => (
         <mesh key={i} position={[x, 0.15, z]}>
           <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
           <meshStandardMaterial color="#27272a" metalness={0.5} />
         </mesh>
       ))}
       
       {/* Control knobs */}
       {[-0.4, 0, 0.4].map((x, i) => (
         <mesh key={i} position={[x, 0.5, 0.38]}>
           <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
           <meshStandardMaterial color="#a3a3a3" metalness={0.7} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Backyard Floor - Stone patio with grass border
  */
 export const BackyardFloor: React.FC<{ width?: number; depth?: number }> = ({ 
   width = 30, 
   depth = 20 
 }) => {
   return (
     <group>
       {/* Grass border */}
       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
         <planeGeometry args={[width + 6, depth + 6]} />
         <meshStandardMaterial color="#22c55e" roughness={0.9} />
       </mesh>
       
       {/* Stone patio */}
       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
         <planeGeometry args={[width, depth]} />
         <meshStandardMaterial color="#78716c" roughness={0.8} />
       </mesh>
       
       {/* Patio tile pattern (subtle) */}
       {Array.from({ length: Math.floor(width / 2) }, (_, i) => (
         Array.from({ length: Math.floor(depth / 2) }, (_, j) => (
           <mesh 
             key={`${i}-${j}`}
             rotation={[-Math.PI / 2, 0, 0]} 
             position={[(i - width / 4) * 2 + 1, 0.01, (j - depth / 4) * 2 + 1]}
           >
             <planeGeometry args={[1.9, 1.9]} />
             <meshStandardMaterial 
               color={(i + j) % 2 === 0 ? '#a8a29e' : '#78716c'} 
               roughness={0.85} 
             />
           </mesh>
         ))
       )).flat()}
     </group>
   );
 };
 
 /**
  * Glass Sliding Door connecting to house
  */
 export const SlidingGlassDoor: React.FC<{ position: [number, number, number] }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Door frame */}
       <mesh position={[0, 1.5, 0]}>
         <boxGeometry args={[6, 3.2, 0.15]} />
         <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
       </mesh>
       
       {/* Glass panels */}
       {[-1.4, 1.4].map((x, i) => (
         <mesh key={i} position={[x, 1.5, 0]}>
           <planeGeometry args={[2.6, 2.9]} />
           <meshStandardMaterial 
             color="#94a3b8" 
             transparent 
             opacity={0.3} 
             metalness={0.9}
             roughness={0.1}
           />
         </mesh>
       ))}
       
       {/* Door handles */}
       {[-0.1, 0.1].map((x, i) => (
         <mesh key={i} position={[x, 1.2, 0.1]}>
           <boxGeometry args={[0.02, 0.3, 0.05]} />
           <meshStandardMaterial color="#a3a3a3" metalness={0.8} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Main Backyard composite component
  */
 export const Backyard: React.FC<BackyardProps> = ({ position, eventColor }) => {
   return (
     <group position={position}>
       {/* Backyard floor */}
       <BackyardFloor width={28} depth={18} />
       
       {/* Swimming pool - centered */}
       <SwimmingPool position={[0, 0, 3]} />
       
       {/* Hot tub - left side */}
       <HotTub position={[-6, 0, 3]} />
       
       {/* Pool loungers - right side */}
       <PoolLounge position={[6, 0, 2]} rotation={[0, -Math.PI / 6, 0]} />
       <PoolLounge position={[6, 0, 4]} rotation={[0, -Math.PI / 6, 0]} />
       <PoolLounge position={[6, 0, 6]} rotation={[0, -Math.PI / 6, 0]} />
       
       {/* Competition platform - back of yard */}
       <CompetitionPlatform position={[0, 0, -5]} />
       
       {/* Host stage */}
       <HostStage position={[0, 0, -12]} />
       
       {/* Outdoor seating - left */}
       <OutdoorSeating position={[-8, 0, -4]} rotation={[0, Math.PI / 4, 0]} />
       
       {/* BBQ Grill - right */}
       <BBQGrill position={[10, 0, 0]} />
       
       {/* Sliding glass doors - connecting to house */}
       <SlidingGlassDoor position={[0, 0, 9]} />
       
       {/* Ambient backyard lighting */}
       <pointLight position={[0, 8, 0]} intensity={0.4} color="#fef3c7" distance={25} />
       <pointLight position={[-8, 4, 3]} intensity={0.2} color="#3b82f6" distance={10} />
       <pointLight position={[8, 4, 3]} intensity={0.2} color="#fbbf24" distance={10} />
       
       {/* Competition area spotlights */}
       <spotLight 
         position={[0, 10, -8]} 
         angle={0.6} 
         penumbra={0.4} 
         intensity={0.6} 
         color={eventColor || '#fef3c7'}
       />
     </group>
   );
 };
 
 export default Backyard;