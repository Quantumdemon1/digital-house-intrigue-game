/**
 * @file avatar-3d/PresetAvatarSelector.tsx
 * @description Grid UI for selecting preset avatars (GLB, VRM, or RPM) with category filtering
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, User, Sparkles, Filter, Bot, Cat, Beaker } from 'lucide-react';
import { PRESET_GLB_AVATARS, GLBPresetAvatar, GLBCategory } from '@/data/preset-glb-avatars';
import { PRESET_VRM_AVATARS, VRMPresetAvatar } from '@/data/preset-vrm-avatars';
import { PRESET_RPM_AVATARS, RPMPresetAvatar } from '@/data/preset-rpm-avatars';

export type PresetSource = 'glb' | 'vrm' | 'rpm';

type PresetAvatar = GLBPresetAvatar | VRMPresetAvatar | RPMPresetAvatar;

interface PresetAvatarSelectorProps {
  source: PresetSource;
  onSelect: (preset: PresetAvatar) => void;
  selectedId?: string;
  showFilters?: boolean;
  showCategoryFilter?: boolean;
  columns?: number;
  className?: string;
}

const PRESET_MAP: Record<PresetSource, PresetAvatar[]> = {
  glb: PRESET_GLB_AVATARS,
  vrm: PRESET_VRM_AVATARS,
  rpm: PRESET_RPM_AVATARS
};

const SOURCE_LABELS: Record<PresetSource, string> = {
  glb: 'Realistic',
  vrm: 'Anime',
  rpm: 'Pro Custom'
};

const CATEGORY_OPTIONS: { value: GLBCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: User },
  { value: 'humanoid', label: 'Human', icon: User },
  { value: 'robot', label: 'Robot', icon: Bot },
  { value: 'demo', label: 'Demo', icon: Beaker }
];

/**
 * Extract all unique styles from presets
 */
const getAvailableStyles = (presets: PresetAvatar[]): string[] => {
  const styles = new Set<string>();
  presets.forEach(preset => {
    if ('style' in preset && preset.style) {
      styles.add(preset.style);
    }
  });
  return Array.from(styles);
};

/**
 * Preset Avatar Selector Component
 */
export const PresetAvatarSelector: React.FC<PresetAvatarSelectorProps> = ({
  source,
  onSelect,
  selectedId,
  showFilters = true,
  showCategoryFilter = true,
  columns = 4,
  className
}) => {
  const [search, setSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GLBCategory | 'all'>('all');

  const presets = PRESET_MAP[source];
  const styles = useMemo(() => getAvailableStyles(presets), [presets]);
  const showCategories = showCategoryFilter && source === 'glb';

  // Filter presets
  const filteredPresets = useMemo(() => {
    return presets.filter(preset => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = preset.name.toLowerCase().includes(searchLower);
        const traitMatch = preset.traits?.some(t => 
          t.toLowerCase().includes(searchLower)
        );
        if (!nameMatch && !traitMatch) return false;
      }

      // Style filter
      if (selectedStyle && 'style' in preset) {
        if (preset.style !== selectedStyle) return false;
      }

      // Category filter (GLB only)
      if (selectedCategory !== 'all' && source === 'glb' && 'category' in preset) {
        const glbPreset = preset as GLBPresetAvatar;
        if (glbPreset.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [presets, search, selectedStyle, selectedCategory, source]);

  const gridCols = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }[columns] || 'grid-cols-4';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Source label */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="w-4 h-4" />
        <span>{SOURCE_LABELS[source]} Presets</span>
        <Badge variant="secondary" className="ml-auto">
          {presets.length} avatars
        </Badge>
      </div>

      {/* Search & Filters */}
      {showFilters && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or trait..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filters (GLB only) */}
          {showCategories && (
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1.5",
                    selectedCategory === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-accent"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Style filters */}
          {styles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStyle(null)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border transition-colors",
                  selectedStyle === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-accent"
                )}
              >
                All Styles
              </button>
              {styles.map(style => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-colors capitalize",
                    selectedStyle === style
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-accent"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Avatar Grid */}
      <ScrollArea className="h-[300px] pr-4">
        <div className={cn('grid gap-3', gridCols)}>
          <AnimatePresence mode="popLayout">
            {filteredPresets.map((preset, index) => (
              <motion.button
                key={preset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelect(preset)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden",
                  "border-2 transition-all duration-200",
                  "hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selectedId === preset.id
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50",
                  ('isPlaceholder' in preset && preset.isPlaceholder) && "opacity-70"
                )}
              >
                {/* Thumbnail */}
                {preset.thumbnail ? (
                  <img
                    src={preset.thumbnail}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Name overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs font-medium text-white truncate">
                    {preset.name}
                  </p>
                </div>

                {/* Selected indicator */}
                {selectedId === preset.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </motion.div>
                )}

                {/* Style badge */}
                {'style' in preset && preset.style && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 capitalize"
                  >
                    {preset.style}
                  </Badge>
                )}

                {/* Coming Soon badge for placeholders */}
                {('isPlaceholder' in preset && preset.isPlaceholder) && (
                  <Badge 
                    variant="outline" 
                    className="absolute bottom-8 right-2 text-[8px] px-1.5 py-0.5 bg-background/80"
                  >
                    Coming Soon
                  </Badge>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredPresets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Filter className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No avatars match your filters</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedStyle(null);
                setSelectedCategory('all');
              }}
              className="text-xs text-primary mt-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </ScrollArea>

      {/* Selected preview */}
      {selectedId && (
        <div className="text-xs text-muted-foreground text-center">
          Selected: <span className="font-medium text-foreground">
            {presets.find(p => p.id === selectedId)?.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default PresetAvatarSelector;
