/**
 * @file poses/applyPose.ts
 * @description Apply static poses to avatar clones - one-time application
 */

import * as THREE from 'three';
import { STATIC_POSES, type StaticPoseType } from './PoseLibrary';

/**
 * Safely clamp a value to prevent extreme rotations
 */
function clampRotation(value: number, max: number = Math.PI): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-max, Math.min(max, value));
}

/**
 * Find a bone by name in a Three.js scene
 */
function findBone(root: THREE.Object3D, boneName: string): THREE.Bone | null {
  let foundBone: THREE.Bone | null = null;
  
  root.traverse((child) => {
    if (child instanceof THREE.Bone && child.name === boneName) {
      foundBone = child;
    }
  });
  
  return foundBone;
}

/**
 * Apply a static pose to a cloned avatar
 * This is called ONCE during clone creation, not in animation loop
 */
export function applyStaticPose(
  clone: THREE.Group,
  poseType: StaticPoseType = 'relaxed'
): void {
  const pose = STATIC_POSES[poseType];
  
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
 */
export function getBoneMap(clone: THREE.Group): Map<string, THREE.Bone> {
  const boneMap = new Map<string, THREE.Bone>();
  
  clone.traverse((child) => {
    if (child instanceof THREE.Bone) {
      boneMap.set(child.name, child);
    }
  });
  
  return boneMap;
}
