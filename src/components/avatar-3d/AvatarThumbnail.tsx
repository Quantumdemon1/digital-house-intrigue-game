/**
 * @file avatar-3d/AvatarThumbnail.tsx
 * @description 2D thumbnail fallback for avatars while 3D loads
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { avatarThumbnailCache, getAvatarCacheKey } from '@/utils/avatar-cache';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User } from 'lucide-react';

interface AvatarThumbnailProps {
  url?: string;
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLoader?: boolean;
  onCapture?: (dataUrl: string) => void;
}

const SIZE_MAP = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48'
};

/**
 * Static thumbnail display component
 */
export const AvatarThumbnail: React.FC<AvatarThumbnailProps> = ({
  url,
  avatarId,
  size = 'md',
  className,
  showLoader = true
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(url);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (url) {
      setThumbnailUrl(url);
      return;
    }

    // Try to get from cache
    if (avatarId) {
      const cached = avatarThumbnailCache.get(avatarId);
      if (cached) {
        setThumbnailUrl(cached);
      }
    }
  }, [url, avatarId]);

  if (!thumbnailUrl) {
    return (
      <div className={cn(
        SIZE_MAP[size],
        'rounded-lg bg-muted flex items-center justify-center',
        className
      )}>
        {showLoader ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : (
          <User className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <div className={cn(SIZE_MAP[size], 'relative rounded-lg overflow-hidden', className)}>
      <AnimatePresence>
        {!loaded && showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-muted flex items-center justify-center z-10"
          >
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
      <img
        src={thumbnailUrl}
        alt="Avatar thumbnail"
        className="w-full h-full object-cover"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  );
};

/**
 * Capture thumbnail from canvas and store in cache
 */
export const captureAvatarThumbnail = (
  canvas: HTMLCanvasElement,
  avatarId: string,
  quality = 0.7
): string | null => {
  try {
    const dataUrl = canvas.toDataURL('image/webp', quality);
    
    // Store in cache
    avatarThumbnailCache.set(avatarId, dataUrl);
    
    return dataUrl;
  } catch (error) {
    console.warn('Failed to capture avatar thumbnail:', error);
    return null;
  }
};

/**
 * Component that captures thumbnail after 3D render
 */
interface ThumbnailCaptureProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  avatarId: string;
  delay?: number;
  onCaptured?: (dataUrl: string) => void;
}

export const ThumbnailCapture: React.FC<ThumbnailCaptureProps> = ({
  canvasRef,
  avatarId,
  delay = 500,
  onCaptured
}) => {
  const capturedRef = useRef(false);

  useEffect(() => {
    if (capturedRef.current) return;
    if (!canvasRef.current) return;

    // Skip if already cached
    if (avatarThumbnailCache.has(avatarId)) {
      capturedRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      if (canvasRef.current && !capturedRef.current) {
        const dataUrl = captureAvatarThumbnail(canvasRef.current, avatarId);
        if (dataUrl) {
          capturedRef.current = true;
          onCaptured?.(dataUrl);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [canvasRef, avatarId, delay, onCaptured]);

  return null;
};

/**
 * Hook to manage thumbnail capture and display
 */
export const useAvatarThumbnail = (avatarId: string) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(() => 
    avatarThumbnailCache.get(avatarId)
  );

  const storeThumbnail = useCallback((dataUrl: string) => {
    avatarThumbnailCache.set(avatarId, dataUrl);
    setThumbnailUrl(dataUrl);
  }, [avatarId]);

  const clearThumbnail = useCallback(() => {
    setThumbnailUrl(undefined);
  }, []);

  return {
    thumbnailUrl,
    hasThumbnail: !!thumbnailUrl,
    storeThumbnail,
    clearThumbnail
  };
};

export default AvatarThumbnail;
