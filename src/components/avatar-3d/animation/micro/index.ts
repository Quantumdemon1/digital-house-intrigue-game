/**
 * @file micro/index.ts
 * @description Export micro-animation components
 */

export {
  createBreathingConfig,
  createBreathingState,
  calculateBreathingOffsets,
  applyBreathing,
  type BreathingConfig,
  type BreathingState,
} from './BreathingSystem';

export {
  createWeightShiftConfig,
  createWeightShiftState,
  calculateWeightShiftOffsets,
  applyWeightShift,
  type WeightShiftConfig,
  type WeightShiftState,
} from './WeightShift';
