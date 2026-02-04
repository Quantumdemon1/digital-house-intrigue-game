/**
 * @file avatar-3d/VRMAvatar.tsx
 * @description VRM format avatar renderer using @pixiv/three-vrm
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { VRM, VRMLoaderPlugin, VRMExpressionPresetName, VRMHumanBoneName } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { MoodType } from '@/models/houseguest';

interface VRMAvatarProps {
  modelSrc: string;
  mood?: MoodType;
  scale?: number;
  position?: [number, number, number];
  onLoaded?: () => void;
  onError?: (error: Error) => void;
  enableBlink?: boolean;
  enableBreathing?: boolean;
}

// Map mood types to VRM expression presets
const MOOD_TO_EXPRESSION: Record<MoodType, VRMExpressionPresetName | null> = {
  'Happy': VRMExpressionPresetName.Happy,
  'Content': VRMExpressionPresetName.Relaxed,
  'Neutral': null,
  'Upset': VRMExpressionPresetName.Sad,
  'Angry': VRMExpressionPresetName.Angry
};

/**
 * VRM Avatar Component
 * Renders VRM format avatars with expression support
 */
export const VRMAvatar: React.FC<VRMAvatarProps> = ({
  modelSrc,
  mood = 'Neutral',
  scale = 1,
  position = [0, -0.8, 0],
  onLoaded,
  onError,
  enableBlink = true,
  enableBreathing = true
}) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loading, setLoading] = useState(true);
  const blinkTimerRef = useRef(0);
  const breathTimerRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Load VRM model
  useEffect(() => {
    let disposed = false;
    setLoading(true);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      modelSrc,
      (gltf) => {
        if (disposed) return;
        
        const loadedVrm = gltf.userData.vrm as VRM;
        if (!loadedVrm) {
          const error = new Error('No VRM data found in GLTF');
          console.error(error);
          onError?.(error);
          return;
        }

        // Rotate to face camera (VRM models typically face -Z)
        loadedVrm.scene.rotation.y = Math.PI;
        
        setVrm(loadedVrm);
        setLoading(false);
        onLoaded?.();
      },
      (progress) => {
        // Progress callback - could be used for loading indicator
      },
      (error) => {
        if (disposed) return;
        console.error('Failed to load VRM:', error);
        setLoading(false);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    );

    return () => {
      disposed = true;
      if (vrm) {
        vrm.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material?.dispose();
            }
          }
        });
      }
    };
  }, [modelSrc]);

  // Apply mood expression
  useEffect(() => {
    if (!vrm?.expressionManager) return;

    // Reset all expressions first
    const allExpressions = Object.values(VRMExpressionPresetName);
    allExpressions.forEach(name => {
      try {
        vrm.expressionManager?.setValue(name, 0);
      } catch {
        // Expression may not exist in this model
      }
    });

    // Apply mood expression
    const targetExpression = MOOD_TO_EXPRESSION[mood];
    if (targetExpression) {
      try {
        vrm.expressionManager.setValue(targetExpression, 0.7);
      } catch {
        console.warn(`Expression ${targetExpression} not available in VRM model`);
      }
    }
  }, [vrm, mood]);

  // Animation frame updates
  useFrame((state, delta) => {
    if (!vrm) return;

    // Update VRM (required for expressions and look-at)
    vrm.update(delta);

    // Blink animation
    if (enableBlink && vrm.expressionManager) {
      blinkTimerRef.current += delta;
      
      // Blink every 3-6 seconds
      const blinkInterval = 4 + Math.sin(state.clock.elapsedTime * 0.5) * 1.5;
      
      if (blinkTimerRef.current >= blinkInterval) {
        // Quick blink
        try {
          const blinkProgress = (blinkTimerRef.current - blinkInterval) * 10;
          if (blinkProgress < 1) {
            const blinkValue = Math.sin(blinkProgress * Math.PI);
            vrm.expressionManager.setValue(VRMExpressionPresetName.Blink, blinkValue);
          } else {
            vrm.expressionManager.setValue(VRMExpressionPresetName.Blink, 0);
            blinkTimerRef.current = 0;
          }
        } catch {
          // Blink expression not available
        }
      }
    }

    // Breathing animation - subtle chest/head movement
    if (enableBreathing && vrm.humanoid) {
      breathTimerRef.current += delta;
      const breathCycle = Math.sin(breathTimerRef.current * 1.5) * 0.003;
      
      const chest = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest);
      if (chest) {
        chest.rotation.x = breathCycle;
      }
      
      const head = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
      if (head) {
        // Subtle head sway
        head.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
        head.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.01;
      }
    }
  });

  if (loading || !vrm) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={vrm.scene} />
    </group>
  );
};

/**
 * Preload a VRM model
 */
export const preloadVRM = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.load(
      url,
      () => resolve(),
      undefined,
      (error) => reject(error)
    );
  });
};

export default VRMAvatar;
