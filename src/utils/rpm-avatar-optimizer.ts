/**
 * @file utils/rpm-avatar-optimizer.ts
 * @description URL optimization utilities for Ready Player Me avatars
 * Reduces GLB file size by 60-80% through query parameters
 */

export type AvatarQuality = 'low' | 'medium' | 'high';
export type TextureFormat = 'webp' | 'jpeg' | 'png';
export type LODLevel = 0 | 1 | 2;

export interface RPMOptimizationOptions {
  /** Texture and mesh quality - 'low' is ~1MB, 'medium' ~3MB, 'high' ~8MB */
  quality?: AvatarQuality;
  /** Morph targets to include - fewer = smaller file */
  morphTargets?: string[];
  /** Texture format - webp is 40% smaller than PNG */
  textureFormat?: TextureFormat;
  /** Level of detail - 0=full, 1=50% tris, 2=25% tris */
  lod?: LODLevel;
}

/** Default morph targets needed for expressions */
const DEFAULT_MORPH_TARGETS = [
  'ARKit',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthFrownLeft', 
  'mouthFrownRight',
  'eyeBlinkLeft',
  'eyeBlinkRight',
  'browInnerUp',
  'browDownLeft',
  'browDownRight',
  'eyeSquintLeft',
  'eyeSquintRight',
  'eyeWideLeft',
  'eyeWideRight',
  'jawOpen',
  'cheekSquintLeft',
  'cheekSquintRight',
];

/** Minimal morph targets for thumbnails */
const MINIMAL_MORPH_TARGETS = [
  'ARKit',
  'mouthSmileLeft',
  'mouthSmileRight',
  'eyeBlinkLeft',
  'eyeBlinkRight',
];

/**
 * Quality presets for different UI contexts
 */
export const QUALITY_PRESETS: Record<string, RPMOptimizationOptions> = {
  /** Smallest size for list views and thumbnails (~0.5-1MB) */
  thumbnail: {
    quality: 'low',
    textureFormat: 'webp',
    lod: 2,
    morphTargets: MINIMAL_MORPH_TARGETS,
  },
  /** Balanced for game views (~1-2MB) */
  game: {
    quality: 'low',
    textureFormat: 'webp',
    lod: 1,
    morphTargets: DEFAULT_MORPH_TARGETS,
  },
  /** Higher quality for profile dialogs (~2-3MB) */
  profile: {
    quality: 'medium',
    textureFormat: 'webp',
    lod: 1,
    morphTargets: DEFAULT_MORPH_TARGETS,
  },
  /** Full quality for customizer preview (~3-5MB) */
  customizer: {
    quality: 'medium',
    textureFormat: 'webp',
    lod: 0,
    morphTargets: DEFAULT_MORPH_TARGETS,
  },
};

/**
 * Optimize an RPM avatar URL with query parameters to reduce file size
 * 
 * @example
 * // Before: 8-12MB
 * const url = 'https://models.readyplayer.me/abc123.glb';
 * 
 * // After: 1-2MB (using 'game' preset)
 * const optimized = optimizeRPMUrl(url, QUALITY_PRESETS.game);
 */
export const optimizeRPMUrl = (
  url: string, 
  options?: RPMOptimizationOptions
): string => {
  if (!url) return url;
  
  // Don't process non-RPM URLs
  if (!url.includes('readyplayer.me') && !url.includes('models.readyplayer.me')) {
    return url;
  }
  
  // Extract base URL without existing params
  const baseUrl = url.split('?')[0];
  
  const params = new URLSearchParams();
  
  // Apply quality (affects textures and mesh detail)
  params.set('quality', options?.quality ?? 'low');
  
  // Apply texture format (webp is best for web)
  params.set('textureFormat', options?.textureFormat ?? 'webp');
  
  // Apply LOD (level of detail)
  params.set('lod', String(options?.lod ?? 1));
  
  // Apply morph targets (only include what we need)
  const morphs = options?.morphTargets ?? DEFAULT_MORPH_TARGETS;
  params.set('morphTargets', morphs.join(','));
  
  // Enable Draco compression
  params.set('useDracoCompression', 'true');
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Get optimized URL based on UI context
 */
export const getOptimizedUrl = (
  url: string,
  context: 'thumbnail' | 'game' | 'profile' | 'customizer' = 'game'
): string => {
  return optimizeRPMUrl(url, QUALITY_PRESETS[context]);
};

/**
 * Check if URL already has optimization parameters
 */
export const isOptimizedUrl = (url: string): boolean => {
  if (!url) return false;
  const params = new URLSearchParams(url.split('?')[1] || '');
  return params.has('quality') && params.has('textureFormat');
};

/**
 * Detect network quality and suggest appropriate quality preset
 */
export const getNetworkAwareQuality = (): AvatarQuality => {
  if (typeof navigator === 'undefined') return 'low';
  
  const connection = (navigator as any).connection;
  if (!connection) return 'low';
  
  const effectiveType = connection.effectiveType as string;
  
  switch (effectiveType) {
    case '4g':
      return 'medium';
    case '3g':
    case '2g':
    case 'slow-2g':
    default:
      return 'low';
  }
};

/**
 * Get network-aware optimized URL
 */
export const getNetworkOptimizedUrl = (url: string): string => {
  const quality = getNetworkAwareQuality();
  return optimizeRPMUrl(url, { 
    ...QUALITY_PRESETS.game, 
    quality 
  });
};
