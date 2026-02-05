/**
 * @file expressions/BlinkSystem.ts
 * @description Morph-target based blinking animation
 */

import * as THREE from 'three';

export interface BlinkConfig {
  /** Minimum time between blinks (seconds) */
  minInterval: number;
  /** Maximum time between blinks (seconds) */
  maxInterval: number;
  /** Total blink duration (seconds) */
  duration: number;
}

export interface BlinkState {
  /** Time until next blink */
  nextBlinkIn: number;
  /** Current blink progress (0 = not blinking, 0-1 = blinking) */
  blinkProgress: number;
  /** Is currently blinking */
  isBlinking: boolean;
  config: BlinkConfig;
}

// Default blink timing
const DEFAULT_CONFIG: BlinkConfig = {
  minInterval: 2,
  maxInterval: 6,
  duration: 0.15,
};

/**
 * Create initial blink state
 */
export function createBlinkState(config?: Partial<BlinkConfig>): BlinkState {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return {
    nextBlinkIn: getRandomInterval(finalConfig),
    blinkProgress: 0,
    isBlinking: false,
    config: finalConfig,
  };
}

/**
 * Get random blink interval
 */
function getRandomInterval(config: BlinkConfig): number {
  return config.minInterval + Math.random() * (config.maxInterval - config.minInterval);
}

/**
 * Calculate blink morph target value
 * Uses asymmetric curve: quick close (30%), hold (20%), slow open (50%)
 */
function calculateBlinkValue(progress: number): number {
  if (progress <= 0 || progress >= 1) return 0;
  
  // Quick close: 0-30% of duration
  if (progress < 0.3) {
    return progress / 0.3;
  }
  
  // Hold closed: 30-50% of duration
  if (progress < 0.5) {
    return 1;
  }
  
  // Slow open: 50-100% of duration
  return 1 - (progress - 0.5) / 0.5;
}

/**
 * Update blink state for this frame
 */
export function updateBlinkState(state: BlinkState, delta: number): void {
  // Clamp delta for safety
  const safeDelta = Math.max(0.001, Math.min(0.1, delta));
  
  if (state.isBlinking) {
    // Progress the blink
    state.blinkProgress += safeDelta / state.config.duration;
    
    if (state.blinkProgress >= 1) {
      // Blink complete
      state.isBlinking = false;
      state.blinkProgress = 0;
      state.nextBlinkIn = getRandomInterval(state.config);
    }
  } else {
    // Count down to next blink
    state.nextBlinkIn -= safeDelta;
    
    if (state.nextBlinkIn <= 0) {
      // Start blinking
      state.isBlinking = true;
      state.blinkProgress = 0;
    }
  }
}

/**
 * Get current blink morph value (0-1)
 */
export function getBlinkValue(state: BlinkState): number {
  if (!state.isBlinking) return 0;
  return calculateBlinkValue(state.blinkProgress);
}

/**
 * Apply blink to avatar's morph targets
 */
export function applyBlink(
  clone: THREE.Group,
  blinkValue: number
): void {
  if (blinkValue <= 0) return;
  
  // Clamp for safety
  const safeValue = Math.max(0, Math.min(1, blinkValue));
  
  clone.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
      // Try common morph target names for eye blink
      const blinkNames = [
        'eyeBlinkLeft', 'eyeBlinkRight',
        'eyeBlink_L', 'eyeBlink_R',
        'EyeBlink_L', 'EyeBlink_R',
        'blink_L', 'blink_R',
      ];
      
      for (const name of blinkNames) {
        const index = child.morphTargetDictionary[name];
        if (index !== undefined) {
          child.morphTargetInfluences[index] = safeValue;
        }
      }
    }
  });
}

/**
 * Force trigger a blink immediately
 */
export function triggerBlinkNow(state: BlinkState): void {
  state.isBlinking = true;
  state.blinkProgress = 0;
}
