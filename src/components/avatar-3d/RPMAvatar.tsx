/**
 * @file avatar-3d/RPMAvatar.tsx
 * @description Ready Player Me avatar component wrapper for React Three Fiber
 */

import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { MoodType } from '@/models/houseguest';

// ARKit blendshape names for expressions (52 blendshapes available)
const EXPRESSION_MORPHS: Record<string, Record<string, number>> = {
  happy: {
    'mouthSmileLeft': 0.8,
    'mouthSmileRight': 0.8,
    'eyeSquintLeft': 0.4,
    'eyeSquintRight': 0.4,
    'cheekSquintLeft': 0.3,
    'cheekSquintRight': 0.3,
  },
  content: {
    'mouthSmileLeft': 0.4,
    'mouthSmileRight': 0.4,
    'eyeSquintLeft': 0.15,
    'eyeSquintRight': 0.15,
  },
  sad: {
    'mouthFrownLeft': 0.6,
    'mouthFrownRight': 0.6,
    'browDownLeft': 0.5,
    'browDownRight': 0.5,
    'browInnerUp': 0.4,
    'mouthPucker': 0.2,
  },
  angry: {
    'browDownLeft': 0.8,
    'browDownRight': 0.8,
    'mouthFrownLeft': 0.5,
    'mouthFrownRight': 0.5,
    'jawForward': 0.3,
    'noseSneerLeft': 0.3,
    'noseSneerRight': 0.3,
  },
  surprised: {
    'eyeWideLeft': 0.9,
    'eyeWideRight': 0.9,
    'browOuterUpLeft': 0.7,
    'browOuterUpRight': 0.7,
    'browInnerUp': 0.6,
    'jawOpen': 0.4,
  },
  worried: {
    'browInnerUp': 0.6,
    'browDownLeft': 0.2,
    'browDownRight': 0.2,
    'mouthFrownLeft': 0.3,
    'mouthFrownRight': 0.3,
    'eyeSquintLeft': 0.1,
    'eyeSquintRight': 0.1,
  },
  neutral: {},
};

// Map game mood to RPM expression
const moodToExpression = (mood: MoodType): string => {
  switch (mood) {
    case 'Happy': return 'happy';
    case 'Content': return 'content';
    case 'Upset': return 'sad';
    case 'Angry': return 'angry';
    case 'Neutral':
    default: return 'neutral';
  }
};

interface RPMAvatarProps {
  modelSrc: string;
  animationSrc?: string;
  mood?: MoodType;
  scale?: number;
  position?: [number, number, number];
  onLoaded?: () => void;
}

/**
 * RPMAvatar - Renders a Ready Player Me GLB avatar with expressions
 */
export const RPMAvatar: React.FC<RPMAvatarProps> = ({
  modelSrc,
  animationSrc,
  mood = 'Neutral',
  scale = 1,
  position = [0, -1.5, 0],
  onLoaded
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelSrc);
  
  // Clone the scene to prevent issues with multiple instances
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  
  // Get all skinned meshes for morph target manipulation
  const skinnedMeshes = useMemo(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    clone.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetInfluences) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [clone]);

  // Apply expression based on mood
  useEffect(() => {
    const expression = moodToExpression(mood);
    const morphValues = EXPRESSION_MORPHS[expression];
    
    skinnedMeshes.forEach((mesh) => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      
      // Reset all morph targets
      mesh.morphTargetInfluences.fill(0);
      
      // Apply expression morphs
      Object.entries(morphValues).forEach(([morphName, value]) => {
        const index = mesh.morphTargetDictionary![morphName];
        if (index !== undefined) {
          mesh.morphTargetInfluences![index] = value;
        }
      });
    });
  }, [mood, skinnedMeshes]);

  // Idle blink animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Blink every ~4 seconds
    const blinkCycle = time % 4;
    let blinkValue = 0;
    
    if (blinkCycle > 3.8 && blinkCycle < 4.0) {
      // Quick blink
      const blinkProgress = (blinkCycle - 3.8) / 0.2;
      blinkValue = blinkProgress < 0.5 
        ? blinkProgress * 2 
        : (1 - blinkProgress) * 2;
    }
    
    // Apply blink to all meshes
    skinnedMeshes.forEach((mesh) => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      
      const leftBlinkIndex = mesh.morphTargetDictionary['eyeBlinkLeft'];
      const rightBlinkIndex = mesh.morphTargetDictionary['eyeBlinkRight'];
      
      if (leftBlinkIndex !== undefined) {
        mesh.morphTargetInfluences[leftBlinkIndex] = blinkValue;
      }
      if (rightBlinkIndex !== undefined) {
        mesh.morphTargetInfluences[rightBlinkIndex] = blinkValue;
      }
    });
    
    // Subtle head movement
    if (group.current) {
      group.current.rotation.y = Math.sin(time * 0.5) * 0.05;
      group.current.rotation.x = Math.sin(time * 0.3) * 0.02;
    }
  });

  // Call onLoaded when model is ready
  useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={clone} />
    </group>
  );
};

/**
 * RPMAvatarWithSuspense - Wrapped version with loading fallback
 */
export const RPMAvatarWithSuspense: React.FC<RPMAvatarProps> = (props) => {
  return (
    <Suspense fallback={<RPMAvatarFallback />}>
      <RPMAvatar {...props} />
    </Suspense>
  );
};

/**
 * Simple loading fallback mesh
 */
const RPMAvatarFallback: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime();
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <capsuleGeometry args={[0.3, 0.6, 4, 16]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
};

// Preload helper for performance
export const preloadRPMAvatar = (url: string) => {
  useGLTF.preload(url);
};

export default RPMAvatar;
