/**
 * @file hooks/useAvatarPreloader.ts
 * @description Hook for preloading RPM GLB avatars for smooth rendering
 */

import { useEffect, useCallback, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Houseguest } from '@/models/houseguest';
import { optimizeRPMUrl, getOptimizedUrl, QUALITY_PRESETS } from '@/utils/rpm-avatar-optimizer';
import { PRESET_GLB_AVATARS } from '@/data/preset-glb-avatars';
import { PRESET_VRM_AVATARS } from '@/data/preset-vrm-avatars';

/**
 * Preload a single RPM avatar URL with optimization
 */
export const preloadRPMModel = (url: string, context: 'thumbnail' | 'game' | 'profile' = 'game'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Optimize URL before preloading
      const optimizedUrl = getOptimizedUrl(url, context);
      
      // useGLTF.preload triggers the cache
      useGLTF.preload(optimizedUrl);
      
      // Also fetch to warm the network cache
      fetch(optimizedUrl, { method: 'HEAD' })
        .then(() => resolve())
        .catch(() => resolve()); // Don't fail on HEAD request issues
    } catch (error) {
      console.warn('Failed to preload RPM model:', url, error);
      resolve(); // Don't block on preload failures
    }
  });
};

/**
 * Preload multiple RPM avatar URLs in parallel with optimization
 */
export const preloadRPMModels = async (
  urls: string[], 
  context: 'thumbnail' | 'game' | 'profile' = 'game'
): Promise<void> => {
  const validUrls = urls.filter(Boolean);
  if (validUrls.length === 0) return;
  
  console.log(`Preloading ${validUrls.length} RPM avatar(s) with quality: ${context}...`);
  
  await Promise.allSettled(validUrls.map(url => preloadRPMModel(url, context)));
  
  console.log('RPM avatar preloading complete');
};

/**
 * Extract RPM avatar URLs from houseguests
 */
export const extractRPMUrls = (houseguests: Houseguest[]): string[] => {
  return houseguests
    .filter(hg => 
      hg.avatarConfig?.modelSource === 'ready-player-me' && 
      hg.avatarConfig?.modelUrl
    )
    .map(hg => hg.avatarConfig!.modelUrl!)
    .filter((url, index, arr) => arr.indexOf(url) === index); // Dedupe
};

/**
 * Extract VRM avatar URLs from houseguests
 */
export const extractVRMUrls = (houseguests: Houseguest[]): string[] => {
  return houseguests
    .filter(hg => 
      hg.avatarConfig?.modelSource === 'vrm' && 
      hg.avatarConfig?.modelUrl
    )
    .map(hg => hg.avatarConfig!.modelUrl!)
    .filter((url, index, arr) => arr.indexOf(url) === index);
};

/**
 * Extract preset IDs from houseguests
 */
export const extractPresetIds = (houseguests: Houseguest[]): string[] => {
  return houseguests
    .filter(hg => 
      hg.avatarConfig?.modelSource === 'preset-glb' && 
      hg.avatarConfig?.presetId
    )
    .map(hg => hg.avatarConfig!.presetId!)
    .filter((id, index, arr) => arr.indexOf(id) === index);
};

/**
 * Preload VRM models
 */
export const preloadVRMModels = async (urls: string[]): Promise<void> => {
  const validUrls = urls.filter(Boolean);
  if (validUrls.length === 0) return;
  
  console.log(`Preloading ${validUrls.length} VRM avatar(s)...`);
  
  // VRM uses standard GLTF loading
  await Promise.allSettled(validUrls.map(url => {
    useGLTF.preload(url);
    return fetch(url, { method: 'HEAD' }).catch(() => {});
  }));
  
  console.log('VRM avatar preloading complete');
};

/**
 * Preload preset GLB models
 */
export const preloadPresetModels = async (presetIds?: string[]): Promise<void> => {
  const presets = presetIds 
    ? PRESET_GLB_AVATARS.filter(p => presetIds.includes(p.id))
    : PRESET_GLB_AVATARS;
    
  if (presets.length === 0) return;
  
  console.log(`Preloading ${presets.length} preset GLB avatar(s)...`);
  
  presets.forEach(preset => useGLTF.preload(preset.url));
  
  console.log('Preset GLB avatar preloading complete');
};

/**
 * Batch preload all quality variants of an avatar for smooth quality transitions
 */
export const preloadAllQualities = async (url: string): Promise<void> => {
  if (!url) return;
  
  const qualities: Array<'thumbnail' | 'game' | 'profile'> = ['thumbnail', 'game', 'profile'];
  
  // Preload in order of priority (game first, then others)
  await preloadRPMModel(url, 'game');
  
  // Load others in parallel
  await Promise.allSettled([
    preloadRPMModel(url, 'thumbnail'),
    preloadRPMModel(url, 'profile'),
  ]);
};

/**
 * Hook to preload all avatars for a list of houseguests (all sources)
 */
export const useAvatarPreloader = (houseguests: Houseguest[]) => {
  const preloadedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // RPM avatars
    const rpmUrls = extractRPMUrls(houseguests);
    const newRpmUrls = rpmUrls.filter(url => !preloadedRef.current.has(url));
    if (newRpmUrls.length > 0) {
      newRpmUrls.forEach(url => preloadedRef.current.add(url));
      preloadRPMModels(newRpmUrls, 'game');
    }
    
    // VRM avatars
    const vrmUrls = extractVRMUrls(houseguests);
    const newVrmUrls = vrmUrls.filter(url => !preloadedRef.current.has(`vrm:${url}`));
    if (newVrmUrls.length > 0) {
      newVrmUrls.forEach(url => preloadedRef.current.add(`vrm:${url}`));
      preloadVRMModels(newVrmUrls);
    }
    
    // Preset GLB avatars
    const presetIds = extractPresetIds(houseguests);
    const newPresetIds = presetIds.filter(id => !preloadedRef.current.has(`preset:${id}`));
    if (newPresetIds.length > 0) {
      newPresetIds.forEach(id => preloadedRef.current.add(`preset:${id}`));
      preloadPresetModels(newPresetIds);
    }
  }, [houseguests]);
  
  const preloadSingle = useCallback((url: string, context: 'thumbnail' | 'game' | 'profile' = 'game') => {
    if (!url) return;
    
    const cacheKey = `${url}:${context}`;
    if (preloadedRef.current.has(cacheKey)) return;
    
    preloadedRef.current.add(cacheKey);
    preloadRPMModel(url, context);
  }, []);
  
  const preloadAll = useCallback((url: string) => {
    if (!url || preloadedRef.current.has(`${url}:all`)) return;
    
    preloadedRef.current.add(`${url}:all`);
    preloadAllQualities(url);
  }, []);
  
  return { preloadSingle, preloadAll };
};

/**
 * Hook to preload a single avatar when URL changes
 */
export const useAvatarUrlPreloader = (
  url: string | undefined, 
  context: 'thumbnail' | 'game' | 'profile' = 'game'
) => {
  useEffect(() => {
    if (url) {
      preloadRPMModel(url, context);
    }
  }, [url, context]);
};

/**
 * Hook for immediate preloading on component mount
 */
export const useImmediatePreload = (urls: string[]) => {
  const preloadedRef = useRef(false);
  
  useEffect(() => {
    if (!preloadedRef.current && urls.length > 0) {
      preloadedRef.current = true;
      preloadRPMModels(urls, 'game');
    }
  }, []);
};

export default useAvatarPreloader;
