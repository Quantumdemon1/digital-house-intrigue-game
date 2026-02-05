/**
 * @file AvatarAnimator.ts
 * @description Unified animation hook - single entry point for all avatar animations
 */

import { useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getBoneMap } from './poses/applyPose';
import {
  createBreathingState,
  calculateBreathingOffsets,
  applyBreathing,
  type BreathingState,
} from './micro/BreathingSystem';
import {
  createWeightShiftState,
  calculateWeightShiftOffsets,
  applyWeightShift,
  type WeightShiftState,
} from './micro/WeightShift';
import {
  createBlinkState,
  updateBlinkState,
  getBlinkValue,
  applyBlink,
  type BlinkState,
} from './expressions/BlinkSystem';

export interface AvatarAnimatorConfig {
  /** The cloned avatar group */
  clone: THREE.Group | null;
  /** Unique instance ID for this avatar */
  instanceId: string;
  /** Enable breathing animation */
  enableBreathing?: boolean;
  /** Enable weight shift animation */
  enableWeightShift?: boolean;
  /** Enable blinking animation */
  enableBlinking?: boolean;
  /** Animation update priority (lower = earlier) */
  priority?: number;
}

interface AnimatorState {
  initialized: boolean;
  boneMap: Map<string, THREE.Bone>;
  breathing: BreathingState | null;
  weightShift: WeightShiftState | null;
  blink: BlinkState | null;
  /** Store base rotations to reset each frame */
  baseRotations: Map<string, { x: number; y: number; z: number }>;
}

/**
 * Unified animation hook - manages all micro-animations for a single avatar
 * 
 * Features:
 * - Zero shared state between avatars
 * - All calculations validated for NaN/Infinity
 * - Graceful degradation on errors
 */
export function useAvatarAnimator(config: AvatarAnimatorConfig): void {
  const {
    clone,
    instanceId,
    enableBreathing = true,
    enableWeightShift = true,
    enableBlinking = true,
    priority = 0,
  } = config;

  // State owned by this hook instance only
  const stateRef = useRef<AnimatorState>({
    initialized: false,
    boneMap: new Map(),
    breathing: null,
    weightShift: null,
    blink: null,
    baseRotations: new Map(),
  });

  // Initialize state when clone becomes available
  const initializeIfNeeded = useCallback(() => {
    const state = stateRef.current;
    
    if (!clone || state.initialized) return;
    
    // Get bone map for THIS clone only
    state.boneMap = getBoneMap(clone);
    
    // Store base rotations (after static pose applied)
    state.boneMap.forEach((bone, name) => {
      state.baseRotations.set(name, {
        x: bone.rotation.x,
        y: bone.rotation.y,
        z: bone.rotation.z,
      });
    });
    
    // Create animation states with unique phase offsets
    if (enableBreathing) {
      state.breathing = createBreathingState(instanceId);
    }
    if (enableWeightShift) {
      state.weightShift = createWeightShiftState(instanceId);
    }
    if (enableBlinking) {
      state.blink = createBlinkState();
    }
    
    state.initialized = true;
  }, [clone, instanceId, enableBreathing, enableWeightShift, enableBlinking]);

  // Reset bones to base pose before applying new offsets
  const resetToBasePose = useCallback(() => {
    const state = stateRef.current;
    
    state.boneMap.forEach((bone, name) => {
      const base = state.baseRotations.get(name);
      if (base) {
        bone.rotation.set(base.x, base.y, base.z);
      }
    });
  }, []);

  // Frame update - single apply step
  useFrame((_, delta) => {
    // Initialize on first frame with valid clone
    initializeIfNeeded();
    
    const state = stateRef.current;
    if (!state.initialized || !clone) return;
    
    try {
      // Reset to base pose first (prevents accumulation drift)
      resetToBasePose();
      
      // 1. Apply breathing
      if (state.breathing && enableBreathing) {
        const offsets = calculateBreathingOffsets(state.breathing, delta);
        applyBreathing(state.boneMap, offsets);
      }
      
      // 2. Apply weight shift
      if (state.weightShift && enableWeightShift) {
        const offsets = calculateWeightShiftOffsets(state.weightShift, delta);
        applyWeightShift(state.boneMap, offsets);
      }
      
      // 3. Update and apply blinking
      if (state.blink && enableBlinking) {
        updateBlinkState(state.blink, delta);
        const blinkValue = getBlinkValue(state.blink);
        applyBlink(clone, blinkValue);
      }
      
      // Future: Look-at and emotes will be added here
      
    } catch (error) {
      // Graceful degradation - log but don't throw
      console.warn(`[AvatarAnimator] Error in animation frame for ${instanceId}:`, error);
      // Avatar stays in last valid pose
    }
  }, priority);
}

/**
 * Check if animation features should be enabled based on quality
 */
export function getAnimationFeatures(quality: 'low' | 'medium' | 'high') {
  switch (quality) {
    case 'low':
      return {
        enableBreathing: false,
        enableWeightShift: false,
        enableBlinking: true, // Blinking is cheap
      };
    case 'medium':
      return {
        enableBreathing: true,
        enableWeightShift: false,
        enableBlinking: true,
      };
    case 'high':
    default:
      return {
        enableBreathing: true,
        enableWeightShift: true,
        enableBlinking: true,
      };
  }
}
