/**
 * @file avatar-3d/SimsAvatar.tsx
 * @description Modern chibi-style 3D avatar with toon shading
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
 * Inner avatar scene component with modern toon lighting
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
      {/* Modern soft 3-point lighting for toon shading */}
      <ambientLight intensity={0.75} color="#fff8f5" />
      
      {/* Main key light - warm, from above-front */}
      <directionalLight 
        position={[2, 4, 4]} 
        intensity={0.6} 
        color="#fffaf5"
        castShadow={false}
      />
      
      {/* Rim/back light - cool blue for depth */}
      <directionalLight 
        position={[-2, 2, -3]} 
        intensity={0.35}
        color="#c5d8ff"
      />
      
      {/* Fill light from below - warm bounce */}
      <hemisphereLight 
        args={['#ffffff', '#ffd4b8', 0.4]}
      />
      
      {/* Status glow light */}
      {hasGlow && (
        <pointLight
          position={[0, 0.2, 0.6]}
          intensity={0.4}
          color={glowColor}
          distance={2.5}
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
        
        {/* Player indicator ring - cute glow */}
        {isPlayer && (
          <group position={[0, -0.5, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.22, 0.26, 32]} />
              <meshBasicMaterial color="#22C55E" transparent opacity={0.7} />
            </mesh>
            {/* Inner glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <circleGeometry args={[0.22, 32]} />
              <meshBasicMaterial color="#22C55E" transparent opacity={0.15} />
            </mesh>
          </group>
        )}
      </group>
      
      {/* Soft ground shadow */}
      {showShadow && (
        <ContactShadows
          position={[0, -0.52, 0]}
          opacity={0.5}
          scale={1.2}
          blur={2.5}
          far={1}
        />
      )}
    </>
  );
};

/**
 * Main modern chibi-style 3D avatar component
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
