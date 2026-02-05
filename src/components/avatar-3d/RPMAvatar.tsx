/**
 * @file avatar-3d/RPMAvatar.tsx
 * @description Ready Player Me avatar component with new modular animation system
 */

import React, { Suspense, useRef, useMemo, useEffect, Component, ReactNode } from 'react';
import { useGLTF, useProgress } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { MoodType } from '@/models/houseguest';
import { getOptimizedUrl } from '@/utils/rpm-avatar-optimizer';
import { PoseType, GestureType } from './animation';
import { applyStaticPose, type StaticPoseType } from './animation/poses';
import { useAvatarAnimator, getAnimationFeatures } from './animation/AvatarAnimator';

export type AvatarContext = 'thumbnail' | 'game' | 'profile' | 'customizer';

// Re-export types for backwards compatibility
export type { PoseType, GestureType };

interface RPMAvatarProps {
  modelSrc: string;
  animationSrc?: string;
  mood?: MoodType;
  scale?: number;
  position?: [number, number, number];
  /** UI context for quality optimization */
  context?: AvatarContext;
  /** Apply natural idle standing pose */
  applyIdlePose?: boolean;
  /** Phase offset for animation variation */
  phaseOffset?: number;
  /** Pose type for static pose */
  poseType?: PoseType;
  /** Target position for head look-at (Phase 5 - not yet implemented) */
  lookAtTarget?: THREE.Vector3 | null;
  /** Character's world position */
  worldPosition?: [number, number, number];
  /** Character's Y rotation */
  worldRotationY?: number;
  /** Whether this is the player's avatar */
  isPlayer?: boolean;
  /** Enable gesture animations (Phase 6 - not yet implemented) */
  enableGestures?: boolean;
  /** Gesture to play (Phase 6 - not yet implemented) */
  gestureToPlay?: GestureType | null;
  /** Callback when gesture completes */
  onGestureComplete?: () => void;
  /** Relationship score */
  relationshipToSelected?: number;
  /** Whether the selected character is a nominee */
  selectedIsNominee?: boolean;
  /** Whether the selected character is HoH */
  selectedIsHoH?: boolean;
  /** Whether someone is currently selected */
  hasSelection?: boolean;
  /** Animation quality level */
  animationQuality?: 'low' | 'medium' | 'high';
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Map legacy PoseType to new StaticPoseType
 */
function mapToStaticPose(poseType?: PoseType): StaticPoseType {
  switch (poseType) {
    case 'crossed-arms': return 'defensive';
    case 'hands-on-hips': return 'confident';
    case 'thinking': return 'neutral';
    case 'casual-lean': return 'relaxed';
    case 'relaxed':
    default: return 'relaxed';
  }
}

/**
 * RPMAvatar - Ready Player Me avatar with modular animation system
 */
export const RPMAvatar: React.FC<RPMAvatarProps> = ({
  modelSrc,
  mood = 'Neutral',
  scale = 1,
  position,
  context = 'game',
  applyIdlePose = true,
  poseType,
  animationQuality = 'high',
  onLoaded,
  onError,
}) => {
  const group = useRef<THREE.Group>(null);
  
  // Generate a unique instance ID for this component
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  
  // Context-aware default positions
  const getDefaultPosition = (ctx: AvatarContext): [number, number, number] => {
    switch (ctx) {
      case 'customizer': return [0, -1.5, 0];
      case 'profile': return [0, -0.55, 0];
      case 'thumbnail': return [0, -0.5, 0];
      case 'game': 
      default: return [0, -0.7, 0];
    }
  };
  
  const effectivePosition = position ?? getDefaultPosition(context);
  
  // Map context to quality preset
  const getQualityContext = (ctx: AvatarContext): 'thumbnail' | 'game' | 'profile' => {
    if (ctx === 'customizer') return 'profile';
    return ctx;
  };
  
  const qualityContext = getQualityContext(context);
  
  const optimizedUrl = useMemo(() => 
    getOptimizedUrl(modelSrc, qualityContext),
    [modelSrc, qualityContext]
  );
  
  const { scene } = useGLTF(optimizedUrl);
  
  // Determine static pose to apply
  const staticPose = useMemo(() => mapToStaticPose(poseType), [poseType]);
  
  // Clone scene and apply static pose ONCE
  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;
    
    // Mark with unique instance ID
    cloned.userData.instanceId = instanceId.current;
    
    // Apply static pose if enabled
    if (applyIdlePose) {
      applyStaticPose(cloned, staticPose);
    }
    
    return cloned;
  }, [scene, applyIdlePose, staticPose]);
  
  // Get animation features based on quality
  const animFeatures = useMemo(() => 
    getAnimationFeatures(animationQuality),
    [animationQuality]
  );
  
  // Use the unified animation hook - all animation happens here
  useAvatarAnimator({
    clone,
    instanceId: instanceId.current,
    enableBreathing: animFeatures.enableBreathing,
    enableWeightShift: animFeatures.enableWeightShift,
    enableBlinking: animFeatures.enableBlinking,
  });
  
  // Notify when clone is ready
  useEffect(() => {
    if (clone && onLoaded) onLoaded();
  }, [clone, onLoaded]);

  return (
    <group ref={group} position={effectivePosition} scale={scale}>
      <primitive object={clone} />
    </group>
  );
};

