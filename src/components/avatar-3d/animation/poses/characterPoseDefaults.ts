/**
 * @file poses/characterPoseDefaults.ts
 * @description Per-character pose overrides that take priority over
 * gender-template defaults but yield to localStorage overrides.
 */

import type { BoneRotation } from '../types';
import type { StaticPoseType } from './PoseLibrary';

/**
 * Character-specific pose bone overrides.
 * Key = lowercase character name (must match isFemaleCharacter / name slug).
 * Only poses that differ from the gender-template default need to be listed.
 */
export const CHARACTER_POSE_OVERRIDES: Record<
  string,
  Partial<Record<StaticPoseType, Record<string, BoneRotation>>>
> = {
  morgan: {
    relaxed: {
      Spine: { x: 0.02, y: 0, z: 0 },
      Spine1: { x: 0.01, y: 0, z: 0 },
      Spine2: { x: 0.01, y: 0, z: 0 },
      Neck: { x: 0, y: 0, z: 0 },
      Head: { x: 0, y: 0, z: 0 },
      LeftShoulder: { x: 0.41, y: 0.18, z: -0.02 },
      LeftArm: { x: 0.12, y: 0.05, z: 0.27 },
      LeftForeArm: { x: 0.21, y: 0.02, z: 0.05 },
      LeftHand: { x: -0.13, y: 0.66, z: 0.08 },
      RightShoulder: { x: 0.44, y: 0.15, z: -0.05 },
      RightArm: { x: 0.12, y: 0.21, z: -0.35 },
      RightForeArm: { x: 0.12, y: -0.33, z: 0.44 },
      RightHand: { x: 0.41, y: 0, z: 0.18 },
    },
    open: {
      Spine: { x: -0.02, y: 0, z: 0 },
      Spine1: { x: -0.01, y: 0, z: 0 },
      Spine2: { x: 0, y: 0, z: 0 },
      Neck: { x: 0, y: 0, z: 0 },
      Head: { x: 0.02, y: 0, z: 0 },
      LeftShoulder: { x: 0.58, y: 0.41, z: 0.12 },
      LeftArm: { x: 0.18, y: 0.15, z: 0.55 },
      LeftForeArm: { x: 0.28, y: 0.45, z: 0.08 },
      LeftHand: { x: 0.05, y: 0.44, z: -0.4 },
      RightShoulder: { x: 0.61, y: -0.3, z: -0.12 },
      RightArm: { x: 0.24, y: -0.11, z: -0.55 },
      RightForeArm: { x: 0.28, y: -0.45, z: -0.08 },
      RightHand: { x: 0.05, y: -0.1, z: 0.4 },
    },
    wave: {
      Spine: { x: 0.02, y: 0, z: 0 },
      Spine1: { x: 0.01, y: 0, z: 0 },
      Spine2: { x: 0.01, y: 0, z: 0 },
      Neck: { x: 0, y: 0, z: 0 },
      Head: { x: 0, y: 0, z: 0 },
      LeftShoulder: { x: -1.62, y: 0.18, z: -0.02 },
      LeftArm: { x: -0.96, y: 0.05, z: 0.27 },
      LeftForeArm: { x: 0.21, y: 0.02, z: 0.05 },
      LeftHand: { x: -0.76, y: 0.04, z: 0.08 },
      RightShoulder: { x: 0.49, y: 0.12, z: 0.49 },
      RightArm: { x: 0.46, y: 0.21, z: -0.35 },
      RightForeArm: { x: 0.12, y: -0.33, z: 0.44 },
      RightHand: { x: 0.41, y: 0, z: 0.18 },
    },
    neutral: {
      Spine: { x: 0.02, y: 0, z: 0 },
      Spine1: { x: 0.01, y: 0, z: 0 },
      Spine2: { x: 0.01, y: 0, z: 0 },
      Neck: { x: 0, y: 0, z: 0 },
      Head: { x: 0, y: 0, z: 0 },
      LeftShoulder: { x: 0.52, y: 0.61, z: 0.49 },
      LeftArm: { x: 0.12, y: 0.05, z: 0.27 },
      LeftForeArm: { x: 0.15, y: 0.02, z: 0.05 },
      LeftHand: { x: 0, y: 0, z: 0.08 },
      RightShoulder: { x: 0.58, y: -0.13, z: -0.05 },
      RightArm: { x: 0.24, y: 0.21, z: -0.35 },
      RightForeArm: { x: 0.75, y: -0.56, z: 0.44 },
      RightHand: { x: -0.28, y: 0, z: -0.08 },
    },
  },
};

/**
 * Look up a character-specific pose override by name.
 * Returns undefined if no override exists for that character + pose combo.
 */
export function getCharacterPoseDefault(
  characterName: string,
  poseType: StaticPoseType,
): Record<string, BoneRotation> | undefined {
  const lower = characterName.toLowerCase();
  for (const [key, poses] of Object.entries(CHARACTER_POSE_OVERRIDES)) {
    if (lower.includes(key)) {
      return poses[poseType];
    }
  }
  return undefined;
}
