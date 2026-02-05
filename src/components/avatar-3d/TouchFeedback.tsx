 /**
  * @file TouchFeedback.tsx
  * @description Visual feedback components for touch interactions
  */
 
 import React, { useRef, useState, useEffect } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 /**
  * Tap ripple effect that expands and fades
  */
 export const TapRipple: React.FC<{
   position: [number, number, number];
   color?: string;
   onComplete?: () => void;
 }> = ({ position, color = '#22c55e', onComplete }) => {
   const ringRef = useRef<THREE.Mesh>(null);
   const materialRef = useRef<THREE.MeshBasicMaterial>(null);
   const [scale, setScale] = useState(0.1);
   const [opacity, setOpacity] = useState(0.8);
   const startTime = useRef(Date.now());
   
   useFrame(() => {
     const elapsed = (Date.now() - startTime.current) / 1000;
     const duration = 0.4;
     const progress = Math.min(elapsed / duration, 1);
     
     // Expand and fade
     setScale(0.1 + progress * 0.9);
     setOpacity(0.8 * (1 - progress));
     
     if (progress >= 1) {
       onComplete?.();
     }
   });
   
   return (
     <mesh
       ref={ringRef}
       position={[position[0], position[1] + 0.02, position[2]]}
       rotation={[-Math.PI / 2, 0, 0]}
       scale={[scale, scale, 1]}
     >
       <ringGeometry args={[0.4, 0.5, 32]} />
       <meshBasicMaterial
         ref={materialRef}
         color={color}
         transparent
         opacity={opacity}
         side={THREE.DoubleSide}
       />
     </mesh>
   );
 };
 
 /**
  * Pulsing indicator for active move targets
  */
 export const MoveTargetIndicator: React.FC<{
   position: [number, number, number];
   active?: boolean;
   available?: boolean;
   occupied?: boolean;
   onClick?: () => void;
 }> = ({ position, active = false, available = true, occupied = false, onClick }) => {
   const ringRef = useRef<THREE.Mesh>(null);
   const innerRef = useRef<THREE.Mesh>(null);
   
   useFrame(({ clock }) => {
     if (!ringRef.current || !active) return;
     
     const t = clock.getElapsedTime();
     // Pulsing scale
     const pulse = 1 + Math.sin(t * 3) * 0.1;
     ringRef.current.scale.setScalar(pulse);
     
     // Inner disc breathing
     if (innerRef.current) {
       const breathe = 0.8 + Math.sin(t * 2) * 0.2;
       innerRef.current.scale.setScalar(breathe);
     }
   });
   
   const color = occupied ? '#ef4444' : available ? '#22c55e' : '#6b7280';
   const emissive = active ? color : '#000000';
   
   if (!active) return null;
   
   return (
     <group position={position} onClick={(e) => {
       e.stopPropagation();
       if (available && !occupied) onClick?.();
     }}>
       {/* Outer ring */}
       <mesh
         ref={ringRef}
         rotation={[-Math.PI / 2, 0, 0]}
         position={[0, 0.02, 0]}
       >
         <ringGeometry args={[0.45, 0.55, 32]} />
         <meshStandardMaterial
           color={color}
           emissive={emissive}
           emissiveIntensity={0.5}
           transparent
           opacity={0.8}
           side={THREE.DoubleSide}
         />
       </mesh>
       
       {/* Inner disc */}
       <mesh
         ref={innerRef}
         rotation={[-Math.PI / 2, 0, 0]}
         position={[0, 0.01, 0]}
       >
         <circleGeometry args={[0.35, 32]} />
         <meshStandardMaterial
           color={color}
           transparent
           opacity={0.3}
           side={THREE.DoubleSide}
         />
       </mesh>
     </group>
   );
 };
 
 /**
  * Long press indicator (expanding circle)
  */
 export const LongPressIndicator: React.FC<{
   position: [number, number, number];
   progress: number; // 0 to 1
   color?: string;
 }> = ({ position, progress, color = '#fbbf24' }) => {
   const arcRef = useRef<THREE.Mesh>(null);
   
   if (progress <= 0) return null;
   
   // Create arc geometry based on progress
   const startAngle = 0;
   const endAngle = progress * Math.PI * 2;
   
   return (
     <mesh
       ref={arcRef}
       position={[position[0], position[1] + 0.03, position[2]]}
       rotation={[-Math.PI / 2, 0, 0]}
     >
       <ringGeometry args={[0.55, 0.65, 32, 1, startAngle, endAngle]} />
       <meshBasicMaterial
         color={color}
         transparent
         opacity={0.9}
         side={THREE.DoubleSide}
       />
     </mesh>
   );
 };
 
 /**
  * Touch feedback manager that handles multiple ripples
  */
 export const TouchFeedbackManager: React.FC<{
   ripples: Array<{ id: string; position: [number, number, number]; color?: string }>;
   onRippleComplete?: (id: string) => void;
 }> = ({ ripples, onRippleComplete }) => {
   return (
     <>
       {ripples.map((ripple) => (
         <TapRipple
           key={ripple.id}
           position={ripple.position}
           color={ripple.color}
           onComplete={() => onRippleComplete?.(ripple.id)}
         />
       ))}
     </>
   );
 };
 
 export default TouchFeedbackManager;