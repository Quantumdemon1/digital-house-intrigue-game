
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';
import type { Houseguest } from '@/models/houseguest';
import { HouseguestSelectionItem } from './HouseguestSelectionItem';

interface AllianceProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    members: string[];
    isPublic: boolean;
  }) => void;
}

const AllianceProposalModal: React.FC<AllianceProposalModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { game, relationshipSystem } = useGame();
  const { toast } = useToast();

  // State for the form
  const [allianceName, setAllianceName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');
  const [memberError, setMemberError] = useState('');
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAllianceName('');
      setIsPublic(false);
      setSelectedMembers([]);
      setNameError('');
      setMemberError('');
    }
  }, [isOpen]);

  // Get all eligible houseguests (excluding player)
  const eligibleHouseguests = game?.getActiveHouseguests().filter(hg => !hg.isPlayer) || [];
  const playerHouseguest = game?.houseguests.find(hg => hg.isPlayer);
  
  // Toggle selection of a houseguest
  const toggleHouseguest = (id: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(id)) {
        return prev.filter(memberId => memberId !== id);
      } else {
        return [...prev, id];
      }
    });
    // Clear error when selecting
    if (memberError) setMemberError('');
  };

  // Get relationship with a houseguest
  const getRelationshipScore = (houseguestId: string): number => {
    if (!relationshipSystem || !playerHouseguest) return 0;
    return relationshipSystem.getEffectiveRelationship(
      playerHouseguest.id,
      houseguestId
    );
  };

  // Get relationship level with a houseguest
  const getRelationshipLevel = (houseguestId: string): string => {
    if (!relationshipSystem || !playerHouseguest) return 'Unknown';
    return relationshipSystem.getRelationshipLevel(
      playerHouseguest.id,
      houseguestId
    );
  };
  
  // Validate and handle form submission
  const handleSubmit = () => {
    // Validate form
    let hasError = false;
    
    if (!allianceName.trim()) {
      setNameError('Alliance name is required');
      hasError = true;
    }
    
    if (selectedMembers.length < 1) {
      setMemberError('Select at least one houseguest');
      hasError = true;
    }
    
    if (hasError) return;
    
    // Confirm submission
    onSubmit({
      name: allianceName,
      members: selectedMembers,
      isPublic
    });
    
    toast({
      title: "Alliance Proposal",
      description: `Proposing alliance "${allianceName}" to selected houseguests.`,
    });
    
    // Close modal
    onClose();
  };
  
  // Generate a random alliance name suggestion
  const generateRandomName = () => {
    const prefixes = ['The', 'Team', 'Secret', 'Ultimate', 'Power', 'Stealth', 'Elite', 'Royal'];
    const nouns = ['Alliance', 'Squad', 'Brigade', 'Crew', 'Circle', 'Coalition', 'Syndicate', 'Council', 'Pact'];
    const adjectives = ['Loyal', 'Strong', 'Winning', 'Silent', 'Hidden', 'Golden', 'Perfect', 'Strategic'];
    
    const usePrefix = Math.random() > 0.5;
    const useAdjective = Math.random() > 0.3;
    
    let name = '';
    
    if (usePrefix) {
      name += prefixes[Math.floor(Math.random() * prefixes.length)] + ' ';
    }
    
    if (useAdjective) {
      name += adjectives[Math.floor(Math.random() * adjectives.length)] + ' ';
    }
    
    name += nouns[Math.floor(Math.random() * nouns.length)];
    
    setAllianceName(name);
    setNameError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2" /> Propose New Alliance
          </DialogTitle>
          <DialogDescription>
            Create a new alliance with your selected houseguests.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Alliance Name Input */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="alliance-name">Alliance Name</Label>
                <Input 
                  id="alliance-name" 
                  value={allianceName} 
                  onChange={(e) => {
                    setAllianceName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="Enter alliance name"
                  className={nameError ? "border-red-500" : ""}
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={generateRandomName}
              >
                Random
              </Button>
            </div>
          </div>
          
          {/* Public vs Secret Toggle */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Alliance Type</Label>
            <div className="flex gap-4 pt-1">
              <div 
                className={`border rounded p-3 flex-1 flex flex-col items-center gap-2 cursor-pointer ${!isPublic ? 'bg-primary/10 border-primary' : ''}`}
                onClick={() => setIsPublic(false)}
              >
                <EyeOff size={22} className={`${!isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-center">
                  <div className="font-medium text-sm">Secret Alliance</div>
                  <p className="text-xs text-muted-foreground">Only members know</p>
                </div>
              </div>
              
              <div 
                className={`border rounded p-3 flex-1 flex flex-col items-center gap-2 cursor-pointer ${isPublic ? 'bg-primary/10 border-primary' : ''}`}
                onClick={() => setIsPublic(true)}
              >
                <Eye size={22} className={`${isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-center">
                  <div className="font-medium text-sm">Public Alliance</div>
                  <p className="text-xs text-muted-foreground">Everyone knows</p>
                </div>
              </div>
            </div>
            
            {isPublic && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300">Public alliances are known to all houseguests</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Houseguest Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm text-muted-foreground">Select Members</Label>
              <Badge variant="outline" className="font-mono">
                {selectedMembers.length}/{eligibleHouseguests.length}
              </Badge>
            </div>
            
            {memberError && <p className="text-xs text-red-500">{memberError}</p>}
            
            <ScrollArea className="h-[240px] border rounded-md">
              <div className="p-2 space-y-1">
                {eligibleHouseguests.map(houseguest => (
                  <HouseguestSelectionItem
                    key={houseguest.id}
                    houseguest={houseguest}
                    isSelected={selectedMembers.includes(houseguest.id)}
                    relationshipScore={getRelationshipScore(houseguest.id)}
                    relationshipLevel={getRelationshipLevel(houseguest.id)} 
                    onToggle={() => toggleHouseguest(houseguest.id)}
                  />
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedMembers([])}
                disabled={selectedMembers.length === 0}
              >
                Clear All
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedMembers(eligibleHouseguests.map(hg => hg.id))}
                disabled={selectedMembers.length === eligibleHouseguests.length}
              >
                Select All
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!allianceName || selectedMembers.length === 0}
          >
            <Shield className="mr-2" />
            Propose Alliance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllianceProposalModal;
