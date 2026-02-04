/**
 * @file avatar-3d/materials/ToonMaterials.tsx
 * @description Toon material factory for modern cel-shaded avatars
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { getSkinGradient, getClothGradient, getHairGradient } from './GradientTextures';

/**
 * Create a toon-shaded skin material
 */
export function createSkinMaterial(color: string): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getSkinGradient(),
  });
}

/**
 * Create a toon-shaded cloth/clothing material
 */
export function createClothMaterial(color: string): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getClothGradient(),
  });
}

/**
 * Create a toon-shaded hair material
 */
export function createHairMaterial(color: string): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getHairGradient(),
  });
}

/**
 * Hook for creating memoized skin material
 */
export function useSkinMaterial(color: string): THREE.MeshToonMaterial {
  return useMemo(() => createSkinMaterial(color), [color]);
}

/**
 * Hook for creating memoized cloth material
 */
export function useClothMaterial(color: string): THREE.MeshToonMaterial {
  return useMemo(() => createClothMaterial(color), [color]);
}

/**
 * Hook for creating memoized hair material
 */
export function useHairMaterial(color: string): THREE.MeshToonMaterial {
  return useMemo(() => createHairMaterial(color), [color]);
}

// Chibi-style proportions for modern cute avatar look
export const CHIBI_PROPORTIONS = {
  headScale: 1.4,       // 40% larger head
  bodyHeight: 0.65,     // Shorter torso
  armLength: 0.7,       // Stubby arms
  legLength: 0.6,       // Short legs
  limbRoundness: 0.9,   // Very rounded limbs
  handScale: 1.3,       // Larger, cuter hands
  eyeScale: 1.5,        // Bigger expressive eyes
};

// Outline color for toon effect
export const OUTLINE_COLOR = '#2a1f1a';
export const OUTLINE_THICKNESS = 0.02;
