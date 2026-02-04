/**
 * @file avatar-3d/AvatarAnimations.tsx
 * @description Animation controller component for 3D avatars
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useIdleAnimation } from './hooks/useIdleAnimation';
import { useStatusAnimation } from './hooks/useStatusAnimation';
import { useMoodBodyAnimation } from './hooks/useMoodAnimation';
import { AvatarStatus } from '@/components/ui/status-avatar';
import { MoodType } from '@/models/houseguest/types';

interface AvatarAnimationsProps {
  mood?: MoodType;
  status?: AvatarStatus;
  isPlayer?: boolean;
  enabled?: boolean;
}

/**
 * Animation controller that applies all animation hooks
 * This is a "controller" component that wraps the avatar group
 * and applies animations to its parent
 */
export const AvatarAnimations: React.FC<AvatarAnimationsProps> = ({
  mood = 'Neutral',
  status = 'none',
  isPlayer = false,
  enabled = true
}) => {
  // This component doesn't render anything visible
  // It's meant to be used alongside avatar components
  // The actual animation application happens in parent components
  
  // We return null but this serves as a documentation component
  // showing what animations are available
  return null;
};

/**
 * Hook that combines all avatar animations
 * Use this in the parent component that has the group ref
 */
export function useAvatarAnimations(
  groupRef: React.RefObject<THREE.Group>,
  options: {
    mood?: MoodType;
    status?: AvatarStatus;
    isPlayer?: boolean;
    animated?: boolean;
  } = {}
) {
  const {
    mood = 'Neutral',
    status = 'none',
    isPlayer = false,
    animated = true
  } = options;
  
  // Apply idle animations
  useIdleAnimation(groupRef, animated);
  
  // Apply status-based animations
  const statusParams = useStatusAnimation(groupRef, status, animated);
  
  // Apply mood-based body animations
  const moodExpression = useMoodBodyAnimation(groupRef, mood, animated);
  
  return {
    statusParams,
    moodExpression
  };
}

/**
 * Wrapper component that provides animation context
 */
export const AnimatedAvatarGroup: React.FC<{
  children: React.ReactNode;
  mood?: MoodType;
  status?: AvatarStatus;
  isPlayer?: boolean;
  animated?: boolean;
}> = ({ children, mood, status, isPlayer, animated = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useAvatarAnimations(groupRef, { mood, status, isPlayer, animated });
  
  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
};

export default AvatarAnimations;
