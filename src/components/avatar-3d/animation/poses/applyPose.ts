/**
 * @file poses/applyPose.ts
 * @description Apply static poses to avatar clones - one-time application
 * Now with admin override support
 */

import * as THREE from 'three';
import { getEffectivePose, type StaticPoseType } from './PoseLibrary';
import type { BoneRotation } from '../types';

/**
 * Safely clamp a value to prevent extreme rotations
 */
function clampRotation(value: number, max: number = Math.PI): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-max, Math.min(max, value));
}

/**
 * Find a bone by name in a Three.js scene
 * Handles both standard and Mixamo-prefixed bone names
 */
function findBone(root: THREE.Object3D, boneName: string): THREE.Bone | null {
  let foundBone: THREE.Bone | null = null;
  
  // Names to search for (in order of preference)
  const namesToTry = [
    boneName,
    `mixamorig${boneName}`,
    `mixamorig:${boneName}`,
  ];
  
  root.traverse((child) => {
    if (foundBone) return; // Already found
    
    if (child instanceof THREE.Bone) {
      for (const name of namesToTry) {
        if (child.name === name) {
          foundBone = child;
          return;
        }
      }
    }
  });
  
  return foundBone;
}

/**
 * Apply a static pose to a cloned avatar
 * This is called ONCE during clone creation, not in animation loop
 * Now uses admin overrides if available
 */
export function applyStaticPose(
  clone: THREE.Group,
  poseType: StaticPoseType = 'neutral'
): void {
  // Use effective pose which includes any admin overrides
  const pose = getEffectivePose(poseType);
  
  if (!pose) {
    console.warn(`[applyStaticPose] Unknown pose type: ${poseType}`);
    return;
  }

  // Apply each bone rotation from the pose definition
  for (const [boneName, rotation] of Object.entries(pose.bones)) {
    const bone = findBone(clone, boneName);
    
    if (bone) {
      // Clamp all rotations for safety
      const x = clampRotation(rotation.x);
      const y = clampRotation(rotation.y);
      const z = clampRotation(rotation.z);
      
      // Apply rotation additively to preserve model's base pose
      bone.rotation.x += x;
      bone.rotation.y += y;
      bone.rotation.z += z;
    }
  }
}

/**
 * Apply raw bone rotations (for live preview in pose editor)
 */
export function applyBoneRotations(
  clone: THREE.Group,
  bones: Record<string, BoneRotation>
): void {
  for (const [boneName, rotation] of Object.entries(bones)) {
    const bone = findBone(clone, boneName);
    
    if (bone) {
      const x = clampRotation(rotation.x);
      const y = clampRotation(rotation.y);
      const z = clampRotation(rotation.z);
      
      bone.rotation.set(x, y, z);
    }
  }
}

/**
 * Reset avatar to T-pose (zero rotations)
 */
export function resetToTPose(clone: THREE.Group): void {
  clone.traverse((child) => {
    if (child instanceof THREE.Bone) {
      child.rotation.set(0, 0, 0);
    }
  });
}

/**
 * Get bone references for an avatar clone
 * Returns a map that's owned by this specific clone
 * Handles Mixamo-prefixed bone names
 */
export function getBoneMap(clone: THREE.Group): Map<string, THREE.Bone> {
  const boneMap = new Map<string, THREE.Bone>();
  
  clone.traverse((child) => {
    if (child instanceof THREE.Bone) {
      // Store both the original name and normalized name
      boneMap.set(child.name, child);
      
      // Also store without prefix for easier lookup
      const normalizedName = child.name
        .replace('mixamorig:', '')
        .replace('mixamorig', '');
      
      if (normalizedName !== child.name) {
        boneMap.set(normalizedName, child);
      }
    }
  });
  
  return boneMap;
}
