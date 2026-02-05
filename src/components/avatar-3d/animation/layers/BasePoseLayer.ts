 /**
  * @file animation/layers/BasePoseLayer.ts
  * @description Foundation pose layer with smooth transitions between poses
  */
 
 import * as THREE from 'three';
 import { BoneMap, BoneRotation, PoseType } from '../types';
 import { lerpBoneRotation } from '../utils/boneUtils';
 
 // Pose bone configurations - all values in radians
 export const POSE_CONFIGS: Record<PoseType, BoneMap> = {
   relaxed: {
     LeftArm: { rotation: { x: 0.05, y: 0.1, z: 1.45 } },
     RightArm: { rotation: { x: 0.05, y: -0.1, z: -1.45 } },
     LeftForeArm: { rotation: { x: 0, y: 0, z: 0.08 } },
     RightForeArm: { rotation: { x: 0, y: 0, z: -0.08 } },
     LeftHand: { rotation: { x: -0.3, y: 0, z: 0.05 } },
     RightHand: { rotation: { x: -0.3, y: 0, z: -0.05 } },
     Spine: { rotation: { x: -0.02, y: 0, z: 0 } },
     Spine1: { rotation: { x: -0.01, y: 0, z: 0 } },
     Hips: { rotation: { x: 0, y: 0, z: 0 } },
     Neck: { rotation: { x: 0, y: 0, z: 0 } },
     Head: { rotation: { x: 0, y: 0, z: 0 } },
   },
   'crossed-arms': {
     LeftArm: { rotation: { x: 0.8, y: 0.2, z: 0.5 } },
     RightArm: { rotation: { x: 0.8, y: -0.2, z: -0.5 } },
     LeftForeArm: { rotation: { x: 0, y: 0.4, z: 1.7 } },
     RightForeArm: { rotation: { x: 0, y: -0.4, z: -1.7 } },
     LeftHand: { rotation: { x: 0, y: -0.3, z: 0 } },
     RightHand: { rotation: { x: 0, y: 0.3, z: 0 } },
     Spine: { rotation: { x: -0.03, y: 0, z: 0 } },
     Spine1: { rotation: { x: -0.02, y: 0, z: 0 } },
     Hips: { rotation: { x: 0, y: 0, z: 0 } },
     Neck: { rotation: { x: 0, y: 0, z: 0 } },
     Head: { rotation: { x: 0, y: 0, z: 0 } },
   },
   'hands-on-hips': {
     LeftArm: { rotation: { x: 0.15, y: -0.2, z: 0.7 } },
     RightArm: { rotation: { x: 0.15, y: 0.2, z: -0.7 } },
     LeftForeArm: { rotation: { x: 0, y: 0.5, z: 1.4 } },
     RightForeArm: { rotation: { x: 0, y: -0.5, z: -1.4 } },
     LeftHand: { rotation: { x: 0.2, y: 0, z: 0.3 } },
     RightHand: { rotation: { x: 0.2, y: 0, z: -0.3 } },
     Spine: { rotation: { x: -0.02, y: 0, z: 0 } },
     Spine1: { rotation: { x: 0, y: 0, z: 0 } },
     Hips: { rotation: { x: 0, y: 0, z: 0.03 } },
     Neck: { rotation: { x: 0, y: 0, z: 0 } },
     Head: { rotation: { x: 0, y: 0, z: 0 } },
   },
   thinking: {
     LeftArm: { rotation: { x: 0.1, y: 0, z: 1.2 } },
     RightArm: { rotation: { x: 0.9, y: 0, z: -0.2 } },
     LeftForeArm: { rotation: { x: 0, y: 0, z: 0.3 } },
     RightForeArm: { rotation: { x: 0, y: 0, z: -2.0 } },
     LeftHand: { rotation: { x: -0.3, y: 0, z: 0.05 } },
     RightHand: { rotation: { x: -0.3, y: 0, z: 0 } },
     Spine: { rotation: { x: -0.02, y: 0.02, z: 0 } },
     Spine1: { rotation: { x: 0, y: 0, z: 0 } },
     Hips: { rotation: { x: 0, y: 0, z: 0 } },
     Neck: { rotation: { x: 0, y: 0, z: 0 } },
     Head: { rotation: { x: -0.08, y: 0, z: 0.04 } },
   },
   'casual-lean': {
     LeftArm: { rotation: { x: 0.05, y: 0.1, z: 1.45 } },
     RightArm: { rotation: { x: 0.05, y: -0.1, z: -1.35 } },
     LeftForeArm: { rotation: { x: 0, y: 0, z: 0.1 } },
     RightForeArm: { rotation: { x: 0, y: 0, z: -0.1 } },
     LeftHand: { rotation: { x: -0.3, y: 0, z: 0.05 } },
     RightHand: { rotation: { x: -0.3, y: 0, z: -0.05 } },
     Spine: { rotation: { x: -0.01, y: 0.02, z: 0.02 } },
     Spine1: { rotation: { x: 0, y: 0.01, z: 0.01 } },
     Hips: { rotation: { x: 0, y: 0, z: 0.04 } },
     Neck: { rotation: { x: 0, y: 0, z: 0 } },
     Head: { rotation: { x: 0, y: 0, z: 0 } },
   },
 };
 
 // Easing functions
 export const easeInOutCubic = (t: number): number => {
   return t < 0.5
     ? 4 * t * t * t
     : 1 - Math.pow(-2 * t + 2, 3) / 2;
 };
 
 export const easeOutQuart = (t: number): number => {
   return 1 - Math.pow(1 - t, 4);
 };
 
 export interface PoseTransitionState {
   fromPose: PoseType;
   toPose: PoseType;
   startTime: number;
   duration: number;
   isTransitioning: boolean;
 }
 
 /**
  * Create initial pose transition state
  */
 export const createPoseTransition = (initialPose: PoseType): PoseTransitionState => ({
   fromPose: initialPose,
   toPose: initialPose,
   startTime: 0,
   duration: 0.8,
   isTransitioning: false,
 });
 
 /**
  * Start a pose transition
  */
 export const startPoseTransition = (
   state: PoseTransitionState,
   toPose: PoseType,
   currentTime: number,
   duration: number = 0.8
 ): PoseTransitionState => {
   if (state.toPose === toPose) return state;
   
   return {
     fromPose: state.toPose,
     toPose,
     startTime: currentTime,
     duration,
     isTransitioning: true,
   };
 };
 
 /**
  * Update pose transition and get current blended bones
  */
 export const updatePoseTransition = (
   state: PoseTransitionState,
   currentTime: number
 ): { bones: BoneMap; state: PoseTransitionState } => {
   if (!state.isTransitioning) {
     return { bones: POSE_CONFIGS[state.toPose], state };
   }
   
   const elapsed = currentTime - state.startTime;
   const progress = Math.min(elapsed / state.duration, 1);
   const easedProgress = easeInOutCubic(progress);
   
   // Blend between poses
   const fromBones = POSE_CONFIGS[state.fromPose];
   const toBones = POSE_CONFIGS[state.toPose];
   const blendedBones: BoneMap = {};
   
   // Get all bone names from both poses
   const allBoneNames = new Set([
     ...Object.keys(fromBones),
     ...Object.keys(toBones),
   ]);
   
   allBoneNames.forEach((boneName) => {
     const fromRot = fromBones[boneName]?.rotation ?? { x: 0, y: 0, z: 0 };
     const toRot = toBones[boneName]?.rotation ?? fromRot;
     
     blendedBones[boneName] = {
       rotation: lerpBoneRotation(fromRot, toRot, easedProgress),
     };
   });
   
   // Check if transition complete
   const newState: PoseTransitionState = progress >= 1
     ? { ...state, isTransitioning: false }
     : state;
   
   return { bones: blendedBones, state: newState };
 };
 
 /**
  * Get base pose bones without transition
  */
 export const getBasePoseBones = (pose: PoseType): BoneMap => {
   return POSE_CONFIGS[pose];
 };