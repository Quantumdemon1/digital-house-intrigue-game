/**
 * @file poses/malePoseDefaults.ts
 * @description Default pose bone coordinates for male character templates
 */

import type { BoneRotation } from '../types';
import type { StaticPoseType } from './PoseLibrary';

export const MALE_CHARACTER_NAMES = ['sam', 'blake', 'jordan', 'avery', 'alex', 'riley'];

export function isMaleCharacter(characterName?: string): boolean {
  if (!characterName) return false;
  const normalized = characterName.toLowerCase().split(/[\s-]+/)[0];
  return MALE_CHARACTER_NAMES.includes(normalized);
}

export const MALE_POSE_BONES: Record<StaticPoseType, Record<string, BoneRotation>> = {
  neutral: {
    Spine: { x: 0.02, y: 0, z: 0 },
    Spine1: { x: 0.01, y: 0, z: 0 },
    Spine2: { x: 0.01, y: 0, z: 0 },
    Neck: { x: 0, y: 0, z: 0 },
    Head: { x: 0, y: 0, z: 0 },
    LeftShoulder: { x: -0.56, y: -0.08, z: -0.02 },
    LeftArm: { x: 0.04, y: 0.55, z: -0.08 },
    LeftForeArm: { x: 0.12, y: 0.02, z: 0.05 },
    LeftHand: { x: 0, y: 0, z: 0.08 },
    RightShoulder: { x: -0.62, y: -0.11, z: -0.08 },
    RightArm: { x: 0.04, y: 0.01, z: 0.15 },
    RightForeArm: { x: 0.09, y: 0.15, z: -0.13 },
    RightHand: { x: 0.24, y: 0, z: -0.08 },
  },
  relaxed: {
    Spine: { x: 0.02, y: 0, z: 0 },
    Spine1: { x: 0.01, y: 0, z: 0 },
    Spine2: { x: 0.01, y: 0, z: 0 },
    Neck: { x: 0, y: 0, z: 0 },
    Head: { x: 0, y: 0, z: 0 },
    LeftShoulder: { x: -0.19, y: -0.02, z: 0.49 },
    LeftArm: { x: 0.12, y: 0.05, z: 0.27 },
    LeftForeArm: { x: 0.15, y: -0.42, z: 0.05 },
    LeftHand: { x: 0.07, y: 0.86, z: -0.16 },
    RightShoulder: { x: -0.39, y: -0.11, z: -0.05 },
    RightArm: { x: 0.07, y: -0.16, z: -0.02 },
    RightForeArm: { x: 0.12, y: 0.04, z: 0.09 },
    RightHand: { x: 0.04, y: 0, z: 0.21 },
  },
  confident: {
    Spine: { x: -0.05, y: 0, z: 0 },
    Spine1: { x: -0.03, y: 0, z: 0 },
    Spine2: { x: -0.02, y: 0, z: 0 },
    Neck: { x: 0.02, y: 0, z: 0 },
    Head: { x: 0.03, y: 0, z: 0 },
    LeftShoulder: { x: -0.19, y: -0.3, z: -0.93 },
    LeftArm: { x: -0.62, y: 0.38, z: 0.75 },
    LeftForeArm: { x: 0.7, y: 0.25, z: 0.1 },
    LeftHand: { x: 0.1, y: 0.1, z: 0.15 },
    RightShoulder: { x: 0.21, y: -0.59, z: -0.15 },
    RightArm: { x: 0.29, y: 0.21, z: -0.75 },
    RightForeArm: { x: 0.7, y: -0.25, z: -0.1 },
    RightHand: { x: 0.1, y: -0.1, z: -0.15 },
  },
  defensive: {
    Spine: { x: 0.05, y: 0, z: 0 },
    Spine1: { x: 0.03, y: 0, z: 0 },
    Spine2: { x: 0.02, y: 0, z: 0 },
    Neck: { x: 0.03, y: 0, z: 0 },
    Head: { x: -0.02, y: 0, z: 0 },
    LeftShoulder: { x: -2.56, y: 0.22, z: 0.18 },
    LeftArm: { x: 0.55, y: 0.24, z: 0.21 },
    LeftForeArm: { x: 1.1, y: 0.45, z: -0.25 },
    LeftHand: { x: 0.15, y: 0.1, z: 0.1 },
    RightShoulder: { x: -0.99, y: -0.45, z: -0.76 },
    RightArm: { x: -0.56, y: -0.45, z: -0.5 },
    RightForeArm: { x: -0.11, y: 1.6, z: -0.96 },
    RightHand: { x: 0.15, y: -0.1, z: -0.1 },
  },
  open: {
    Spine: { x: -0.02, y: 0, z: 0 },
    Spine1: { x: -0.01, y: 0, z: 0 },
    Spine2: { x: 0, y: 0, z: 0 },
    Neck: { x: 0, y: 0, z: 0 },
    Head: { x: 0.02, y: 0, z: 0 },
    LeftShoulder: { x: -1.47, y: -0.05, z: -0.39 },
    LeftArm: { x: -0.36, y: 0.32, z: 0.55 },
    LeftForeArm: { x: 0.28, y: 0.45, z: 0.08 },
    LeftHand: { x: -0.39, y: -0.53, z: -0.4 },
    RightShoulder: { x: -1.33, y: -0.42, z: -0.12 },
    RightArm: { x: 0.18, y: -0.32, z: -0.55 },
    RightForeArm: { x: -0.3, y: -0.45, z: 0.01 },
    RightHand: { x: 0.24, y: 0.72, z: 0.4 },
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
