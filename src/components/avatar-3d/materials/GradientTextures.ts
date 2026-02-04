/**
 * @file avatar-3d/materials/GradientTextures.ts
 * @description Gradient texture generation for toon shading
 */

import * as THREE from 'three';

/**
 * Create a gradient texture for MeshToonMaterial
 * The values represent brightness steps (0-1) that create cel-shading bands
 */
export function createGradientTexture(steps: number[]): THREE.DataTexture {
  const size = steps.length;
  const data = new Uint8Array(size);
  
  for (let i = 0; i < size; i++) {
    data[i] = Math.floor(steps[i] * 255);
  }
  
  const texture = new THREE.DataTexture(data, size, 1, THREE.RedFormat);
  texture.needsUpdate = true;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  
  return texture;
}

// Pre-defined gradient presets for different materials

/** Soft 3-step gradient for skin - subtle toon shading */
export const SKIN_GRADIENT_STEPS = [0.4, 0.7, 1.0];

/** 4-step gradient for clothing - more defined bands */
export const CLOTH_GRADIENT_STEPS = [0.3, 0.55, 0.8, 1.0];

/** 3-step for hair - medium contrast */
export const HAIR_GRADIENT_STEPS = [0.35, 0.65, 1.0];

/** 5-step for detailed shading */
export const DETAILED_GRADIENT_STEPS = [0.25, 0.45, 0.65, 0.85, 1.0];

// Cached textures for performance
let cachedSkinGradient: THREE.DataTexture | null = null;
let cachedClothGradient: THREE.DataTexture | null = null;
let cachedHairGradient: THREE.DataTexture | null = null;

export function getSkinGradient(): THREE.DataTexture {
  if (!cachedSkinGradient) {
    cachedSkinGradient = createGradientTexture(SKIN_GRADIENT_STEPS);
  }
  return cachedSkinGradient;
}

export function getClothGradient(): THREE.DataTexture {
  if (!cachedClothGradient) {
    cachedClothGradient = createGradientTexture(CLOTH_GRADIENT_STEPS);
  }
  return cachedClothGradient;
}

export function getHairGradient(): THREE.DataTexture {
  if (!cachedHairGradient) {
    cachedHairGradient = createGradientTexture(HAIR_GRADIENT_STEPS);
  }
  return cachedHairGradient;
}
