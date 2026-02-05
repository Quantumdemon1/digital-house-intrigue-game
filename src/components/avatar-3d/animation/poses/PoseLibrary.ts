/**
 * @file poses/PoseLibrary.ts
 * @description Static pose definitions for avatars - applied once, no animation loop
 * Now with admin override support for manual pose adjustments AND per-character overrides
 */

import type { BoneRotation } from '../types';

export type StaticPoseType = 'neutral' | 'relaxed' | 'confident' | 'defensive' | 'open';

export interface PoseDefinition {
  name: StaticPoseType;
  description: string;
  bones: Record<string, BoneRotation>;
}

/**
 * Admin pose overrides stored in localStorage
 * Format: { 
 *   [poseName]: { [boneName]: BoneRotation },           // Global override
 *   [poseName:characterId]: { [boneName]: BoneRotation } // Per-character override
 * }
 */
const POSE_OVERRIDES_KEY = 'avatar_pose_overrides';

/**
 * Generate storage key for a pose override
 * @param poseName - The pose type name
 * @param characterId - Optional character ID for per-character overrides
 */
function getPoseKey(poseName: string, characterId?: string): string {
  return characterId ? `${poseName}:${characterId}` : poseName;
}

/**
 * Get all admin pose overrides from localStorage
 */
export function getPoseOverrides(): Record<string, Record<string, BoneRotation>> {
  try {
    const stored = localStorage.getItem(POSE_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save admin pose overrides to localStorage
 */
export function savePoseOverrides(overrides: Record<string, Record<string, BoneRotation>>): void {
  try {
    localStorage.setItem(POSE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.warn('[PoseLibrary] Failed to save pose overrides:', e);
  }
}

/**
 * Save a single pose override (global or per-character)
 * @param poseName - The pose type name
 * @param bones - The bone rotations to save
 * @param characterId - Optional character ID for per-character override
 */
export function saveSinglePoseOverride(
  poseName: string, 
  bones: Record<string, BoneRotation>,
  characterId?: string
): void {
  const overrides = getPoseOverrides();
  const key = getPoseKey(poseName, characterId);
  overrides[key] = bones;
  savePoseOverrides(overrides);
}

/**
 * Clear a pose override (revert to default)
 * @param poseName - The pose type name
 * @param characterId - Optional character ID for per-character override
 */
export function clearPoseOverride(poseName: string, characterId?: string): void {
  const overrides = getPoseOverrides();
  const key = getPoseKey(poseName, characterId);
  delete overrides[key];
  savePoseOverrides(overrides);
}

/**
 * Check if a character-specific override exists
 */
export function hasCharacterPoseOverride(poseName: string, characterId: string): boolean {
  const overrides = getPoseOverrides();
  const key = getPoseKey(poseName, characterId);
  return !!overrides[key];
}

/**
 * Get list of all character IDs that have overrides for a specific pose
 */
export function getCharacterOverrideIds(poseName: string): string[] {
  const overrides = getPoseOverrides();
  const prefix = `${poseName}:`;
  return Object.keys(overrides)
    .filter(key => key.startsWith(prefix))
    .map(key => key.slice(prefix.length));
}

/**
 * Static pose library - bone rotations in radians
 * REFINED: Better arm angles to prevent body collision/clipping
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
      LeftShoulder: { x: 0.61, y: 0.18, z: -0.02 },
      LeftArm: { x: 0.12, y: 0.05, z: 0.27 },
      LeftForeArm: { x: 0.15, y: 0.02, z: 0.05 },
      LeftHand: { x: 0, y: 0, z: 0.08 },
      RightShoulder: { x: 0.61, y: 0.15, z: -0.05 },
      RightArm: { x: 0.12, y: 0.21, z: -0.35 },
      RightForeArm: { x: 0.12, y: -0.33, z: 0.44 },
      RightHand: { x: -0.28, y: 0, z: -0.08 },
    },
  },

  relaxed: {
    name: 'relaxed',
    description: 'Arms at sides, natural stance - REFINED for no clipping',
    bones: {
      Spine: { x: 0.02, y: 0, z: 0 },
      Spine1: { x: 0.01, y: 0, z: 0 },
      Spine2: { x: 0.01, y: 0, z: 0 },
      Neck: { x: 0, y: 0, z: 0 },
      Head: { x: 0, y: 0, z: 0 },
      LeftShoulder: { x: 0.61, y: 0.18, z: -0.02 },
      LeftArm: { x: 0.12, y: 0.05, z: 0.27 },
      LeftForeArm: { x: 0.15, y: 0.02, z: 0.05 },
      LeftHand: { x: 0, y: 0, z: 0.08 },
      RightShoulder: { x: 0.61, y: 0.15, z: -0.05 },
      RightArm: { x: 0.12, y: 0.21, z: -0.35 },
      RightForeArm: { x: 0.12, y: -0.33, z: 0.44 },
      RightHand: { x: -0.28, y: 0, z: -0.08 },
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
      // Refined hands-on-hips with proper elbow angles
      LeftShoulder: { x: 0.05, y: 0.15, z: 0.15 },
      LeftArm: { x: 0.35, y: 0.45, z: 0.75 },
      LeftForeArm: { x: 0.7, y: 0.25, z: 0.1 },
      LeftHand: { x: 0.1, y: 0.1, z: 0.15 },
      RightShoulder: { x: 0.05, y: -0.15, z: -0.15 },
      RightArm: { x: 0.35, y: -0.45, z: -0.75 },
      RightForeArm: { x: 0.7, y: -0.25, z: -0.1 },
      RightHand: { x: 0.1, y: -0.1, z: -0.15 },
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
      // Refined crossed arms - proper layering
      LeftShoulder: { x: 0.12, y: 0.22, z: 0.18 },
      LeftArm: { x: 0.55, y: 0.75, z: 0.5 },
      LeftForeArm: { x: 1.1, y: 0.45, z: -0.25 },
      LeftHand: { x: 0.15, y: 0.1, z: 0.1 },
      RightShoulder: { x: 0.12, y: -0.22, z: -0.18 },
      RightArm: { x: 0.55, y: -0.75, z: -0.5 },
      RightForeArm: { x: 1.1, y: -0.45, z: 0.25 },
      RightHand: { x: 0.15, y: -0.1, z: -0.1 },
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
      // Open welcoming pose with arms spread
      LeftShoulder: { x: 0.02, y: 0.08, z: 0.12 },
      LeftArm: { x: 0.18, y: 0.32, z: 0.55 },
      LeftForeArm: { x: 0.28, y: 0.45, z: 0.08 },
      LeftHand: { x: 0.05, y: 0.1, z: -0.4 },
      RightShoulder: { x: 0.02, y: -0.08, z: -0.12 },
      RightArm: { x: 0.18, y: -0.32, z: -0.55 },
      RightForeArm: { x: 0.28, y: -0.45, z: -0.08 },
      RightHand: { x: 0.05, y: -0.1, z: 0.4 },
    },
  },
};

/**
 * Get effective pose with admin overrides applied (global only - legacy)
 */
export function getEffectivePose(poseType: StaticPoseType): PoseDefinition {
  return getEffectivePoseForCharacter(poseType);
}

/**
 * Get effective pose with per-character overrides applied
 * Fallback chain: character-specific -> global -> base pose
 * @param poseType - The pose type
 * @param characterId - Optional character ID for per-character override lookup
 */
export function getEffectivePoseForCharacter(
  poseType: StaticPoseType,
  characterId?: string
): PoseDefinition {
  const basePose = STATIC_POSES[poseType];
  const overrides = getPoseOverrides();
  
  // 1. Try character-specific override first
  if (characterId) {
    const charKey = getPoseKey(poseType, characterId);
    const charOverride = overrides[charKey];
    if (charOverride) {
      return {
        ...basePose,
        bones: {
          ...basePose.bones,
          ...charOverride,
        },
      };
    }
  }
  
  // 2. Try global override
  const globalOverride = overrides[poseType];
  if (globalOverride) {
    return {
      ...basePose,
      bones: {
        ...basePose.bones,
        ...globalOverride,
      },
    };
  }
  
  // 3. Return base pose
  return basePose;
}

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

/**
 * List of all bone names that can be adjusted
 */
export const ADJUSTABLE_BONES = [
  'Hips',
  'Spine',
  'Spine1',
  'Spine2',
  'Neck',
  'Head',
  'LeftShoulder',
  'LeftArm',
  'LeftForeArm',
  'LeftHand',
  'RightShoulder',
  'RightArm',
  'RightForeArm',
  'RightHand',
] as const;

export type AdjustableBone = typeof ADJUSTABLE_BONES[number];
