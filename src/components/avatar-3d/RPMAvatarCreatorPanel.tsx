/**
 * @file avatar-3d/RPMAvatarCreatorPanel.tsx
 * @description Inline Ready Player Me avatar creator panel with embedded iframe and gallery
 */

import React, { useState, useCallback, lazy, Suspense, useRef, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Globe, AlertTriangle, Trash2, Sparkles } from 'lucide-react';
import { optimizeRPMUrl, QUALITY_PRESETS } from '@/utils/rpm-avatar-optimizer';
import { useRPMAvatarStorage, SavedRPMAvatar } from '@/hooks/useRPMAvatarStorage';
import { RPMAvatarGallery } from './RPMAvatarGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Generic props interface for the avatar creator - supports both old and new SDK
interface AvatarCreatorComponentProps {
  subdomain: string;
  // New SDK uses 'config', old uses 'editorConfig'
  config?: Record<string, unknown>;
  editorConfig?: Record<string, unknown>;
  avatarConfig?: Record<string, unknown>;
  onAvatarExported?: (event: { data: { url: string } } | string) => void;
  onUserSet?: (event: unknown) => void;
  style?: React.CSSProperties;
}

// Lazy load the RPM Avatar Creator with proper typing
const LazyAvatarCreator = lazy(async (): Promise<{ default: ComponentType<AvatarCreatorComponentProps> }> => {
  try {
    // Try new package first
    const mod = await import('@readyplayerme/react-avatar-creator');
    console.log('Loaded @readyplayerme/react-avatar-creator');
    return { default: mod.AvatarCreator as ComponentType<AvatarCreatorComponentProps> };
  } catch (e1) {
    try {
      // Fallback to old package
      const mod = await import('@readyplayerme/rpm-react-sdk');
      console.log('Loaded @readyplayerme/rpm-react-sdk (fallback)');
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
            The Ready Player Me SDK couldn&apos;t be loaded. Please try refreshing the page.
          </p>
        </div>
      );
      return { default: FallbackComponent };
    }
  }
});

interface RPMAvatarCreatorPanelProps {
  onAvatarSelected: (url: string, thumbnail?: string) => void;
  subdomain?: string;
  className?: string;
}

type TabValue = 'gallery' | 'create';

/**
 * RPMAvatarCreatorPanel - Inline RPM creator with saved avatar gallery
 */
export const RPMAvatarCreatorPanel: React.FC<RPMAvatarCreatorPanelProps> = ({
  onAvatarSelected,
  subdomain = 'demo',
  className,
}) => {
  const [activeTab, setActiveTab] = useState<TabValue>('gallery');
  const [isCreatorLoading, setIsCreatorLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | undefined>();
  const creatorContainerRef = useRef<HTMLDivElement>(null);
  const iframeLoadedRef = useRef(false);

  const { 
    avatars, 
    addAvatar, 
    removeAvatar, 
    isLoading: isStorageLoading 
  } = useRPMAvatarStorage();

  // Configuration for the avatar creator - new SDK uses 'config'
  const creatorConfig = {
    clearCache: false,
    bodyType: 'halfbody',
    quickStart: false,
    language: 'en',
  };

  // Style for the iframe
  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
  };

  // Auto-hide loading after a timeout (fallback if onUserSet doesn't fire)
  React.useEffect(() => {
    if (activeTab === 'create' && isCreatorLoading) {
      const timer = setTimeout(() => {
        if (!iframeLoadedRef.current) {
          console.log('Hiding loader via timeout fallback');
          setIsCreatorLoading(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, isCreatorLoading]);

  // Handle avatar export from RPM creator - supports both old and new SDK event formats
  const handleAvatarExported = useCallback((eventOrUrl: { data: { url: string } } | string) => {
    // Extract URL from event object or use directly if string
    const url = typeof eventOrUrl === 'string' 
      ? eventOrUrl 
      : eventOrUrl?.data?.url || '';
    
    if (!url) {
      console.warn('No URL received from avatar export');
      return;
    }
    
    console.log('RPM Avatar exported:', url);
    
    // Optimize URL for game use
    const optimizedUrl = optimizeRPMUrl(url, QUALITY_PRESETS.game);
    
    // Generate a simple thumbnail URL from RPM
    const avatarId = url.match(/models\.readyplayer\.me\/([a-f0-9-]+)/)?.[1];
    const thumbnailUrl = avatarId 
      ? `https://models.readyplayer.me/${avatarId}.png?size=256`
      : undefined;
    
    // Save to gallery
    addAvatar(optimizedUrl, thumbnailUrl);
    
    // Notify parent
    onAvatarSelected(optimizedUrl, thumbnailUrl);
    
    // Switch to gallery to show saved avatar
    setActiveTab('gallery');
  }, [addAvatar, onAvatarSelected]);

  // Handle selection from gallery
  const handleGallerySelect = useCallback((avatar: SavedRPMAvatar) => {
    setSelectedAvatarUrl(avatar.url);
    onAvatarSelected(avatar.url, avatar.thumbnail);
  }, [onAvatarSelected]);

  // Handle delete with confirmation
  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmId) {
      removeAvatar(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, removeAvatar]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex flex-col h-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            My Avatars
            {avatars.length > 0 && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 rounded-full">
                {avatars.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="flex-1 mt-0">
          {isStorageLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : avatars.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Create Your First Avatar
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                Design a unique 3D avatar with realistic features, custom outfits, and expressions.
              </p>
              <Button onClick={() => setActiveTab('create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Avatar
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <RPMAvatarGallery
                avatars={avatars}
                selectedUrl={selectedAvatarUrl}
                onSelect={handleGallerySelect}
                onDelete={(id) => setDeleteConfirmId(id)}
              />
              
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="flex-1 mt-0">
          <div 
            ref={creatorContainerRef}
            className="relative w-full h-[450px] rounded-xl overflow-hidden border border-border bg-muted/30"
          >
            {isCreatorLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading avatar creator...</p>
              </div>
            )}
            
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }>
              <LazyAvatarCreator
                subdomain={subdomain}
                config={creatorConfig}
                editorConfig={creatorConfig}
                style={iframeStyle}
                onAvatarExported={handleAvatarExported}
                onUserSet={() => {
                  iframeLoadedRef.current = true;
                  setIsCreatorLoading(false);
                }}
              />
            </Suspense>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Customize your avatar's face, hair, outfit, and more. Click "Done" when finished.
          </p>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Avatar?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this avatar from your saved collection. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RPMAvatarCreatorPanel;
