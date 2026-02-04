/**
 * @file src/components/social-network/PerceptionEditorDialog.tsx
 * @description Dialog for editing player's perception of a houseguest
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Houseguest } from '@/models/houseguest';
import { 
  PlayerPerception, 
  RelationshipLevel, 
  CustomAlliance,
  createDefaultPerception 
} from '@/models/player-perception';
import { cn } from '@/lib/utils';
import { Shield, Target, Users, Heart, Skull } from 'lucide-react';

interface PerceptionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  houseguest: Houseguest | null;
  perception: PlayerPerception | null;
  customAlliances: CustomAlliance[];
  actualRelationshipScore?: number;
  onSave: (perception: PlayerPerception) => void;
}

const RELATIONSHIP_LEVELS: { value: RelationshipLevel; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'ally', label: 'Ally', icon: <Shield className="h-4 w-4" />, color: 'bg-green-500' },
  { value: 'friend', label: 'Friend', icon: <Heart className="h-4 w-4" />, color: 'bg-emerald-400' },
  { value: 'neutral', label: 'Neutral', icon: <Users className="h-4 w-4" />, color: 'bg-amber-400' },
  { value: 'rival', label: 'Rival', icon: <Target className="h-4 w-4" />, color: 'bg-orange-400' },
  { value: 'enemy', label: 'Enemy', icon: <Skull className="h-4 w-4" />, color: 'bg-red-500' },
];

const PerceptionEditorDialog: React.FC<PerceptionEditorDialogProps> = ({
  open,
  onOpenChange,
  houseguest,
  perception,
  customAlliances,
  actualRelationshipScore = 0,
  onSave
}) => {
  const [editedPerception, setEditedPerception] = useState<PlayerPerception | null>(null);
  const [selectedAllianceId, setSelectedAllianceId] = useState<string>('none');
  
  // Initialize state when dialog opens
  useEffect(() => {
    if (houseguest && open) {
      const currentPerception = perception || createDefaultPerception(houseguest.id);
      setEditedPerception(currentPerception);
      
      // Find which alliance this houseguest is in
      const memberAlliance = customAlliances.find(a => 
        a.memberIds.includes(houseguest.id)
      );
      setSelectedAllianceId(memberAlliance?.id || 'none');
    }
  }, [houseguest, perception, customAlliances, open]);
  
  if (!houseguest || !editedPerception) return null;
  
  const handleRelationshipLevelChange = (level: RelationshipLevel | null) => {
    setEditedPerception(prev => prev ? {
      ...prev,
      customRelationshipLevel: level,
      lastUpdated: Date.now()
    } : null);
  };
  
  const handleThreatChange = (level: number) => {
    setEditedPerception(prev => prev ? {
      ...prev,
      threatLevel: level,
      lastUpdated: Date.now()
    } : null);
  };
  
  const handleTrustChange = (level: number) => {
    setEditedPerception(prev => prev ? {
      ...prev,
      trustLevel: level,
      lastUpdated: Date.now()
    } : null);
  };
  
  const handleNotesChange = (notes: string) => {
    setEditedPerception(prev => prev ? {
      ...prev,
      notes,
      lastUpdated: Date.now()
    } : null);
  };
  
  const handleSave = () => {
    if (editedPerception) {
      // Update alliance membership through the alliance itself, not the perception
      onSave({
        ...editedPerception,
        inMyAlliance: selectedAllianceId !== 'none'
      });
      onOpenChange(false);
    }
  };
  
  const getStatusLabel = () => {
    if (houseguest.isHoH) return 'Head of Household';
    if (houseguest.isPovHolder) return 'PoV Holder';
    if (houseguest.isNominated) return 'Nominated';
    if (houseguest.status === 'Evicted') return 'Evicted';
    if (houseguest.status === 'Jury') return 'Jury Member';
    return 'Houseguest';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Your View
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Houseguest Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
            <StatusAvatar 
              name={houseguest.name}
              status={houseguest.isHoH ? 'hoh' : houseguest.isNominated ? 'nominee' : 'none'}
              size="lg"
              isPlayer={false}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{houseguest.name}</h3>
              <p className="text-sm text-muted-foreground">{getStatusLabel()}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Actual relationship:</span>
                <Badge variant={actualRelationshipScore >= 50 ? 'default' : actualRelationshipScore >= 0 ? 'secondary' : 'destructive'}>
                  {actualRelationshipScore > 0 ? '+' : ''}{actualRelationshipScore}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Relationship Level */}
          <div className="space-y-3">
            <Label>How do you see them?</Label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  type="button"
                  variant={editedPerception.customRelationshipLevel === level.value ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'flex items-center gap-1.5',
                    editedPerception.customRelationshipLevel === level.value && level.color
                  )}
                  onClick={() => handleRelationshipLevelChange(
                    editedPerception.customRelationshipLevel === level.value ? null : level.value
                  )}
                >
                  {level.icon}
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Threat Level */}
          <div className="space-y-3">
            <Label>Threat Level</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={editedPerception.threatLevel === level ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'w-10 h-10',
                    editedPerception.threatLevel === level && 
                      (level >= 4 ? 'bg-bb-red hover:bg-bb-red/90' : 
                       level >= 2 ? 'bg-amber-500 hover:bg-amber-500/90' : 
                       'bg-green-500 hover:bg-green-500/90')
                  )}
                  onClick={() => handleThreatChange(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {editedPerception.threatLevel <= 2 ? 'Low threat' : 
               editedPerception.threatLevel <= 3 ? 'Moderate threat' : 'High threat'}
            </p>
          </div>
          
          {/* Trust Level */}
          <div className="space-y-3">
            <Label>Trust Level</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={editedPerception.trustLevel === level ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'w-10 h-10',
                    editedPerception.trustLevel === level && 
                      (level >= 4 ? 'bg-green-500 hover:bg-green-500/90' : 
                       level >= 2 ? 'bg-amber-500 hover:bg-amber-500/90' : 
                       'bg-bb-red hover:bg-bb-red/90')
                  )}
                  onClick={() => handleTrustChange(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {editedPerception.trustLevel <= 2 ? 'Untrustworthy' : 
               editedPerception.trustLevel <= 3 ? 'Neutral' : 'Trustworthy'}
            </p>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Your Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add private notes about this houseguest..."
              value={editedPerception.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
          
          {/* Alliance Assignment */}
          {customAlliances.length > 0 && (
            <div className="space-y-2">
              <Label>Add to Alliance</Label>
              <Select value={selectedAllianceId} onValueChange={setSelectedAllianceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an alliance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No alliance</SelectItem>
                  {customAlliances.map((alliance) => (
                    <SelectItem key={alliance.id} value={alliance.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: alliance.color }}
                        />
                        {alliance.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Perception
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PerceptionEditorDialog;
