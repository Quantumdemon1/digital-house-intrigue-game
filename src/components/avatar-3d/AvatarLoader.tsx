/**
 * @file avatar-3d/AvatarLoader.tsx
 * @description Smart avatar loader with RPM optimization and fallback
 */

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useProgress } from '@react-three/drei';
import { SimsAvatar } from './SimsAvatar';
import { Avatar3DConfig } from '@/models/avatar-config';
import { MoodType } from '@/models/houseguest';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOptimizedUrl } from '@/utils/rpm-avatar-optimizer';
import type { AvatarContext } from './RPMAvatar';

// Lazy load RPM avatar to prevent build issues with the SDK
const LazyRPMAvatar = lazy(() => 
  import('./RPMAvatar').then(mod => ({ default: mod.RPMAvatar }))
);

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface AvatarLoaderProps {
  avatarUrl?: string;
  avatarConfig?: Avatar3DConfig;
  size?: AvatarSize;
  mood?: MoodType;
  status?: 'none' | 'hoh' | 'pov' | 'nominee' | 'evicted';
  isPlayer?: boolean;
  animated?: boolean;
  className?: string;
  forceChibibAvatar?: boolean;
  /** Timeout in ms before falling back to chibi (default: 8000) */
  loadTimeout?: number;
}

// Size configurations with context mapping
const SIZE_CONFIG: Record<AvatarSize, { width: string; height: string; scale: number; context: AvatarContext }> = {
  sm: { width: 'w-12', height: 'h-12', scale: 0.8, context: 'thumbnail' },
  md: { width: 'w-20', height: 'h-20', scale: 1, context: 'game' },
  lg: { width: 'w-32', height: 'h-32', scale: 1.2, context: 'game' },
  xl: { width: 'w-48', height: 'h-48', scale: 1.5, context: 'profile' },
  full: { width: 'w-full', height: 'h-full', scale: 1, context: 'customizer' },
};

/**
 * Loading state component with progress bar
 */
const RPMLoadingState: React.FC<{ progress: number; timedOut?: boolean }> = ({ 
  progress, 
  timedOut 
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 z-10">
    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
    <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.2 }}
      />
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      {timedOut ? 'Switching to chibi...' : 
       progress < 100 ? `${Math.round(progress)}%` : 'Rendering...'}
    </p>
  </div>
);

/**
 * Progress tracker hook
 */
const useLoadingProgress = () => {
  const { progress, active, loaded, total } = useProgress();
  return { progress, active, loaded, total };
};

/**
 * RPM Avatar Canvas - Only loaded when RPM avatar URL is provided
 */
const RPMAvatarCanvas: React.FC<{
  avatarUrl: string;
  mood: MoodType;
  scale: number;
  context: AvatarContext;
  sizeConfig: { width: string; height: string };
  className?: string;
  onLoaded?: () => void;
  onError?: () => void;
}> = ({ avatarUrl, mood, scale, context, sizeConfig, className, onLoaded, onError }) => {
  const [rpmLoadError, setRpmLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Get optimized URL based on context
  const optimizedUrl = getOptimizedUrl(avatarUrl, context === 'customizer' ? 'profile' : context);

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
    setLoadProgress(100);
    onLoaded?.();
  }, [onLoaded]);

  const handleError = useCallback(() => {
    setRpmLoadError(true);
    onError?.();
  }, [onError]);

  if (rpmLoadError) {
    return null; // Will trigger fallback to SimsAvatar
  }

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
        onError={handleError}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={0.8} />
        <directionalLight position={[-2, 2, -3]} intensity={0.3} color="#e0f0ff" />
        
        <Suspense fallback={null}>
          <ProgressTracker onProgress={setLoadProgress} />
          <LazyRPMAvatar
            modelSrc={optimizedUrl}
            mood={mood}
            scale={scale}
            context={context}
            onLoaded={handleLoaded}
            onError={handleError}
          />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
      
      {/* Loading overlay with progress */}
      {isLoading && <RPMLoadingState progress={loadProgress} />}
    </div>
  );
};

/**
 * Progress tracker component (inside Canvas)
 */
const ProgressTracker: React.FC<{ onProgress: (p: number) => void }> = ({ onProgress }) => {
  const { progress } = useLoadingProgress();
  
  useEffect(() => {
    onProgress(progress);
  }, [progress, onProgress]);
  
  return null;
};

/**
 * AvatarLoader - Renders either RPM GLB avatar or procedural chibi avatar
 * With timeout fallback and loading progress
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
  forceChibibAvatar = false,
  loadTimeout = 8000
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const shouldUseRPM = avatarUrl && !forceChibibAvatar;
  const [timedOut, setTimedOut] = useState(false);
  const [rpmReady, setRpmReady] = useState(false);

  // Timeout fallback - if RPM takes too long, switch to chibi
  useEffect(() => {
    if (!shouldUseRPM || rpmReady) return;
    
    const timeout = setTimeout(() => {
      if (!rpmReady) {
        console.warn('RPM avatar load timeout, falling back to chibi');
        setTimedOut(true);
      }
    }, loadTimeout);
    
    return () => clearTimeout(timeout);
  }, [shouldUseRPM, rpmReady, loadTimeout]);

  // For small sizes, always use procedural avatar (faster rendering)
  const useProceduralForPerformance = size === 'sm' && avatarConfig;

  // If timed out, force chibi
  if (timedOut || useProceduralForPerformance) {
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
  }

  // Try RPM avatar with chibi fallback
  if (shouldUseRPM) {
    return (
      <Suspense fallback={
        <SimsAvatar
          config={avatarConfig}
          size={size}
          mood={mood}
          status={status}
          isPlayer={isPlayer}
          animated={animated}
        />
      }>
        <RPMAvatarCanvas
          avatarUrl={avatarUrl}
          mood={mood}
          scale={sizeConfig.scale}
          context={sizeConfig.context}
          sizeConfig={sizeConfig}
          className={className}
          onLoaded={() => setRpmReady(true)}
          onError={() => setTimedOut(true)}
        />
      </Suspense>
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
 * Preload utility for GLB models with optimization
 */
export const preloadAvatar = async (url: string, context: AvatarContext = 'game'): Promise<void> => {
  if (!url) return;
  
  try {
    const optimizedUrl = getOptimizedUrl(url, context);
    const response = await fetch(optimizedUrl, { method: 'HEAD' });
    if (!response.ok) throw new Error(`Failed to preload: ${response.status}`);
  } catch (error) {
    console.warn('Failed to preload avatar:', error);
  }
};

export default AvatarLoader;
