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
const POSE_DATA_VERSION_KEY = 'avatar_pose_data_version';
const CURRENT_POSE_DATA_VERSION = 2; // v2 = T-pose-relative absolute rotations

/**
 * One-time migration: clear old additive overrides when version changes
 */
function migrateIfNeeded(): void {
  try {
    const storedVersion = localStorage.getItem(POSE_DATA_VERSION_KEY);
    if (storedVersion !== String(CURRENT_POSE_DATA_VERSION)) {
      localStorage.removeItem(POSE_OVERRIDES_KEY);
      localStorage.setItem(POSE_DATA_VERSION_KEY, String(CURRENT_POSE_DATA_VERSION));
      console.log('[PoseLibrary] Migrated pose data to v' + CURRENT_POSE_DATA_VERSION + ', cleared old overrides');
    }
  } catch { /* ignore */ }
}

// Run migration on module load
migrateIfNeeded();

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
 * Static pose library - T-pose-relative ABSOLUTE rotations in radians
 * Convention: T-pose = all zeros. Values are total rotation from zero.
 * Source: TalkingHead, KalidoKit, Animaze, CMU MoCap verified data
 */
export const STATIC_POSES: Record<StaticPoseType, PoseDefinition> = {
  neutral: {
    name: 'neutral',
    description: 'Relaxed idle standing (T-pose-relative)',
    bones: {
      Spine:         { x: -0.05,  y: 0,      z: 0 },
      Spine1:        { x: -0.03,  y: 0,      z: 0 },
      Spine2:        { x: 0.04,   y: 0,      z: 0 },
      Neck:          { x: 0.05,   y: 0,      z: 0 },
      Head:          { x: 0.05,   y: 0,      z: 0 },
      LeftShoulder:  { x: 0,      y: 0,      z: 0.03 },
      LeftArm:       { x: 0.08,   y: 0,      z: 1.22 },
      LeftForeArm:   { x: 0,      y: 0,      z: 0.18 },
      LeftHand:      { x: 0,      y: -0.15,  z: 0.05 },
      RightShoulder: { x: 0,      y: 0,      z: -0.03 },
      RightArm:      { x: 0.08,   y: 0,      z: -1.22 },
      RightForeArm:  { x: 0,      y: 0,      z: -0.18 },
      RightHand:     { x: 0,      y: 0.15,   z: -0.05 },
    },
  },

  relaxed: {
    name: 'relaxed',
    description: 'Relaxed idle standing (same as neutral)',
    bones: {
      Spine:         { x: -0.05,  y: 0,      z: 0 },
      Spine1:        { x: -0.03,  y: 0,      z: 0 },
      Spine2:        { x: 0.04,   y: 0,      z: 0 },
      Neck:          { x: 0.05,   y: 0,      z: 0 },
      Head:          { x: 0.05,   y: 0,      z: 0 },
      LeftShoulder:  { x: 0,      y: 0,      z: 0.03 },
      LeftArm:       { x: 0.08,   y: 0,      z: 1.22 },
      LeftForeArm:   { x: 0,      y: 0,      z: 0.18 },
      LeftHand:      { x: 0,      y: -0.15,  z: 0.05 },
      RightShoulder: { x: 0,      y: 0,      z: -0.03 },
      RightArm:      { x: 0.08,   y: 0,      z: -1.22 },
      RightForeArm:  { x: 0,      y: 0,      z: -0.18 },
      RightHand:     { x: 0,      y: 0.15,   z: -0.05 },
    },
  },

  confident: {
    name: 'confident',
    description: 'Confident power pose, hands on hips, chest forward',
    bones: {
      Spine:         { x: -0.06,  y: 0,      z: 0 },
      Spine1:        { x: 0,      y: 0,      z: 0 },
      Spine2:        { x: 0.12,   y: 0,      z: 0 },
      Neck:          { x: 0,      y: 0,      z: 0 },
      Head:          { x: -0.05,  y: 0,      z: 0 },
      LeftShoulder:  { x: 0,      y: 0,      z: 0 },
      LeftArm:       { x: 0,      y: 0.35,   z: 0.85 },
      LeftForeArm:   { x: 0,      y: 0,      z: 1.50 },
      LeftHand:      { x: 0,      y: -0.30,  z: 0 },
      RightShoulder: { x: 0,      y: 0,      z: 0 },
      RightArm:      { x: 0,      y: -0.35,  z: -0.85 },
      RightForeArm:  { x: 0,      y: 0,      z: -1.50 },
      RightHand:     { x: 0,      y: 0.30,   z: 0 },
    },
  },

  defensive: {
    name: 'defensive',
    description: 'Arms crossed, guarded stance',
    bones: {
      Spine:         { x: -0.06,  y: 0,      z: 0 },
      Spine1:        { x: 0,      y: 0,      z: 0 },
      Spine2:        { x: 0.06,   y: 0,      z: 0 },
      Neck:          { x: 0.04,   y: 0,      z: 0 },
      Head:          { x: 0.04,   y: 0,      z: 0 },
      LeftShoulder:  { x: 0,      y: 0,      z: 0.10 },
      LeftArm:       { x: 0.60,   y: 0.80,   z: 1.10 },
      LeftForeArm:   { x: 0,      y: 0,      z: 1.40 },
      LeftHand:      { x: 0,      y: -0.20,  z: 0.10 },
      RightShoulder: { x: 0,      y: 0,      z: -0.10 },
      RightArm:      { x: 0.60,   y: -0.80,  z: -1.10 },
      RightForeArm:  { x: 0,      y: 0,      z: -1.40 },
      RightHand:     { x: 0,      y: 0.20,   z: -0.10 },
    },
  },

  open: {
    name: 'open',
    description: 'Waving right hand, welcoming gesture',
    bones: {
      Spine:         { x: -0.05,  y: 0,      z: 0 },
      Spine1:        { x: -0.03,  y: 0,      z: 0 },
      Spine2:        { x: 0.04,   y: 0,      z: 0 },
      Neck:          { x: 0.05,   y: 0,      z: 0 },
      Head:          { x: 0,      y: 0.10,   z: 0 },
      LeftShoulder:  { x: 0,      y: 0,      z: 0.03 },
      LeftArm:       { x: 0.08,   y: 0,      z: 1.22 },
      LeftForeArm:   { x: 0,      y: 0,      z: 0.18 },
      LeftHand:      { x: 0,      y: 0,      z: 0 },
      RightShoulder: { x: 0,      y: 0,      z: -0.08 },
      RightArm:      { x: -0.30,  y: -0.50,  z: -0.40 },
      RightForeArm:  { x: 0,      y: 0,      z: -2.00 },
      RightHand:     { x: 0,      y: 0.20,   z: 0 },
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
