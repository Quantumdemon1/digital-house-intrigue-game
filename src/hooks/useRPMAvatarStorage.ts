/**
 * @file hooks/useRPMAvatarStorage.ts
 * @description Hook for managing saved Ready Player Me avatars in localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface SavedRPMAvatar {
  id: string;
  url: string;
  thumbnail?: string;
  createdAt: string;
  name?: string;
}

const STORAGE_KEY = 'rpm-saved-avatars';
const MAX_SAVED_AVATARS = 10;

/**
 * Hook for managing saved RPM avatars
 */
export function useRPMAvatarStorage() {
  const [avatars, setAvatars] = useState<SavedRPMAvatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load avatars from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedRPMAvatar[];
        setAvatars(parsed);
      }
    } catch (error) {
      console.error('Failed to load saved RPM avatars:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever avatars change
  const saveToStorage = useCallback((newAvatars: SavedRPMAvatar[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAvatars));
    } catch (error) {
      console.error('Failed to save RPM avatars:', error);
    }
  }, []);

  /**
   * Add a new avatar to the gallery
   */
  const addAvatar = useCallback((url: string, thumbnail?: string, name?: string): SavedRPMAvatar => {
    const newAvatar: SavedRPMAvatar = {
      id: uuidv4(),
      url,
      thumbnail,
      name,
      createdAt: new Date().toISOString(),
    };

    setAvatars(prev => {
      // Limit to max avatars, remove oldest if needed
      const updated = [newAvatar, ...prev].slice(0, MAX_SAVED_AVATARS);
      saveToStorage(updated);
      return updated;
    });

    return newAvatar;
  }, [saveToStorage]);

  /**
   * Remove an avatar from the gallery
   */
  const removeAvatar = useCallback((id: string) => {
    setAvatars(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  /**
   * Update an existing avatar's metadata
   */
  const updateAvatar = useCallback((id: string, updates: Partial<Omit<SavedRPMAvatar, 'id' | 'createdAt'>>) => {
    setAvatars(prev => {
      const updated = prev.map(a => 
        a.id === id ? { ...a, ...updates } : a
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  /**
   * Check if a URL is already saved
   */
  const isAvatarSaved = useCallback((url: string): boolean => {
    // Extract avatar ID from URL for comparison (URLs may have different params)
    const extractId = (u: string) => {
      const match = u.match(/models\.readyplayer\.me\/([a-f0-9-]+)/);
      return match ? match[1] : u;
    };
    
    const targetId = extractId(url);
    return avatars.some(a => extractId(a.url) === targetId);
  }, [avatars]);

  /**
   * Clear all saved avatars
   */
  const clearAll = useCallback(() => {
    setAvatars([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    avatars,
    isLoading,
    addAvatar,
    removeAvatar,
    updateAvatar,
    isAvatarSaved,
    clearAll,
  };
}

export default useRPMAvatarStorage;
