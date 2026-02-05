 /**
  * @file hooks/useLookAt.ts
  * @description Hook for dynamic head/neck look-at behavior toward a target position
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
   /** Smooth interpolation speed (0-1, higher = faster) */
   lerpSpeed?: number;
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
     lerpSpeed = 0.05,
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
   useFrame(() => {
     if (!enabled || !initialized.current) return;
     
     const { head, neck } = bonesRef.current;
     if (!head) return;
     
     // If no target, smoothly return to base rotation
     if (!targetPosition) {
       head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, baseHeadRotation.current.x, lerpSpeed);
       head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, baseHeadRotation.current.y, lerpSpeed);
       
       if (neck) {
         neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, baseNeckRotation.current.y, lerpSpeed);
       }
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
     
     // Split rotation between head (70%) and neck (30%) for natural movement
     const headTargetY = baseHeadRotation.current.y + clampedY * 0.7;
     const neckTargetY = baseNeckRotation.current.y + clampedY * 0.3;
     const headTargetX = baseHeadRotation.current.x + clampedX * 0.7;
     
     // Smoothly interpolate
     head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, headTargetY, lerpSpeed);
     head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, headTargetX, lerpSpeed);
     
     if (neck) {
       neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, neckTargetY, lerpSpeed);
     }
   });
 };
 
 export default useLookAt;