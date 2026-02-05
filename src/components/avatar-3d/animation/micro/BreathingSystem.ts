/**
 * @file micro/BreathingSystem.ts
 * @description Simple sine-based breathing animation - no complex physics
 */

import * as THREE from 'three';

export interface BreathingConfig {
  /** Breathing rate in Hz (cycles per second) */
  rate: number;
  /** Maximum spine tilt amplitude in radians */
  spineAmplitude: number;
  /** Maximum chest expansion amplitude in radians */
  chestAmplitude: number;
  /** Phase offset for this avatar (0-2π) */
  phaseOffset: number;
}

export interface BreathingState {
  elapsedTime: number;
  config: BreathingConfig;
}

// Safety limits
const MAX_AMPLITUDE = 0.05; // Hard cap on any breathing motion
const MIN_DELTA = 0.001;
const MAX_DELTA = 0.1;

/**
 * Create default breathing config with unique phase offset
 */
export function createBreathingConfig(instanceId: string): BreathingConfig {
  // Generate deterministic phase offset from instance ID
  let hash = 0;
  for (let i = 0; i < instanceId.length; i++) {
    hash = ((hash << 5) - hash) + instanceId.charCodeAt(i);
    hash |= 0;
  }
  const phaseOffset = (Math.abs(hash) % 1000) / 1000 * Math.PI * 2;

  return {
    rate: 0.3, // ~0.3 Hz = one breath every 3.3 seconds
    spineAmplitude: 0.02,
    chestAmplitude: 0.01,
    phaseOffset,
  };
}

/**
 * Create initial breathing state
 */
export function createBreathingState(instanceId: string): BreathingState {
  return {
    elapsedTime: 0,
    config: createBreathingConfig(instanceId),
  };
}

/**
 * Calculate breathing offsets for this frame
 * Returns safe, clamped values
 */
export function calculateBreathingOffsets(
  state: BreathingState,
  delta: number
): { spine: number; chest: number } {
  // Clamp delta time for stability
  const safeDelta = Math.max(MIN_DELTA, Math.min(MAX_DELTA, delta));
  
  // Update elapsed time
  state.elapsedTime += safeDelta;
  
  const { rate, spineAmplitude, chestAmplitude, phaseOffset } = state.config;
  
  // Simple sine wave - no complex physics
  const breathPhase = state.elapsedTime * rate * Math.PI * 2 + phaseOffset;
  const breathValue = Math.sin(breathPhase);
  
  // Calculate offsets with safety clamping
  const spineOffset = clampValue(breathValue * Math.min(spineAmplitude, MAX_AMPLITUDE));
  const chestOffset = clampValue(breathValue * Math.min(chestAmplitude, MAX_AMPLITUDE));
  
  return { spine: spineOffset, chest: chestOffset };
}

/**
 * Apply breathing to bones
 */
export function applyBreathing(
  boneMap: Map<string, THREE.Bone>,
  offsets: { spine: number; chest: number }
): void {
  // Apply to Spine (forward/back tilt)
  const spine = boneMap.get('Spine');
  if (spine) {
    applyRotationSafely(spine, 'x', offsets.spine);
  }

  // Apply to Spine1/Chest (expansion)
  const spine1 = boneMap.get('Spine1');
  if (spine1) {
    applyRotationSafely(spine1, 'x', offsets.chest * 0.5);
  }

  const spine2 = boneMap.get('Spine2');
  if (spine2) {
    applyRotationSafely(spine2, 'x', offsets.chest);
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
