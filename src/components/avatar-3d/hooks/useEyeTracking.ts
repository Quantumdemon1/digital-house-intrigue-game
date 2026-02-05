 /**
  * @file hooks/useEyeTracking.ts
  * @description Hook for independent eye tracking using ARKit eye blendshapes
  */
 
 import { useRef } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 export interface EyeTrackingConfig {
   /** Target position to look at (world space) */
   targetPosition: THREE.Vector3 | null;
   /** Character's world position */
   characterPosition: [number, number, number];
   /** Character's Y rotation (facing direction) */
   characterRotationY: number;
   /** Maximum eye angle in radians (~30 degrees default) */
   maxAngle?: number;
   /** Transition speed (0-1, higher = faster) */
   transitionSpeed?: number;
   /** Whether to add micro-saccades for realism */
   enableMicroSaccades?: boolean;
   /** Whether eye tracking is enabled */
   enabled?: boolean;
 }
 
 // Simple noise function for micro-saccades
 const noise = (t: number): number => {
   return Math.sin(t * 12.9898 + Math.cos(t * 78.233)) * 0.5 + 0.5;
 };
 
 /**
  * Hook for independent eye tracking using eye look blendshapes
  * Eyes can look at targets faster than head, creating realistic eye contact
  */
 export const useEyeTracking = (
   skinnedMeshes: THREE.SkinnedMesh[],
   config: EyeTrackingConfig
 ) => {
   const {
     targetPosition,
     characterPosition,
     characterRotationY,
     maxAngle = 0.52, // ~30 degrees
     transitionSpeed = 0.15, // Eyes move faster than head
     enableMicroSaccades = true,
     enabled = true,
   } = config;
   
   // Current eye look values for smooth transitions
   const currentHorizontal = useRef(0);
   const currentVertical = useRef(0);
   
   // Saccade timing
   const lastSaccadeTime = useRef(0);
   const saccadeOffset = useRef({ x: 0, y: 0 });
   
   useFrame(({ clock }) => {
     if (!enabled || skinnedMeshes.length === 0) return;
     
     const time = clock.getElapsedTime();
     
     // Target values
     let targetHorizontal = 0;
     let targetVertical = 0;
     
     if (targetPosition) {
       // Calculate eye position (approximate head height)
       const eyePos = new THREE.Vector3(
         characterPosition[0],
         characterPosition[1] + 1.65, // Eye height
         characterPosition[2]
       );
       
       // Direction to target
       const direction = targetPosition.clone().sub(eyePos);
       
       // Calculate angles relative to character facing
       const targetAngleY = Math.atan2(direction.x, direction.z);
       const relativeAngleY = targetAngleY - characterRotationY;
       
       // Normalize to -PI to PI
       let normalizedY = relativeAngleY;
       while (normalizedY > Math.PI) normalizedY -= Math.PI * 2;
       while (normalizedY < -Math.PI) normalizedY += Math.PI * 2;
       
       // Vertical angle
       const horizontalDist = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
       const verticalAngle = Math.atan2(direction.y - 0.15, horizontalDist); // Slight offset for eye height
       
       // Clamp to eye rotation limits
       targetHorizontal = THREE.MathUtils.clamp(normalizedY / maxAngle, -1, 1);
       targetVertical = THREE.MathUtils.clamp(-verticalAngle / maxAngle, -1, 1);
     }
     
     // Add micro-saccades for realism
     if (enableMicroSaccades && targetPosition) {
       // Random saccade every 2-4 seconds
       if (time - lastSaccadeTime.current > 2 + noise(time) * 2) {
         saccadeOffset.current = {
           x: (noise(time * 0.7) - 0.5) * 0.1,
           y: (noise(time * 0.9) - 0.5) * 0.06,
         };
         lastSaccadeTime.current = time;
       }
       
       // Decay saccade offset
       saccadeOffset.current.x *= 0.95;
       saccadeOffset.current.y *= 0.95;
       
       targetHorizontal += saccadeOffset.current.x;
       targetVertical += saccadeOffset.current.y;
     }
     
     // Smooth interpolation (eyes move faster than head)
     currentHorizontal.current = THREE.MathUtils.lerp(
       currentHorizontal.current,
       targetHorizontal,
       transitionSpeed
     );
     currentVertical.current = THREE.MathUtils.lerp(
       currentVertical.current,
       targetVertical,
       transitionSpeed
     );
     
     // Apply to morph targets
     const h = currentHorizontal.current;
     const v = currentVertical.current;
     
     skinnedMeshes.forEach(mesh => {
       if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
       
       const dict = mesh.morphTargetDictionary;
       const influences = mesh.morphTargetInfluences;
       
       // Reset all eye look morphs first
       const eyeMorphs = [
         'eyeLookUpLeft', 'eyeLookUpRight',
         'eyeLookDownLeft', 'eyeLookDownRight',
         'eyeLookInLeft', 'eyeLookInRight',
         'eyeLookOutLeft', 'eyeLookOutRight'
       ];
       
       eyeMorphs.forEach(name => {
         const idx = dict[name];
         if (idx !== undefined) influences[idx] = 0;
       });
       
       // Apply horizontal eye movement
       if (h > 0) {
         // Looking right: left eye looks out, right eye looks in
         const lookOutLeftIdx = dict['eyeLookOutLeft'];
         const lookInRightIdx = dict['eyeLookInRight'];
         if (lookOutLeftIdx !== undefined) influences[lookOutLeftIdx] = h;
         if (lookInRightIdx !== undefined) influences[lookInRightIdx] = h;
       } else if (h < 0) {
         // Looking left: left eye looks in, right eye looks out
         const lookInLeftIdx = dict['eyeLookInLeft'];
         const lookOutRightIdx = dict['eyeLookOutRight'];
         if (lookInLeftIdx !== undefined) influences[lookInLeftIdx] = -h;
         if (lookOutRightIdx !== undefined) influences[lookOutRightIdx] = -h;
       }
       
       // Apply vertical eye movement
       if (v > 0) {
         // Looking up
         const lookUpLeftIdx = dict['eyeLookUpLeft'];
         const lookUpRightIdx = dict['eyeLookUpRight'];
         if (lookUpLeftIdx !== undefined) influences[lookUpLeftIdx] = v;
         if (lookUpRightIdx !== undefined) influences[lookUpRightIdx] = v;
       } else if (v < 0) {
         // Looking down
         const lookDownLeftIdx = dict['eyeLookDownLeft'];
         const lookDownRightIdx = dict['eyeLookDownRight'];
         if (lookDownLeftIdx !== undefined) influences[lookDownLeftIdx] = -v;
         if (lookDownRightIdx !== undefined) influences[lookDownRightIdx] = -v;
       }
     });
   });
   
   return {
     currentHorizontal: currentHorizontal.current,
     currentVertical: currentVertical.current,
   };
 };
 
 export default useEyeTracking;