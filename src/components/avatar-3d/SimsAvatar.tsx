/**
 * @file avatar-3d/SimsAvatar.tsx
 * @description Main 3D Sims-style avatar component
 */

import React, { useRef } from 'react';
import * as THREE from 'three';
import { ContactShadows } from '@react-three/drei';
import { Avatar3DConfig, DEFAULT_AVATAR_CONFIG } from '@/models/avatar-config';
import { MoodType } from '@/models/houseguest/types';
import { AvatarStatus } from '@/components/ui/status-avatar';
import { AvatarCanvas, AvatarCanvasSize } from './AvatarCanvas';
import { AvatarBody } from './AvatarBody';
import { AvatarHead } from './AvatarHead';
import { AvatarHair } from './AvatarHair';
import { AvatarClothing } from './AvatarClothing';
import { useAvatarAnimations } from './AvatarAnimations';
import { getSegmentsForSize } from './utils/avatar-generator';
import { getStatusGlowColor } from './hooks/useStatusAnimation';
import { cn } from '@/lib/utils';

interface SimsAvatarProps {
  config?: Avatar3DConfig;
  size?: AvatarCanvasSize;
  mood?: MoodType;
  status?: AvatarStatus;
  isPlayer?: boolean;
  animated?: boolean;
  showShadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Inner avatar scene component that renders inside the Canvas
 */
const AvatarScene: React.FC<{
  config: Avatar3DConfig;
  mood: MoodType;
  status: AvatarStatus;
  isPlayer: boolean;
  animated: boolean;
  showShadow: boolean;
  segments: number;
}> = ({ config, mood, status, isPlayer, animated, showShadow, segments }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Apply combined animations
  useAvatarAnimations(groupRef, { mood, status, isPlayer, animated });
  
  // Get glow color for status
  const glowColor = getStatusGlowColor(status);
  const hasGlow = status !== 'none' && status !== 'evicted';
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight 
        position={[3, 5, 5]} 
        intensity={0.8} 
        castShadow={false}
      />
      <directionalLight 
        position={[-2, 3, 2]} 
        intensity={0.3}
        color="#b0c4de"
      />
      
      {/* Status glow light */}
      {hasGlow && (
        <pointLight
          position={[0, 0.3, 0.5]}
          intensity={0.5}
          color={glowColor}
          distance={2}
        />
      )}
      
      {/* Avatar group with animations */}
      <group ref={groupRef}>
        <AvatarBody config={config} segments={segments} />
        <AvatarHead 
          config={config} 
          mood={mood} 
          segments={segments}
          animated={animated}
        />
        <AvatarHair config={config} segments={segments} />
        <AvatarClothing config={config} segments={segments} />
        
        {/* Player indicator ring */}
        {isPlayer && (
          <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.25, 0.28, 32]} />
            <meshBasicMaterial color="#22C55E" transparent opacity={0.8} />
          </mesh>
        )}
      </group>
      
      {/* Ground shadow */}
      {showShadow && (
        <ContactShadows
          position={[0, -0.65, 0]}
          opacity={0.4}
          scale={1}
          blur={2}
          far={1}
        />
      )}
    </>
  );
};

/**
 * Main Sims-style 3D avatar component
 */
export const SimsAvatar: React.FC<SimsAvatarProps> = ({
  config = DEFAULT_AVATAR_CONFIG,
  size = 'md',
  mood = 'Neutral',
  status = 'none',
  isPlayer = false,
  animated = true,
  showShadow = true,
  className,
  style
}) => {
  const segments = getSegmentsForSize(size);
  
  return (
    <div className={cn('relative', className)} style={style}>
      <AvatarCanvas size={size}>
        <AvatarScene
          config={config}
          mood={mood}
          status={status}
          isPlayer={isPlayer}
          animated={animated}
          showShadow={showShadow}
          segments={segments}
        />
      </AvatarCanvas>
    </div>
  );
};

export default SimsAvatar;
