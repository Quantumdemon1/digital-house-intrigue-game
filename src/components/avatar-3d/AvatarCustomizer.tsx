/**
 * @file avatar-3d/AvatarCustomizer.tsx
 * @description Streamlined avatar customization using Ready Player Me only
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Sparkles, Globe, RotateCcw, ChevronLeft, ChevronRight, Check, Camera, RefreshCw } from 'lucide-react';
import { Avatar3DConfig, generateDefaultConfig } from '@/models/avatar-config';
import { RPMAvatarCreator } from './RPMAvatarCreator';
import { RPMAvatarCreatorPanel } from './RPMAvatarCreatorPanel';
import { AvatarLoader } from './AvatarLoader';
import { captureAvatarScreenshot } from './AvatarScreenshotCapture';
import { toast } from '@/hooks/use-toast';

interface AvatarCustomizerProps {
  initialConfig?: Avatar3DConfig;
  onChange: (config: Avatar3DConfig) => void;
  onComplete?: () => void;
  showCompleteButton?: boolean;
  rpmSubdomain?: string;
  className?: string;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  initialConfig,
  onChange,
  onComplete,
  showCompleteButton = true,
  rpmSubdomain = 'demo',
  className
}) => {
  const [config, setConfig] = useState<Avatar3DConfig>(initialConfig || generateDefaultConfig());
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showRPMCreator, setShowRPMCreator] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Track avatar URL for auto-capture
  const lastCapturedUrlRef = useRef<string | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateConfig = useCallback((updates: Partial<Avatar3DConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  }, [config, onChange]);

  // Auto-capture profile photo when avatar changes
  const performAutoCapture = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Canvas not found for auto-capture');
      return;
    }

    setIsCapturing(true);

    const dataUrl = captureAvatarScreenshot(canvas, {
      width: 256,
      height: 256,
      focusTop: true,
      zoomFactor: 1.3,
      verticalOffset: 0.05,
    });

    if (dataUrl && dataUrl.length > 1000) {
      updateConfig({ profilePhotoUrl: dataUrl });
      lastCapturedUrlRef.current = config.modelUrl || null;
      
      toast({
        title: "Profile photo captured!",
        description: "Click 'Retake' below to capture a new one.",
        duration: 3000,
      });
    }

    setIsCapturing(false);
  }, [config.modelUrl, updateConfig]);

  // Trigger auto-capture when avatar URL changes
  useEffect(() => {
    if (!config.modelUrl || config.modelUrl === lastCapturedUrlRef.current) {
      return;
    }

    // Clear any existing timeout
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
    }

    // Wait for avatar to load and render before capturing
    captureTimeoutRef.current = setTimeout(() => {
      performAutoCapture();
    }, 2500); // Give avatar time to load

    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, [config.modelUrl, performAutoCapture]);

  const handleRPMAvatarCreated = useCallback((avatarUrl: string, thumbnailUrl?: string) => {
    // Reset the captured URL to trigger new auto-capture
    lastCapturedUrlRef.current = null;
    
    updateConfig({
      modelSource: 'ready-player-me',
      modelUrl: avatarUrl,
      presetId: undefined,
      thumbnailUrl: thumbnailUrl,
      profilePhotoUrl: undefined, // Clear old photo, will be auto-captured
    });
  }, [updateConfig]);

  const handleRetakePhoto = useCallback(() => {
    // Force re-capture by clearing the last captured URL
    lastCapturedUrlRef.current = null;
    performAutoCapture();
  }, [performAutoCapture]);

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { delta: { x: number } }) => {
    setRotation(r => r + info.delta.x * 0.5);
  };

  // Check if a valid avatar is selected
  const hasValidAvatar = config.modelUrl;
  const hasProfilePhoto = !!config.profilePhotoUrl;

  return (
    <div className={cn(
      'sims-cas-background sims-cas-pattern min-h-[500px] rounded-2xl overflow-hidden',
      className
    )}>
      {/* RPM Creator Dialog */}
      <RPMAvatarCreator
        open={showRPMCreator}
        onClose={() => setShowRPMCreator(false)}
        onAvatarCreated={handleRPMAvatarCreated}
        subdomain={rpmSubdomain}
      />

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left: 3D Preview */}
        <motion.div 
          className="flex flex-col items-center gap-4 lg:w-2/5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Avatar Preview with Turntable */}
          <div className="sims-turntable relative">
            {/* Spotlight */}
            <div className="sims-spotlight" />
            
            {/* Avatar container */}
            <motion.div 
              className={cn(
                "relative w-56 h-56 lg:w-72 lg:h-72 rounded-2xl overflow-hidden",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              style={{ 
                background: 'radial-gradient(ellipse at center 30%, hsl(var(--primary) / 0.2) 0%, hsl(var(--background)) 100%)'
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onDrag={(e, info) => handleDrag(e, info)}
            >
              <motion.div
                animate={{ rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="w-full h-full"
              >
                {hasValidAvatar ? (
                  <AvatarLoader
                    avatarUrl={config.modelUrl}
                    avatarConfig={config}
                    size="full"
                    animated={true}
                  />
                ) : (
                  /* Placeholder when no avatar is selected */
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <User className="w-16 h-16 mb-2 opacity-50" />
                    <p className="text-sm text-center">Create your avatar</p>
                    <p className="text-xs text-center opacity-60">using the panel on the right</p>
                  </div>
                )}
              </motion.div>
              
              {/* Drag hint */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/40 pointer-events-none">
                ← drag to rotate →
              </div>
            </motion.div>
          </div>

          {/* Rotation controls */}
          <div className="flex items-center gap-3 mt-2">
            <motion.button
              onClick={() => setRotation(r => r - 45)}
              className="w-10 h-10 rounded-full bg-muted/30 border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={() => setRotation(0)}
              className="px-4 py-2 rounded-full bg-muted/30 border border-border flex items-center gap-2 text-muted-foreground text-sm hover:bg-muted/50 hover:text-foreground transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
            
            <motion.button
              onClick={() => setRotation(r => r + 45)}
              className="w-10 h-10 rounded-full bg-muted/30 border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Quick edit RPM button when avatar exists */}
          {config.modelUrl && (
            <motion.button
              onClick={() => setShowRPMCreator(true)}
              className="mt-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-4 h-4" />
              Open Full Editor
            </motion.button>
          )}

          {/* Profile Photo Status & Retake Button */}
          {hasValidAvatar && (
            <div className="mt-4 flex flex-col items-center gap-2">
              {isCapturing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Capturing profile photo...
                </div>
              ) : hasProfilePhoto ? (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-primary"
                  >
                    <Check className="w-4 h-4" />
                    Profile photo saved
                  </motion.div>
                  
                  {/* Mini preview of captured photo */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
                      <img 
                        src={config.profilePhotoUrl} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <motion.button
                      onClick={handleRetakePhoto}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Camera className="w-4 h-4" />
                      Retake
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Profile photo will be captured automatically...
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right: RPM Creator Panel */}
        <motion.div 
          className="flex-1 lg:w-3/5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="sims-panel">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Create Your Avatar
            </h3>
            <RPMAvatarCreatorPanel
              onAvatarSelected={handleRPMAvatarCreated}
              subdomain={rpmSubdomain}
            />
          </div>

          {/* Complete Button */}
          {showCompleteButton && onComplete && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={onComplete}
                className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-5 h-5" />
                Continue
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
