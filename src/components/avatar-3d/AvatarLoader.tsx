/**
 * @file avatar-3d/AvatarLoader.tsx
 * @description Smart avatar loader for Ready Player Me avatars with optimization and fallbacks
 */

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useProgress } from '@react-three/drei';
import { Avatar3DConfig } from '@/models/avatar-config';
import { MoodType } from '@/models/houseguest';
import { cn } from '@/lib/utils';
import { Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOptimizedUrl } from '@/utils/rpm-avatar-optimizer';
import { AvatarThumbnail } from './AvatarThumbnail';
import { getAvatarCacheKey } from '@/utils/avatar-cache';
import type { AvatarContext } from './RPMAvatar';
import * as THREE from 'three';

// Lazy load RPM avatar component
const LazyRPMAvatar = lazy(() => 
  import('./RPMAvatar').then(mod => ({ default: mod.RPMAvatar }))
);

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface AvatarLoaderProps {
  avatarUrl?: string;
  avatarConfig?: Avatar3DConfig;
  size?: AvatarSize;
  mood?: MoodType;
  status?: 'none' | 'hoh' | 'pov' | 'nominee' | 'safe' | 'evicted';
  isPlayer?: boolean;
  animated?: boolean;
  className?: string;
  /** Timeout in ms before showing placeholder (default: 8000) */
  loadTimeout?: number;
  /** Zoom level for camera (1.0 = default, higher = zoomed in) */
  zoom?: number;
}

// Size configurations with context-aware camera settings
const SIZE_CONFIG: Record<AvatarSize, { 
  width: string; 
  height: string; 
  scale: number; 
  context: AvatarContext;
  camera: { y: number; z: number; fov: number; lookAtY: number }
}> = {
  sm: { 
    width: 'w-12', height: 'h-12', scale: 0.8, 
    context: 'thumbnail',
    camera: { y: 1.05, z: 1.2, fov: 25, lookAtY: 1.05 }  // Face level
  },
  md: { 
    width: 'w-20', height: 'h-20', scale: 1, 
    context: 'profile',
    camera: { y: 1.0, z: 1.4, fov: 28, lookAtY: 1.0 }  // Face level
  },
  lg: { 
    width: 'w-32', height: 'h-32', scale: 1.2, 
    context: 'profile',
    camera: { y: 1.0, z: 1.5, fov: 30, lookAtY: 1.0 }  // Face level
  },
  xl: { 
    width: 'w-48', height: 'h-48', scale: 1.5, 
    context: 'profile',
    camera: { y: 1.0, z: 1.5, fov: 30, lookAtY: 1.0 }  // Face level
  },
  full: { 
    width: 'w-full', height: 'h-full', scale: 1, 
    context: 'customizer',
    camera: { y: 0, z: 2.5, fov: 35, lookAtY: 0.8 }   // Body center
  },
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
      {timedOut ? 'Loading...' : 
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
 * Dynamic camera controller that updates position when zoom changes
 */
const CameraController: React.FC<{ 
  baseY: number; 
  baseZ: number; 
  zoom: number;
  lookAtY: number;
}> = ({ baseY, baseZ, zoom, lookAtY }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const zoomedZ = baseZ / zoom;
    const zoomedY = baseY * (zoom > 1 ? 1 + (zoom - 1) * 0.3 : 1);
    
    camera.position.set(0, zoomedY, zoomedZ);
    camera.lookAt(0, lookAtY, 0);
    camera.updateProjectionMatrix();
  }, [camera, baseY, baseZ, zoom, lookAtY]);
  
  return null;
};

/**
 * RPM Avatar Canvas - Primary renderer for Ready Player Me avatars
 */
