/**
 * @file micro/WeightShift.ts
 * @description Subtle weight shift animation for idle variation
 */

import * as THREE from 'three';

export interface WeightShiftConfig {
  /** Shift rate in Hz (cycles per second) */
  rate: number;
  /** Hip sway amplitude in radians */
  hipAmplitude: number;
  /** Shoulder compensation amplitude in radians */
  shoulderAmplitude: number;
  /** Phase offset for this avatar (0-2π) */
  phaseOffset: number;
}

export interface WeightShiftState {
  elapsedTime: number;
  config: WeightShiftConfig;
}

// Safety limits
const MAX_AMPLITUDE = 0.05;
const MIN_DELTA = 0.001;
const MAX_DELTA = 0.1;

/**
 * Create weight shift config with unique phase offset
 */
export function createWeightShiftConfig(instanceId: string): WeightShiftConfig {
  // Generate deterministic phase offset from instance ID (different from breathing)
  let hash = 0;
  for (let i = 0; i < instanceId.length; i++) {
    hash = ((hash << 7) - hash) + instanceId.charCodeAt(i);
    hash |= 0;
  }
  const phaseOffset = (Math.abs(hash) % 1000) / 1000 * Math.PI * 2;

  return {
    rate: 0.2, // ~0.2 Hz = one cycle every 5 seconds
    hipAmplitude: 0.03,
    shoulderAmplitude: 0.015,
    phaseOffset,
  };
}

/**
 * Create initial weight shift state
 */
export function createWeightShiftState(instanceId: string): WeightShiftState {
  return {
    elapsedTime: 0,
    config: createWeightShiftConfig(instanceId),
  };
}

/**
 * Calculate weight shift offsets for this frame
 */
export function calculateWeightShiftOffsets(
  state: WeightShiftState,
  delta: number
): { hip: number; shoulder: number } {
  // Clamp delta time
  const safeDelta = Math.max(MIN_DELTA, Math.min(MAX_DELTA, delta));
  
  // Update elapsed time
  state.elapsedTime += safeDelta;
  
  const { rate, hipAmplitude, shoulderAmplitude, phaseOffset } = state.config;
  
  // Slower sine wave than breathing
  const shiftPhase = state.elapsedTime * rate * Math.PI * 2 + phaseOffset;
  const shiftValue = Math.sin(shiftPhase);
  
  // Calculate offsets with safety clamping
  const hipOffset = clampValue(shiftValue * Math.min(hipAmplitude, MAX_AMPLITUDE));
  const shoulderOffset = clampValue(-shiftValue * Math.min(shoulderAmplitude, MAX_AMPLITUDE)); // Opposite direction
  
  return { hip: hipOffset, shoulder: shoulderOffset };
}

/**
 * Apply weight shift to bones
 */
export function applyWeightShift(
  boneMap: Map<string, THREE.Bone>,
  offsets: { hip: number; shoulder: number }
): void {
  // Apply hip sway (Z-axis = side to side)
  const hips = boneMap.get('Hips');
  if (hips) {
    applyRotationSafely(hips, 'z', offsets.hip);
  }

  // Apply opposite shoulder compensation
  const leftShoulder = boneMap.get('LeftShoulder');
  if (leftShoulder) {
    applyRotationSafely(leftShoulder, 'z', offsets.shoulder);
  }

  const rightShoulder = boneMap.get('RightShoulder');
  if (rightShoulder) {
    applyRotationSafely(rightShoulder, 'z', -offsets.shoulder);
  }
}

/**
 * Clamp a value and handle NaN
 */
function clampValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-MAX_AMPLITUDE, Math.min(MAX_AMPLITUDE, value));
}

/**
 * Safely apply rotation to a bone
 */
function applyRotationSafely(
  bone: THREE.Bone,
  axis: 'x' | 'y' | 'z',
  value: number
): void {
  if (!Number.isFinite(value)) return;
  
  const current = bone.rotation[axis];
  const newValue = current + value;
  
  if (Number.isFinite(newValue)) {
    bone.rotation[axis] = newValue;
  }
}
