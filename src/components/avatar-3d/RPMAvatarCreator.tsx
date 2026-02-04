/**
 * @file avatar-3d/RPMAvatarCreator.tsx
 * @description Ready Player Me avatar creation interface
 */

import React, { useState, useCallback } from 'react';
import { AvatarCreator, EditorConfig, AvatarConfig } from '@readyplayerme/rpm-react-sdk';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';

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
  subdomain = 'demo', // Use 'demo' for testing, replace with actual subdomain
  bodyType = 'halfbody'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const editorConfig: EditorConfig = {
    clearCache: true,
    bodyType,
    quickStart: false,
    language: 'en',
  };

  // Configure avatar export to include ARKit morph targets
  const avatarConfig: AvatarConfig = {
    quality: 'medium',
    morphTargets: ['ARKit'],
    useDracoCompression: true,
  };

  const handleOnAvatarExported = useCallback((url: string) => {
    console.log('Avatar exported:', url);
    onAvatarCreated(url);
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
                <p className="text-destructive font-medium">Failed to load avatar creator</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
          
          <div className="w-full h-full" style={{ height: 'calc(85vh - 60px)' }}>
            <AvatarCreator
              subdomain={subdomain}
              editorConfig={editorConfig}
              avatarConfig={avatarConfig}
              onAvatarExported={handleOnAvatarExported}
              onUserSet={() => setIsLoading(false)}
            />
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
  const editorConfig: EditorConfig = {
    clearCache: true,
    bodyType,
    quickStart: false,
    language: 'en',
  };

  const avatarConfig: AvatarConfig = {
    quality: 'medium',
    morphTargets: ['ARKit'],
    useDracoCompression: true,
  };

  return (
    <div className={className} style={{ minHeight: '500px' }}>
      <AvatarCreator
        subdomain={subdomain}
        editorConfig={editorConfig}
        avatarConfig={avatarConfig}
        onAvatarExported={onAvatarCreated}
      />
    </div>
  );
};

export default RPMAvatarCreator;