const RPMAvatarCanvas: React.FC<{
  avatarUrl: string;
  mood: MoodType;
  scale: number;
  context: AvatarContext;
  sizeConfig: { 
    width: string; 
    height: string;
    camera: { y: number; z: number; fov: number; lookAtY: number }
  };
  className?: string;
  onLoaded?: () => void;
  onError?: () => void;
  zoom?: number;
}> = ({ avatarUrl, mood, scale, context, sizeConfig, className, onLoaded, onError, zoom = 1.0 }) => {
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
    return null;
  }

  return (
    <div className={cn(
      sizeConfig.width,
      sizeConfig.height,
      'relative overflow-hidden rounded-lg',
      className
    )}>
      <Canvas
        camera={{ 
          position: [0, sizeConfig.camera.y, sizeConfig.camera.z], 
          fov: sizeConfig.camera.fov 
        }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onError={handleError}
      >
        {/* Dynamic camera controller for zoom */}
        <CameraController 
          baseY={sizeConfig.camera.y} 
          baseZ={sizeConfig.camera.z} 
          zoom={zoom}
          lookAtY={sizeConfig.camera.lookAtY}
        />
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
 * Placeholder avatar state when no valid avatar is loaded
 */
const PlaceholderAvatarState: React.FC<{ size: AvatarSize; className?: string }> = ({ size, className }) => {
  const sizeConfig = SIZE_CONFIG[size];
  return (
    <div className={cn(
      sizeConfig.width,
      sizeConfig.height,
      'rounded-lg bg-muted/30 flex flex-col items-center justify-center',
      className
    )}>
      <User className="w-8 h-8 text-muted-foreground mb-1" />
      <p className="text-xs text-muted-foreground">No avatar</p>
    </div>
  );
};

/**
 * AvatarLoader - Smart router for Ready Player Me and custom GLB avatars
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
  loadTimeout = 8000,
  zoom = 1.0
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const modelSource = avatarConfig?.modelSource;
  const [timedOut, setTimedOut] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  // Check if we have a valid model to load
  const modelUrl = avatarUrl || avatarConfig?.modelUrl;
  const hasValidModel = Boolean(
    (modelSource === 'ready-player-me' || modelSource === 'custom-glb') && modelUrl
  );

  // Timeout fallback
  useEffect(() => {
    if (!hasValidModel || modelReady) return;
    
    const timeout = setTimeout(() => {
      if (!modelReady) {
        console.warn('Avatar load timeout');
        setTimedOut(true);
      }
    }, loadTimeout);
    
    return () => clearTimeout(timeout);
  }, [hasValidModel, modelReady, loadTimeout]);

  // Get avatar ID for thumbnail caching
  const avatarId = getAvatarCacheKey(modelUrl, avatarConfig?.presetId);

  // Show placeholder if timed out or no valid model
  if (timedOut || !hasValidModel) {
    if (avatarConfig?.thumbnailUrl) {
      return <AvatarThumbnail url={avatarConfig.thumbnailUrl} size={size === 'full' ? 'xl' : size} />;
    }
    return <PlaceholderAvatarState size={size} className={className} />;
  }

  // Fallback component with thumbnail
  const FallbackWithThumbnail = () => (
    avatarConfig?.thumbnailUrl ? (
      <AvatarThumbnail url={avatarConfig.thumbnailUrl} size={size === 'full' ? 'xl' : size} />
    ) : (
      <PlaceholderAvatarState size={size} />
    )
  );

  // Route to RPM renderer for both ready-player-me and custom-glb sources
  if ((modelSource === 'ready-player-me' || modelSource === 'custom-glb') && modelUrl) {
    return (
      <Suspense fallback={<FallbackWithThumbnail />}>
        <RPMAvatarCanvas
          avatarUrl={modelUrl}
          mood={mood}
          scale={sizeConfig.scale}
          context={sizeConfig.context}
          sizeConfig={sizeConfig}
          className={className}
          onLoaded={() => setModelReady(true)}
          onError={() => setTimedOut(true)}
          zoom={zoom}
        />
      </Suspense>
    );
  }

  // Default: show placeholder since we have no valid model
  return <PlaceholderAvatarState size={size} className={className} />;
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
