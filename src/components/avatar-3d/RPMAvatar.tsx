/**
 * @file avatar-3d/RPMAvatar.tsx
 * @description Ready Player Me avatar component using unified animation system
 */

import React, { Suspense, useRef, useEffect, useMemo, useLayoutEffect, Component, ReactNode, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useProgress } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { MoodType } from '@/models/houseguest';
import { getOptimizedUrl } from '@/utils/rpm-avatar-optimizer';
import {
  useAnimationController,
  PoseType,
  GestureType,
  QualityLevel,
  RelationshipContext,
} from './animation';
import { POSE_CONFIGS } from './animation/layers/BasePoseLayer';

export type AvatarContext = 'thumbnail' | 'game' | 'profile' | 'customizer';

// Re-export types for backwards compatibility
export type { PoseType, GestureType };

/** Helper function to apply pose to cloned avatar bones */
const applyPoseToBones = (object: THREE.Object3D, poseType: PoseType) => {
  const poseConfig = POSE_CONFIGS[poseType];
  if (!poseConfig) return;
  
  object.traverse((child) => {
    if (child instanceof THREE.Bone) {
      // Handle both standard and mixamo bone naming
      const boneName = child.name.replace('mixamorig', '');
      const boneState = poseConfig[boneName] || poseConfig[child.name];
      if (boneState) {
        child.rotation.set(
          boneState.rotation.x,
          boneState.rotation.y,
          boneState.rotation.z
        );
      }
    }
  });
};

interface RPMAvatarProps {
  modelSrc: string;
  animationSrc?: string;
  mood?: MoodType;
  scale?: number;
  position?: [number, number, number];
  /** UI context for quality optimization */
  context?: AvatarContext;
  /** Apply natural idle standing pose (arms down, subtle sway) */
  applyIdlePose?: boolean;
  /** Phase offset for staggered idle animations */
  phaseOffset?: number;
   /** Pose type for varied character stances */
   poseType?: PoseType;
   /** Target position for head look-at (world space) */
   lookAtTarget?: THREE.Vector3 | null;
   /** Character's world position for look-at calculations */
   worldPosition?: [number, number, number];
   /** Character's Y rotation for look-at calculations */
   worldRotationY?: number;
   /** Whether this is the player's avatar */
   isPlayer?: boolean;
   /** Enable gesture animations (player only) */
   enableGestures?: boolean;
   /** Gesture to play */
   gestureToPlay?: GestureType | null;
   /** Callback when gesture completes */
   onGestureComplete?: () => void;
   /** Relationship score with selected character (-100 to 100) */
   relationshipToSelected?: number;
   /** Whether the selected character is a nominee */
   selectedIsNominee?: boolean;
   /** Whether the selected character is HoH */
   selectedIsHoH?: boolean;
   /** Whether someone is currently selected */
   hasSelection?: boolean;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

/**
 * RPMAvatar - Renders a Ready Player Me GLB avatar with expressions
 */
export const RPMAvatar: React.FC<RPMAvatarProps> = ({
  modelSrc,
  animationSrc,
  mood = 'Neutral',
  scale = 1,
  position,
  context = 'game',
  applyIdlePose = false,
  phaseOffset = 0,
   poseType = 'relaxed',
   lookAtTarget = null,
   worldPosition = [0, 0, 0],
   worldRotationY = 0,
   isPlayer = false,
   enableGestures = false,
   gestureToPlay = null,
   onGestureComplete,
   relationshipToSelected = 0,
   selectedIsNominee = false,
   selectedIsHoH = false,
   hasSelection = false,
  onLoaded,
  onError
}) => {
  const group = useRef<THREE.Group>(null);
  const cloneRef = useRef<THREE.Group>(null);
  const [cloneReady, setCloneReady] = React.useState(false);
  
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
   
   // Map context to animation quality level
   const getAnimationQuality = (ctx: 'thumbnail' | 'game' | 'profile'): QualityLevel => {
     switch (ctx) {
       case 'thumbnail': return 'low';
       case 'profile': return 'medium';
       case 'game': 
       default: return 'high';
     }
   };
   
   const animationQuality = getAnimationQuality(qualityContext);
   const isAnimated = qualityContext !== 'thumbnail';
  
  const optimizedUrl = useMemo(() => 
    getOptimizedUrl(modelSrc, qualityContext),
    [modelSrc, qualityContext]
  );
  
  const { scene } = useGLTF(optimizedUrl);
  
  // Clone the scene with pose applied
  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;
    if (applyIdlePose) {
      applyPoseToBones(cloned, poseType);
    }
    return cloned;
  }, [scene, applyIdlePose, poseType]);
  
  // Track clone ready state
  useLayoutEffect(() => {
    if (clone) {
      cloneRef.current = clone;
      setCloneReady(true);
      if (onLoaded) onLoaded();
    }
  }, [clone, onLoaded]);
  
  // Get all skinned meshes for morph target manipulation (after clone is ready)
  const skinnedMeshes = useMemo(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    clone.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetInfluences) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [clone]);
   
   // Build relationship context for animation controller
   const relationshipContext: RelationshipContext = useMemo(() => ({
     score: relationshipToSelected,
     isNominee: selectedIsNominee,
     isHoH: selectedIsHoH,
     isSelf: false, // Set by parent based on selection
     hasSelection,
   }), [relationshipToSelected, selectedIsNominee, selectedIsHoH, hasSelection]);
   
   // Unified animation controller - replaces all individual hooks
   useAnimationController({
     scene: applyIdlePose && cloneRef.current ? cloneRef.current : null,
     skinnedMeshes,
     basePose: poseType,
     phaseOffset,
     lookAtTarget: applyIdlePose ? lookAtTarget : null,
     characterPosition: worldPosition,
     characterRotationY: worldRotationY,
     relationshipContext,
     gestureToPlay: enableGestures && isPlayer ? gestureToPlay : null,
     onGestureComplete,
     quality: animationQuality,
     enabled: isAnimated && applyIdlePose && cloneReady,
   });

   // Note: Mood-based expressions are now handled by the ReactiveLayer
   // based on relationship context. The mood prop is preserved for 
   // backwards compatibility but integrated into the unified system.

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
