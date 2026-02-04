/**
 * @file avatar-3d/hooks/useIdleAnimation.ts
 * @description Subtle idle animations for lifelike 3D avatars
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IdleAnimationConfig {
  breathingSpeed?: number;
  breathingIntensity?: number;
  swaySpeed?: number;
  swayIntensity?: number;
  headMovementSpeed?: number;
  headMovementIntensity?: number;
}

const DEFAULT_CONFIG: IdleAnimationConfig = {
  breathingSpeed: 1.5,
  breathingIntensity: 0.008,
  swaySpeed: 0.5,
  swayIntensity: 0.015,
  headMovementSpeed: 0.3,
  headMovementIntensity: 0.04
};

/**
 * Hook that applies subtle idle animations to a group
 */
export function useIdleAnimation(
  groupRef: React.RefObject<THREE.Group>,
  enabled: boolean = true,
  config: IdleAnimationConfig = {}
) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const initialY = useRef<number | null>(null);

  useFrame((state) => {
    if (!enabled || !groupRef.current) return;
    
    // Store initial Y position
    if (initialY.current === null) {
      initialY.current = groupRef.current.position.y;
    }
    
    const time = state.clock.elapsedTime;
    
    // Breathing animation - subtle chest expansion
    const breathingPhase = Math.sin(time * cfg.breathingSpeed!);
    groupRef.current.scale.x = 1 + breathingPhase * cfg.breathingIntensity!;
    groupRef.current.scale.z = 1 + breathingPhase * cfg.breathingIntensity! * 0.5;
    
    // Very subtle Y movement with breathing
    groupRef.current.position.y = initialY.current + breathingPhase * 0.003;
    
    // Slight body sway
    const swayPhase = Math.sin(time * cfg.swaySpeed!);
    groupRef.current.rotation.z = swayPhase * cfg.swayIntensity!;
    
    // Micro weight shift
    groupRef.current.rotation.x = Math.sin(time * 0.4) * 0.005;
  });
}

/**
 * Hook for head-specific idle movements (looking around slightly)
 */
export function useHeadIdleAnimation(
  headRef: React.RefObject<THREE.Group>,
  enabled: boolean = true
) {
  useFrame((state) => {
    if (!enabled || !headRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Subtle head turning
    headRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    
    // Very subtle head tilt
    headRef.current.rotation.z = Math.sin(time * 0.25) * 0.02;
    
    // Occasional look up/down
    headRef.current.rotation.x = Math.sin(time * 0.2) * 0.02;
  });
}

/**
 * Hook for blinking animation
 */
export function useBlinkAnimation(
  leftEyeRef: React.RefObject<THREE.Mesh>,
  rightEyeRef: React.RefObject<THREE.Mesh>,
  enabled: boolean = true
) {
  const lastBlinkTime = useRef(0);
  const isBlinking = useRef(false);
  const blinkDuration = 0.15; // seconds
  
  useFrame((state) => {
    if (!enabled) return;
    
    const time = state.clock.elapsedTime;
    
    // Random blink interval between 2-5 seconds
    const timeSinceLastBlink = time - lastBlinkTime.current;
    const shouldBlink = !isBlinking.current && timeSinceLastBlink > 2 + Math.random() * 3;
    
    if (shouldBlink) {
      isBlinking.current = true;
      lastBlinkTime.current = time;
    }
    
    // Blink animation
    if (isBlinking.current) {
      const blinkProgress = (time - lastBlinkTime.current) / blinkDuration;
      
      if (blinkProgress >= 1) {
        isBlinking.current = false;
        // Reset eye scale
        if (leftEyeRef.current) leftEyeRef.current.scale.y = 1;
        if (rightEyeRef.current) rightEyeRef.current.scale.y = 1;
      } else {
        // Close and open eyes
        const eyeOpenness = blinkProgress < 0.5 
          ? 1 - (blinkProgress * 2)  // Closing
          : (blinkProgress - 0.5) * 2; // Opening
        
        if (leftEyeRef.current) leftEyeRef.current.scale.y = Math.max(0.1, eyeOpenness);
        if (rightEyeRef.current) rightEyeRef.current.scale.y = Math.max(0.1, eyeOpenness);
      }
    }
  });
}
