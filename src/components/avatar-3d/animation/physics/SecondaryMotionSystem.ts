 /**
  * @file animation/physics/SecondaryMotionSystem.ts
  * @description Spring-based secondary motion for natural follow-through on bones
  */
 
 import { BoneMap, BoneRotation } from '../types';
 import { SpringConfig } from '../types';
 import {
   Spring3DState,
   createSpring3D,
   updateSpring3D,
   setSpring3DTarget,
   getSpring3DPosition,
 } from '../utils/springPhysics';
 
 // ============ Configuration ============
 
 /**
  * Spring configurations tuned for each bone type
  * Lower stiffness = more lag/follow-through
  * Lower damping = more bounce/overshoot
  * Higher mass = more momentum
  */
 export const SECONDARY_MOTION_CONFIGS: Record<string, SpringConfig> = {
   // Head has subtle lag and overshoot when turning
   Head: { stiffness: 0.25, damping: 0.75, mass: 0.4 },
   
   // Neck follows head but slightly faster
   Neck: { stiffness: 0.30, damping: 0.70, mass: 0.3 },
   
   // Upper spine has more inertia
   Spine2: { stiffness: 0.40, damping: 0.80, mass: 0.6 },
   
   // Hands are loose and continue moving after gestures
   LeftHand: { stiffness: 0.15, damping: 0.55, mass: 0.15 },
   RightHand: { stiffness: 0.15, damping: 0.55, mass: 0.15 },
   
   // Forearms have more follow-through than upper arms
   LeftForeArm: { stiffness: 0.20, damping: 0.60, mass: 0.25 },
   RightForeArm: { stiffness: 0.20, damping: 0.60, mass: 0.25 },
 };
 
 // Bones that should have secondary motion applied
 const TRACKED_BONES = [
   'Head',
   'Neck', 
   'Spine2',
   'LeftHand',
   'RightHand',
   'LeftForeArm',
   'RightForeArm',
 ];
 
 // ============ State ============
 
 export interface SecondaryMotionState {
   springs: Record<string, Spring3DState>;
   initialized: boolean;
 }
 
 /**
  * Create initial secondary motion state
  */
 export const createSecondaryMotionState = (): SecondaryMotionState => ({
   springs: {},
   initialized: false,
 });
 
 /**
  * Initialize springs for all tracked bones based on current bone rotations
  */
 export const initializeSecondaryMotion = (
   state: SecondaryMotionState,
   currentBones: BoneMap
 ): SecondaryMotionState => {
   const springs: Record<string, Spring3DState> = {};
   
   TRACKED_BONES.forEach(boneName => {
     const bone = currentBones[boneName];
     if (bone) {
       springs[boneName] = createSpring3D({
         x: bone.rotation.x,
         y: bone.rotation.y,
         z: bone.rotation.z,
       });
     } else {
       // Default to zero rotation if bone not found
       springs[boneName] = createSpring3D({ x: 0, y: 0, z: 0 });
     }
   });
   
   return {
     springs,
     initialized: true,
   };
 };
 
 /**
  * Update secondary motion springs and return filtered bone rotations
  * 
  * @param state Current secondary motion state
  * @param targetBones Target bone rotations (from animation layers)
  * @param deltaTime Time since last frame in seconds
  * @param enabled Whether physics is enabled
  * @returns Updated bone map with spring-filtered rotations
  */
 export const updateSecondaryMotion = (
   state: SecondaryMotionState,
   targetBones: BoneMap,
   deltaTime: number,
   enabled: boolean
 ): { bones: BoneMap; state: SecondaryMotionState } => {
   // If disabled, pass through unchanged
   if (!enabled) {
     return { bones: targetBones, state };
   }
   
   // Initialize if needed
   let currentState = state;
   if (!currentState.initialized) {
     currentState = initializeSecondaryMotion(currentState, targetBones);
   }
   
   // Cap deltaTime to avoid instability
   const dt = Math.min(deltaTime, 0.05) * 60; // Normalize to 60fps
   
   const resultBones: BoneMap = { ...targetBones };
   const newSprings: Record<string, Spring3DState> = { ...currentState.springs };
   
   // Update each tracked bone's spring
   TRACKED_BONES.forEach(boneName => {
     const spring = currentState.springs[boneName];
     const target = targetBones[boneName];
     const config = SECONDARY_MOTION_CONFIGS[boneName];
     
     if (!spring || !config) return;
     
     // Set target from animation output
     let updatedSpring = spring;
     if (target) {
       updatedSpring = setSpring3DTarget(spring, {
         x: target.rotation.x,
         y: target.rotation.y,
         z: target.rotation.z,
       });
     }
     
     // Update spring physics
     updatedSpring = updateSpring3D(updatedSpring, config, dt);
     newSprings[boneName] = updatedSpring;
     
     // Get filtered position
     const filtered = getSpring3DPosition(updatedSpring);
     
     // Apply to result bones
     if (resultBones[boneName]) {
       resultBones[boneName] = {
         ...resultBones[boneName],
         rotation: {
           x: filtered.x,
           y: filtered.y,
           z: filtered.z,
         },
       };
     }
   });
   
   return {
     bones: resultBones,
     state: {
       springs: newSprings,
       initialized: true,
     },
   };
 };
 
 /**
  * Reset spring state (e.g., when character changes or on major transitions)
  */
 export const resetSecondaryMotion = (
   state: SecondaryMotionState,
   currentBones: BoneMap
 ): SecondaryMotionState => {
   return initializeSecondaryMotion(createSecondaryMotionState(), currentBones);
 };
 
 /**
  * Apply an impulse to a specific bone's spring (for impact effects)
  */
 export const applyImpulse = (
   state: SecondaryMotionState,
   boneName: string,
   impulse: { x: number; y: number; z: number }
 ): SecondaryMotionState => {
   const spring = state.springs[boneName];
   if (!spring) return state;
   
   return {
     ...state,
     springs: {
       ...state.springs,
       [boneName]: {
         x: { ...spring.x, velocity: spring.x.velocity + impulse.x },
         y: { ...spring.y, velocity: spring.y.velocity + impulse.y },
         z: { ...spring.z, velocity: spring.z.velocity + impulse.z },
       },
     },
   };
 };