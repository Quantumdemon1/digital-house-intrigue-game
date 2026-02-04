/**
 * @file avatar-3d/AvatarCustomizer.tsx
 * @description Full Sims-style 3D avatar customization interface with RPM integration
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Palette, Eye, Scissors, Shirt, 
  RotateCcw, ChevronLeft, ChevronRight,
  Sparkles, Globe, Wand2, Users, Star
} from 'lucide-react';
import { 
  Avatar3DConfig, 
  generateDefaultConfig,
  BodyType, HeightType, HeadShape, EyeShape, NoseType, MouthType,
  HairStyle, TopStyle, BottomStyle,
  SKIN_TONE_PALETTE, HAIR_COLOR_PALETTE, CLOTHING_COLOR_PALETTE
} from '@/models/avatar-config';
import { SimsAvatar } from './SimsAvatar';
import { ColorPalettePicker } from './ColorPalettePicker';
import { AvatarOptionSelector } from './AvatarOptionSelector';
import { 
  PlumbobIcon, 
  DiceIcon,
  BODY_TYPE_ICONS,
  HAIR_STYLE_ICONS,
  TOP_STYLE_ICONS,
  BOTTOM_STYLE_ICONS,
  HEAD_SHAPE_ICONS
} from './SimsIcons';
import { RPMAvatarCreator } from './RPMAvatarCreator';
import { AvatarLoader } from './AvatarLoader';
import { PresetAvatarSelector, PresetSource } from './PresetAvatarSelector';
import { PRESET_GLB_AVATARS } from '@/data/preset-glb-avatars';
import { PRESET_VRM_AVATARS } from '@/data/preset-vrm-avatars';

// Option arrays
const BODY_TYPES: readonly BodyType[] = ['slim', 'average', 'athletic', 'stocky'] as const;
const HEIGHTS: readonly HeightType[] = ['short', 'average', 'tall'] as const;
const HEAD_SHAPES: readonly HeadShape[] = ['round', 'oval', 'square', 'heart'] as const;
const EYE_SHAPES: readonly EyeShape[] = ['round', 'almond', 'wide', 'narrow'] as const;
const NOSE_TYPES: readonly NoseType[] = ['small', 'medium', 'large', 'button'] as const;
const MOUTH_TYPES: readonly MouthType[] = ['thin', 'full', 'wide', 'small'] as const;
const HAIR_STYLES: readonly HairStyle[] = ['short', 'medium', 'long', 'buzz', 'ponytail', 'bun', 'curly', 'bald'] as const;
const TOP_STYLES: readonly TopStyle[] = ['tshirt', 'tanktop', 'blazer', 'hoodie', 'dress'] as const;
const BOTTOM_STYLES: readonly BottomStyle[] = ['pants', 'shorts', 'skirt', 'jeans'] as const;

const EYE_COLORS = ['#5D4037', '#3E2723', '#1565C0', '#2E7D32', '#616161', '#F57F17'];

interface AvatarCustomizerProps {
  initialConfig?: Avatar3DConfig;
  onChange: (config: Avatar3DConfig) => void;
  onComplete?: () => void;
  showCompleteButton?: boolean;
  enableRPM?: boolean;
  rpmSubdomain?: string;
  className?: string;
}

type TabId = 'body' | 'skin' | 'face' | 'hair' | 'clothing';
type AvatarMode = 'procedural' | 'preset' | 'vrm' | 'rpm';

const tabConfig: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'body', label: 'Body', icon: User },
  { id: 'skin', label: 'Skin', icon: Palette },
  { id: 'face', label: 'Face', icon: Eye },
  { id: 'hair', label: 'Hair', icon: Scissors },
  { id: 'clothing', label: 'Clothes', icon: Shirt },
];

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
  const [activeTab, setActiveTab] = useState<TabId>('body');
  const [isDragging, setIsDragging] = useState(false);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>(() => {
    const source = initialConfig?.modelSource;
    if (source === 'ready-player-me') return 'rpm';
    if (source === 'vrm') return 'vrm';
    if (source === 'preset-glb') return 'preset';
    return 'procedural';
  });
  const [showRPMCreator, setShowRPMCreator] = useState(false);

  const updateConfig = useCallback((updates: Partial<Avatar3DConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  }, [config, onChange]);

  const handleRPMAvatarCreated = useCallback((avatarUrl: string) => {
    updateConfig({
      modelSource: 'ready-player-me',
      modelUrl: avatarUrl,
      presetId: undefined
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

  const switchToProceduralMode = useCallback(() => {
    updateConfig({
      modelSource: 'procedural',
      modelUrl: undefined,
      presetId: undefined
    });
    setAvatarMode('procedural');
  }, [updateConfig]);

  const randomizeAll = () => {
    const newConfig = { ...generateDefaultConfig(), modelSource: 'procedural' as const, modelUrl: undefined };
    setConfig(newConfig);
    onChange(newConfig);
    setAvatarMode('procedural');
  };

  const randomizeCategory = (category: string) => {
    const randomConfig = generateDefaultConfig();
    
    switch (category) {
      case 'body':
        updateConfig({ 
          bodyType: randomConfig.bodyType, 
          height: randomConfig.height 
        });
        break;
      case 'skin':
        updateConfig({ skinTone: randomConfig.skinTone });
        break;
      case 'face':
        updateConfig({
          headShape: randomConfig.headShape,
          eyeShape: randomConfig.eyeShape,
          eyeColor: randomConfig.eyeColor,
          noseType: randomConfig.noseType,
          mouthType: randomConfig.mouthType
        });
        break;
      case 'hair':
        updateConfig({
          hairStyle: randomConfig.hairStyle,
          hairColor: randomConfig.hairColor
        });
        break;
      case 'clothing':
        updateConfig({
          topStyle: randomConfig.topStyle,
          topColor: randomConfig.topColor,
          bottomStyle: randomConfig.bottomStyle,
          bottomColor: randomConfig.bottomColor
        });
        break;
    }
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { delta: { x: number } }) => {
    setRotation(r => r + info.delta.x * 0.5);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'body':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="sims-section-title">Body Type</h3>
              <button 
                onClick={() => randomizeCategory('body')}
                className="sims-randomize text-xs"
              >
                <DiceIcon className="w-4 h-4 sims-dice" />
                Random
              </button>
            </div>
            
            <AvatarOptionSelector
              options={BODY_TYPES}
              value={config.bodyType}
              onChange={(v) => updateConfig({ bodyType: v })}
              columns={4}
              getIcon={(option) => {
                const IconComponent = BODY_TYPE_ICONS[option];
                return IconComponent ? <IconComponent className="w-8 h-10" /> : null;
              }}
            />
            
            <div className="sims-divider" />
            
            <h3 className="sims-section-title">Height</h3>
            <AvatarOptionSelector
              options={HEIGHTS}
              value={config.height}
              onChange={(v) => updateConfig({ height: v })}
              columns={3}
            />
          </div>
        );

      case 'skin':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="sims-section-title">Skin Tone</h3>
              <button 
                onClick={() => randomizeCategory('skin')}
                className="sims-randomize text-xs"
              >
                <DiceIcon className="w-4 h-4 sims-dice" />
                Random
              </button>
            </div>
            
            <ColorPalettePicker
              colors={SKIN_TONE_PALETTE}
              value={config.skinTone}
              onChange={(color) => updateConfig({ skinTone: color })}
              size="lg"
            />
          </div>
        );

      case 'face':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="sims-section-title">Facial Features</h3>
              <button 
                onClick={() => randomizeCategory('face')}
                className="sims-randomize text-xs"
              >
                <DiceIcon className="w-4 h-4 sims-dice" />
                Random
              </button>
            </div>
            
            <AvatarOptionSelector
              options={HEAD_SHAPES}
              value={config.headShape}
              onChange={(v) => updateConfig({ headShape: v })}
              label="Head Shape"
              columns={4}
              getIcon={(option) => {
                const IconComponent = HEAD_SHAPE_ICONS[option];
                return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
              }}
            />
            
            <div className="sims-divider" />
            
            <AvatarOptionSelector
              options={EYE_SHAPES}
              value={config.eyeShape}
              onChange={(v) => updateConfig({ eyeShape: v })}
              label="Eye Shape"
              columns={4}
            />
            
            <ColorPalettePicker
              colors={EYE_COLORS}
              value={config.eyeColor}
              onChange={(color) => updateConfig({ eyeColor: color })}
              size="md"
              label="Eye Color"
            />
            
            <div className="sims-divider" />
            
            <AvatarOptionSelector
              options={NOSE_TYPES}
              value={config.noseType}
              onChange={(v) => updateConfig({ noseType: v })}
              label="Nose Type"
              columns={4}
            />
            
            <AvatarOptionSelector
              options={MOUTH_TYPES}
              value={config.mouthType}
              onChange={(v) => updateConfig({ mouthType: v })}
              label="Mouth Type"
              columns={4}
            />
          </div>
        );

      case 'hair':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="sims-section-title">Hair Style</h3>
              <button 
                onClick={() => randomizeCategory('hair')}
                className="sims-randomize text-xs"
              >
                <DiceIcon className="w-4 h-4 sims-dice" />
                Random
              </button>
            </div>
            
            <AvatarOptionSelector
              options={HAIR_STYLES}
              value={config.hairStyle}
              onChange={(v) => updateConfig({ hairStyle: v })}
              columns={4}
              getIcon={(option) => {
                const IconComponent = HAIR_STYLE_ICONS[option];
                return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
              }}
            />
            
            <div className="sims-divider" />
            
            <h3 className="sims-section-title">Hair Color</h3>
            <p className="text-xs text-white/50 mb-3">Natural</p>
            <ColorPalettePicker
              colors={HAIR_COLOR_PALETTE.slice(0, 9)}
              value={config.hairColor}
              onChange={(color) => updateConfig({ hairColor: color })}
              size="md"
            />
            <p className="text-xs text-white/50 mb-3 mt-4">Fantasy</p>
            <ColorPalettePicker
              colors={HAIR_COLOR_PALETTE.slice(9)}
              value={config.hairColor}
              onChange={(color) => updateConfig({ hairColor: color })}
              size="md"
            />
          </div>
        );

      case 'clothing':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="sims-section-title">Outfit</h3>
              <button 
                onClick={() => randomizeCategory('clothing')}
                className="sims-randomize text-xs"
              >
                <DiceIcon className="w-4 h-4 sims-dice" />
                Random
              </button>
            </div>
            
            <AvatarOptionSelector
              options={TOP_STYLES}
              value={config.topStyle}
              onChange={(v) => updateConfig({ topStyle: v })}
              label="Top"
              columns={5}
              getIcon={(option) => {
                const IconComponent = TOP_STYLE_ICONS[option];
                return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
              }}
            />
            
            <ColorPalettePicker
              colors={CLOTHING_COLOR_PALETTE}
              value={config.topColor}
              onChange={(color) => updateConfig({ topColor: color })}
              size="md"
              label="Top Color"
            />
            
            <div className="sims-divider" />
            
            <AvatarOptionSelector
              options={BOTTOM_STYLES}
              value={config.bottomStyle}
              onChange={(v) => updateConfig({ bottomStyle: v })}
              label="Bottom"
              columns={4}
              getIcon={(option) => {
                const IconComponent = BOTTOM_STYLE_ICONS[option];
                return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
              }}
            />
            
            <ColorPalettePicker
              colors={CLOTHING_COLOR_PALETTE}
              value={config.bottomColor}
              onChange={(color) => updateConfig({ bottomColor: color })}
              size="md"
              label="Bottom Color"
            />
          </div>
        );

      default:
        return null;
    }
  };

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
          {/* Plumbob */}
          <div className="sims-plumbob w-6 h-8 text-emerald-400">
            <PlumbobIcon className="w-full h-full" />
          </div>

          {/* Mode Toggle - 4 mode selector */}
          {enableRPM && (
            <div className="flex gap-1 bg-card/50 backdrop-blur-sm rounded-xl p-1 mb-4 border border-border/50">
              {[
                { mode: 'procedural' as const, icon: Wand2, label: 'Chibi' },
                { mode: 'preset' as const, icon: Users, label: 'Presets' },
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
                animate={{ rotateY: avatarMode === 'procedural' ? rotation : 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="w-full h-full"
              >
                {avatarMode !== 'procedural' && (config.modelUrl || config.presetId) ? (
                  <AvatarLoader
                    avatarUrl={config.modelUrl}
                    avatarConfig={config}
                    size="full"
                    animated={true}
                  />
                ) : (
                  <SimsAvatar 
                    config={config} 
                    size="full"
                    animated={true}
                  />
                )}
              </motion.div>
              
              {/* Drag hint */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/40 pointer-events-none">
                ← drag to rotate →
              </div>
            </motion.div>
          </div>

          {/* Rotation controls */}
          <div className="flex items-center gap-3 mt-2">
            <motion.button
              onClick={() => setRotation(r => r - 45)}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={() => setRotation(0)}
              className="px-4 py-2 rounded-full bg-white/10 border border-white/20 flex items-center gap-2 text-white/70 text-sm hover:bg-white/20 hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
            
            <motion.button
              onClick={() => setRotation(r => r + 45)}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Randomize All / Edit buttons based on mode */}
          {avatarMode === 'procedural' && (
            <motion.button
              onClick={randomizeAll}
              className="sims-randomize mt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DiceIcon className="w-5 h-5 sims-dice" />
              Randomize All
            </motion.button>
          )}
          {avatarMode === 'rpm' && (
            <motion.button
              onClick={() => setShowRPMCreator(true)}
              className="sims-randomize mt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-5 h-5" />
              Edit Pro Avatar
            </motion.button>
          )}
        </motion.div>

        {/* Right: Customization Panels */}
        <motion.div 
          className="flex-1 lg:w-3/5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {avatarMode === 'rpm' && (
            /* RPM Mode - Show info and option to switch */
            <div className="sims-panel flex flex-col items-center justify-center h-[400px] text-center">
              <Globe className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Pro Avatar Active</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You're using a Ready Player Me avatar with realistic proportions and expressions.
              </p>
              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={() => setShowRPMCreator(true)}
                  className="sims-button px-6 py-3 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Globe className="w-5 h-5" />
                  Customize Pro Avatar
                </motion.button>
                <motion.button
                  onClick={switchToProceduralMode}
                  className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Switch to Chibi Style
                </motion.button>
              </div>
            </div>
          )}

          {avatarMode === 'preset' && (
            /* Preset GLB Mode */
            <div className="sims-panel">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Choose a Preset Character
              </h3>
              <PresetAvatarSelector
                source="glb"
                onSelect={(preset) => handlePresetSelected(preset as { id: string; url: string; thumbnail?: string })}
                selectedId={config.presetId}
                columns={4}
              />
              <motion.button
                onClick={switchToProceduralMode}
                className="mt-4 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                Or customize your own chibi
              </motion.button>
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
              <motion.button
                onClick={switchToProceduralMode}
                className="mt-4 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                Or customize your own chibi
              </motion.button>
            </div>
          )}

          {avatarMode === 'procedural' && (
            /* Procedural Mode - Show customization tabs */
            <>
              {/* Sims-style Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {tabConfig.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "sims-tab text-sm",
                      activeTab === tab.id && "active"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Panel Content */}
              <div className="sims-panel">
                <ScrollArea className="h-[320px] lg:h-[380px] pr-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderTabContent()}
                    </motion.div>
                  </AnimatePresence>
                </ScrollArea>
              </div>
            </>
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
                className="sims-button w-full flex items-center justify-center gap-2 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-5 h-5" />
                Continue with this Sim
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
