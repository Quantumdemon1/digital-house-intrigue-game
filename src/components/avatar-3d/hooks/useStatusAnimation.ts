/**
 * @file avatar-3d/hooks/useStatusAnimation.ts
 * @description Game status-reactive animations for 3D avatars (HoH, Nominee, etc.)
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarStatus } from '@/components/ui/status-avatar';

// Animation parameters for each status
interface StatusAnimationParams {
  poseRotationX: number;
  poseRotationY: number;
  positionY: number;
  scaleBase: number;
  scalePulseSpeed: number;
  scalePulseIntensity: number;
  fidgetSpeed: number;
  fidgetIntensity: number;
  glowIntensity: number;
}

const STATUS_ANIMATIONS: Record<AvatarStatus, StatusAnimationParams> = {
  hoh: {
    poseRotationX: -0.05,      // Confident lean back
    poseRotationY: 0,
    positionY: 0.02,           // Slightly elevated
    scaleBase: 1.02,           // Slightly larger
    scalePulseSpeed: 2,
    scalePulseIntensity: 0.02, // Golden pulse
    fidgetSpeed: 0,
    fidgetIntensity: 0,
    glowIntensity: 0.5
  },
  nominee: {
    poseRotationX: 0.03,       // Nervous hunch
    poseRotationY: 0,
    positionY: 0,
    scaleBase: 1.0,
    scalePulseSpeed: 0,
    scalePulseIntensity: 0,
    fidgetSpeed: 4,            // Nervous fidgeting
    fidgetIntensity: 0.02,
    glowIntensity: 0.3
  },
  pov: {
    poseRotationX: -0.03,      // Confident
    poseRotationY: 0,
    positionY: 0.01,
    scaleBase: 1.01,
    scalePulseSpeed: 1.5,
    scalePulseIntensity: 0.015,
    fidgetSpeed: 0,
    fidgetIntensity: 0,
    glowIntensity: 0.4
  },
  safe: {
    poseRotationX: 0,
    poseRotationY: 0,
    positionY: 0,
    scaleBase: 1.0,
    scalePulseSpeed: 0,
    scalePulseIntensity: 0,
    fidgetSpeed: 0,
    fidgetIntensity: 0,
    glowIntensity: 0.2
  },
  evicted: {
    poseRotationX: 0.1,        // Sad slump
    poseRotationY: 0,
    positionY: -0.03,          // Lowered
    scaleBase: 0.98,           // Slightly smaller
    scalePulseSpeed: 0,
    scalePulseIntensity: 0,
    fidgetSpeed: 0,
    fidgetIntensity: 0,
    glowIntensity: 0
  },
  none: {
    poseRotationX: 0,
    poseRotationY: 0,
    positionY: 0,
    scaleBase: 1.0,
    scalePulseSpeed: 0,
    scalePulseIntensity: 0,
    fidgetSpeed: 0,
    fidgetIntensity: 0,
    glowIntensity: 0
  }
};

/**
 * Hook that applies status-based animations to avatar
 */
export function useStatusAnimation(
  groupRef: React.RefObject<THREE.Group>,
  status: AvatarStatus,
  enabled: boolean = true
) {
  const params = STATUS_ANIMATIONS[status];
  const currentParams = useRef(params);
  const baseY = useRef<number | null>(null);
  
  // Store base position on first render
  useEffect(() => {
    if (groupRef.current && baseY.current === null) {
      baseY.current = groupRef.current.position.y;
    }
  }, [groupRef]);
  
  // Update target params when status changes
  useEffect(() => {
    currentParams.current = STATUS_ANIMATIONS[status];
  }, [status]);
  
  useFrame((state) => {
    if (!enabled || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    const target = currentParams.current;
    
    // Smooth pose transitions
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      target.poseRotationX,
      0.05
    );
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      target.poseRotationY,
      0.05
    );
    
    // Position adjustment
    const targetY = (baseY.current || 0) + target.positionY;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.05
    );
    
    // Scale with optional pulse
    let targetScale = target.scaleBase;
    if (target.scalePulseSpeed > 0) {
      targetScale += Math.sin(time * target.scalePulseSpeed) * target.scalePulseIntensity;
    }
    
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    groupRef.current.scale.setScalar(newScale);
    
    // Fidgeting for nervous states
    if (target.fidgetSpeed > 0) {
      // Random-ish fidget using multiple sine waves
      const fidgetY = Math.sin(time * target.fidgetSpeed) * target.fidgetIntensity;
      const fidgetX = Math.sin(time * target.fidgetSpeed * 1.3) * target.fidgetIntensity * 0.5;
      
      groupRef.current.position.y += fidgetY;
      groupRef.current.rotation.y += Math.sin(time * 2) * 0.08;
    }
  });
  
  return params;
}

/**
 * Hook for player-specific highlight animation
 */
export function usePlayerHighlight(
  groupRef: React.RefObject<THREE.Group>,
  isPlayer: boolean,
  enabled: boolean = true
) {
  useFrame((state) => {
    if (!enabled || !isPlayer || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Subtle green glow pulse for player
    // This would typically be applied to a glow mesh, but we can use scale
    const glowPulse = 1 + Math.sin(time * 1.5) * 0.005;
    
    // Apply only if it doesn't interfere with status animation
    // This is additive to existing scale
  });
}

/**
 * Get glow color for status
 */
export function getStatusGlowColor(status: AvatarStatus): string {
  const colors: Record<AvatarStatus, string> = {
    hoh: '#FFD700',
    nominee: '#EF4444',
    pov: '#FFD700',
    safe: '#22C55E',
    evicted: '#6B7280',
    none: 'transparent'
  };
  return colors[status];
}

/**
 * Get animation parameters for status
 */
export function getStatusParams(status: AvatarStatus): StatusAnimationParams {
  return STATUS_ANIMATIONS[status];
}
