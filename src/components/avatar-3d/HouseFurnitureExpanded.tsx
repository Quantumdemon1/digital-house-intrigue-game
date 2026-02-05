 /**
  * @file HouseFurnitureExpanded.tsx
  * @description Expanded ornate furniture components for the modern Big Brother USA house
  */
 
 import React, { useRef, useMemo } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 // =====================
 // SHARED MATERIALS
 // =====================
 
 const goldAccent = new THREE.MeshStandardMaterial({
   color: '#fbbf24',
   metalness: 0.9,
   roughness: 0.2,
   emissive: '#fbbf24',
   emissiveIntensity: 0.1
 });
 
 const chromeMaterial = new THREE.MeshStandardMaterial({
   color: '#94a3b8',
   metalness: 0.95,
   roughness: 0.1
 });
 
 const velvetBlue = new THREE.MeshStandardMaterial({
   color: '#1e3a5f',
   roughness: 0.95,
   metalness: 0
 });
 
 const darkWood = new THREE.MeshStandardMaterial({
   color: '#2a1810',
   roughness: 0.8,
   metalness: 0.1
 });
 
 const marbleWhite = new THREE.MeshStandardMaterial({
   color: '#f1f5f9',
   roughness: 0.15,
   metalness: 0.1
 });
 
 // =====================
 // LIVING ROOM FURNITURE
 // =====================
 
 /**
  * L-shaped sectional sofa with tufted cushions
  */
 export const SectionalSofa: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* Main long section */}
       <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
         <boxGeometry args={[4, 0.5, 1.2]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
       </mesh>
       
       {/* L section */}
       <mesh position={[-1.4, 0.35, -1.1]} castShadow receiveShadow>
         <boxGeometry args={[1.2, 0.5, 2]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
       </mesh>
       
       {/* Backrest - main */}
       <mesh position={[0, 0.85, -0.45]} castShadow>
         <boxGeometry args={[4, 0.7, 0.3]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
       </mesh>
       
       {/* Backrest - L section */}
       <mesh position={[-1.85, 0.85, -1.1]} castShadow>
         <boxGeometry args={[0.3, 0.7, 2]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
       </mesh>
       
       {/* Tufted cushion details */}
       {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
         <mesh key={i} position={[x, 0.62, 0]}>
           <boxGeometry args={[0.7, 0.05, 0.9]} />
           <meshStandardMaterial color="#1a3050" roughness={0.95} />
         </mesh>
       ))}
       
       {/* Accent pillows */}
       <mesh position={[-0.8, 0.65, 0.2]} rotation={[0.2, 0.3, 0]}>
         <boxGeometry args={[0.35, 0.25, 0.3]} />
         <meshStandardMaterial color="#fbbf24" roughness={0.85} />
       </mesh>
       <mesh position={[0.8, 0.65, 0.15]} rotation={[0.15, -0.2, 0]}>
         <boxGeometry args={[0.35, 0.25, 0.3]} />
         <meshStandardMaterial color="#dc2626" roughness={0.85} />
       </mesh>
       <mesh position={[1.5, 0.65, 0.1]} rotation={[0.1, 0.1, 0]}>
         <boxGeometry args={[0.35, 0.25, 0.3]} />
         <meshStandardMaterial color="#3b82f6" roughness={0.85} />
       </mesh>
       
       {/* Chrome legs */}
       {[[-1.8, -1.8], [-1.8, 0.4], [1.8, -0.4], [1.8, 0.4]].map((pos, i) => (
         <mesh key={i} position={[pos[0], 0.08, pos[1]]} castShadow>
           <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
           <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Memory Wall with LED-backlit photo frames
  */
 export const MemoryWall: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   const glowRef = useRef<THREE.PointLight>(null);
   
   useFrame(({ clock }) => {
     if (glowRef.current) {
       glowRef.current.intensity = 0.3 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
     }
   });
   
   return (
     <group position={position} rotation={rotation}>
       {/* Wall backing */}
       <mesh position={[0, 0, 0]} castShadow receiveShadow>
         <boxGeometry args={[5, 2.5, 0.15]} />
         <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
       </mesh>
       
       {/* Photo frames - 4x3 grid */}
       {[...Array(12)].map((_, i) => {
         const row = Math.floor(i / 4);
         const col = i % 4;
         const x = (col - 1.5) * 1.1;
         const y = (1 - row) * 0.7;
         
         return (
           <group key={i} position={[x, y, 0.08]}>
             {/* Frame */}
             <mesh>
               <boxGeometry args={[0.5, 0.6, 0.05]} />
               <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
             </mesh>
             {/* Photo placeholder (dark) */}
             <mesh position={[0, 0, 0.03]}>
               <planeGeometry args={[0.4, 0.5]} />
               <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
             </mesh>
             {/* LED backlight glow */}
             <mesh position={[0, 0, -0.03]}>
               <boxGeometry args={[0.55, 0.65, 0.02]} />
               <meshStandardMaterial 
                 color="#3b82f6"
                 emissive="#3b82f6"
                 emissiveIntensity={0.3}
                 transparent
                 opacity={0.7}
               />
             </mesh>
           </group>
         );
       })}
       
       {/* "MEMORY WALL" title */}
       <mesh position={[0, 1.5, 0.1]}>
         <boxGeometry args={[2.5, 0.25, 0.02]} />
         <meshStandardMaterial 
           color="#fbbf24"
           emissive="#fbbf24"
           emissiveIntensity={0.5}
         />
       </mesh>
       
       {/* Ambient glow */}
       <pointLight ref={glowRef} position={[0, 0, 0.5]} intensity={0.4} color="#3b82f6" distance={4} />
     </group>
   );
 };
 
 /**
  * Modern crystal/LED hybrid chandelier
  */
 export const CrystalChandelier: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   const groupRef = useRef<THREE.Group>(null);
   
   useFrame(({ clock }) => {
     if (groupRef.current) {
       groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
     }
   });
   
   return (
     <group position={position}>
       {/* Mounting plate */}
       <mesh position={[0, 0, 0]}>
         <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
         <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
       </mesh>
       
       {/* Main cord */}
       <mesh position={[0, -0.4, 0]}>
         <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
         <meshStandardMaterial color="#1a1a1a" />
       </mesh>
       
       {/* Central hub */}
       <mesh position={[0, -0.9, 0]}>
         <sphereGeometry args={[0.15, 16, 16]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
       </mesh>
       
       {/* Rotating crystal arms */}
       <group ref={groupRef} position={[0, -1.2, 0]}>
         {[0, 1, 2, 3, 4, 5].map((i) => {
           const angle = (i / 6) * Math.PI * 2;
           const radius = 0.8;
           return (
             <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
               {/* Crystal drop */}
               <mesh>
                 <octahedronGeometry args={[0.12]} />
                 <meshStandardMaterial 
                   color="#ffffff"
                   transparent
                   opacity={0.8}
                   metalness={0.1}
                   roughness={0.05}
                 />
               </mesh>
               {/* LED light inside */}
               <pointLight intensity={0.2} color="#fef3c7" distance={3} />
             </group>
           );
         })}
         
         {/* Inner ring of smaller crystals */}
         {[0, 1, 2, 3].map((i) => {
           const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
           const radius = 0.4;
           return (
             <mesh key={`inner-${i}`} position={[Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius]}>
               <octahedronGeometry args={[0.08]} />
               <meshStandardMaterial 
                 color="#3b82f6"
                 transparent
                 opacity={0.7}
                 emissive="#3b82f6"
                 emissiveIntensity={0.3}
               />
             </mesh>
           );
         })}
       </group>
       
       {/* Main light */}
       <pointLight position={[0, -1.2, 0]} intensity={1} color="#fef3c7" distance={12} castShadow />
     </group>
   );
 };
 
 /**
  * Geometric glass coffee table
  */
 export const GlassCoffeeTable: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Glass top */}
       <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
         <boxGeometry args={[1.8, 0.06, 1]} />
         <meshPhysicalMaterial 
           color="#ffffff"
           transmission={0.9}
           roughness={0.05}
           thickness={0.1}
           ior={1.5}
         />
       </mesh>
       
       {/* Chrome frame */}
       <mesh position={[0, 0.4, 0]}>
         <boxGeometry args={[1.85, 0.02, 1.05]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
       </mesh>
       
       {/* Geometric chrome legs */}
       {[[-0.7, -0.35], [-0.7, 0.35], [0.7, -0.35], [0.7, 0.35]].map((pos, i) => (
         <group key={i}>
           {/* Angled leg */}
           <mesh position={[pos[0], 0.2, pos[1]]} rotation={[0, 0, i < 2 ? 0.1 : -0.1]}>
             <boxGeometry args={[0.04, 0.4, 0.04]} />
             <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
           </mesh>
           {/* Cross bar */}
           <mesh position={[pos[0] * 0.5, 0.15, pos[1]]}>
             <boxGeometry args={[0.6, 0.02, 0.02]} />
             <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
           </mesh>
         </group>
       ))}
     </group>
   );
 };
 
 /**
  * LED cove lighting strip
  */
 export const LEDCoveLighting: React.FC<{
   position: [number, number, number];
   width: number;
   depth: number;
   color?: string;
 }> = ({ position, width, depth, color = '#3b82f6' }) => {
   const lightRef = useRef<THREE.PointLight>(null);
   
   useFrame(({ clock }) => {
     if (lightRef.current) {
       lightRef.current.intensity = 0.3 + Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
     }
   });
   
   return (
     <group position={position}>
       {/* LED strip - front */}
       <mesh position={[0, 0, depth / 2]}>
         <boxGeometry args={[width, 0.05, 0.1]} />
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
       </mesh>
       
       {/* LED strip - back */}
       <mesh position={[0, 0, -depth / 2]}>
         <boxGeometry args={[width, 0.05, 0.1]} />
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
       </mesh>
       
       {/* LED strip - left */}
       <mesh position={[-width / 2, 0, 0]}>
         <boxGeometry args={[0.1, 0.05, depth]} />
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
       </mesh>
       
       {/* LED strip - right */}
       <mesh position={[width / 2, 0, 0]}>
         <boxGeometry args={[0.1, 0.05, depth]} />
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
       </mesh>
       
       {/* Ambient light cast */}
       <pointLight ref={lightRef} position={[0, -0.5, 0]} intensity={0.3} color={color} distance={8} />
     </group>
   );
 };
 
 // =====================
 // HOH SUITE FURNITURE
 // =====================
 
 /**
  * Elevated platform with LED edge lighting
  */
 export const HOHPlatform: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Platform base */}
       <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
         <boxGeometry args={[8, 0.3, 8]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.2} />
       </mesh>
       
       {/* Plush carpet top */}
       <mesh position={[0, 0.32, 0]} receiveShadow>
         <boxGeometry args={[7.8, 0.04, 7.8]} />
         <meshStandardMaterial color="#4a1a4a" roughness={0.98} metalness={0} />
       </mesh>
       
       {/* Gold trim edge */}
       <mesh position={[0, 0.3, 0]}>
         <boxGeometry args={[8.1, 0.02, 8.1]} />
         <meshStandardMaterial 
           color="#fbbf24" 
           metalness={0.9} 
           roughness={0.2}
           emissive="#fbbf24"
           emissiveIntensity={0.1}
         />
       </mesh>
       
       {/* LED edge lighting */}
       {['front', 'back', 'left', 'right'].map((side, i) => {
         const isHorizontal = side === 'front' || side === 'back';
         const pos: [number, number, number] = 
           side === 'front' ? [0, 0.05, 4] :
           side === 'back' ? [0, 0.05, -4] :
           side === 'left' ? [-4, 0.05, 0] : [4, 0.05, 0];
         
         return (
           <mesh key={side} position={pos}>
             <boxGeometry args={isHorizontal ? [8, 0.08, 0.1] : [0.1, 0.08, 8]} />
             <meshStandardMaterial 
               color="#fbbf24"
               emissive="#fbbf24"
               emissiveIntensity={1}
             />
           </mesh>
         );
       })}
     </group>
   );
 };
 
 /**
  * Luxurious king bed with upholstered headboard
  */
 export const HOHBed: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Bed frame */}
       <mesh position={[0, 0.25, 0]} castShadow>
         <boxGeometry args={[2.5, 0.5, 3]} />
         <meshStandardMaterial color="#2a1810" roughness={0.8} metalness={0.1} />
       </mesh>
       
       {/* Mattress */}
       <mesh position={[0, 0.55, 0]} castShadow>
         <boxGeometry args={[2.4, 0.3, 2.9]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
       </mesh>
       
       {/* Upholstered headboard */}
       <mesh position={[0, 1.2, -1.4]} castShadow>
         <boxGeometry args={[2.6, 1.6, 0.2]} />
         <meshStandardMaterial color="#4a1a4a" roughness={0.95} />
       </mesh>
       
       {/* Headboard gold trim */}
       <mesh position={[0, 1.2, -1.29]}>
         <boxGeometry args={[2.7, 1.7, 0.02]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
       
       {/* Crown motif on headboard */}
       <mesh position={[0, 1.9, -1.28]}>
         <coneGeometry args={[0.15, 0.3, 3]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
       
       {/* Pillows */}
       <mesh position={[-0.5, 0.8, -0.8]} rotation={[0.2, 0, 0]}>
         <boxGeometry args={[0.6, 0.2, 0.4]} />
         <meshStandardMaterial color="#fbbf24" roughness={0.9} />
       </mesh>
       <mesh position={[0.5, 0.8, -0.8]} rotation={[0.2, 0, 0]}>
         <boxGeometry args={[0.6, 0.2, 0.4]} />
         <meshStandardMaterial color="#fbbf24" roughness={0.9} />
       </mesh>
       
       {/* Decorative bedding */}
       <mesh position={[0, 0.72, 0.5]}>
         <boxGeometry args={[2.3, 0.05, 1.5]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.95} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Ornate high-back throne chair
  */
 export const HOHThrone: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* Seat */}
       <mesh position={[0, 0.45, 0]} castShadow>
         <boxGeometry args={[0.7, 0.1, 0.6]} />
         <meshStandardMaterial color="#4a1a4a" roughness={0.95} />
       </mesh>
       
       {/* Seat cushion */}
       <mesh position={[0, 0.52, 0]}>
         <boxGeometry args={[0.65, 0.05, 0.55]} />
         <meshStandardMaterial color="#fbbf24" roughness={0.9} />
       </mesh>
       
       {/* High back */}
       <mesh position={[0, 1, -0.25]} castShadow>
         <boxGeometry args={[0.7, 1.2, 0.15]} />
         <meshStandardMaterial color="#4a1a4a" roughness={0.95} />
       </mesh>
       
       {/* Crown top of back */}
       <mesh position={[0, 1.7, -0.25]}>
         <coneGeometry args={[0.2, 0.3, 5]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
       
       {/* Armrests */}
       <mesh position={[-0.4, 0.6, 0]} castShadow>
         <boxGeometry args={[0.1, 0.3, 0.5]} />
         <meshStandardMaterial color="#2a1810" roughness={0.8} />
       </mesh>
       <mesh position={[0.4, 0.6, 0]} castShadow>
         <boxGeometry args={[0.1, 0.3, 0.5]} />
         <meshStandardMaterial color="#2a1810" roughness={0.8} />
       </mesh>
       
       {/* Legs */}
       {[[-0.3, -0.2], [-0.3, 0.2], [0.3, -0.2], [0.3, 0.2]].map((pos, i) => (
         <mesh key={i} position={[pos[0], 0.2, pos[1]]} castShadow>
           <cylinderGeometry args={[0.04, 0.06, 0.4, 8]} />
           <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Mini fridge
  */
 export const MiniFridge: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       <mesh position={[0, 0.5, 0]} castShadow>
         <boxGeometry args={[0.6, 1, 0.5]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
       </mesh>
       {/* Handle */}
       <mesh position={[0.25, 0.5, 0.28]} castShadow>
         <boxGeometry args={[0.03, 0.4, 0.03]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Private TV screen
  */
 export const PrivateTV: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* TV frame */}
       <mesh castShadow>
         <boxGeometry args={[1.5, 1, 0.1]} />
         <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.7} />
       </mesh>
       {/* Screen */}
       <mesh position={[0, 0, 0.06]}>
         <planeGeometry args={[1.35, 0.85]} />
         <meshStandardMaterial 
           color="#0f172a"
           emissive="#3b82f6"
           emissiveIntensity={0.5}
         />
       </mesh>
     </group>
   );
 };
 
 // =====================
 // BEDROOM FURNITURE
 // =====================
 
 /**
  * Stackable bunk bed
  */
 export const BunkBed: React.FC<{
   position: [number, number, number];
   isHaveNot?: boolean;
 }> = ({ position, isHaveNot = false }) => {
   const bedColor = isHaveNot ? '#4a4a4a' : '#1e3a5f';
   const frameColor = isHaveNot ? '#2a2a2a' : '#2a1810';
   
   return (
     <group position={position}>
       {/* Frame posts */}
       {[[-0.9, -0.5], [-0.9, 0.5], [0.9, -0.5], [0.9, 0.5]].map((pos, i) => (
         <mesh key={i} position={[pos[0], 1.5, pos[1]]} castShadow>
           <boxGeometry args={[0.1, 3, 0.1]} />
           <meshStandardMaterial color={frameColor} roughness={0.8} />
         </mesh>
       ))}
       
       {/* Bottom bunk */}
       <mesh position={[0, 0.4, 0]} castShadow>
         <boxGeometry args={[1.8, 0.15, 1]} />
         <meshStandardMaterial color={frameColor} roughness={0.8} />
       </mesh>
       <mesh position={[0, 0.55, 0]}>
         <boxGeometry args={[1.7, 0.15, 0.9]} />
         <meshStandardMaterial color={bedColor} roughness={0.95} />
       </mesh>
       
       {/* Top bunk */}
       <mesh position={[0, 1.8, 0]} castShadow>
         <boxGeometry args={[1.8, 0.15, 1]} />
         <meshStandardMaterial color={frameColor} roughness={0.8} />
       </mesh>
       <mesh position={[0, 1.95, 0]}>
         <boxGeometry args={[1.7, 0.15, 0.9]} />
         <meshStandardMaterial color={bedColor} roughness={0.95} />
       </mesh>
       
       {/* Ladder */}
       <mesh position={[0.95, 1.1, 0]} castShadow>
         <boxGeometry args={[0.05, 2.2, 0.05]} />
         <meshStandardMaterial color={frameColor} roughness={0.8} />
       </mesh>
       {[0.6, 1.0, 1.4, 1.8].map((y, i) => (
         <mesh key={i} position={[0.95, y, 0]} castShadow>
           <boxGeometry args={[0.05, 0.05, 0.3]} />
           <meshStandardMaterial color={frameColor} roughness={0.8} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Wardrobe closet with mirror
  */
 export const WardrobeCloset: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* Main cabinet */}
       <mesh position={[0, 1.2, 0]} castShadow>
         <boxGeometry args={[1.2, 2.4, 0.6]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.7} metalness={0.2} />
       </mesh>
       {/* Mirror on door */}
       <mesh position={[0, 1.2, 0.31]}>
         <planeGeometry args={[0.8, 1.8]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.05} />
       </mesh>
       {/* Handle */}
       <mesh position={[0.35, 1.2, 0.33]}>
         <boxGeometry args={[0.03, 0.2, 0.03]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Floating nightstand
  */
 export const FloatingNightstand: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       <mesh castShadow>
         <boxGeometry args={[0.5, 0.15, 0.35]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
       </mesh>
       {/* LED strip underneath */}
       <mesh position={[0, -0.1, 0]}>
         <boxGeometry args={[0.48, 0.02, 0.33]} />
         <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
       </mesh>
     </group>
   );
 };
 
 // =====================
 // BATHROOM FURNITURE
 // =====================
 
 /**
  * Vanity counter with Hollywood-style lights
  */
 export const VanityCounter: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Counter */}
       <mesh position={[0, 0.9, 0]} castShadow>
         <boxGeometry args={[4, 0.1, 0.8]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.15} metalness={0.1} />
       </mesh>
       {/* Cabinet base */}
       <mesh position={[0, 0.4, 0]} castShadow>
         <boxGeometry args={[4, 0.8, 0.75]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
       </mesh>
       {/* Vessel sinks */}
       {[-1, 1].map((x, i) => (
         <mesh key={i} position={[x, 1, 0]}>
           <cylinderGeometry args={[0.25, 0.2, 0.15, 16]} />
           <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.2} />
         </mesh>
       ))}
       {/* Faucets */}
       {[-1, 1].map((x, i) => (
         <mesh key={i} position={[x, 1.15, -0.2]}>
           <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
           <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Hollywood-style illuminated mirror
  */
 export const BathroomMirror: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Mirror */}
       <mesh>
         <boxGeometry args={[1, 1.5, 0.05]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.98} roughness={0.02} />
       </mesh>
       {/* Light bulbs around frame */}
       {[...Array(12)].map((_, i) => {
         const isVertical = i < 3 || (i >= 6 && i < 9);
         const x = i < 3 ? -0.55 : i < 6 ? -0.35 + (i - 3) * 0.35 : i < 9 ? 0.55 : -0.35 + (i - 9) * 0.35;
         const y = i < 3 ? 0.5 - i * 0.5 : i < 6 ? 0.8 : i < 9 ? 0.5 - (i - 6) * 0.5 : -0.8;
         
         return (
           <group key={i} position={[x, y, 0.05]}>
             <mesh>
               <sphereGeometry args={[0.06, 8, 8]} />
               <meshStandardMaterial 
                 color="#fef3c7" 
                 emissive="#fbbf24"
                 emissiveIntensity={1}
               />
             </mesh>
           </group>
         );
       })}
       <pointLight position={[0, 0, 0.3]} intensity={0.5} color="#fef3c7" distance={3} />
     </group>
   );
 };
 
 /**
  * Frosted glass shower stall
  */
 export const ShowerStall: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Base */}
       <mesh position={[0, 0.05, 0]} receiveShadow>
         <boxGeometry args={[1.2, 0.1, 1.2]} />
         <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
       </mesh>
       {/* Glass walls */}
       <mesh position={[0, 1.1, -0.55]}>
         <boxGeometry args={[1.2, 2.1, 0.05]} />
         <meshPhysicalMaterial 
           color="#ffffff"
           transmission={0.8}
           roughness={0.3}
           thickness={0.1}
         />
       </mesh>
       <mesh position={[-0.55, 1.1, 0]}>
         <boxGeometry args={[0.05, 2.1, 1.2]} />
         <meshPhysicalMaterial 
           color="#ffffff"
           transmission={0.8}
           roughness={0.3}
           thickness={0.1}
         />
       </mesh>
       {/* Shower head */}
       <mesh position={[0, 2, -0.4]}>
         <cylinderGeometry args={[0.12, 0.08, 0.05, 16]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
       </mesh>
     </group>
   );
 };
 
 // =====================
 // KITCHEN FURNITURE
 // =====================
 
 /**
  * Large kitchen island with waterfall edge
  */
 export const KitchenIslandLarge: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Island base */}
       <mesh position={[0, 0.45, 0]} castShadow>
         <boxGeometry args={[3.5, 0.9, 1.2]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.2} />
       </mesh>
       {/* Marble countertop */}
       <mesh position={[0, 0.95, 0]} castShadow>
         <boxGeometry args={[3.7, 0.1, 1.4]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.15} metalness={0.1} />
       </mesh>
       {/* Waterfall edge sides */}
       <mesh position={[-1.8, 0.45, 0]} castShadow>
         <boxGeometry args={[0.1, 0.9, 1.4]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.15} metalness={0.1} />
       </mesh>
       <mesh position={[1.8, 0.45, 0]} castShadow>
         <boxGeometry args={[0.1, 0.9, 1.4]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.15} metalness={0.1} />
       </mesh>
       {/* Bar stools */}
       {[-1, 0, 1].map((x, i) => (
         <group key={i} position={[x, 0, 1]}>
           <mesh position={[0, 0.85, 0]}>
             <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
             <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
           </mesh>
           <mesh position={[0, 0.45, 0]}>
             <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
             <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
           </mesh>
           <mesh position={[0, 0.05, 0]}>
             <torusGeometry args={[0.18, 0.03, 8, 16]} />
             <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
           </mesh>
         </group>
       ))}
     </group>
   );
 };
 
 /**
  * Modern stainless steel refrigerator
  */
 export const ModernRefrigerator: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       <mesh position={[0, 1.1, 0]} castShadow>
         <boxGeometry args={[1.2, 2.2, 0.8]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
       </mesh>
       {/* Door line */}
       <mesh position={[0, 1.1, 0.41]}>
         <boxGeometry args={[0.02, 2.1, 0.02]} />
         <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
       </mesh>
       {/* Handles */}
       <mesh position={[-0.15, 1.5, 0.45]}>
         <boxGeometry args={[0.03, 0.5, 0.03]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
       <mesh position={[0.15, 1.5, 0.45]}>
         <boxGeometry args={[0.03, 0.5, 0.03]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Commercial-style stove/range
  */
 export const CommercialStove: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Stove body */}
       <mesh position={[0, 0.5, 0]} castShadow>
         <boxGeometry args={[1.2, 1, 0.8]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.3} />
       </mesh>
       {/* Cooktop */}
       <mesh position={[0, 1.02, 0]}>
         <boxGeometry args={[1.2, 0.05, 0.8]} />
         <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.5} />
       </mesh>
       {/* Burners */}
       {[[-0.3, -0.2], [-0.3, 0.2], [0.3, -0.2], [0.3, 0.2]].map((pos, i) => (
         <mesh key={i} position={[pos[0], 1.06, pos[1]]}>
           <torusGeometry args={[0.12, 0.015, 8, 24]} />
           <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.5} />
         </mesh>
       ))}
       {/* Oven door */}
       <mesh position={[0, 0.35, 0.41]}>
         <boxGeometry args={[1, 0.6, 0.02]} />
         <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.6} />
       </mesh>
       {/* Handle */}
       <mesh position={[0, 0.65, 0.45]}>
         <boxGeometry args={[0.6, 0.03, 0.03]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Open shelving with displayed kitchenware
  */
 export const OpenShelving: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Shelves */}
       {[0, 0.5, 1].map((y, i) => (
         <mesh key={i} position={[0, y, 0]} castShadow>
           <boxGeometry args={[1.5, 0.04, 0.3]} />
           <meshStandardMaterial color="#2a1810" roughness={0.8} />
         </mesh>
       ))}
       {/* Decorative items */}
       {[[-0.5, 0.15], [0, 0.65], [0.4, 1.15]].map((pos, i) => (
         <mesh key={i} position={[pos[0], pos[1], 0]}>
           <cylinderGeometry args={[0.08, 0.06, 0.2, 8]} />
           <meshStandardMaterial color={['#dc2626', '#22c55e', '#3b82f6'][i]} roughness={0.7} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Breakfast nook with built-in seating
  */
 export const BreakfastNook: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Built-in bench */}
       <mesh position={[0, 0.35, 0]} castShadow>
         <boxGeometry args={[2, 0.5, 0.8]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
       </mesh>
       {/* Back cushion */}
       <mesh position={[0, 0.8, -0.35]} castShadow>
         <boxGeometry args={[2, 0.6, 0.15]} />
         <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
       </mesh>
       {/* Small table */}
       <mesh position={[0, 0.4, 0.8]} castShadow>
         <cylinderGeometry args={[0.5, 0.5, 0.05, 16]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
       </mesh>
       <mesh position={[0, 0.2, 0.8]} castShadow>
         <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
       </mesh>
     </group>
   );
 };
 
 // =====================
 // NOMINATION AREA
 // =====================
 
 /**
  * Nomination podium with key box
  */
 export const NominationPodium: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   const glowRef = useRef<THREE.Mesh>(null);
   
   useFrame(({ clock }) => {
     if (glowRef.current) {
       const mat = glowRef.current.material as THREE.MeshStandardMaterial;
       mat.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
     }
   });
   
   return (
     <group position={position}>
       {/* Podium base */}
       <mesh position={[0, 0.6, 0]} castShadow>
         <cylinderGeometry args={[0.5, 0.7, 1.2, 6]} />
         <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.3} />
       </mesh>
       
       {/* Key box on top */}
       <mesh position={[0, 1.35, 0]} castShadow>
         <boxGeometry args={[0.6, 0.4, 0.4]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.4} />
       </mesh>
       
       {/* BB Eye on box */}
       <mesh ref={glowRef} position={[0, 1.35, 0.21]}>
         <ringGeometry args={[0.08, 0.12, 32]} />
         <meshStandardMaterial 
           color="#3b82f6"
           emissive="#3b82f6"
           emissiveIntensity={0.8}
         />
       </mesh>
       
       {/* Gold trim */}
       <mesh position={[0, 1.2, 0]}>
         <torusGeometry args={[0.52, 0.02, 8, 32]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Semi-circular curved sofa
  */
 export const CurvedSofa: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   const segments = 8;
   
   return (
     <group position={position} rotation={rotation}>
       {/* Curved seat sections */}
       {[...Array(segments)].map((_, i) => {
         const angle = (i / (segments - 1)) * Math.PI - Math.PI / 2;
         const radius = 3;
         const x = Math.cos(angle) * radius;
         const z = Math.sin(angle) * radius;
         const rotY = -angle + Math.PI / 2;
         
         return (
           <group key={i} position={[x, 0, z]} rotation={[0, rotY, 0]}>
             {/* Seat */}
             <mesh position={[0, 0.35, 0]} castShadow>
               <boxGeometry args={[1.2, 0.4, 0.8]} />
               <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
             </mesh>
             {/* Backrest */}
             <mesh position={[0, 0.75, -0.35]} castShadow>
               <boxGeometry args={[1.2, 0.6, 0.2]} />
               <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
             </mesh>
           </group>
         );
       })}
     </group>
   );
 };
 
 /**
  * Dramatic spotlight
  */
 export const SpotLight: React.FC<{
   position: [number, number, number];
   targetPosition: [number, number, number];
   color?: string;
   intensity?: number;
 }> = ({ position, targetPosition, color = '#ffffff', intensity = 1 }) => {
   return (
     <group position={position}>
       {/* Light housing */}
       <mesh rotation={[Math.PI / 4, 0, 0]}>
         <cylinderGeometry args={[0.15, 0.25, 0.4, 16]} />
         <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
       </mesh>
       
       {/* Actual spotlight */}
       <spotLight
         position={[0, 0, 0]}
         target-position={targetPosition}
         intensity={intensity}
         color={color}
         angle={0.3}
         penumbra={0.5}
         distance={10}
         castShadow
       />
     </group>
   );
 };
 
 /**
  * Large BB Eye display
  */
 export const BBEyeDisplay: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   const ringRef = useRef<THREE.Mesh>(null);
   
   useFrame(({ clock }) => {
     if (ringRef.current) {
       const mat = ringRef.current.material as THREE.MeshStandardMaterial;
       mat.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 1.5) * 0.4;
     }
   });
   
   return (
     <group position={position}>
       {/* Background panel */}
       <mesh>
         <circleGeometry args={[1.5, 64]} />
         <meshStandardMaterial color="#0f172a" roughness={0.5} />
       </mesh>
       
       {/* Eye ring */}
       <mesh ref={ringRef} position={[0, 0, 0.05]}>
         <ringGeometry args={[0.6, 0.9, 64]} />
         <meshStandardMaterial 
           color="#fbbf24"
           emissive="#fbbf24"
           emissiveIntensity={1}
         />
       </mesh>
       
       {/* Pupil */}
       <mesh position={[0, 0, 0.06]}>
         <circleGeometry args={[0.35, 32]} />
         <meshStandardMaterial 
           color="#3b82f6"
           emissive="#3b82f6"
           emissiveIntensity={0.5}
         />
       </mesh>
       
       {/* Center dot */}
       <mesh position={[0, 0, 0.07]}>
         <circleGeometry args={[0.1, 16]} />
         <meshStandardMaterial color="#0f172a" />
       </mesh>
       
       {/* Glow light */}
       <pointLight position={[0, 0, 0.5]} intensity={0.5} color="#fbbf24" distance={5} />
     </group>
   );
 };
 
 /**
  * Frosted glass wall partition
  */
 export const GlassWall: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
   width?: number;
   height?: number;
 }> = ({ position, rotation = [0, 0, 0], width = 4, height = 3 }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* Chrome frame */}
       <mesh>
         <boxGeometry args={[width + 0.1, height + 0.1, 0.05]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
       </mesh>
       
       {/* Frosted glass */}
       <mesh position={[0, 0, 0.01]}>
         <boxGeometry args={[width - 0.1, height - 0.1, 0.03]} />
         <meshPhysicalMaterial 
           color="#ffffff"
           transmission={0.85}
           roughness={0.15}
           thickness={0.5}
           ior={1.5}
         />
       </mesh>
       
       {/* BB logo tint */}
       <mesh position={[0, 0, 0.03]}>
         <ringGeometry args={[0.3, 0.5, 32]} />
         <meshStandardMaterial 
           color="#3b82f6"
           transparent
           opacity={0.3}
         />
       </mesh>
     </group>
   );
 };
 
 // =====================
 // GAME ROOM FURNITURE
 // =====================
 
 /**
  * Pool table with LED edge
  */
 export const PoolTable: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Table legs */}
       {[[-1.1, -0.5], [-1.1, 0.5], [1.1, -0.5], [1.1, 0.5]].map((pos, i) => (
         <mesh key={i} position={[pos[0], 0.4, pos[1]]} castShadow>
           <boxGeometry args={[0.15, 0.8, 0.15]} />
           <meshStandardMaterial color="#2a1810" roughness={0.8} />
         </mesh>
       ))}
       
       {/* Table frame */}
       <mesh position={[0, 0.85, 0]} castShadow>
         <boxGeometry args={[2.8, 0.2, 1.5]} />
         <meshStandardMaterial color="#2a1810" roughness={0.8} />
       </mesh>
       
       {/* Green felt surface */}
       <mesh position={[0, 0.96, 0]}>
         <boxGeometry args={[2.5, 0.02, 1.2]} />
         <meshStandardMaterial color="#166534" roughness={0.95} />
       </mesh>
       
       {/* LED edge strip */}
       {['front', 'back', 'left', 'right'].map((side) => {
         const isHorizontal = side === 'front' || side === 'back';
         const pos: [number, number, number] = 
           side === 'front' ? [0, 0.9, 0.76] :
           side === 'back' ? [0, 0.9, -0.76] :
           side === 'left' ? [-1.41, 0.9, 0] : [1.41, 0.9, 0];
         
         return (
           <mesh key={side} position={pos}>
             <boxGeometry args={isHorizontal ? [2.8, 0.05, 0.02] : [0.02, 0.05, 1.5]} />
             <meshStandardMaterial 
               color="#3b82f6"
               emissive="#3b82f6"
               emissiveIntensity={0.8}
             />
           </mesh>
         );
       })}
       
       {/* Cue balls */}
       <mesh position={[-0.6, 1, 0]}>
         <sphereGeometry args={[0.04, 16, 16]} />
         <meshStandardMaterial color="#ffffff" />
       </mesh>
       {[[-0.1, 0], [0.05, 0.08], [0.05, -0.08], [0.2, 0], [0.2, 0.16], [0.2, -0.16]].map((pos, i) => (
         <mesh key={i} position={[pos[0] + 0.3, 1, pos[1]]}>
           <sphereGeometry args={[0.04, 16, 16]} />
           <meshStandardMaterial color={['#dc2626', '#fbbf24', '#3b82f6', '#22c55e', '#8b5cf6', '#f97316'][i]} />
         </mesh>
       ))}
     </group>
   );
 };
 
 /**
  * Retro arcade cabinet
  */
 export const ArcadeCabinet: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   const screenRef = useRef<THREE.Mesh>(null);
   
   useFrame(({ clock }) => {
     if (screenRef.current) {
       const mat = screenRef.current.material as THREE.MeshStandardMaterial;
       mat.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 5) * 0.2;
     }
   });
   
   return (
     <group position={position} rotation={rotation}>
       {/* Cabinet body */}
       <mesh position={[0, 0.9, 0]} castShadow>
         <boxGeometry args={[0.8, 1.8, 0.7]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.2} />
       </mesh>
       
       {/* Screen */}
       <mesh ref={screenRef} position={[0, 1.3, 0.36]}>
         <planeGeometry args={[0.6, 0.5]} />
         <meshStandardMaterial 
           color="#0f172a"
           emissive="#22c55e"
           emissiveIntensity={0.8}
         />
       </mesh>
       
       {/* Control panel */}
       <mesh position={[0, 0.6, 0.25]} rotation={[-0.3, 0, 0]}>
         <boxGeometry args={[0.7, 0.3, 0.3]} />
         <meshStandardMaterial color="#0f172a" roughness={0.5} />
       </mesh>
       
       {/* Joystick */}
       <mesh position={[-0.15, 0.75, 0.3]}>
         <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
         <meshStandardMaterial color="#dc2626" roughness={0.5} />
       </mesh>
       
       {/* Buttons */}
       {[[0.1, 0.3], [0.2, 0.28], [0.3, 0.3]].map((pos, i) => (
         <mesh key={i} position={[pos[0], 0.73, pos[1]]}>
           <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
           <meshStandardMaterial color={['#dc2626', '#fbbf24', '#3b82f6'][i]} roughness={0.5} />
         </mesh>
       ))}
       
       {/* Marquee */}
       <mesh position={[0, 1.75, 0.2]}>
         <boxGeometry args={[0.7, 0.2, 0.1]} />
         <meshStandardMaterial 
           color="#3b82f6"
           emissive="#3b82f6"
           emissiveIntensity={0.5}
         />
       </mesh>
     </group>
   );
 };
 
 /**
  * Dart board
  */
 export const DartBoard: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Board */}
       <mesh>
         <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
         <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
       </mesh>
       
       {/* Colored rings */}
       {[0.25, 0.2, 0.15, 0.1, 0.05].map((r, i) => (
         <mesh key={i} position={[0, 0, 0.026]}>
           <ringGeometry args={[r - 0.04, r, 32]} />
           <meshStandardMaterial 
             color={i % 2 === 0 ? '#dc2626' : '#22c55e'} 
             roughness={0.8} 
           />
         </mesh>
       ))}
       
       {/* Bullseye */}
       <mesh position={[0, 0, 0.027]}>
         <circleGeometry args={[0.02, 16]} />
         <meshStandardMaterial color="#dc2626" roughness={0.8} />
       </mesh>
       
       {/* Surround */}
       <mesh>
         <torusGeometry args={[0.32, 0.03, 8, 32]} />
         <meshStandardMaterial color="#0f172a" roughness={0.6} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Gaming chair
  */
 export const GamingChair: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* Seat */}
       <mesh position={[0, 0.45, 0]} castShadow>
         <boxGeometry args={[0.5, 0.1, 0.5]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
       </mesh>
       
       {/* Back */}
       <mesh position={[0, 0.9, -0.2]} castShadow>
         <boxGeometry args={[0.5, 0.8, 0.1]} />
         <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
       </mesh>
       
       {/* Racing stripes */}
       <mesh position={[0, 0.9, -0.14]}>
         <boxGeometry args={[0.1, 0.7, 0.02]} />
         <meshStandardMaterial color="#dc2626" roughness={0.8} />
       </mesh>
       
       {/* Base */}
       <mesh position={[0, 0.15, 0]}>
         <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
         <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.5} />
       </mesh>
       
       {/* Pole */}
       <mesh position={[0, 0.3, 0]}>
         <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
         <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
       </mesh>
       
       {/* Wheels */}
       {[0, 1, 2, 3, 4].map((i) => {
         const angle = (i / 5) * Math.PI * 2;
         return (
           <mesh key={i} position={[Math.cos(angle) * 0.22, 0.05, Math.sin(angle) * 0.22]}>
             <sphereGeometry args={[0.04, 8, 8]} />
             <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
           </mesh>
         );
       })}
     </group>
   );
 };
 
 /**
  * Neon sign
  */
 export const NeonSign: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
   text: string;
   color?: string;
 }> = ({ position, rotation = [0, 0, 0], text, color = '#22c55e' }) => {
   const glowRef = useRef<THREE.PointLight>(null);
   
   useFrame(({ clock }) => {
     if (glowRef.current) {
       glowRef.current.intensity = 0.4 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
     }
   });
   
   return (
     <group position={position} rotation={rotation}>
       {/* Sign backing */}
       <mesh>
         <boxGeometry args={[text.length * 0.25, 0.4, 0.05]} />
         <meshStandardMaterial color="#0f172a" roughness={0.8} />
       </mesh>
       
       {/* Neon tube effect (simplified as glowing box) */}
       <mesh position={[0, 0, 0.03]}>
         <boxGeometry args={[text.length * 0.22, 0.25, 0.02]} />
         <meshStandardMaterial 
           color={color}
           emissive={color}
           emissiveIntensity={1.5}
         />
       </mesh>
       
       {/* Glow */}
       <pointLight ref={glowRef} position={[0, 0, 0.2]} intensity={0.5} color={color} distance={3} />
     </group>
   );
 };
 
 // =====================
 // DIARY ROOM FURNITURE
 // =====================
 
 /**
  * Iconic diary room chair
  */
 export const DiaryChair: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Seat */}
       <mesh position={[0, 0.45, 0]} castShadow>
         <boxGeometry args={[0.8, 0.15, 0.7]} />
         <meshStandardMaterial color="#dc2626" roughness={0.85} />
       </mesh>
       
       {/* Back - curved high back */}
       <mesh position={[0, 1, -0.3]} castShadow>
         <boxGeometry args={[0.85, 1.2, 0.15]} />
         <meshStandardMaterial color="#dc2626" roughness={0.85} />
       </mesh>
       
       {/* Wings/sides */}
       <mesh position={[-0.45, 0.7, -0.1]} castShadow>
         <boxGeometry args={[0.1, 0.6, 0.5]} />
         <meshStandardMaterial color="#dc2626" roughness={0.85} />
       </mesh>
       <mesh position={[0.45, 0.7, -0.1]} castShadow>
         <boxGeometry args={[0.1, 0.6, 0.5]} />
         <meshStandardMaterial color="#dc2626" roughness={0.85} />
       </mesh>
       
       {/* Gold trim */}
       <mesh position={[0, 1.6, -0.35]}>
         <boxGeometry args={[0.9, 0.05, 0.02]} />
         <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
       </mesh>
       
       {/* Base */}
       <mesh position={[0, 0.15, 0]}>
         <cylinderGeometry args={[0.35, 0.4, 0.3, 6]} />
         <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Camera rig with multiple cameras
  */
 export const CameraRig: React.FC<{
   position: [number, number, number];
 }> = ({ position }) => {
   return (
     <group position={position}>
       {/* Main camera */}
       <mesh rotation={[0.3, 0, 0]}>
         <boxGeometry args={[0.3, 0.2, 0.4]} />
         <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
       </mesh>
       
       {/* Lens */}
       <mesh position={[0, -0.05, 0.22]} rotation={[0.3, 0, 0]}>
         <cylinderGeometry args={[0.08, 0.06, 0.1, 16]} />
         <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
       </mesh>
       
       {/* Recording light */}
       <mesh position={[0.12, 0.05, 0.15]}>
         <sphereGeometry args={[0.02, 8, 8]} />
         <meshStandardMaterial 
           color="#dc2626"
           emissive="#dc2626"
           emissiveIntensity={2}
         />
       </mesh>
       
       {/* Mount arm */}
       <mesh position={[0, 0.2, -0.1]}>
         <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
         <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
       </mesh>
     </group>
   );
 };
 
 /**
  * Acoustic wall panels
  */
 export const SoundPanels: React.FC<{
   position: [number, number, number];
   rotation?: [number, number, number];
 }> = ({ position, rotation = [0, 0, 0] }) => {
   return (
     <group position={position} rotation={rotation}>
       {/* Panel grid */}
       {[...Array(6)].map((_, i) => {
         const row = Math.floor(i / 3);
         const col = i % 3;
         return (
           <mesh key={i} position={[(col - 1) * 0.5, (0.5 - row) * 0.6, 0]}>
             <boxGeometry args={[0.45, 0.55, 0.15]} />
             <meshStandardMaterial 
               color={i % 2 === 0 ? '#1e293b' : '#334155'} 
               roughness={0.98} 
             />
           </mesh>
         );
       })}
     </group>
   );
 };
 
 export default {
   // Living Room
   SectionalSofa, MemoryWall, CrystalChandelier, GlassCoffeeTable, LEDCoveLighting,
   // HOH Suite
   HOHPlatform, HOHBed, HOHThrone, MiniFridge, PrivateTV,
   // Bedroom
   BunkBed, WardrobeCloset, FloatingNightstand,
   // Bathroom
   VanityCounter, ShowerStall, BathroomMirror,
   // Kitchen
   KitchenIslandLarge, ModernRefrigerator, CommercialStove, OpenShelving, BreakfastNook,
   // Nomination
   NominationPodium, CurvedSofa, SpotLight, BBEyeDisplay, GlassWall,
   // Game Room
   PoolTable, ArcadeCabinet, DartBoard, GamingChair, NeonSign,
   // Diary Room
   DiaryChair, CameraRig, SoundPanels
 };