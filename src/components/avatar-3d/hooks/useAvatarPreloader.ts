/**
 * @file hooks/useAvatarPreloader.ts
 * @description Hook for preloading RPM GLB avatars for smooth rendering
 */

import { useEffect, useCallback, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Houseguest } from '@/models/houseguest';

/**
 * Preload a single RPM avatar URL
 */
export const preloadRPMModel = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // useGLTF.preload triggers the cache
      useGLTF.preload(url);
      
      // Also fetch to warm the network cache
      fetch(url, { method: 'HEAD' })
        .then(() => resolve())
        .catch(() => resolve()); // Don't fail on HEAD request issues
    } catch (error) {
      console.warn('Failed to preload RPM model:', url, error);
      resolve(); // Don't block on preload failures
    }
  });
};

/**
 * Preload multiple RPM avatar URLs in parallel
 */
export const preloadRPMModels = async (urls: string[]): Promise<void> => {
  const validUrls = urls.filter(Boolean);
  if (validUrls.length === 0) return;
  
  console.log(`Preloading ${validUrls.length} RPM avatar(s)...`);
  
  await Promise.allSettled(validUrls.map(preloadRPMModel));
  
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
 * Hook to preload all RPM avatars for a list of houseguests
 */
export const useAvatarPreloader = (houseguests: Houseguest[]) => {
  const preloadedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const urls = extractRPMUrls(houseguests);
    const newUrls = urls.filter(url => !preloadedRef.current.has(url));
    
    if (newUrls.length > 0) {
      newUrls.forEach(url => preloadedRef.current.add(url));
      preloadRPMModels(newUrls);
    }
  }, [houseguests]);
  
  const preloadSingle = useCallback((url: string) => {
    if (!url || preloadedRef.current.has(url)) return;
    
    preloadedRef.current.add(url);
    preloadRPMModel(url);
  }, []);
  
  return { preloadSingle };
};

/**
 * Hook to preload a single avatar when URL changes
 */
export const useAvatarUrlPreloader = (url: string | undefined) => {
  useEffect(() => {
    if (url) {
      preloadRPMModel(url);
    }
  }, [url]);
};

export default useAvatarPreloader;
