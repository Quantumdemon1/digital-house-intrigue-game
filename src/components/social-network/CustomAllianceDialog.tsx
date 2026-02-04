/**
 * @file src/components/social-network/CustomAllianceDialog.tsx
 * @description Dialog for creating/editing player's custom alliance groupings
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Houseguest } from '@/models/houseguest';
import { CustomAlliance, ALLIANCE_COLORS, getNextAllianceColor } from '@/models/player-perception';
import { cn } from '@/lib/utils';
import { Trash2, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CustomAllianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAlliance?: CustomAlliance;
  houseguests: Houseguest[];
  existingAlliances: CustomAlliance[];
  onSave: (alliance: CustomAlliance) => void;
  onDelete?: (id: string) => void;
}

const CustomAllianceDialog: React.FC<CustomAllianceDialogProps> = ({
  open,
  onOpenChange,
  existingAlliance,
  houseguests,
  existingAlliances,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(ALLIANCE_COLORS[0]);
  
  // Initialize state when dialog opens
  useEffect(() => {
    if (open) {
      if (existingAlliance) {
        setName(existingAlliance.name);
        setSelectedMembers(existingAlliance.memberIds);
        setSelectedColor(existingAlliance.color);
      } else {
        setName('');
        setSelectedMembers([]);
        const existingColors = existingAlliances.map(a => a.color);
        setSelectedColor(getNextAllianceColor(existingColors));
      }
    }
  }, [open, existingAlliance, existingAlliances]);
  
  const activeHouseguests = houseguests.filter(h => h.status === 'Active');
  
  const handleMemberToggle = (houseguestId: string) => {
    setSelectedMembers(prev => 
      prev.includes(houseguestId)
        ? prev.filter(id => id !== houseguestId)
        : [...prev, houseguestId]
    );
  };
  
  const handleSave = () => {
    if (!name.trim() || selectedMembers.length === 0) return;
    
    const alliance: CustomAlliance = {
      id: existingAlliance?.id || uuidv4(),
      name: name.trim(),
      memberIds: selectedMembers,
      color: selectedColor,
      createdAt: existingAlliance?.createdAt || Date.now()
    };
    
    onSave(alliance);
    onOpenChange(false);
  };
  
  const handleDelete = () => {
    if (existingAlliance && onDelete) {
      onDelete(existingAlliance.id);
      onOpenChange(false);
    }
  };
  
  const isValid = name.trim().length > 0 && selectedMembers.length > 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {existingAlliance ? 'Edit Alliance' : 'Create Alliance'}
          </DialogTitle>
          <DialogDescription>
            Create your own alliance groups to track relationships. These are private notes and don't affect gameplay.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Alliance Name */}
          <div className="space-y-2">
            <Label htmlFor="alliance-name">Alliance Name</Label>
            <Input
              id="alliance-name"
              placeholder="e.g., The Core Four"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </div>
          
          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Alliance Color</Label>
            <div className="flex flex-wrap gap-2">
              {ALLIANCE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    selectedColor === color 
                      ? 'border-foreground scale-110' 
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          
          {/* Member Selection */}
          <div className="space-y-2">
            <Label>Select Members ({selectedMembers.length} selected)</Label>
            <ScrollArea className="h-[200px] border rounded-lg p-2">
              <div className="space-y-1">
                {activeHouseguests.map((houseguest) => (
                  <div
                    key={houseguest.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                      selectedMembers.includes(houseguest.id) 
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => handleMemberToggle(houseguest.id)}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(houseguest.id)}
                      onCheckedChange={() => handleMemberToggle(houseguest.id)}
                    />
                    <StatusAvatar
                      name={houseguest.name}
                      status={houseguest.isHoH ? 'hoh' : houseguest.isNominated ? 'nominee' : 'none'}
                      size="sm"
                      isPlayer={houseguest.isPlayer}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{houseguest.name}</p>
                      {houseguest.isPlayer && (
                        <span className="text-xs text-bb-blue font-semibold">YOU</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {existingAlliance && onDelete && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Alliance
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {existingAlliance ? 'Save Changes' : 'Create Alliance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomAllianceDialog;
