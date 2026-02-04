/**
 * @file avatar-3d/hooks/useMoodAnimation.ts
 * @description Mood-reactive animations and expressions for 3D avatars
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MoodType } from '@/models/houseguest/types';

// Expression parameters for each mood
const MOOD_EXPRESSIONS: Record<MoodType, {
  eyeScale: number;
  eyeOffsetY: number;
  mouthCurve: number;
  browOffset: number;
  headTilt: number;
  bodyEnergy: number;
}> = {
  Happy: {
    eyeScale: 1.15,
    eyeOffsetY: 0.002,
    mouthCurve: 0.4,
    browOffset: 0.01,
    headTilt: 0.05,
    bodyEnergy: 1.3
  },
  Content: {
    eyeScale: 1.05,
    eyeOffsetY: 0,
    mouthCurve: 0.15,
    browOffset: 0.005,
    headTilt: 0.02,
    bodyEnergy: 1.1
  },
  Neutral: {
    eyeScale: 1.0,
    eyeOffsetY: 0,
    mouthCurve: 0,
    browOffset: 0,
    headTilt: 0,
    bodyEnergy: 1.0
  },
  Upset: {
    eyeScale: 0.9,
    eyeOffsetY: -0.002,
    mouthCurve: -0.2,
    browOffset: -0.008,
    headTilt: -0.03,
    bodyEnergy: 0.8
  },
  Angry: {
    eyeScale: 0.85,
    eyeOffsetY: -0.004,
    mouthCurve: -0.35,
    browOffset: -0.015,
    headTilt: 0.08,
    bodyEnergy: 1.4
  }
};

/**
 * Hook for mood-based body animation adjustments
 */
export function useMoodBodyAnimation(
  groupRef: React.RefObject<THREE.Group>,
  mood: MoodType,
  enabled: boolean = true
) {
  const expression = MOOD_EXPRESSIONS[mood];
  const targetEnergy = useRef(expression.bodyEnergy);
  const currentEnergy = useRef(1.0);
  
  // Smoothly transition energy level
  useEffect(() => {
    targetEnergy.current = MOOD_EXPRESSIONS[mood].bodyEnergy;
  }, [mood]);
  
  useFrame((state) => {
    if (!enabled || !groupRef.current) return;
    
    // Lerp to target energy
    currentEnergy.current += (targetEnergy.current - currentEnergy.current) * 0.05;
    
    const time = state.clock.elapsedTime;
    const energy = currentEnergy.current;
    
    // Adjust idle animation intensity based on mood energy
    if (mood === 'Happy') {
      // Bouncy movement
      groupRef.current.position.y += Math.abs(Math.sin(time * 3)) * 0.005;
    } else if (mood === 'Upset') {
      // Slouched posture
      groupRef.current.rotation.x = 0.05;
    } else if (mood === 'Angry') {
      // Tense, quick movements
      groupRef.current.rotation.x = -0.03;
      groupRef.current.position.y += Math.sin(time * 6) * 0.002;
    }
  });
  
  return expression;
}

/**
 * Hook for mood-based facial expressions
 */
export function useMoodFaceAnimation(
  headRef: React.RefObject<THREE.Group>,
  leftEyeRef: React.RefObject<THREE.Mesh>,
  rightEyeRef: React.RefObject<THREE.Mesh>,
  mood: MoodType,
  enabled: boolean = true
) {
  const expression = MOOD_EXPRESSIONS[mood];
  const currentExpression = useRef(expression);
  
  useEffect(() => {
    currentExpression.current = MOOD_EXPRESSIONS[mood];
  }, [mood]);
  
  useFrame(() => {
    if (!enabled) return;
    
    const target = currentExpression.current;
    
    // Apply eye scaling
    if (leftEyeRef.current) {
      leftEyeRef.current.scale.x = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.x,
        target.eyeScale,
        0.1
      );
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.x = THREE.MathUtils.lerp(
        rightEyeRef.current.scale.x,
        target.eyeScale,
        0.1
      );
    }
    
    // Apply head tilt
    if (headRef.current) {
      headRef.current.rotation.z = THREE.MathUtils.lerp(
        headRef.current.rotation.z,
        target.headTilt,
        0.05
      );
    }
  });
  
  return expression;
}

/**
 * Get mouth curve parameter for current mood
 */
export function getMouthCurve(mood: MoodType): number {
  return MOOD_EXPRESSIONS[mood].mouthCurve;
}

/**
 * Get expression parameters for mood
 */
export function getMoodExpression(mood: MoodType) {
  return MOOD_EXPRESSIONS[mood];
}
