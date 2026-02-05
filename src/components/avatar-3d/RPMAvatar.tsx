/**
 * @file avatar-3d/RPMAvatar.tsx
 * @description Ready Player Me avatar component - STRIPPED FOR TROUBLESHOOTING
 */

import React, { Suspense, useRef, useMemo, useEffect, Component, ReactNode } from 'react';
import { useGLTF, useProgress } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { MoodType } from '@/models/houseguest';
import { getOptimizedUrl } from '@/utils/rpm-avatar-optimizer';
import { PoseType, GestureType } from './animation';

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
  /** Apply natural idle standing pose - DISABLED FOR TROUBLESHOOTING */
  applyIdlePose?: boolean;
  /** Phase offset - DISABLED FOR TROUBLESHOOTING */
  phaseOffset?: number;
  /** Pose type - DISABLED FOR TROUBLESHOOTING */
  poseType?: PoseType;
  /** Target position for head look-at - DISABLED FOR TROUBLESHOOTING */
  lookAtTarget?: THREE.Vector3 | null;
  /** Character's world position - DISABLED FOR TROUBLESHOOTING */
  worldPosition?: [number, number, number];
  /** Character's Y rotation - DISABLED FOR TROUBLESHOOTING */
  worldRotationY?: number;
  /** Whether this is the player's avatar - DISABLED FOR TROUBLESHOOTING */
  isPlayer?: boolean;
  /** Enable gesture animations - DISABLED FOR TROUBLESHOOTING */
  enableGestures?: boolean;
  /** Gesture to play - DISABLED FOR TROUBLESHOOTING */
  gestureToPlay?: GestureType | null;
  /** Callback when gesture completes - DISABLED FOR TROUBLESHOOTING */
  onGestureComplete?: () => void;
  /** Relationship score - DISABLED FOR TROUBLESHOOTING */
  relationshipToSelected?: number;
  /** Whether the selected character is a nominee - DISABLED FOR TROUBLESHOOTING */
  selectedIsNominee?: boolean;
  /** Whether the selected character is HoH - DISABLED FOR TROUBLESHOOTING */
  selectedIsHoH?: boolean;
  /** Whether someone is currently selected - DISABLED FOR TROUBLESHOOTING */
  hasSelection?: boolean;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

/**
 * RPMAvatar - STRIPPED FOR TROUBLESHOOTING
 * Renders avatar in T-pose with NO animations, NO bone manipulation
 */
export const RPMAvatar: React.FC<RPMAvatarProps> = ({
  modelSrc,
  // All animation-related props are ignored for troubleshooting
  mood = 'Neutral',
  scale = 1,
  position,
  context = 'game',
  onLoaded,
  onError,
}) => {
  const group = useRef<THREE.Group>(null);
  
  // Generate a unique instance ID for this component
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  
  // Context-aware default positions (head-centered for portraits, full-body for customizer)
  const getDefaultPosition = (ctx: AvatarContext): [number, number, number] => {
    switch (ctx) {
      case 'customizer': return [0, -1.5, 0];   // Full body view
      case 'profile': return [0, -0.55, 0];     // Head portrait
      case 'thumbnail': return [0, -0.5, 0];    // Tight head shot
      case 'game': 
      default: return [0, -0.7, 0];             // Upper body
    }
  };
  
  const effectivePosition = position ?? getDefaultPosition(context);
  
  // Map context to quality preset - 'customizer' -> 'profile', keep others
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
  
  // SIMPLIFIED: Clone scene with NO pose application - T-pose only
  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;
    
    // Mark with unique instance ID
    cloned.userData.instanceId = instanceId.current;
    
    // NO pose application - render in default T-pose for troubleshooting
    return cloned;
  }, [scene]);
  
  // Notify when clone is ready
  useEffect(() => {
    if (clone && onLoaded) onLoaded();
  }, [clone, onLoaded]);
  
  // ALL ANIMATION LOGIC REMOVED FOR TROUBLESHOOTING
  // - No useAnimationController
  // - No bone manipulation
  // - No morph targets
  // - No skinned mesh traversal

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
