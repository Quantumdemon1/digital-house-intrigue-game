/**
 * @file avatar-3d/PresetAvatar.tsx
 * @description Self-hosted GLB preset avatar renderer with auto-scaling normalization
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
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

// Target height for normalized avatars (in world units)
const TARGET_HEIGHT = 1.8;

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
 * Renders self-hosted GLB models with auto-scaling normalization
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
  
  // If preset is a placeholder (no real assets), trigger error immediately
  useEffect(() => {
    if (preset?.isPlaceholder) {
      onError?.(new Error(`Preset "${preset.name}" is a placeholder without assets`));
    }
  }, [preset, onError]);
  
  // Don't attempt to load placeholder URLs
  if (!preset || preset.isPlaceholder) {
    return null;
  }
  
  return <PresetAvatarInner 
    presetId={presetId}
    preset={preset} 
    mood={mood} 
    scale={scale} 
    position={position} 
    onLoaded={onLoaded} 
    onError={onError} 
    enableIdleAnimation={enableIdleAnimation} 
  />;
};

/**
 * Inner component that actually loads the GLB (only rendered when preset is valid)
 */
const PresetAvatarInner: React.FC<PresetAvatarProps & { preset: GLBPresetAvatar }> = ({
  preset,
  mood = 'Neutral',
  scale = 1,
  position = [0, -0.8, 0],
  onLoaded,
  onError,
  enableIdleAnimation = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const timeRef = useRef(0);
  const [normalizedScale, setNormalizedScale] = useState(1);
  const [verticalOffset, setVerticalOffset] = useState(0);
  
  // Load the GLTF model - only called for valid presets
  const gltf = useGLTF(preset.url, true, true);
  
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

  // Auto-scale normalization based on bounding box
  useEffect(() => {
    if (!clonedScene) return;
    
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Get the maximum dimension (usually height for humanoids)
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Calculate scale to normalize to target height
    const autoScale = TARGET_HEIGHT / maxDim;
    setNormalizedScale(autoScale);
    
    // Calculate vertical offset to center the model
    // Position so the model's bottom is at y=0
    const bottomY = box.min.y * autoScale;
    setVerticalOffset(-bottomY - 0.9); // Adjust for portrait framing
    
  }, [clonedScene]);

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
      groupRef.current.position.y = verticalOffset + breathe;
      
      // Subtle sway
      groupRef.current.rotation.y = Math.sin(timeRef.current * 0.3) * 0.02;
    }
  });

  if (!clonedScene || !preset) {
    return null;
  }

  // Final scale combines auto-normalization with user-provided scale
  const finalScale = normalizedScale * scale;

  return (
    <group 
      ref={groupRef} 
      position={[position[0], verticalOffset, position[2]]} 
      scale={finalScale}
    >
      <primitive object={clonedScene} />
    </group>
  );
};

/**
 * Preload preset avatars
 */
export const preloadPresetAvatars = (presetIds?: string[]): void => {
  const avatarsToPreload = presetIds 
    ? PRESET_GLB_AVATARS.filter(p => presetIds.includes(p.id) && !p.isPlaceholder)
    : PRESET_GLB_AVATARS.filter(p => !p.isPlaceholder);
    
  avatarsToPreload.forEach(preset => {
    useGLTF.preload(preset.url);
  });
};

/**
 * Preload all preset avatars on module load (for NPC usage)
 */
export const preloadAllPresets = (): void => {
  PRESET_GLB_AVATARS.filter(p => !p.isPlaceholder).forEach(preset => {
    useGLTF.preload(preset.url);
  });
};

export default PresetAvatar;
