 /**
  * @file useEventLighting.ts
  * @description Hook to manage dynamic room lighting based on game phase
  */
 
 import { useState, useEffect, useRef } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 export type LightingEvent = 
   | 'normal' 
   | 'hoh' 
   | 'pov' 
   | 'nomination' 
   | 'eviction' 
   | 'ceremony' 
   | 'finale';
 
 export interface LightingColors {
   primary: string;
   accent: string;
   ambient: string;
 }
 
 export interface EventLightingState {
   event: LightingEvent;
   colors: LightingColors;
   intensity: number;
   pulseSpeed: number;
   transitionProgress: number;
 }
 
 const LIGHTING_PRESETS: Record<LightingEvent, { colors: LightingColors; pulseSpeed: number }> = {
   normal: {
     colors: { primary: '#fef3c7', accent: '#3b82f6', ambient: '#1e293b' },
     pulseSpeed: 0.3,
   },
   hoh: {
     colors: { primary: '#3b82f6', accent: '#fbbf24', ambient: '#1e3a5f' },
     pulseSpeed: 0.8,
   },
   pov: {
     colors: { primary: '#fbbf24', accent: '#ffffff', ambient: '#422006' },
     pulseSpeed: 0.6,
   },
   nomination: {
     colors: { primary: '#dc2626', accent: '#0f172a', ambient: '#450a0a' },
     pulseSpeed: 1.5,
   },
   eviction: {
     colors: { primary: '#991b1b', accent: '#ffffff', ambient: '#1c1917' },
     pulseSpeed: 2.0,
   },
   ceremony: {
     colors: { primary: '#fbbf24', accent: '#a855f7', ambient: '#1e1b4b' },
     pulseSpeed: 0.5,
   },
   finale: {
     colors: { primary: '#fbbf24', accent: '#22c55e', ambient: '#0f172a' },
     pulseSpeed: 1.0,
   },
 };
 
 // Map game phases to lighting events
 const PHASE_TO_EVENT: Record<string, LightingEvent> = {
   'HoH': 'hoh',
   'HOH Competition': 'hoh',
   'HoH Competition': 'hoh',
   'Nomination': 'nomination',
   'Nominations': 'nomination',
   'PoV': 'pov',
   'POV Competition': 'pov',
   'PoV Competition': 'pov',
   'POV Selection': 'pov',
   'PoV Selection': 'pov',
   'Veto': 'ceremony',
   'Veto Meeting': 'ceremony',
   'PoV Meeting': 'ceremony',
   'Eviction': 'eviction',
   'Live Eviction': 'eviction',
   'Finale': 'finale',
   'Final HoH': 'finale',
   'Jury': 'ceremony',
   'Jury Questioning': 'ceremony',
 };
 
 export const useEventLighting = (gamePhase?: string): EventLightingState => {
   const [lightingState, setLightingState] = useState<EventLightingState>({
     event: 'normal',
     colors: LIGHTING_PRESETS.normal.colors,
     intensity: 1,
     pulseSpeed: LIGHTING_PRESETS.normal.pulseSpeed,
     transitionProgress: 1,
   });
   
   const transitionRef = useRef({ start: 0, duration: 1000 });
   
   useEffect(() => {
     if (!gamePhase) return;
     
     const event = PHASE_TO_EVENT[gamePhase] || 'normal';
     const preset = LIGHTING_PRESETS[event];
     
     // Start transition
     transitionRef.current.start = Date.now();
     
     setLightingState(prev => ({
       event,
       colors: preset.colors,
       intensity: 1,
       pulseSpeed: preset.pulseSpeed,
       transitionProgress: prev.event === event ? 1 : 0,
     }));
   }, [gamePhase]);
   
   // Animate transition progress
   useEffect(() => {
     if (lightingState.transitionProgress >= 1) return;
     
     const animate = () => {
       const elapsed = Date.now() - transitionRef.current.start;
       const progress = Math.min(elapsed / transitionRef.current.duration, 1);
       
       setLightingState(prev => ({
         ...prev,
         transitionProgress: easeOutCubic(progress),
       }));
       
       if (progress < 1) {
         requestAnimationFrame(animate);
       }
     };
     
     requestAnimationFrame(animate);
   }, [lightingState.event]);
   
   return lightingState;
 };
 
 // Easing function
 const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
 
 /**
  * Interpolate between two colors
  */
 export const interpolateColor = (from: string, to: string, progress: number): string => {
   const fromColor = new THREE.Color(from);
   const toColor = new THREE.Color(to);
   const result = fromColor.clone().lerp(toColor, progress);
   return `#${result.getHexString()}`;
 };
 
 /**
  * Get pulsing intensity based on event type
  */
 export const usePulsingIntensity = (
   baseIntensity: number, 
   pulseSpeed: number, 
   event: LightingEvent
 ): number => {
   const intensityRef = useRef(baseIntensity);
   
   useFrame(({ clock }) => {
     const time = clock.getElapsedTime();
     
     switch (event) {
       case 'eviction':
         // Deep pulsing for eviction drama
         intensityRef.current = baseIntensity * (0.5 + Math.sin(time * pulseSpeed) * 0.4);
         break;
       case 'hoh':
         // Quick flashes for HoH competition
         intensityRef.current = baseIntensity * (0.8 + (Math.sin(time * pulseSpeed * 8) > 0.9 ? 0.4 : 0));
         break;
       case 'pov':
         // Golden glow pulse
         intensityRef.current = baseIntensity * (0.9 + Math.sin(time * pulseSpeed) * 0.15);
         break;
       case 'nomination':
         // Ominous slow pulse
         intensityRef.current = baseIntensity * (0.6 + Math.sin(time * pulseSpeed) * 0.3);
         break;
       case 'finale':
         // Celebratory multi-wave
         intensityRef.current = baseIntensity * (0.8 + Math.sin(time * pulseSpeed) * 0.2 + Math.sin(time * 2) * 0.1);
         break;
       default:
         // Gentle ambient breathing
         intensityRef.current = baseIntensity * (0.95 + Math.sin(time * pulseSpeed) * 0.05);
     }
   });
   
   return intensityRef.current;
 };
 
 export default useEventLighting;