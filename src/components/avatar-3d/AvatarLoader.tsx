/**
 * @file avatar-3d/AvatarLoader.tsx
 * @description Smart avatar loader that chooses between RPM and procedural avatars
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { RPMAvatar } from './RPMAvatar';
import { SimsAvatar } from './SimsAvatar';
import { Avatar3DConfig } from '@/models/avatar-config';
import { MoodType } from '@/models/houseguest';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface AvatarLoaderProps {
  // GLB URL from Ready Player Me or custom source
  avatarUrl?: string;
  // Fallback procedural config
  avatarConfig?: Avatar3DConfig;
  // Display size
  size?: AvatarSize;
  // Current mood for expressions
  mood?: MoodType;
  // Game status
  status?: 'none' | 'hoh' | 'pov' | 'nominee' | 'evicted';
  // Is this the player's avatar?
  isPlayer?: boolean;
  // Enable idle animations
  animated?: boolean;
  // Additional CSS classes
  className?: string;
  // Force use of procedural avatar even if URL exists
  forceChibibAvatar?: boolean;
}

// Size configurations
const SIZE_CONFIG: Record<AvatarSize, { width: string; height: string; scale: number }> = {
  sm: { width: 'w-12', height: 'h-12', scale: 0.8 },
  md: { width: 'w-20', height: 'h-20', scale: 1 },
  lg: { width: 'w-32', height: 'h-32', scale: 1.2 },
  xl: { width: 'w-48', height: 'h-48', scale: 1.5 },
  full: { width: 'w-full', height: 'h-full', scale: 1 },
};

/**
 * AvatarLoader - Renders either RPM GLB avatar or procedural chibi avatar
 */
export const AvatarLoader: React.FC<AvatarLoaderProps> = ({
  avatarUrl,
  avatarConfig,
  size = 'md',
  mood = 'Neutral',
  status = 'none',
  isPlayer = false,
  animated = true,
  className,
  forceChibibAvatar = false
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const shouldUseRPM = avatarUrl && !forceChibibAvatar;

  // For small sizes, use procedural avatar (faster rendering)
  const useProceduralForPerformance = size === 'sm' && avatarConfig;

  if (shouldUseRPM && !useProceduralForPerformance) {
    return (
      <div className={cn(
        sizeConfig.width,
        sizeConfig.height,
        'relative overflow-hidden rounded-lg',
        className
      )}>
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 35 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 4]} intensity={0.8} />
          <directionalLight position={[-2, 2, -3]} intensity={0.3} color="#e0f0ff" />
          
          <Suspense fallback={null}>
            <RPMAvatar
              modelSrc={avatarUrl}
              mood={mood}
              scale={sizeConfig.scale}
            />
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
        
        {/* Loading overlay */}
        <LoadingOverlay />
      </div>
    );
  }

  // Fallback to procedural SimsAvatar
  return (
    <SimsAvatar
      config={avatarConfig}
      size={size}
      mood={mood}
      status={status}
      isPlayer={isPlayer}
      animated={animated}
    />
  );
};

/**
 * Loading overlay with spinner
 */
const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 pointer-events-none opacity-0 transition-opacity duration-300">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
};

/**
 * AvatarSkeleton - Placeholder while avatar loads
 */
export const AvatarSkeleton: React.FC<{ size?: AvatarSize; className?: string }> = ({
  size = 'md',
  className
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  
  return (
    <div className={cn(
      sizeConfig.width,
      sizeConfig.height,
      'rounded-lg bg-muted animate-pulse flex items-center justify-center',
      className
    )}>
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
};

/**
 * Preload utility for GLB models
 */
export const preloadAvatar = async (url: string): Promise<void> => {
  if (!url) return;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to preload: ${response.status}`);
    // Just validate the URL is accessible, actual caching is handled by useGLTF
  } catch (error) {
    console.warn('Failed to preload avatar:', error);
  }
};

export default AvatarLoader;
