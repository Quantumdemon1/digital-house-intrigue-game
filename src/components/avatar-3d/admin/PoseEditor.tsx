/**
 * @file admin/PoseEditor.tsx
 * @description Admin UI for manually adjusting avatar poses with real-time preview
 * Now supports per-character pose customization
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  RotateCcw, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Copy,
  Info,
  ClipboardPaste,
  Users,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  STATIC_POSES,
  ADJUSTABLE_BONES,
  type StaticPoseType,
  type AdjustableBone,
  getPoseOverrides,
  saveSinglePoseOverride,
  clearPoseOverride,
  hasCharacterPoseOverride,
  getEffectivePoseForCharacter,
} from '../animation/poses/PoseLibrary';
import type { BoneRotation } from '../animation/types';

// Validation schema for imported pose data
const boneRotationSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const poseDataSchema = z.record(z.string(), boneRotationSchema);

/** Character info for the selector */
export interface CharacterOption {
  id: string;
  name: string;
}

interface PoseEditorProps {
  isVisible: boolean;
  onClose: () => void;
  currentPose: StaticPoseType;
  onPoseChange: (pose: StaticPoseType) => void;
  /** Callback to apply live preview of bone adjustments */
  onBoneAdjust?: (bones: Record<string, BoneRotation>) => void;
  /** List of available characters for per-character editing */
  characters?: CharacterOption[];
  /** Currently selected character ID (null = global) */
  selectedCharacterId?: string | null;
  /** Callback when character selection changes */
  onCharacterChange?: (characterId: string | null) => void;
}

const ROTATION_LIMITS = {
  min: -Math.PI,
  max: Math.PI,
  step: 0.01,
};

const BONE_GROUPS = {
  'Core': ['Hips', 'Spine', 'Spine1', 'Spine2'],
  'Head': ['Neck', 'Head'],
  'Left Arm': ['LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand'],
  'Right Arm': ['RightShoulder', 'RightArm', 'RightForeArm', 'RightHand'],
} as const;

