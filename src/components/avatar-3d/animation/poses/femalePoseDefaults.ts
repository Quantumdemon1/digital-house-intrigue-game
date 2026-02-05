/**
 * @file poses/femalePoseDefaults.ts
 * @description Default pose definitions for female character templates.
 * These override the base (male/unisex) poses for female avatars.
 */

import type { BoneRotation } from '../types';
import type { StaticPoseType } from './PoseLibrary';

/**
 * Female characters that should use these pose defaults.
 * Uses lowercase name matching (first name or full slug).
 */
export const FEMALE_CHARACTER_NAMES = [
  'quinn', 'jamie', 'morgan', 'taylor', 'casey', 'maya',
] as const;

/**
 * Check if a character name matches a female template
 */
export function isFemaleCharacter(characterName?: string): boolean {
  if (!characterName) return false;
  const lower = characterName.toLowerCase();
  return FEMALE_CHARACTER_NAMES.some(
    name => lower.includes(name)
  );
}

/**
 * Female-specific bone rotations for each pose type
 */
export const FEMALE_POSE_BONES: Record<StaticPoseType, Record<string, BoneRotation>> = {
  relaxed: {
    Spine: { x: 0.02, y: 0, z: 0 },
    Spine1: { x: 0.01, y: 0, z: 0 },
    Spine2: { x: 0.01, y: 0, z: 0 },
    Neck: { x: 0, y: 0, z: 0 },
    Head: { x: 0, y: 0, z: 0 },
    LeftShoulder: { x: -0.08, y: 0.18, z: -0.02 },
    LeftArm: { x: 0.35, y: 0.05, z: 0.27 },
    LeftForeArm: { x: 0.15, y: 0.02, z: 0.05 },
    LeftHand: { x: -0.19, y: 0, z: 0.08 },
    RightShoulder: { x: -0.08, y: 0.15, z: -0.05 },
    RightArm: { x: 0.15, y: 0.21, z: -0.35 },
    RightForeArm: { x: 0.38, y: -0.96, z: 0.44 },
    RightHand: { x: 0.15, y: 0.04, z: -0.08 },
  },

  neutral: {
    Spine: { x: 0.02, y: 0, z: 0 },
    Spine1: { x: 0.01, y: 0, z: 0 },
    Spine2: { x: 0.01, y: 0, z: 0 },
    Neck: { x: 0, y: 0, z: 0 },
    Head: { x: 0, y: 0, z: 0 },
    LeftShoulder: { x: -0.11, y: -0.16, z: -0.02 },
    LeftArm: { x: 0.12, y: 0.05, z: 0.27 },
    LeftForeArm: { x: 0.15, y: 0.02, z: 0.05 },
    LeftHand: { x: 0, y: 0, z: 0.08 },
    RightShoulder: { x: -0.22, y: -0.13, z: -0.05 },
    RightArm: { x: 0.24, y: 0.21, z: -0.35 },
    RightForeArm: { x: 0.75, y: -0.56, z: 0.44 },
    RightHand: { x: -0.28, y: 0, z: -0.08 },
  },

  confident: {
    Spine: { x: -0.05, y: 0, z: 0 },
    Spine1: { x: -0.03, y: 0, z: 0 },
    Spine2: { x: -0.02, y: 0, z: 0 },
    Neck: { x: 0.02, y: 0, z: 0 },
    Head: { x: 0.03, y: 0, z: 0 },
    LeftShoulder: { x: -2.87, y: -0.02, z: -0.08 },
    LeftArm: { x: -1.96, y: 0.45, z: 0.75 },
    LeftForeArm: { x: -0.62, y: 0.25, z: 0.1 },
    LeftHand: { x: -0.02, y: -0.5, z: 0.15 },
    RightShoulder: { x: -2.47, y: 0.18, z: 0.27 },
    RightArm: { x: -1.96, y: -0.45, z: -0.75 },
    RightForeArm: { x: -0.22, y: -0.25, z: -0.1 },
    RightHand: { x: -0.08, y: 0.75, z: -0.13 },
  },

  defensive: {
    Spine: { x: 0.05, y: 0, z: 0 },
    Spine1: { x: 0.03, y: 0, z: 0 },
    Spine2: { x: 0.02, y: 0, z: 0 },
    Neck: { x: 0.03, y: 0, z: 0 },
    Head: { x: -0.02, y: 0, z: 0 },
    LeftShoulder: { x: -0.85, y: 0.22, z: 0.18 },
    LeftArm: { x: 0.55, y: -0.05, z: 0.89 },
    LeftForeArm: { x: 1.46, y: 0.55, z: -0.16 },
    LeftHand: { x: 0.55, y: -0.02, z: 0.09 },
    RightShoulder: { x: -1.05, y: -1.27, z: -0.13 },
    RightArm: { x: 0.66, y: -0.75, z: -0.33 },
    RightForeArm: { x: 0.92, y: 0.29, z: -1.36 },
    RightHand: { x: 0.78, y: -0.16, z: 0.21 },
  },

  open: {
    Spine: { x: -0.02, y: 0, z: 0 },
    Spine1: { x: -0.01, y: 0, z: 0 },
    Spine2: { x: 0, y: 0, z: 0 },
    Neck: { x: 0, y: 0, z: 0 },
    Head: { x: 0.02, y: 0, z: 0 },
    LeftShoulder: { x: -0.48, y: 0.08, z: 0.12 },
    LeftArm: { x: 0.18, y: 0.32, z: 0.55 },
    LeftForeArm: { x: 0.28, y: 0.45, z: 0.08 },
    LeftHand: { x: 0.05, y: 0.1, z: -0.4 },
    RightShoulder: { x: -0.19, y: -0.08, z: -0.12 },
    RightArm: { x: 0.15, y: -0.32, z: -0.55 },
    RightForeArm: { x: 0.28, y: -0.45, z: -0.08 },
    RightHand: { x: 0.05, y: -0.1, z: 0.4 },
  },

  wave: {
    Spine: { x: 0.02, y: 0, z: 0 },
    Spine1: { x: 0.01, y: 0, z: 0 },
    Spine2: { x: 0.01, y: 0, z: 0 },
    Neck: { x: 0, y: 0, z: 0 },
    Head: { x: 0, y: 0, z: 0 },
    LeftShoulder: { x: -2.41, y: 0.18, z: -0.02 },
    LeftArm: { x: 0.12, y: 0.05, z: 0.27 },
    LeftForeArm: { x: 0.21, y: 0.02, z: 0.05 },
    LeftHand: { x: -0.13, y: 0.66, z: 0.08 },
    RightShoulder: { x: -0.42, y: 0.15, z: -0.05 },
    RightArm: { x: 0.12, y: 0.21, z: -0.35 },
    RightForeArm: { x: 0.12, y: -0.33, z: 0.44 },
    RightHand: { x: 0.41, y: 0, z: 0.18 },
  },
};
