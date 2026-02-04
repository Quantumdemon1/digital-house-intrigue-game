/**
 * @file avatar-3d/AvatarCustomizer.tsx
 * @description Full avatar customization interface with preset, VRM, and RPM options (no procedural/chibi)
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  User, Sparkles, Globe, Users, Star, RotateCcw, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { Avatar3DConfig, generateDefaultConfig } from '@/models/avatar-config';
import { RPMAvatarCreator } from './RPMAvatarCreator';
import { RPMAvatarCreatorPanel } from './RPMAvatarCreatorPanel';
import { AvatarLoader } from './AvatarLoader';
import { PresetAvatarSelector } from './PresetAvatarSelector';
import { AvatarScreenshotCapture } from './AvatarScreenshotCapture';

interface AvatarCustomizerProps {
  initialConfig?: Avatar3DConfig;
  onChange: (config: Avatar3DConfig) => void;
  onComplete?: () => void;
  showCompleteButton?: boolean;
  enableRPM?: boolean;
  rpmSubdomain?: string;
  className?: string;
}

type AvatarMode = 'preset' | 'vrm' | 'rpm';

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  initialConfig,
  onChange,
  onComplete,
  showCompleteButton = true,
  enableRPM = true,
  rpmSubdomain = 'demo',
  className
}) => {
  const [config, setConfig] = useState<Avatar3DConfig>(initialConfig || generateDefaultConfig());
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>(() => {
    const source = initialConfig?.modelSource;
    if (source === 'ready-player-me') return 'rpm';
    if (source === 'vrm') return 'vrm';
    return 'preset';
  });
  const [showRPMCreator, setShowRPMCreator] = useState(false);

  const updateConfig = useCallback((updates: Partial<Avatar3DConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  }, [config, onChange]);

  const handleRPMAvatarCreated = useCallback((avatarUrl: string, thumbnailUrl?: string) => {
    updateConfig({
      modelSource: 'ready-player-me',
      modelUrl: avatarUrl,
      presetId: undefined,
      thumbnailUrl: thumbnailUrl
    });
    setAvatarMode('rpm');
  }, [updateConfig]);

  const handlePresetSelected = useCallback((preset: { id: string; url: string; thumbnail?: string }) => {
    updateConfig({
      modelSource: 'preset-glb',
      modelUrl: preset.url,
      presetId: preset.id,
      thumbnailUrl: preset.thumbnail
    });
    setAvatarMode('preset');
  }, [updateConfig]);

  const handleVRMSelected = useCallback((preset: { id: string; url: string; thumbnail?: string }) => {
    updateConfig({
      modelSource: 'vrm',
      modelUrl: preset.url,
      presetId: preset.id,
      thumbnailUrl: preset.thumbnail
    });
    setAvatarMode('vrm');
  }, [updateConfig]);

  const handleProfilePhotoCaptured = useCallback((dataUrl: string) => {
    updateConfig({ profilePhotoUrl: dataUrl });
  }, [updateConfig]);

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { delta: { x: number } }) => {
    setRotation(r => r + info.delta.x * 0.5);
  };

  // Check if a valid avatar is selected
  const hasValidAvatar = config.modelUrl || config.presetId;
  const hasProfilePhoto = !!config.profilePhotoUrl;

  return (
    <div className={cn(
      'sims-cas-background sims-cas-pattern min-h-[500px] rounded-2xl overflow-hidden',
      className
    )}>
      {/* RPM Creator Dialog */}
      {enableRPM && (
        <RPMAvatarCreator
          open={showRPMCreator}
          onClose={() => setShowRPMCreator(false)}
          onAvatarCreated={handleRPMAvatarCreated}
          subdomain={rpmSubdomain}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left: 3D Preview */}
        <motion.div 
          className="flex flex-col items-center gap-4 lg:w-2/5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Mode Toggle - 3 mode selector */}
          {enableRPM && (
            <div className="flex gap-1 bg-card/50 backdrop-blur-sm rounded-xl p-1 mb-4 border border-border/50">
              {[
                { mode: 'preset' as const, icon: Users, label: 'Realistic' },
                { mode: 'vrm' as const, icon: Star, label: 'Anime' },
                { mode: 'rpm' as const, icon: Globe, label: 'Pro' },
              ].map(({ mode, icon: Icon, label }) => (
                <motion.button
                  key={mode}
                  onClick={() => {
                    if (mode === 'rpm' && !config.modelUrl) {
                      setShowRPMCreator(true);
                    } else {
                      setAvatarMode(mode);
                    }
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                    avatarMode === mode 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </motion.button>
              ))}
            </div>
          )}
          
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
                    <p className="text-sm text-center">Select an avatar</p>
                    <p className="text-xs text-center opacity-60">from the options below</p>
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

          {/* Quick edit RPM button when in RPM mode with existing avatar */}
          {avatarMode === 'rpm' && config.modelUrl && (
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

          {/* Profile Photo Capture Button */}
          {hasValidAvatar && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <AvatarScreenshotCapture
                canvasSelector="canvas"
                onCapture={handleProfilePhotoCaptured}
              />
              
              {hasProfilePhoto && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-primary"
                >
                  <Check className="w-3 h-3" />
                  Profile photo saved
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right: Selection Panels */}
        <motion.div 
          className="flex-1 lg:w-3/5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {avatarMode === 'rpm' && (
            /* RPM Mode - Inline creator panel with gallery */
            <div className="sims-panel">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Pro Avatar Creator
              </h3>
              <RPMAvatarCreatorPanel
                onAvatarSelected={handleRPMAvatarCreated}
                subdomain={rpmSubdomain}
              />
            </div>
          )}

          {avatarMode === 'preset' && (
            /* Preset GLB Mode */
            <div className="sims-panel">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Choose a Realistic Character
              </h3>
              <PresetAvatarSelector
                source="glb"
                onSelect={(preset) => handlePresetSelected(preset as { id: string; url: string; thumbnail?: string })}
                selectedId={config.presetId}
                columns={4}
              />
            </div>
          )}

          {avatarMode === 'vrm' && (
            /* VRM Anime Mode */
            <div className="sims-panel">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Choose an Anime Avatar
              </h3>
              <PresetAvatarSelector
                source="vrm"
                onSelect={(preset) => handleVRMSelected(preset as { id: string; url: string; thumbnail?: string })}
                selectedId={config.presetId}
                columns={4}
              />
            </div>
          )}

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
