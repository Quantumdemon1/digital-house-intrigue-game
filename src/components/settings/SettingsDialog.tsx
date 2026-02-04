import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  Zap, 
  Volume2, 
  VolumeX, 
  Brain, 
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { useSettings, GameSettings } from './SettingsProvider';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

const speedOptions = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
] as const;

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ trigger }) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative group"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display tracking-wide">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Game Settings
          </DialogTitle>
          <DialogDescription>
            Customize your gameplay experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              Theme
            </Label>
            <RadioGroup
              value={settings.theme}
              onValueChange={(value) => updateSetting('theme', value as GameSettings['theme'])}
              className="grid grid-cols-3 gap-2"
            >
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <div key={value}>
                  <RadioGroupItem
                    value={value}
                    id={`theme-${value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`theme-${value}`}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 border-muted p-3 cursor-pointer transition-all duration-200",
                      "hover:bg-accent/50 hover:border-primary/30",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                      "peer-data-[state=checked]:shadow-glow-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Animation Speed */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-bb-gold" />
              Animation Speed
            </Label>
            <RadioGroup
              value={settings.animationSpeed}
              onValueChange={(value) => updateSetting('animationSpeed', value as GameSettings['animationSpeed'])}
              className="grid grid-cols-3 gap-2"
            >
              {speedOptions.map(({ value, label }) => (
                <div key={value}>
                  <RadioGroupItem
                    value={value}
                    id={`speed-${value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`speed-${value}`}
                    className={cn(
                      "flex items-center justify-center rounded-lg border-2 border-muted p-2 cursor-pointer transition-all duration-200",
                      "hover:bg-accent/50 hover:border-primary/30",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                    )}
                  >
                    <span className="text-xs font-medium">{label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Toggle Options */}
          <div className="space-y-4">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound" className="text-sm">Sound Effects</Label>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>

            {/* AI Thoughts Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="ai-thoughts" className="text-sm">AI Thought Bubbles</Label>
              </div>
              <Switch
                id="ai-thoughts"
                checked={settings.showAIThoughts}
                onCheckedChange={(checked) => updateSetting('showAIThoughts', checked)}
              />
            </div>

            {/* Compact Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="compact" className="text-sm">Compact Mode</Label>
              </div>
              <Switch
                id="compact"
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
