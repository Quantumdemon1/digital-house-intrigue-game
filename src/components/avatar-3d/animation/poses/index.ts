/**
 * @file poses/index.ts
 * @description Export pose system components
 */

export {
  STATIC_POSES,
  getRandomPose,
  getPoseForContext,
  getEffectivePose,
  getPoseOverrides,
  savePoseOverrides,
  saveSinglePoseOverride,
  clearPoseOverride,
  ADJUSTABLE_BONES,
  type StaticPoseType,
  type PoseDefinition,
  type AdjustableBone,
} from './PoseLibrary';

export {
  applyStaticPose,
  applyBoneRotations,
  resetToTPose,
  getBoneMap,
} from './applyPose';
