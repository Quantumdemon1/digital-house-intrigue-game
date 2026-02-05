/**
 * @file poses/index.ts
 * @description Export pose system components
 */

export {
  STATIC_POSES,
  getRandomPose,
  getPoseForContext,
  type StaticPoseType,
  type PoseDefinition,
} from './PoseLibrary';

export {
  applyStaticPose,
  resetToTPose,
  getBoneMap,
} from './applyPose';
