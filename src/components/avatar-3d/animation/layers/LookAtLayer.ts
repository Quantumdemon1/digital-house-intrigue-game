 /**
  * @file animation/layers/LookAtLayer.ts
  * @description Enhanced look-at system with eye-lead behavior and natural glances
  */
 
 import * as THREE from 'three';
 import { BoneMap, BoneRotation, SpringConfig } from '../types';
 import { 
   Spring3DState, 
   createSpring3D, 
   updateSpring3D, 
   setSpring3DTarget,
   getSpring3DPosition 
 } from '../utils/springPhysics';
 
 export interface LookAtConfig {
   // Target
   targetPosition: THREE.Vector3 | null;
   characterPosition: [number, number, number];
   characterRotationY: number;
   
   // Limits
   maxHeadYaw: number;         // Side-to-side limit (radians, ~60°)
   maxHeadPitch: number;       // Up-down limit (radians, ~30°)
   
   // Eye-lead behavior
   eyeLeadTime: number;        // Eyes arrive before head (0.1-0.3s)
   
   // Natural behavior
   enableBreakAway: boolean;   // Occasionally look away
   breakAwayChance: number;    // Per-second probability (0-0.1)
   breakAwayDuration: number;  // How long (0.3-1.0s)
 }
 
 export const DEFAULT_LOOKAT_CONFIG: LookAtConfig = {
   targetPosition: null,
   characterPosition: [0, 0, 0],
   characterRotationY: 0,
   maxHeadYaw: 1.04,           // ~60 degrees
   maxHeadPitch: 0.52,         // ~30 degrees
   eyeLeadTime: 0.15,
   enableBreakAway: true,
   breakAwayChance: 0.02,
   breakAwayDuration: 0.5,
 };
 
 // Spring config for smooth head movement
 const HEAD_SPRING: SpringConfig = { stiffness: 0.25, damping: 0.7, mass: 0.4 };
 const NECK_SPRING: SpringConfig = { stiffness: 0.3, damping: 0.75, mass: 0.3 };
 
 export interface LookAtState {
   headSpring: Spring3DState;
   neckSpring: Spring3DState;
   eyePosition: { horizontal: number; vertical: number };
   isBreakingAway: boolean;
   breakAwayEndTime: number;
   breakAwayTarget: { x: number; y: number };
   lastTargetChange: number;
 }
 
 /**
  * Create initial look-at state
  */
 export const createLookAtState = (): LookAtState => ({
   headSpring: createSpring3D(),
   neckSpring: createSpring3D(),
   eyePosition: { horizontal: 0, vertical: 0 },
   isBreakingAway: false,
   breakAwayEndTime: 0,
   breakAwayTarget: { x: 0, y: 0 },
   lastTargetChange: 0,
 });
 
 /**
  * Calculate look-at angles from target position
  */
 const calculateLookAtAngles = (
   target: THREE.Vector3,
   characterPosition: [number, number, number],
   characterRotationY: number
 ): { yaw: number; pitch: number } => {
   // Eye position (approximate head height)
   const eyePos = new THREE.Vector3(
     characterPosition[0],
     characterPosition[1] + 1.6,
     characterPosition[2]
   );
   
   const direction = target.clone().sub(eyePos);
   
   // Horizontal angle (yaw)
   const targetAngleY = Math.atan2(direction.x, direction.z);
   let relativeAngleY = targetAngleY - characterRotationY;
   
   // Normalize to -PI to PI
   while (relativeAngleY > Math.PI) relativeAngleY -= Math.PI * 2;
   while (relativeAngleY < -Math.PI) relativeAngleY += Math.PI * 2;
   
   // Vertical angle (pitch)
   const horizontalDist = Math.sqrt(direction.x ** 2 + direction.z ** 2);
   const pitch = Math.atan2(direction.y, horizontalDist);
   
   return { yaw: relativeAngleY, pitch: -pitch };
 };
 
 /**
  * Update look-at state and get bone rotations
  */
 export const updateLookAt = (
   state: LookAtState,
   config: LookAtConfig,
   time: number,
   deltaTime: number
 ): { bones: BoneMap; eyeMorphs: Record<string, number>; state: LookAtState } => {
   let newState = { ...state };
   
   // Target angles
   let targetYaw = 0;
   let targetPitch = 0;
   
   if (config.targetPosition) {
     const angles = calculateLookAtAngles(
       config.targetPosition,
       config.characterPosition,
       config.characterRotationY
     );
     
     // Clamp to limits
     targetYaw = THREE.MathUtils.clamp(angles.yaw, -config.maxHeadYaw, config.maxHeadYaw);
     targetPitch = THREE.MathUtils.clamp(angles.pitch, -config.maxHeadPitch, config.maxHeadPitch);
   }
   
   // Handle break-away glances
   if (config.enableBreakAway && config.targetPosition) {
     if (newState.isBreakingAway) {
       // Check if break-away is over
       if (time >= newState.breakAwayEndTime) {
         newState.isBreakingAway = false;
       } else {
         // Apply break-away offset
         targetYaw += newState.breakAwayTarget.x;
         targetPitch += newState.breakAwayTarget.y;
       }
     } else {
       // Random chance to start break-away
       if (Math.random() < config.breakAwayChance * deltaTime) {
         newState.isBreakingAway = true;
         newState.breakAwayEndTime = time + config.breakAwayDuration;
         newState.breakAwayTarget = {
           x: (Math.random() - 0.5) * 0.5,  // Random horizontal offset
           y: (Math.random() - 0.5) * 0.3,  // Random vertical offset
         };
       }
     }
   }
   
   // Update springs for smooth movement
   newState.headSpring = setSpring3DTarget(newState.headSpring, { x: targetPitch * 0.7, y: targetYaw * 0.7, z: 0 });
   newState.neckSpring = setSpring3DTarget(newState.neckSpring, { x: targetPitch * 0.3, y: targetYaw * 0.3, z: 0 });
   
    // Normalize deltaTime to 60fps baseline but clamp to stable range
    const dt = Math.min(Math.max(deltaTime * 60, 0.1), 1.5);
    
    newState.headSpring = updateSpring3D(newState.headSpring, HEAD_SPRING, dt);
    newState.neckSpring = updateSpring3D(newState.neckSpring, NECK_SPRING, dt);
   
   const headRot = getSpring3DPosition(newState.headSpring);
   const neckRot = getSpring3DPosition(newState.neckSpring);
   
   // Eye tracking (leads head by eyeLeadTime)
   const eyeSpeed = 0.2; // Fast eye movement
   const targetEyeH = THREE.MathUtils.clamp(targetYaw / config.maxHeadYaw, -1, 1);
   const targetEyeV = THREE.MathUtils.clamp(targetPitch / config.maxHeadPitch, -1, 1);
   
   newState.eyePosition = {
     horizontal: THREE.MathUtils.lerp(newState.eyePosition.horizontal, targetEyeH, eyeSpeed),
     vertical: THREE.MathUtils.lerp(newState.eyePosition.vertical, targetEyeV, eyeSpeed),
   };
   
   // Build bone map
   const bones: BoneMap = {
     Head: { rotation: { x: headRot.x, y: headRot.y, z: 0 } },
     Neck: { rotation: { x: neckRot.x, y: neckRot.y, z: 0 } },
   };
   
   // Build eye morph targets
   const eyeMorphs = calculateEyeMorphs(newState.eyePosition.horizontal, newState.eyePosition.vertical);
   
   return { bones, eyeMorphs, state: newState };
 };
 
 /**
  * Calculate eye morph targets from look direction
  */
 const calculateEyeMorphs = (
   horizontal: number,  // -1 (left) to 1 (right)
   vertical: number     // -1 (down) to 1 (up)
 ): Record<string, number> => {
   const morphs: Record<string, number> = {};
   
   // Horizontal eye movement
   if (horizontal > 0) {
     // Looking right
     morphs['eyeLookOutLeft'] = horizontal;
     morphs['eyeLookInRight'] = horizontal;
   } else if (horizontal < 0) {
     // Looking left
     morphs['eyeLookInLeft'] = -horizontal;
     morphs['eyeLookOutRight'] = -horizontal;
   }
   
   // Vertical eye movement
   if (vertical > 0) {
     // Looking up
     morphs['eyeLookUpLeft'] = vertical;
     morphs['eyeLookUpRight'] = vertical;
   } else if (vertical < 0) {
     // Looking down
     morphs['eyeLookDownLeft'] = -vertical;
     morphs['eyeLookDownRight'] = -vertical;
   }
   
   return morphs;
 };
 
 /**
  * Get bones for returning to neutral position
  */
 export const getLookAtNeutralBones = (): BoneMap => ({
   Head: { rotation: { x: 0, y: 0, z: 0 } },
   Neck: { rotation: { x: 0, y: 0, z: 0 } },
 });