/**
 * Loading progress indicator component
 */
export const RPMLoadingProgress: React.FC<{ className?: string }> = ({ className }) => {
  const { progress, active } = useProgress();
  
  if (!active) return null;
  
  return (
    <div className={`flex flex-col items-center justify-center ${className || ''}`}>
      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {progress < 100 ? `${Math.round(progress)}%` : 'Ready'}
      </p>
    </div>
  );
};

/**
 * Error boundary for catching GLB loading failures
 */
interface AvatarErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface AvatarErrorBoundaryState {
  hasError: boolean;
}

class AvatarErrorBoundary extends Component<AvatarErrorBoundaryProps, AvatarErrorBoundaryState> {
  constructor(props: AvatarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AvatarErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.warn('Avatar loading failed:', error.message);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return <RPMAvatarFallback isError />;
    }
    return this.props.children;
  }
}

/**
 * Simple loading fallback mesh
 */
 const RPMAvatarFallback: React.FC<{ 
   isError?: boolean;
   characterName?: string;
   onRetry?: () => void;
 }> = ({ isError = false, characterName, onRetry }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
       meshRef.current.rotation.y = isError ? 0 : clock.getElapsedTime() * 0.5;
    }
  });
  
  return (
     <group>
       <mesh ref={meshRef} position={[0, 0.8, 0]}>
         <capsuleGeometry args={[0.25, 0.5, 4, 16]} />
         <meshStandardMaterial 
           color={isError ? "#ef4444" : "#6b7280"} 
           wireframe 
           transparent
           opacity={0.6}
         />
       </mesh>
       {/* Head indicator */}
       <mesh position={[0, 1.5, 0]}>
         <sphereGeometry args={[0.2, 16, 16]} />
         <meshStandardMaterial 
           color={isError ? "#ef4444" : "#9ca3af"} 
           wireframe
           transparent
           opacity={0.6}
         />
       </mesh>
       {/* Shimmer effect for loading state */}
       {!isError && (
         <mesh position={[0, 1, 0]}>
           <ringGeometry args={[0.35, 0.4, 32]} />
           <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
         </mesh>
       )}
     </group>
  );
};

/**
 * RPMAvatarWithSuspense - Wrapped version with loading fallback and error handling
 */
 export const RPMAvatarWithSuspense: React.FC<RPMAvatarProps & { characterName?: string }> = (props) => {
  return (
    <AvatarErrorBoundary onError={props.onError}>
       <Suspense fallback={<RPMAvatarFallback characterName={props.characterName} />}>
        <RPMAvatar {...props} />
      </Suspense>
    </AvatarErrorBoundary>
  );
};

// Preload helper for performance - with optimization
export const preloadRPMAvatar = (url: string, context: AvatarContext = 'game') => {
  // Map customizer to profile for preloading
  const preloadContext = context === 'customizer' ? 'profile' : context;
  const optimizedUrl = getOptimizedUrl(url, preloadContext as 'thumbnail' | 'game' | 'profile');
  try {
    useGLTF.preload(optimizedUrl);
  } catch (e) {
    console.warn('Failed to preload avatar:', url, e);
  }
};

export default RPMAvatar;
