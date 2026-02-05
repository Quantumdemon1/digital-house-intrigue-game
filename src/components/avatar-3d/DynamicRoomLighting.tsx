 /**
  * @file DynamicRoomLighting.tsx
  * @description Animated room lighting that changes based on game events
  */
 
 import React, { useRef, useMemo } from 'react';
 import * as THREE from 'three';
 import { useFrame } from '@react-three/fiber';
 import { LightingEvent } from './hooks/useEventLighting';
 
 interface DynamicRoomLightingProps {
   event: LightingEvent;
   colors: {
     primary: string;
     accent: string;
     ambient: string;
   };
   pulseSpeed: number;
   transitionProgress: number;
 }
 
 // Room light positions
 const ROOM_LIGHTS = {
   livingRoom: { position: [0, 4, 0] as [number, number, number], intensity: 0.6 },
   hohSuite: { position: [10, 4, -10] as [number, number, number], intensity: 0.5 },
   nomination: { position: [0, 4, 11] as [number, number, number], intensity: 0.7 },
   kitchen: { position: [12, 4, 0] as [number, number, number], intensity: 0.5 },
   gameRoom: { position: [12, 4, 9] as [number, number, number], intensity: 0.4 },
   diaryRoom: { position: [-14, 3, -3] as [number, number, number], intensity: 0.6 },
   bedroom1: { position: [-5, 3.5, -10] as [number, number, number], intensity: 0.3 },
   bedroom2: { position: [3, 3.5, -10] as [number, number, number], intensity: 0.3 },
   backyard: { position: [0, 8, -22] as [number, number, number], intensity: 0.5 },
 };
 
 const DynamicRoomLighting: React.FC<DynamicRoomLightingProps> = ({ 
   event, 
   colors, 
   pulseSpeed,
   transitionProgress 
 }) => {
   const lightsRef = useRef<(THREE.PointLight | null)[]>([]);
   const spotlightsRef = useRef<(THREE.SpotLight | null)[]>([]);
   
   // Convert color strings to THREE.Color objects
   const primaryColor = useMemo(() => new THREE.Color(colors.primary), [colors.primary]);
   const accentColor = useMemo(() => new THREE.Color(colors.accent), [colors.accent]);
   
   useFrame(({ clock }) => {
     const time = clock.getElapsedTime();
     
     lightsRef.current.forEach((light, i) => {
       if (!light) return;
       
       // Calculate pulsing based on event type
       let intensityMultiplier = 1;
       let targetColor = primaryColor.clone();
       
       switch (event) {
         case 'eviction':
           // Deep red pulsing
           intensityMultiplier = 0.5 + Math.sin(time * pulseSpeed) * 0.4;
           // Add white flash occasionally
           if (Math.sin(time * 4) > 0.95) {
             targetColor = accentColor.clone();
             intensityMultiplier = 1.5;
           }
           break;
           
         case 'hoh':
           // Blue with gold flash bursts
           const flash = Math.sin(time * 8) > 0.9;
           targetColor = flash ? accentColor.clone() : primaryColor.clone();
           intensityMultiplier = flash ? 1.3 : 0.8 + Math.sin(time * pulseSpeed) * 0.2;
           break;
           
         case 'pov':
           // Golden glow with shimmer
           intensityMultiplier = 0.9 + Math.sin(time * pulseSpeed + i * 0.5) * 0.15;
           break;
           
         case 'nomination':
           // Ominous slow red pulse
           intensityMultiplier = 0.5 + Math.sin(time * pulseSpeed) * 0.35;
           // Stagger lights for wave effect
           const phase = (i * 0.3) % (Math.PI * 2);
           intensityMultiplier *= 0.7 + Math.sin(time * 0.5 + phase) * 0.3;
           break;
           
         case 'ceremony':
           // Gold and purple alternating
           const alternate = Math.sin(time * pulseSpeed + i) > 0;
           targetColor = alternate ? primaryColor.clone() : accentColor.clone();
           intensityMultiplier = 0.8 + Math.sin(time * 2) * 0.2;
           break;
           
         case 'finale':
           // Celebratory rainbow cycling
           const hue = (time * 0.1 + i * 0.1) % 1;
           targetColor = new THREE.Color().setHSL(hue, 0.8, 0.5);
           intensityMultiplier = 1 + Math.sin(time * pulseSpeed) * 0.3;
           break;
           
         default:
           // Normal ambient with gentle breathing
           intensityMultiplier = 0.95 + Math.sin(time * pulseSpeed) * 0.05;
       }
       
       // Apply transition progress for smooth color changes
       if (transitionProgress < 1) {
         intensityMultiplier *= transitionProgress;
       }
       
       // Update light properties
       light.color.copy(targetColor);
       light.intensity = ROOM_LIGHTS[Object.keys(ROOM_LIGHTS)[i] as keyof typeof ROOM_LIGHTS]?.intensity * intensityMultiplier || 0.5;
     });
     
     // Update spotlights for dramatic effects
     spotlightsRef.current.forEach((spotlight, i) => {
       if (!spotlight) return;
       
       if (event === 'eviction' || event === 'nomination') {
         spotlight.intensity = 0.8 + Math.sin(time * 2 + i) * 0.4;
         spotlight.color.copy(primaryColor);
       } else if (event === 'finale') {
         spotlight.intensity = 1 + Math.sin(time * 3) * 0.5;
       } else {
         spotlight.intensity = 0.3;
       }
     });
   });
   
   return (
     <group name="dynamic-lighting">
       {/* Room point lights */}
       {Object.entries(ROOM_LIGHTS).map(([name, config], i) => (
         <pointLight
           key={name}
           ref={el => lightsRef.current[i] = el}
           position={config.position}
           intensity={config.intensity}
           color={colors.primary}
           distance={12}
           decay={2}
         />
       ))}
       
       {/* Dramatic spotlights for ceremonies */}
       <spotLight
         ref={el => spotlightsRef.current[0] = el}
         position={[0, 6, 11]}
         angle={0.4}
         penumbra={0.5}
         intensity={0.3}
         color={colors.primary}
         target-position={[0, 0, 11]}
       />
       
       {/* HOH room spotlight */}
       <spotLight
         ref={el => spotlightsRef.current[1] = el}
         position={[10, 5, -10]}
         angle={0.5}
         penumbra={0.4}
         intensity={0.3}
         color={colors.accent}
       />
       
       {/* Backyard competition spotlight */}
       <spotLight
         ref={el => spotlightsRef.current[2] = el}
         position={[0, 10, -25]}
         angle={0.6}
         penumbra={0.3}
         intensity={0.4}
         color={colors.primary}
       />
       
       {/* Ambient light adjustment based on event */}
       <ambientLight intensity={event === 'eviction' ? 0.1 : event === 'nomination' ? 0.15 : 0.2} />
     </group>
   );
 };
 
 export default DynamicRoomLighting;