/**
 * @file avatar-3d/AvatarCustomizer.tsx
 * @description Full Sims-style 3D avatar customization interface
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Palette, Eye, Scissors, Shirt, 
  Shuffle, RotateCcw, ChevronLeft, ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  Avatar3DConfig, 
  generateDefaultConfig,
  BodyType, HeightType, HeadShape, EyeShape, NoseType, MouthType,
  HairStyle, TopStyle, BottomStyle,
  SKIN_TONE_PALETTE, HAIR_COLOR_PALETTE, CLOTHING_COLOR_PALETTE
} from '@/models/avatar-config';
import { SimsAvatar } from './SimsAvatar';
import { AvatarCanvas } from './AvatarCanvas';
import { ColorPalettePicker } from './ColorPalettePicker';
import { AvatarOptionSelector } from './AvatarOptionSelector';

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
  className?: string;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  initialConfig,
  onChange,
  onComplete,
  showCompleteButton = true,
  className
}) => {
  const [config, setConfig] = useState<Avatar3DConfig>(initialConfig || generateDefaultConfig());
  const [rotation, setRotation] = useState(0);
  const [activeTab, setActiveTab] = useState('body');

  const updateConfig = useCallback((updates: Partial<Avatar3DConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  }, [config, onChange]);

  const randomizeAll = () => {
    const newConfig = generateDefaultConfig();
    setConfig(newConfig);
    onChange(newConfig);
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

  const tabConfig = [
    { id: 'body', label: 'Body', icon: User },
    { id: 'skin', label: 'Skin', icon: Palette },
    { id: 'face', label: 'Face', icon: Eye },
    { id: 'hair', label: 'Hair', icon: Scissors },
    { id: 'clothing', label: 'Clothes', icon: Shirt },
  ];

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6', className)}>
      {/* Left: 3D Preview */}
      <motion.div 
        className="flex flex-col items-center gap-4 lg:w-1/3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 -m-4 rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-black/80 blur-sm" />
          
          {/* Avatar container */}
          <motion.div 
            className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)'
            }}
            animate={{ rotateY: rotation }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <SimsAvatar 
              config={config} 
              size="full"
              animated={true}
            />
          </motion.div>
        </div>

        {/* Rotation controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRotation(r => r - 45)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotation(0)}
            className="gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRotation(r => r + 45)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Randomize All */}
        <Button
          variant="secondary"
          onClick={randomizeAll}
          className="gap-2 w-full max-w-xs"
        >
          <Shuffle className="h-4 w-4" />
          Randomize All
        </Button>
      </motion.div>

      {/* Right: Customization Panels */}
      <motion.div 
        className="flex-1 lg:w-2/3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            {tabConfig.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
            <ScrollArea className="h-[300px] lg:h-[350px] pr-4">
              {/* Body Tab */}
              <TabsContent value="body" className="m-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Body Shape</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => randomizeCategory('body')}
                    className="gap-1 text-xs"
                  >
                    <Shuffle className="h-3 w-3" />
                    Random
                  </Button>
                </div>
                
                <AvatarOptionSelector
                  options={BODY_TYPES}
                  value={config.bodyType}
                  onChange={(v) => updateConfig({ bodyType: v })}
                  label="Body Type"
                  columns={4}
                />
                
                <AvatarOptionSelector
                  options={HEIGHTS}
                  value={config.height}
                  onChange={(v) => updateConfig({ height: v })}
                  label="Height"
                  columns={3}
                />
              </TabsContent>

              {/* Skin Tab */}
              <TabsContent value="skin" className="m-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Skin Tone</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => randomizeCategory('skin')}
                    className="gap-1 text-xs"
                  >
                    <Shuffle className="h-3 w-3" />
                    Random
                  </Button>
                </div>
                
                <ColorPalettePicker
                  colors={SKIN_TONE_PALETTE}
                  value={config.skinTone}
                  onChange={(color) => updateConfig({ skinTone: color })}
                  size="lg"
                  label="Choose your skin tone"
                />
              </TabsContent>

              {/* Face Tab */}
              <TabsContent value="face" className="m-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Facial Features</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => randomizeCategory('face')}
                    className="gap-1 text-xs"
                  >
                    <Shuffle className="h-3 w-3" />
                    Random
                  </Button>
                </div>
                
                <AvatarOptionSelector
                  options={HEAD_SHAPES}
                  value={config.headShape}
                  onChange={(v) => updateConfig({ headShape: v })}
                  label="Head Shape"
                  columns={4}
                />
                
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
              </TabsContent>

              {/* Hair Tab */}
              <TabsContent value="hair" className="m-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Hair Style</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => randomizeCategory('hair')}
                    className="gap-1 text-xs"
                  >
                    <Shuffle className="h-3 w-3" />
                    Random
                  </Button>
                </div>
                
                <AvatarOptionSelector
                  options={HAIR_STYLES}
                  value={config.hairStyle}
                  onChange={(v) => updateConfig({ hairStyle: v })}
                  label="Style"
                  columns={4}
                />
                
                <ColorPalettePicker
                  colors={HAIR_COLOR_PALETTE}
                  value={config.hairColor}
                  onChange={(color) => updateConfig({ hairColor: color })}
                  size="md"
                  label="Hair Color"
                />
              </TabsContent>

              {/* Clothing Tab */}
              <TabsContent value="clothing" className="m-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Outfit</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => randomizeCategory('clothing')}
                    className="gap-1 text-xs"
                  >
                    <Shuffle className="h-3 w-3" />
                    Random
                  </Button>
                </div>
                
                <AvatarOptionSelector
                  options={TOP_STYLES}
                  value={config.topStyle}
                  onChange={(v) => updateConfig({ topStyle: v })}
                  label="Top"
                  columns={5}
                />
                
                <ColorPalettePicker
                  colors={CLOTHING_COLOR_PALETTE}
                  value={config.topColor}
                  onChange={(color) => updateConfig({ topColor: color })}
                  size="md"
                  label="Top Color"
                />
                
                <AvatarOptionSelector
                  options={BOTTOM_STYLES}
                  value={config.bottomStyle}
                  onChange={(v) => updateConfig({ bottomStyle: v })}
                  label="Bottom"
                  columns={4}
                />
                
                <ColorPalettePicker
                  colors={CLOTHING_COLOR_PALETTE}
                  value={config.bottomColor}
                  onChange={(color) => updateConfig({ bottomColor: color })}
                  size="md"
                  label="Bottom Color"
                />
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>

        {/* Complete Button */}
        {showCompleteButton && onComplete && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={onComplete}
              variant="dramatic"
              size="lg"
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Continue with this Avatar
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AvatarCustomizer;
