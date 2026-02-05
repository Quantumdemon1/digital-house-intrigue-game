 /**
  * @file hooks/usePoseVariety.ts
  * @description Hook to apply varied poses to RPM avatar skeleton bones based on character archetype
  */
 
 import { useRef, useEffect } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 // Pose type definitions
 export type PoseType = 'relaxed' | 'crossed-arms' | 'hands-on-hips' | 'thinking' | 'casual-lean';
 
 // Bone rotation configuration
 interface BoneRotation {
   x: number;
   y: number;
   z: number;
 }
 
 // Pose bone configurations - all values in radians
 const POSE_CONFIGS: Record<PoseType, Record<string, BoneRotation>> = {
   relaxed: {
    LeftArm: { x: 0.05, y: 0.1, z: 1.45 },      // Arms relaxed at sides
    RightArm: { x: 0.05, y: -0.1, z: -1.45 },   // Arms relaxed at sides
    LeftForeArm: { x: 0, y: 0, z: 0.08 },       // Slight elbow bend
    RightForeArm: { x: 0, y: 0, z: -0.08 },     // Slight elbow bend
    LeftHand: { x: 0, y: 0, z: 0.05 },          // Relaxed wrist
    RightHand: { x: 0, y: 0, z: -0.05 },        // Relaxed wrist
     Spine: { x: -0.02, y: 0, z: 0 },
     Spine1: { x: -0.01, y: 0, z: 0 },
   },
   'crossed-arms': {
     LeftArm: { x: 0.8, y: 0.2, z: 0.5 },
     RightArm: { x: 0.8, y: -0.2, z: -0.5 },
     LeftForeArm: { x: 0, y: 0.4, z: 1.7 },
     RightForeArm: { x: 0, y: -0.4, z: -1.7 },
     LeftHand: { x: 0, y: -0.3, z: 0 },
     RightHand: { x: 0, y: 0.3, z: 0 },
     Spine: { x: -0.03, y: 0, z: 0 },
     Spine1: { x: -0.02, y: 0, z: 0 },
   },
   'hands-on-hips': {
     LeftArm: { x: 0.15, y: -0.2, z: 0.7 },
     RightArm: { x: 0.15, y: 0.2, z: -0.7 },
     LeftForeArm: { x: 0, y: 0.5, z: 1.4 },
     RightForeArm: { x: 0, y: -0.5, z: -1.4 },
     LeftHand: { x: 0.2, y: 0, z: 0.3 },
     RightHand: { x: 0.2, y: 0, z: -0.3 },
     Spine: { x: -0.02, y: 0, z: 0 },
     Hips: { x: 0, y: 0, z: 0.03 },
   },
   thinking: {
     LeftArm: { x: 0.1, y: 0, z: 1.2 },
     RightArm: { x: 0.9, y: 0, z: -0.2 },
     LeftForeArm: { x: 0, y: 0, z: 0.3 },
     RightForeArm: { x: 0, y: 0, z: -2.0 },
     RightHand: { x: -0.3, y: 0, z: 0 },
     Head: { x: -0.08, y: 0, z: 0.04 },
     Spine: { x: -0.02, y: 0.02, z: 0 },
   },
   'casual-lean': {
    LeftArm: { x: 0.05, y: 0.1, z: 1.45 },      // Arms relaxed
    RightArm: { x: 0.05, y: -0.1, z: -1.35 },   // Slightly different for asymmetry
    LeftForeArm: { x: 0, y: 0, z: 0.1 },
    RightForeArm: { x: 0, y: 0, z: -0.1 },
     Hips: { x: 0, y: 0, z: 0.04 },
     Spine: { x: -0.01, y: 0.02, z: 0.02 },
     Spine1: { x: 0, y: 0.01, z: 0.01 },
   },
 };
 
 // Pose-specific animation parameters
 const POSE_ANIMATIONS: Record<PoseType, {
   armSway: number;
   armSwaySpeed: number;
   spineSway: number;
   hipSway: number;
 }> = {
   relaxed: { armSway: 0.02, armSwaySpeed: 0.5, spineSway: 0.008, hipSway: 0.006 },
   'crossed-arms': { armSway: 0.008, armSwaySpeed: 0.3, spineSway: 0.006, hipSway: 0.004 },
   'hands-on-hips': { armSway: 0.01, armSwaySpeed: 0.4, spineSway: 0.01, hipSway: 0.008 },
   thinking: { armSway: 0.005, armSwaySpeed: 0.2, spineSway: 0.004, hipSway: 0.003 },
   'casual-lean': { armSway: 0.015, armSwaySpeed: 0.35, spineSway: 0.012, hipSway: 0.01 },
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
   head: THREE.Bone | null;
 }
 
 /**
  * Hook to apply varied poses to RPM avatar skeleton bones
  * @param scene - The cloned THREE scene containing the avatar skeleton
  * @param poseType - The type of pose to apply
  * @param enabled - Whether to apply the pose (default: true)
  * @param phaseOffset - Animation phase offset for staggered animations (default: 0)
  */
 export const usePoseVariety = (
   scene: THREE.Object3D | null,
   poseType: PoseType = 'relaxed',
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
     head: null,
   });
   
   const initialized = useRef(false);
   const currentPose = useRef<PoseType>(poseType);
   
   // Find and cache bone references, apply initial pose
   useEffect(() => {
     if (!scene || !enabled) return;
     
     // Find bones
     bonesRef.current = {
       leftArm: findBone(scene, 'LeftArm'),
       rightArm: findBone(scene, 'RightArm'),
       leftForeArm: findBone(scene, 'LeftForeArm'),
       rightForeArm: findBone(scene, 'RightForeArm'),
       spine: findBone(scene, 'Spine'),
       spine1: findBone(scene, 'Spine1'),
       hips: findBone(scene, 'Hips'),
       head: findBone(scene, 'Head'),
     };
     
     // Apply initial pose rotations
     const poseConfig = POSE_CONFIGS[poseType];
     Object.entries(poseConfig).forEach(([boneName, rot]) => {
       const bone = findBone(scene, boneName);
       if (bone) {
         bone.rotation.set(rot.x, rot.y, rot.z);
       }
     });
     
     currentPose.current = poseType;
     initialized.current = true;
   }, [scene, enabled, poseType]);
   
   // Reset when scene changes
   useEffect(() => {
     return () => {
       initialized.current = false;
     };
   }, [scene]);
   
   // Per-frame subtle bone animations based on pose
   useFrame(({ clock }) => {
     if (!enabled || !initialized.current) return;
     
     const bones = bonesRef.current;
     const time = clock.getElapsedTime() + phaseOffset;
     const pose = currentPose.current;
     const poseConfig = POSE_CONFIGS[pose];
     const animConfig = POSE_ANIMATIONS[pose];
     
     // Subtle arm sway based on pose
     if (bones.leftArm && poseConfig.LeftArm) {
       const baseZ = poseConfig.LeftArm.z;
       bones.leftArm.rotation.z = baseZ + Math.sin(time * animConfig.armSwaySpeed) * animConfig.armSway;
       bones.leftArm.rotation.x = poseConfig.LeftArm.x + Math.sin(time * 0.3) * 0.01;
     }
     
     if (bones.rightArm && poseConfig.RightArm) {
       const baseZ = poseConfig.RightArm.z;
       bones.rightArm.rotation.z = baseZ + Math.sin(time * animConfig.armSwaySpeed + 0.5) * animConfig.armSway;
       bones.rightArm.rotation.x = poseConfig.RightArm.x + Math.sin(time * 0.3 + 0.5) * 0.01;
     }
     
     // Subtle forearm movement
     if (bones.leftForeArm && poseConfig.LeftForeArm) {
       bones.leftForeArm.rotation.z = poseConfig.LeftForeArm.z + Math.sin(time * 0.4) * 0.015;
     }
     
     if (bones.rightForeArm && poseConfig.RightForeArm) {
       bones.rightForeArm.rotation.z = poseConfig.RightForeArm.z + Math.sin(time * 0.4 + 0.3) * 0.015;
     }
     
     // Very subtle spine weight shift
     if (bones.spine && poseConfig.Spine) {
       bones.spine.rotation.z = poseConfig.Spine.z + Math.sin(time * 0.25) * animConfig.spineSway;
       bones.spine.rotation.y = poseConfig.Spine.y + Math.sin(time * 0.2) * 0.005;
     }
     
     // Subtle hip sway for weight shift
     if (bones.hips) {
       const baseHipZ = poseConfig.Hips?.z ?? 0;
       bones.hips.rotation.z = baseHipZ + Math.sin(time * 0.25 + 0.2) * animConfig.hipSway;
     }
     
     // Thinking pose: subtle head movement
     if (pose === 'thinking' && bones.head && poseConfig.Head) {
       bones.head.rotation.x = poseConfig.Head.x + Math.sin(time * 0.15) * 0.02;
       bones.head.rotation.z = poseConfig.Head.z + Math.sin(time * 0.1) * 0.01;
     }
   });
 };
 
 export default usePoseVariety;