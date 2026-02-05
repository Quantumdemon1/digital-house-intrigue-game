 /**
  * @file hooks/useLookAt.ts
 * @description Hook for dynamic head/neck look-at behavior with eye-lead effect
 * Eyes target 150-200ms before the head follows for natural look-at behavior
  */
 
 import { useRef, useEffect } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 // Find a bone by name in the scene hierarchy
 const findBone = (scene: THREE.Object3D, name: string): THREE.Bone | null => {
   let bone: THREE.Bone | null = null;
   scene.traverse((child) => {
     if (child instanceof THREE.Bone && child.name === name) {
       bone = child;
     }
   });
   return bone;
 };
 
 export interface LookAtConfig {
   /** Target position to look at (world space) */
   targetPosition: THREE.Vector3 | null;
   /** Character's world position */
   characterPosition: [number, number, number];
   /** Character's Y rotation (facing direction) */
   characterRotationY: number;
   /** Maximum head rotation Y (side-to-side) in radians - default ~60 degrees */
   maxHeadRotationY?: number;
   /** Maximum head rotation X (up-down) in radians - default ~30 degrees */
   maxHeadRotationX?: number;
  /** Head interpolation speed (0-1, higher = faster) - default 0.05 */
  headLerpSpeed?: number;
  /** Eye-lead delay in seconds - eyes reach target before head - default 0.18 */
  eyeLeadDelay?: number;
   /** Whether to enable the look-at behavior */
   enabled?: boolean;
 }
 
 interface HeadNeckRefs {
   head: THREE.Bone | null;
   neck: THREE.Bone | null;
 }
 
 /**
  * Hook for dynamic head/neck look-at behavior
  * Characters turn their heads smoothly toward a target (selected character or camera)
  */
 export const useLookAt = (
   scene: THREE.Object3D | null,
   config: LookAtConfig
 ) => {
   const {
     targetPosition,
     characterPosition,
     characterRotationY,
     maxHeadRotationY = 1.04, // ~60 degrees
     maxHeadRotationX = 0.52, // ~30 degrees
    headLerpSpeed = 0.05,
    eyeLeadDelay = 0.18, // 180ms eye-lead
     enabled = true,
   } = config;
   
   const bonesRef = useRef<HeadNeckRefs>({
     head: null,
     neck: null,
   });
   
   const initialized = useRef(false);
   
   // Base head rotation (from pose) to preserve
   const baseHeadRotation = useRef({ x: 0, y: 0, z: 0 });
   const baseNeckRotation = useRef({ x: 0, y: 0, z: 0 });
   
   // Eye-lead tracking: store the target rotation history
   const targetRotationHistory = useRef<{ y: number; x: number; time: number }[]>([]);
   const currentEyeTarget = useRef({ x: 0, y: 0 });
   
   // Find and cache bone references
   useEffect(() => {
     if (!scene || !enabled) return;
     
     const head = findBone(scene, 'Head');
     const neck = findBone(scene, 'Neck');
     
     bonesRef.current = { head, neck };
     
     // Store base rotations
     if (head) {
       baseHeadRotation.current = {
         x: head.rotation.x,
         y: head.rotation.y,
         z: head.rotation.z,
       };
     }
     if (neck) {
       baseNeckRotation.current = {
         x: neck.rotation.x,
         y: neck.rotation.y,
         z: neck.rotation.z,
       };
     }
     
     initialized.current = true;
   }, [scene, enabled]);
   
   // Reset when scene changes
   useEffect(() => {
     return () => {
       initialized.current = false;
     };
   }, [scene]);
   
   // Per-frame look-at calculation
  useFrame(({ clock }) => {
     if (!enabled || !initialized.current) return;
     
     const { head, neck } = bonesRef.current;
     if (!head) return;
     
     const time = clock.getElapsedTime();
     
     // If no target, smoothly return to base rotation
     if (!targetPosition) {
       head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, baseHeadRotation.current.x, headLerpSpeed);
       head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, baseHeadRotation.current.y, headLerpSpeed);
       
       if (neck) {
         neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, baseNeckRotation.current.y, headLerpSpeed);
       }
       
       // Clear history when no target
       targetRotationHistory.current = [];
       currentEyeTarget.current = { x: 0, y: 0 };
       return;
     }
     
     // Calculate direction to target in world space
     const charPos = new THREE.Vector3(
       characterPosition[0],
       characterPosition[1] + 1.6, // Approximate head height
       characterPosition[2]
     );
     
     const direction = targetPosition.clone().sub(charPos);
     
     // Calculate target rotation relative to character's facing direction
     const targetAngleY = Math.atan2(direction.x, direction.z);
     
     // Adjust for character's body rotation (they face -angle + Math.PI from getCharacterPositions)
     const relativeAngleY = targetAngleY - characterRotationY;
     
     // Normalize to -PI to PI
     let normalizedY = relativeAngleY;
     while (normalizedY > Math.PI) normalizedY -= Math.PI * 2;
     while (normalizedY < -Math.PI) normalizedY += Math.PI * 2;
     
     // Calculate vertical angle (up/down)
     const horizontalDist = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
     const targetAngleX = Math.atan2(direction.y, horizontalDist);
     
     // Clamp to limits
     const clampedY = THREE.MathUtils.clamp(normalizedY, -maxHeadRotationY, maxHeadRotationY);
     const clampedX = THREE.MathUtils.clamp(-targetAngleX, -maxHeadRotationX, maxHeadRotationX);
     
     // Eye-lead system: eyes see the current target immediately
     // Head uses delayed target from history
     const currentTarget = { y: clampedY, x: clampedX, time };
     
     // Update eye target (eyes are fast, almost immediate)
     currentEyeTarget.current.x = THREE.MathUtils.lerp(currentEyeTarget.current.x, clampedX, 0.15);
     currentEyeTarget.current.y = THREE.MathUtils.lerp(currentEyeTarget.current.y, clampedY, 0.15);
     
     // Store current target in history
     targetRotationHistory.current.push(currentTarget);
     
     // Clean old entries (keep last 500ms of history)
     while (targetRotationHistory.current.length > 0 && 
            time - targetRotationHistory.current[0].time > 0.5) {
       targetRotationHistory.current.shift();
     }
     
     // Get delayed target for head (from eyeLeadDelay seconds ago)
     let delayedY = clampedY;
     let delayedX = clampedX;
     
     const delayedTime = time - eyeLeadDelay;
     const history = targetRotationHistory.current;
     
     // Find the entry closest to the delayed time
     if (history.length > 1) {
       for (let i = history.length - 1; i >= 0; i--) {
         if (history[i].time <= delayedTime) {
           // Interpolate between this entry and the next for smoothness
           if (i < history.length - 1) {
             const t = (delayedTime - history[i].time) / (history[i + 1].time - history[i].time);
             delayedY = THREE.MathUtils.lerp(history[i].y, history[i + 1].y, t);
             delayedX = THREE.MathUtils.lerp(history[i].x, history[i + 1].x, t);
           } else {
             delayedY = history[i].y;
             delayedX = history[i].x;
           }
           break;
         }
       }
       // If no entry found before delayed time, use first entry
       if (delayedTime < history[0].time && history.length > 0) {
         delayedY = history[0].y;
         delayedX = history[0].x;
       }
     }
     
     // Split rotation between head (70%) and neck (30%) for natural movement
     // Use DELAYED target for head to create eye-lead effect
     const headTargetY = baseHeadRotation.current.y + delayedY * 0.7;
     const neckTargetY = baseNeckRotation.current.y + delayedY * 0.3;
     const headTargetX = baseHeadRotation.current.x + delayedX * 0.7;
     
     // Smoothly interpolate
     head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, headTargetY, headLerpSpeed);
     head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, headTargetX, headLerpSpeed);
     
     if (neck) {
       neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, neckTargetY, headLerpSpeed);
     }
   });
   
   return {
     /** Current eye target (reaches before head) */
     eyeTarget: currentEyeTarget.current,
   };
 };
 
 export default useLookAt;