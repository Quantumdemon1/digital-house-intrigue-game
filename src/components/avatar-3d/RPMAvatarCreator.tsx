/**
 * @file avatar-3d/RPMAvatarCreator.tsx
 * @description Ready Player Me avatar creation interface (lazy loaded)
 */

import React, { useState, useCallback, lazy, Suspense, ComponentType } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { optimizeRPMUrl, QUALITY_PRESETS } from '@/utils/rpm-avatar-optimizer';
import { useGLTF } from '@react-three/drei';

// Generic props interface for the avatar creator
interface AvatarCreatorComponentProps {
  subdomain: string;
  editorConfig?: Record<string, unknown>;
  avatarConfig?: Record<string, unknown>;
  onAvatarExported?: (event: { data: { url: string } } | string) => void;
  onUserSet?: (event: unknown) => void;
}

// Lazy load the RPM SDK with proper typing
const LazyAvatarCreator = lazy(async (): Promise<{ default: ComponentType<AvatarCreatorComponentProps> }> => {
  try {
    // Try new package first
    const mod = await import('@readyplayerme/react-avatar-creator');
    return { default: mod.AvatarCreator as ComponentType<AvatarCreatorComponentProps> };
  } catch (e1) {
    try {
      // Fallback to old package
      const mod = await import('@readyplayerme/rpm-react-sdk');
      return { default: mod.AvatarCreator as ComponentType<AvatarCreatorComponentProps> };
    } catch (e2) {
      console.error('Failed to load any RPM SDK:', e1, e2);
      const FallbackComponent: React.FC<AvatarCreatorComponentProps> = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Avatar Creator Unavailable
          </h3>
          <p className="text-muted-foreground text-sm">
            The Ready Player Me SDK couldn&apos;t be loaded. Please use the other avatar styles instead.
          </p>
        </div>
      );
      return { default: FallbackComponent };
    }
  }
});

interface RPMAvatarCreatorProps {
  open: boolean;
  onClose: () => void;
  onAvatarCreated: (avatarUrl: string) => void;
  subdomain?: string;
  bodyType?: 'fullbody' | 'halfbody';
}

/**
 * RPMAvatarCreator - Dialog wrapper for Ready Player Me's avatar creator
 */
export const RPMAvatarCreator: React.FC<RPMAvatarCreatorProps> = ({
  open,
  onClose,
  onAvatarCreated,
  subdomain = 'demo',
  bodyType = 'halfbody'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const editorConfig = {
    clearCache: true,
    bodyType,
    quickStart: false,
    language: 'en' as const,
  };

  // Optimized avatar config for export - use low quality for faster exports
  // We'll optimize the URL further when storing
  const avatarConfig = {
    quality: 'low' as const,
    morphTargets: ['ARKit'],
    useDracoCompression: true,
  };

  const handleOnAvatarExported = useCallback((eventOrUrl: { data: { url: string } } | string) => {
    // Extract URL from event object or use directly if string
    const url = typeof eventOrUrl === 'string' 
      ? eventOrUrl 
      : eventOrUrl?.data?.url || '';
    
    if (!url) {
      console.warn('No URL received from avatar export');
      return;
    }
    
    console.log('Avatar exported (raw):', url);
    
    // Optimize the URL for game use
    const optimizedUrl = optimizeRPMUrl(url, QUALITY_PRESETS.game);
    console.log('Avatar optimized:', optimizedUrl);
    
    // Start preloading immediately for instant display
    try {
      useGLTF.preload(optimizedUrl);
    } catch (e) {
      // Preload may fail silently, that's OK
    }
    
    onAvatarCreated(optimizedUrl);
    onClose();
  }, [onAvatarCreated, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            Create Your Avatar
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading avatar creator...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3 text-center p-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <p className="text-destructive font-medium">Failed to load avatar creator</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
          
          <div className="w-full h-full" style={{ height: 'calc(85vh - 60px)' }}>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }>
              <LazyAvatarCreator
                subdomain={subdomain}
                editorConfig={editorConfig}
                avatarConfig={avatarConfig}
                onAvatarExported={handleOnAvatarExported}
                onUserSet={() => setIsLoading(false)}
              />
            </Suspense>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Inline avatar creator (non-dialog version)
 */
export const RPMAvatarCreatorInline: React.FC<{
  onAvatarCreated: (avatarUrl: string) => void;
  subdomain?: string;
  bodyType?: 'fullbody' | 'halfbody';
  className?: string;
}> = ({
  onAvatarCreated,
  subdomain = 'demo',
  bodyType = 'halfbody',
  className
}) => {
  const editorConfig = {
    clearCache: true,
    bodyType,
    quickStart: false,
    language: 'en' as const,
  };

  const avatarConfig = {
    quality: 'low' as const,
    morphTargets: ['ARKit'],
    useDracoCompression: true,
  };

  const handleExport = useCallback((eventOrUrl: { data: { url: string } } | string) => {
    // Extract URL from event object or use directly if string
    const url = typeof eventOrUrl === 'string' 
      ? eventOrUrl 
      : eventOrUrl?.data?.url || '';
    
    if (!url) return;
    
    const optimizedUrl = optimizeRPMUrl(url, QUALITY_PRESETS.game);
    
    // Start preloading immediately
    try {
      useGLTF.preload(optimizedUrl);
    } catch (e) {
      // Preload may fail silently
    }
    
    onAvatarCreated(optimizedUrl);
  }, [onAvatarCreated]);

  return (
    <div className={className} style={{ minHeight: '500px' }}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <LazyAvatarCreator
          subdomain={subdomain}
          editorConfig={editorConfig}
          avatarConfig={avatarConfig}
          onAvatarExported={handleExport}
        />
      </Suspense>
    </div>
  );
};

export default RPMAvatarCreator;
