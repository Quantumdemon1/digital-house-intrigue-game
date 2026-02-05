 /**
  * @file hooks/useIdlePose.ts
  * @description Hook to apply natural idle standing pose to RPM avatar skeleton bones
  */
 
 import { useRef, useEffect, useMemo } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 // Natural standing pose bone rotations (radians)
 // These values move the arms from T-pose to a relaxed position at the sides
 const IDLE_POSE: Record<string, { x: number; y: number; z: number }> = {
   LeftArm: { x: 0.05, y: 0.1, z: 1.45 },   // Arm hanging relaxed at side
   RightArm: { x: 0.05, y: -0.1, z: -1.45 }, // Arm hanging relaxed at side
   LeftForeArm: { x: 0, y: 0, z: 0.08 },    // Very slight natural elbow bend
   RightForeArm: { x: 0, y: 0, z: -0.08 },  // Very slight natural elbow bend
   LeftHand: { x: 0, y: 0, z: 0.05 },       // Relaxed wrist
   RightHand: { x: 0, y: 0, z: -0.05 },     // Relaxed wrist
   Spine: { x: -0.02, y: 0, z: 0 },         // Very slight chest-out posture
   Spine1: { x: -0.01, y: 0, z: 0 },        // Continue slight posture
 };
 
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
 
 interface BoneRefs {
   leftArm: THREE.Bone | null;
   rightArm: THREE.Bone | null;
   leftForeArm: THREE.Bone | null;
   rightForeArm: THREE.Bone | null;
   spine: THREE.Bone | null;
   spine1: THREE.Bone | null;
   hips: THREE.Bone | null;
 }
 
 /**
  * Hook to apply a natural idle standing pose and subtle animations to RPM avatar bones
  * @param scene - The cloned THREE scene containing the avatar skeleton
  * @param enabled - Whether to apply the pose (default: true)
  * @param phaseOffset - Animation phase offset for staggered animations (default: 0)
  */
 export const useIdlePose = (
   scene: THREE.Object3D | null,
   enabled: boolean = true,
   phaseOffset: number = 0
 ) => {
   const bonesRef = useRef<BoneRefs>({
     leftArm: null,
     rightArm: null,
     leftForeArm: null,
     rightForeArm: null,
     spine: null,
     spine1: null,
     hips: null,
   });
   
   const initialized = useRef(false);
   
   // Find and cache bone references, apply initial pose
   useEffect(() => {
     if (!scene || !enabled || initialized.current) return;
     
     // Find bones
     bonesRef.current = {
       leftArm: findBone(scene, 'LeftArm'),
       rightArm: findBone(scene, 'RightArm'),
       leftForeArm: findBone(scene, 'LeftForeArm'),
       rightForeArm: findBone(scene, 'RightForeArm'),
       spine: findBone(scene, 'Spine'),
       spine1: findBone(scene, 'Spine1'),
       hips: findBone(scene, 'Hips'),
     };
     
     // Apply initial pose rotations
     Object.entries(IDLE_POSE).forEach(([boneName, rot]) => {
       const bone = findBone(scene, boneName);
       if (bone) {
         bone.rotation.set(rot.x, rot.y, rot.z);
       }
     });
     
     initialized.current = true;
   }, [scene, enabled]);
   
   // Reset when scene changes
   useEffect(() => {
     return () => {
       initialized.current = false;
     };
   }, [scene]);
   
   // Per-frame subtle bone animations
   useFrame(({ clock }) => {
     if (!enabled || !initialized.current) return;
     
     const bones = bonesRef.current;
     const time = clock.getElapsedTime() + phaseOffset;
     
     // Subtle arm sway - very gentle movement
     if (bones.leftArm) {
       bones.leftArm.rotation.z = 1.45 + Math.sin(time * 0.5) * 0.015;
       bones.leftArm.rotation.x = 0.05 + Math.sin(time * 0.3) * 0.008;
     }
     
     if (bones.rightArm) {
       bones.rightArm.rotation.z = -1.45 + Math.sin(time * 0.5 + 0.5) * 0.015;
       bones.rightArm.rotation.x = 0.05 + Math.sin(time * 0.3 + 0.5) * 0.008;
     }
     
     // Subtle forearm movement
     if (bones.leftForeArm) {
       bones.leftForeArm.rotation.z = 0.08 + Math.sin(time * 0.4) * 0.01;
     }
     
     if (bones.rightForeArm) {
       bones.rightForeArm.rotation.z = -0.08 + Math.sin(time * 0.4 + 0.3) * 0.01;
     }
     
     // Very subtle spine weight shift
     if (bones.spine) {
       bones.spine.rotation.z = Math.sin(time * 0.25) * 0.008;
       bones.spine.rotation.y = Math.sin(time * 0.2) * 0.005;
     }
     
     // Subtle hip sway for weight shift
     if (bones.hips) {
       bones.hips.rotation.z = Math.sin(time * 0.25 + 0.2) * 0.006;
     }
   });
 };
 
 export default useIdlePose;