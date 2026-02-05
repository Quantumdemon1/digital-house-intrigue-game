/**
 * @file poses/PoseLibrary.ts
 * @description Static pose definitions for avatars - applied once, no animation loop
 */

import type { BoneRotation } from '../types';

export type StaticPoseType = 'neutral' | 'relaxed' | 'confident' | 'defensive' | 'open';

export interface PoseDefinition {
  name: StaticPoseType;
  description: string;
  bones: Record<string, BoneRotation>;
}

/**
 * Static pose library - bone rotations in radians
 * These are applied once during clone creation
 */
export const STATIC_POSES: Record<StaticPoseType, PoseDefinition> = {
  neutral: {
    name: 'neutral',
    description: 'Arms slightly forward, relaxed stance',
    bones: {
      Spine: { x: 0.02, y: 0, z: 0 },
      Spine1: { x: 0.01, y: 0, z: 0 },
      Spine2: { x: 0.01, y: 0, z: 0 },
      Neck: { x: 0, y: 0, z: 0 },
      Head: { x: 0, y: 0, z: 0 },
      LeftShoulder: { x: 0, y: 0, z: 0.05 },
      LeftArm: { x: 0.1, y: 0, z: 0.3 },
      LeftForeArm: { x: 0.1, y: 0, z: 0 },
      RightShoulder: { x: 0, y: 0, z: -0.05 },
      RightArm: { x: 0.1, y: 0, z: -0.3 },
      RightForeArm: { x: 0.1, y: 0, z: 0 },
    },
  },

  relaxed: {
    name: 'relaxed',
    description: 'Arms at sides, natural stance',
    bones: {
      Spine: { x: 0.03, y: 0, z: 0 },
      Spine1: { x: 0.02, y: 0, z: 0 },
      Spine2: { x: 0.01, y: 0, z: 0 },
      Neck: { x: 0.02, y: 0, z: 0 },
      Head: { x: -0.02, y: 0, z: 0 },
      LeftShoulder: { x: 0, y: 0, z: 0.08 },
      LeftArm: { x: 0.15, y: 0, z: 0.5 },
      LeftForeArm: { x: 0.2, y: 0, z: 0 },
      RightShoulder: { x: 0, y: 0, z: -0.08 },
      RightArm: { x: 0.15, y: 0, z: -0.5 },
      RightForeArm: { x: 0.2, y: 0, z: 0 },
    },
  },

  confident: {
    name: 'confident',
    description: 'Chest out, hands on hips pose',
    bones: {
      Spine: { x: -0.05, y: 0, z: 0 },
      Spine1: { x: -0.03, y: 0, z: 0 },
      Spine2: { x: -0.02, y: 0, z: 0 },
      Neck: { x: 0.02, y: 0, z: 0 },
      Head: { x: 0.03, y: 0, z: 0 },
      LeftShoulder: { x: 0, y: 0.1, z: 0.1 },
      LeftArm: { x: 0.3, y: 0.4, z: 0.8 },
      LeftForeArm: { x: 0.8, y: 0.3, z: 0 },
      RightShoulder: { x: 0, y: -0.1, z: -0.1 },
      RightArm: { x: 0.3, y: -0.4, z: -0.8 },
      RightForeArm: { x: 0.8, y: -0.3, z: 0 },
    },
  },

  defensive: {
    name: 'defensive',
    description: 'Arms crossed, guarded stance',
    bones: {
      Spine: { x: 0.05, y: 0, z: 0 },
      Spine1: { x: 0.03, y: 0, z: 0 },
      Spine2: { x: 0.02, y: 0, z: 0 },
      Neck: { x: 0.03, y: 0, z: 0 },
      Head: { x: -0.02, y: 0, z: 0 },
      LeftShoulder: { x: 0.1, y: 0.2, z: 0.2 },
      LeftArm: { x: 0.5, y: 0.8, z: 0.6 },
      LeftForeArm: { x: 1.2, y: 0.5, z: -0.3 },
      RightShoulder: { x: 0.1, y: -0.2, z: -0.2 },
      RightArm: { x: 0.5, y: -0.8, z: -0.6 },
      RightForeArm: { x: 1.2, y: -0.5, z: 0.3 },
    },
  },

  open: {
    name: 'open',
    description: 'Palms up, welcoming gesture',
    bones: {
      Spine: { x: -0.02, y: 0, z: 0 },
      Spine1: { x: -0.01, y: 0, z: 0 },
      Spine2: { x: 0, y: 0, z: 0 },
      Neck: { x: 0, y: 0, z: 0 },
      Head: { x: 0.02, y: 0, z: 0 },
      LeftShoulder: { x: 0, y: 0, z: 0.1 },
      LeftArm: { x: 0.2, y: 0.3, z: 0.6 },
      LeftForeArm: { x: 0.3, y: 0.5, z: 0 },
      LeftHand: { x: 0, y: 0, z: -0.5 },
      RightShoulder: { x: 0, y: 0, z: -0.1 },
      RightArm: { x: 0.2, y: -0.3, z: -0.6 },
      RightForeArm: { x: 0.3, y: -0.5, z: 0 },
      RightHand: { x: 0, y: 0, z: 0.5 },
    },
  },
};

/**
 * Get a random static pose for variety
 */
export function getRandomPose(): StaticPoseType {
  const poses: StaticPoseType[] = ['neutral', 'relaxed', 'confident', 'defensive', 'open'];
  return poses[Math.floor(Math.random() * poses.length)];
}

/**
 * Get pose by game context
 */
export function getPoseForContext(context: {
  isHoH?: boolean;
  isNominated?: boolean;
  isSafe?: boolean;
}): StaticPoseType {
  if (context.isHoH) return 'confident';
  if (context.isNominated) return 'defensive';
  if (context.isSafe) return 'relaxed';
  return 'neutral';
}
