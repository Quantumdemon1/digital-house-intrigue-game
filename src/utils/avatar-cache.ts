/**
 * @file utils/avatar-cache.ts
 * @description LRU cache for avatar URLs with CDN optimization hints
 */

interface CacheEntry {
  optimizedUrl: string;
  timestamp: number;
  version: number;
}

const MAX_CACHE_SIZE = 100;
const CACHE_KEY = 'avatar-url-cache';

/**
 * Simple LRU cache for avatar URLs
 */
class AvatarUrlCache {
  private cache: Map<string, CacheEntry> = new Map();
  private loaded = false;

  private loadFromStorage(): void {
    if (this.loaded) return;
    
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as [string, CacheEntry][];
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load avatar cache:', error);
    }
    
    this.loaded = true;
  }

  private saveToStorage(): void {
    try {
      const entries = Array.from(this.cache.entries());
      localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save avatar cache:', error);
    }
  }

  private evictOldest(): void {
    if (this.cache.size <= MAX_CACHE_SIZE) return;
    
    // Sort by timestamp and remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => b.timestamp - a.timestamp)
      .slice(0, MAX_CACHE_SIZE);
    
    this.cache = new Map(entries);
  }

  get(rawUrl: string): CacheEntry | undefined {
    this.loadFromStorage();
    
    const entry = this.cache.get(rawUrl);
    if (entry) {
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      this.cache.set(rawUrl, entry);
    }
    
    return entry;
  }

  set(rawUrl: string, optimizedUrl: string, version = 1): void {
    this.loadFromStorage();
    
    this.cache.set(rawUrl, {
      optimizedUrl,
      timestamp: Date.now(),
      version
    });
    
    this.evictOldest();
    this.saveToStorage();
  }

  invalidate(rawUrl: string): void {
    this.loadFromStorage();
    this.cache.delete(rawUrl);
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem(CACHE_KEY);
  }

  getOrCompute(rawUrl: string, computeFn: (url: string) => string, version = 1): string {
    const cached = this.get(rawUrl);
    
    if (cached && cached.version >= version) {
      return cached.optimizedUrl;
    }
    
    const optimized = computeFn(rawUrl);
    this.set(rawUrl, optimized, version);
    return optimized;
  }
}

// Singleton instance
export const avatarUrlCache = new AvatarUrlCache();

/**
 * Thumbnail storage for 2D fallback images
 */
const THUMBNAIL_CACHE_KEY = 'avatar-thumbnails';
const MAX_THUMBNAIL_SIZE = 50; // Max number of thumbnails
const MAX_THUMBNAIL_BYTES = 50 * 1024; // 50KB per thumbnail

interface ThumbnailEntry {
  dataUrl: string;
  timestamp: number;
}

class AvatarThumbnailCache {
  private cache: Map<string, ThumbnailEntry> = new Map();
  private loaded = false;

  private loadFromStorage(): void {
    if (this.loaded) return;
    
    try {
      const stored = localStorage.getItem(THUMBNAIL_CACHE_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as [string, ThumbnailEntry][];
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load thumbnail cache:', error);
    }
    
    this.loaded = true;
  }

  private saveToStorage(): void {
    try {
      const entries = Array.from(this.cache.entries());
      localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save thumbnail cache:', error);
    }
  }

  private evictOldest(): void {
    if (this.cache.size <= MAX_THUMBNAIL_SIZE) return;
    
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => b.timestamp - a.timestamp)
      .slice(0, MAX_THUMBNAIL_SIZE);
    
    this.cache = new Map(entries);
  }

  get(avatarId: string): string | undefined {
    this.loadFromStorage();
    return this.cache.get(avatarId)?.dataUrl;
  }

  set(avatarId: string, dataUrl: string): boolean {
    this.loadFromStorage();
    
    // Check size limit
    if (dataUrl.length > MAX_THUMBNAIL_BYTES * 1.37) { // base64 encoding adds ~37%
      console.warn('Thumbnail too large, skipping cache');
      return false;
    }
    
    this.cache.set(avatarId, {
      dataUrl,
      timestamp: Date.now()
    });
    
    this.evictOldest();
    this.saveToStorage();
    return true;
  }

  has(avatarId: string): boolean {
    this.loadFromStorage();
    return this.cache.has(avatarId);
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem(THUMBNAIL_CACHE_KEY);
  }
}

// Singleton instance
export const avatarThumbnailCache = new AvatarThumbnailCache();

/**
 * Generate a unique cache key for an avatar
 */
export const getAvatarCacheKey = (url: string | undefined, presetId?: string): string => {
  if (presetId) return `preset:${presetId}`;
  if (url) return `url:${url.split('?')[0]}`; // Base URL without params
  return 'procedural';
};

/**
 * CDN cache hint headers for static hosting
 */
export const getCDNCacheHeaders = (): Record<string, string> => ({
  'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
  'Vary': 'Accept-Encoding'
});