export const PoseEditor: React.FC<PoseEditorProps> = ({
  isVisible,
  onClose,
  currentPose,
  onPoseChange,
  onBoneAdjust,
  characters = [],
  selectedCharacterId = null,
  onCharacterChange,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Left Arm', 'Right Arm']));
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Current bone adjustments state
  const [boneAdjustments, setBoneAdjustments] = useState<Record<string, BoneRotation>>(() => {
    const pose = getEffectivePoseForCharacter(currentPose, selectedCharacterId ?? undefined);
    return pose.bones;
  });
  
  // Reload bone adjustments when pose or character changes
  useEffect(() => {
    const pose = getEffectivePoseForCharacter(currentPose, selectedCharacterId ?? undefined);
    setBoneAdjustments(pose.bones);
    onBoneAdjust?.(pose.bones);
  }, [currentPose, selectedCharacterId]);
  
  // Check if we have unsaved changes
  const hasChanges = useMemo(() => {
    const pose = getEffectivePoseForCharacter(currentPose, selectedCharacterId ?? undefined);
    return JSON.stringify(boneAdjustments) !== JSON.stringify(pose.bones);
  }, [boneAdjustments, currentPose, selectedCharacterId]);
  
  // Check if we have saved overrides (for current character or global)
  const hasOverrides = useMemo(() => {
    const overrides = getPoseOverrides();
    if (selectedCharacterId) {
      // Check for character-specific override
      return !!overrides[`${currentPose}:${selectedCharacterId}`];
    }
    // Check for global override
    return !!overrides[currentPose];
  }, [currentPose, selectedCharacterId]);
  
  // Handle pose type change
  const handlePoseChange = useCallback((pose: StaticPoseType) => {
    onPoseChange(pose);
  }, [onPoseChange]);
  
  // Handle character selection change
  const handleCharacterChange = useCallback((value: string) => {
    const charId = value === 'global' ? null : value;
    onCharacterChange?.(charId);
  }, [onCharacterChange]);
  
  // Handle bone rotation change
  const handleBoneRotation = useCallback((
    boneName: string,
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    setBoneAdjustments(prev => {
      const current = prev[boneName] || { x: 0, y: 0, z: 0 };
      const updated = {
        ...prev,
        [boneName]: {
          ...current,
          [axis]: value,
        },
      };
      
      // Live preview
      onBoneAdjust?.(updated);
      
      return updated;
    });
  }, [onBoneAdjust]);
  
  // Reset to base pose (or parent level)
  const handleReset = useCallback(() => {
    // Get the effective pose (will cascade through fallback chain)
    const pose = getEffectivePoseForCharacter(currentPose, selectedCharacterId ?? undefined);
    const newBones = { ...pose.bones };
    setBoneAdjustments(() => newBones);
    onBoneAdjust?.(newBones);
    toast.info('Reset to default pose');
  }, [currentPose, selectedCharacterId, onBoneAdjust]);
  
  // Save overrides
  const handleSave = useCallback(() => {
    saveSinglePoseOverride(currentPose, boneAdjustments, selectedCharacterId ?? undefined);
    const targetName = selectedCharacterId 
      ? characters.find(c => c.id === selectedCharacterId)?.name || selectedCharacterId
      : 'All Characters';
    toast.success(`Saved pose override for "${currentPose}" (${targetName})`);
  }, [currentPose, boneAdjustments, selectedCharacterId, characters]);
  
  // Clear saved overrides
  const handleClearOverride = useCallback(() => {
    clearPoseOverride(currentPose, selectedCharacterId ?? undefined);
    // Reload from parent level
    const pose = getEffectivePoseForCharacter(currentPose, selectedCharacterId ?? undefined);
    setBoneAdjustments(pose.bones);
    onBoneAdjust?.(pose.bones);
    const targetName = selectedCharacterId 
      ? characters.find(c => c.id === selectedCharacterId)?.name || selectedCharacterId
      : 'All Characters';
    toast.info(`Cleared override for "${currentPose}" (${targetName})`);
  }, [currentPose, selectedCharacterId, characters, onBoneAdjust]);
  
  // Copy current values to clipboard
  const handleCopyValues = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(boneAdjustments, null, 2));
    toast.success('Copied bone rotations to clipboard');
  }, [boneAdjustments]);
  
  // Paste/Import state
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  
  // Handle paste import
  const handlePasteImport = useCallback(() => {
    setPasteError(null);
    
    try {
      const parsed = JSON.parse(pasteValue.trim());
      const validated = poseDataSchema.parse(parsed) as Record<string, BoneRotation>;
      
      // Merge with existing adjustments (only overwrite provided bones)
      setBoneAdjustments(prev => {
        const merged: Record<string, BoneRotation> = { ...prev, ...validated };
        onBoneAdjust?.(merged);
        return merged;
      });
      
      setShowPasteDialog(false);
      setPasteValue('');
      toast.success('Pose data imported successfully');
    } catch (err) {
      if (err instanceof SyntaxError) {
        setPasteError('Invalid JSON format. Please check your input.');
      } else if (err instanceof z.ZodError) {
        setPasteError('Invalid pose data. Each bone must have x, y, z number values.');
      } else {
        setPasteError('Failed to parse pose data.');
      }
    }
  }, [pasteValue, onBoneAdjust]);
  
  const handleOpenPasteDialog = useCallback(() => {
    setPasteValue('');
    setPasteError(null);
    setShowPasteDialog(true);
  }, []);
  
  // Toggle group expansion
  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);
  
  const formatRadian = (value: number) => `${(value * 180 / Math.PI).toFixed(1)}°`;
  
  // Get display name for current editing target
  const editingTargetName = useMemo(() => {
    if (!selectedCharacterId) return 'All Characters (Global)';
    const char = characters.find(c => c.id === selectedCharacterId);
    return char?.name || selectedCharacterId;
  }, [selectedCharacterId, characters]);
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-4 top-20 bottom-4 w-80 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Pose Editor</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">
                    Adjust bone rotations in real-time. Changes are saved to localStorage and persist across sessions. Select a character for individual customization.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Character Selector */}
        {characters.length > 0 && (
          <div className="p-3 border-b border-border bg-accent/20">
            <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
              {selectedCharacterId ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              Editing Target
            </label>
            <Select 
              value={selectedCharacterId ?? 'global'} 
              onValueChange={handleCharacterChange}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global" className="text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    All Characters (Global)
                  </span>
                </SelectItem>
                {characters.map((char) => (
                  <SelectItem key={char.id} value={char.id} className="text-sm">
                    <span className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {char.name}
                      {hasCharacterPoseOverride(currentPose, char.id) && (
                        <span className="text-[10px] text-amber-500">●</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Pose Selector */}
        <div className="p-3 border-b border-border">
          <label className="text-xs text-muted-foreground mb-1.5 block">Base Pose</label>
          <Select value={currentPose} onValueChange={(v) => handlePoseChange(v as StaticPoseType)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(STATIC_POSES).map((pose) => (
                <SelectItem key={pose} value={pose} className="text-sm">
                  {pose.charAt(0).toUpperCase() + pose.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Actions Bar */}
        <div className="flex items-center gap-1 p-2 border-b border-border">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={handleReset}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          {hasOverrides && (
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={handleClearOverride}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCopyValues}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleOpenPasteDialog}
          >
            <ClipboardPaste className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Paste Import Dialog */}
        <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Pose Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Paste JSON bone rotation data to apply to the current pose.
              </p>
              <Textarea
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder='{"LeftArm": {"x": 0.12, "y": 0.05, "z": 0.27}, ...}'
                className="min-h-[200px] font-mono text-xs"
              />
              {pasteError && (
                <p className="text-sm text-destructive">{pasteError}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasteImport} disabled={!pasteValue.trim()}>
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Bone Groups */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {Object.entries(BONE_GROUPS).map(([groupName, bones]) => (
            <div key={groupName} className="border border-border rounded-md overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-2 bg-muted/30 hover:bg-muted/50 transition-colors"
                onClick={() => toggleGroup(groupName)}
              >
                <span className="text-xs font-medium">{groupName}</span>
                {expandedGroups.has(groupName) ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedGroups.has(groupName) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-3">
                      {bones.map((boneName) => {
                        const rotation = boneAdjustments[boneName] || { x: 0, y: 0, z: 0 };
                        
                        return (
                          <div key={boneName} className="space-y-1.5">
                            <div className="text-xs font-medium text-muted-foreground">
                              {boneName}
                            </div>
                            
                        {/* X axis */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-destructive w-3">X</span>
                              <Slider
                                value={[rotation.x]}
                                min={ROTATION_LIMITS.min}
                                max={ROTATION_LIMITS.max}
                                step={ROTATION_LIMITS.step}
                                onValueChange={([v]) => handleBoneRotation(boneName, 'x', v)}
                                className="flex-1"
                              />
                              <span className="text-[10px] text-muted-foreground w-10 text-right">
                                {formatRadian(rotation.x)}
                              </span>
                            </div>
                            
                            {/* Y axis */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-primary w-3">Y</span>
                              <Slider
                                value={[rotation.y]}
                                min={ROTATION_LIMITS.min}
                                max={ROTATION_LIMITS.max}
                                step={ROTATION_LIMITS.step}
                                onValueChange={([v]) => handleBoneRotation(boneName, 'y', v)}
                                className="flex-1"
                              />
                              <span className="text-[10px] text-muted-foreground w-10 text-right">
                                {formatRadian(rotation.y)}
                              </span>
                            </div>
                            
                            {/* Z axis */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-accent-foreground w-3">Z</span>
                              <Slider
                                value={[rotation.z]}
                                min={ROTATION_LIMITS.min}
                                max={ROTATION_LIMITS.max}
                                step={ROTATION_LIMITS.step}
                                onValueChange={([v]) => handleBoneRotation(boneName, 'z', v)}
                                className="flex-1"
                              />
                              <span className="text-[10px] text-muted-foreground w-10 text-right">
                                {formatRadian(rotation.z)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center justify-between p-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          <span>
            {hasChanges ? '• Unsaved changes' : '✓ Up to date'}
          </span>
          <span className="flex items-center gap-1">
            {hasOverrides && <span className="text-amber-500">📌</span>}
            {editingTargetName}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PoseEditor;