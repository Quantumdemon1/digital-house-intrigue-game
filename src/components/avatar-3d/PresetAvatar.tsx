/**
 * @file avatar-3d/PresetAvatar.tsx
 * @description Self-hosted GLB preset avatar renderer
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import { MoodType } from '@/models/houseguest';
import { PRESET_GLB_AVATARS, GLBPresetAvatar } from '@/data/preset-glb-avatars';

interface PresetAvatarProps {
  presetId: string;
  mood?: MoodType;
  scale?: number;
  position?: [number, number, number];
  onLoaded?: () => void;
  onError?: (error: Error) => void;
  enableIdleAnimation?: boolean;
}

// Mood to material tint mapping (for models without morph targets)
const MOOD_TINTS: Record<MoodType, { intensity: number; color: THREE.Color }> = {
  'Happy': { intensity: 0.1, color: new THREE.Color(0.2, 0.5, 0.2) },
  'Content': { intensity: 0.05, color: new THREE.Color(0.3, 0.4, 0.3) },
  'Neutral': { intensity: 0, color: new THREE.Color(1, 1, 1) },
  'Upset': { intensity: 0.1, color: new THREE.Color(0.3, 0.3, 0.5) },
  'Angry': { intensity: 0.2, color: new THREE.Color(0.5, 0.2, 0.2) }
};

/**
 * Get preset info by ID
 */
export const getPresetById = (presetId: string): GLBPresetAvatar | undefined => {
  return PRESET_GLB_AVATARS.find(p => p.id === presetId);
};

/**
 * Get preset URL by ID
 */
export const getPresetUrl = (presetId: string): string | undefined => {
  return getPresetById(presetId)?.url;
};

/**
 * Preset Avatar Component
 * Renders self-hosted GLB models with cloning for instances
 */
export const PresetAvatar: React.FC<PresetAvatarProps> = ({
  presetId,
  mood = 'Neutral',
  scale = 1,
  position = [0, -0.8, 0],
  onLoaded,
  onError,
  enableIdleAnimation = true
}) => {
  const preset = useMemo(() => getPresetById(presetId), [presetId]);
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const timeRef = useRef(0);
  
  // Load the GLTF model
  const gltf = useGLTF(preset?.url || '', true, true);
  
  // Clone scene for instancing
  const clonedScene = useMemo(() => {
    if (!gltf?.scene) return null;
    
    try {
      const clone = SkeletonUtils.clone(gltf.scene);
      return clone;
    } catch (error) {
      console.warn('Failed to clone GLTF scene:', error);
      return gltf.scene.clone();
    }
  }, [gltf?.scene]);

  // Setup animations if available
  useEffect(() => {
    if (!clonedScene || !gltf.animations?.length) return;
    
    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;
    
    // Play first animation (usually idle)
    const idleClip = gltf.animations.find(clip => 
      clip.name.toLowerCase().includes('idle')
    ) || gltf.animations[0];
    
    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.play();
    }
    
    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [clonedScene, gltf.animations]);

  // Notify when loaded
  useEffect(() => {
    if (clonedScene) {
      onLoaded?.();
    }
  }, [clonedScene, onLoaded]);

  // Handle missing preset
  useEffect(() => {
    if (!preset) {
      onError?.(new Error(`Preset not found: ${presetId}`));
    }
  }, [preset, presetId, onError]);

  // Apply mood tinting
  useEffect(() => {
    if (!clonedScene) return;
    
    const tint = MOOD_TINTS[mood];
    if (!tint || tint.intensity === 0) return;
    
    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        // Clone material to avoid affecting other instances
        const mat = node.material.clone();
        mat.emissive = tint.color;
        mat.emissiveIntensity = tint.intensity;
        node.material = mat;
      }
    });
  }, [clonedScene, mood]);

  // Animation loop
  useFrame((state, delta) => {
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Simple idle breathing if no animation
    if (enableIdleAnimation && groupRef.current && !gltf.animations?.length) {
      timeRef.current += delta;
      const breathe = Math.sin(timeRef.current * 1.5) * 0.01;
      groupRef.current.position.y = position[1] + breathe;
      
      // Subtle sway
      groupRef.current.rotation.y = Math.sin(timeRef.current * 0.3) * 0.02;
    }
  });

  if (!clonedScene || !preset) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

/**
 * Preload preset avatars
 */
export const preloadPresetAvatars = (presetIds?: string[]): void => {
  const avatarsToPreload = presetIds 
    ? PRESET_GLB_AVATARS.filter(p => presetIds.includes(p.id))
    : PRESET_GLB_AVATARS;
    
  avatarsToPreload.forEach(preset => {
    useGLTF.preload(preset.url);
  });
};

/**
 * Preload all preset avatars on module load (for NPC usage)
 */
export const preloadAllPresets = (): void => {
  PRESET_GLB_AVATARS.forEach(preset => {
    useGLTF.preload(preset.url);
  });
};

export default PresetAvatar;
