 /**
  * @file animation/utils/boneUtils.ts
  * @description Bone manipulation utilities
  */
 
 import * as THREE from 'three';
 import { BoneRotation, BoneMap, BoneState } from '../types';
 
// Per-bone rotation limits to prevent physically impossible poses
const BONE_LIMITS: Record<string, { min: number; max: number }> = {
  Head: { min: -0.8, max: 0.8 },
  Neck: { min: -0.5, max: 0.5 },
  Spine: { min: -0.3, max: 0.3 },
  Spine1: { min: -0.3, max: 0.3 },
  Spine2: { min: -0.3, max: 0.3 },
  LeftShoulder: { min: -0.5, max: 0.5 },
  RightShoulder: { min: -0.5, max: 0.5 },
  LeftArm: { min: -2.0, max: 2.0 },
  RightArm: { min: -2.0, max: 2.0 },
  LeftForeArm: { min: -2.5, max: 2.5 },
  RightForeArm: { min: -2.5, max: 2.5 },
  LeftHand: { min: -1.0, max: 1.0 },
  RightHand: { min: -1.0, max: 1.0 },
  Hips: { min: -0.3, max: 0.3 },
};

/**
 * Helper to clamp and handle NaN/Infinity
 */
const clampAndValidate = (value: number, min: number, max: number): number => {
  if (!isFinite(value)) return 0;
  return Math.max(min, Math.min(max, value));
};

 /**
  * Find a bone by name in the scene hierarchy
  */
 export const findBone = (scene: THREE.Object3D, name: string): THREE.Bone | null => {
   let bone: THREE.Bone | null = null;
   scene.traverse((child) => {
     if (child instanceof THREE.Bone && child.name === name) {
       bone = child;
     }
   });
   return bone;
 };
 
 /**
  * Find all bones by name and cache them
  */
 export const findBones = (
   scene: THREE.Object3D,
   boneNames: string[]
 ): Map<string, THREE.Bone> => {
   const boneMap = new Map<string, THREE.Bone>();
   scene.traverse((child) => {
     if (child instanceof THREE.Bone && boneNames.includes(child.name)) {
       boneMap.set(child.name, child);
     }
   });
   return boneMap;
 };
 
 /**
  * Interpolate between two bone rotations
  */
 export const lerpBoneRotation = (
   from: BoneRotation,
   to: BoneRotation,
   t: number
 ): BoneRotation => ({
   x: THREE.MathUtils.lerp(from.x, to.x, t),
   y: THREE.MathUtils.lerp(from.y, to.y, t),
   z: THREE.MathUtils.lerp(from.z, to.z, t),
 });
 
 /**
  * Add two bone rotations together
  */
 export const addBoneRotation = (
   a: BoneRotation,
   b: BoneRotation
 ): BoneRotation => ({
   x: a.x + b.x,
   y: a.y + b.y,
   z: a.z + b.z,
 });
 
 /**
  * Scale a bone rotation
  */
 export const scaleBoneRotation = (
   rot: BoneRotation,
   scale: number
 ): BoneRotation => ({
   x: rot.x * scale,
   y: rot.y * scale,
   z: rot.z * scale,
 });
 
 /**
  * Apply a bone map to actual bones
  */
 export const applyBoneMap = (
   boneCache: Map<string, THREE.Bone>,
   boneMap: BoneMap,
   blend: number = 1
 ): void => {
   Object.entries(boneMap).forEach(([boneName, state]) => {
     const bone = boneCache.get(boneName);
     if (!bone) return;
     
    // Get limits for this bone (default to wide range if not specified)
    const limits = BONE_LIMITS[boneName] || { min: -Math.PI, max: Math.PI };
    
    // Clamp rotations to safe ranges with NaN safety
    const safeX = clampAndValidate(state.rotation.x, limits.min, limits.max);
    const safeY = clampAndValidate(state.rotation.y, limits.min, limits.max);
    const safeZ = clampAndValidate(state.rotation.z, limits.min, limits.max);
    
     if (blend >= 1) {
      bone.rotation.set(safeX, safeY, safeZ);
     } else {
      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, safeX, blend);
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, safeY, blend);
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, safeZ, blend);
     }
   });
 };
 
 /**
  * Blend multiple bone maps with weights
  */
 export const blendBoneMaps = (
   layers: Array<{ bones: BoneMap; weight: number }>
 ): BoneMap => {
   const result: BoneMap = {};
   const totalWeights: Record<string, number> = {};
   
   // First pass: collect all bone names and accumulate weighted values
   layers.forEach(({ bones, weight }) => {
     Object.entries(bones).forEach(([boneName, state]) => {
       if (!result[boneName]) {
         result[boneName] = { rotation: { x: 0, y: 0, z: 0 } };
         totalWeights[boneName] = 0;
       }
       
       result[boneName].rotation.x += state.rotation.x * weight;
       result[boneName].rotation.y += state.rotation.y * weight;
       result[boneName].rotation.z += state.rotation.z * weight;
       totalWeights[boneName] += weight;
     });
   });
   
   // Normalize by total weights
   Object.entries(result).forEach(([boneName, state]) => {
     const total = totalWeights[boneName];
     if (total > 0) {
       state.rotation.x /= total;
       state.rotation.y /= total;
       state.rotation.z /= total;
     }
   });
   
   return result;
 };
 
 /**
  * Get bone's current rotation as BoneRotation
  */
 export const getBoneRotation = (bone: THREE.Bone): BoneRotation => ({
   x: bone.rotation.x,
   y: bone.rotation.y,
   z: bone.rotation.z,
 });
 
 /**
  * Clamp bone rotation to safe limits
  */
 export const clampBoneRotation = (
   rot: BoneRotation,
   limits: { minX?: number; maxX?: number; minY?: number; maxY?: number; minZ?: number; maxZ?: number }
 ): BoneRotation => ({
   x: THREE.MathUtils.clamp(rot.x, limits.minX ?? -Math.PI, limits.maxX ?? Math.PI),
   y: THREE.MathUtils.clamp(rot.y, limits.minY ?? -Math.PI, limits.maxY ?? Math.PI),
   z: THREE.MathUtils.clamp(rot.z, limits.minZ ?? -Math.PI, limits.maxZ ?? Math.PI),
 });