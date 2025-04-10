
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';
import { InteractionOption } from './types/interactions';
import InteractionOptions from './InteractionOptions';
import InteractionResults from './InteractionResults';

interface EvictionInteractionDialogProps {
  open: boolean;
  houseguest: Houseguest;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

const EvictionInteractionDialog: React.FC<EvictionInteractionDialogProps> = ({
  open,
  houseguest,
  onClose,
  onComplete,
}) => {
  const { dispatch, getHouseguestById } = useGame();
  const [step, setStep] = useState<'options' | 'result'>('options');
  const [selectedOption, setSelectedOption] = useState<InteractionOption | null>(null);
  
  // Retrieve player information
  const player = getHouseguestById(
    localStorage.getItem('playerId') || ''
  );
  
  if (!player) return null;
  
  const handleSelectOption = (option: InteractionOption) => {
    setSelectedOption(option);
    setStep('result');
    
    // Calculate actual relationship change based on player's social stat
    let actualRelationshipChange = option.relationshipChange;
    
    // If there's a required social stat and the player doesn't meet it,
    // reduce the relationship gain or worsen the relationship loss
    if (option.requiredSocialStat && player.stats.social < option.requiredSocialStat) {
      // The deficit in social skills
      const socialDeficit = option.requiredSocialStat - player.stats.social;
      
      // If it was a positive change, reduce it based on deficit
      if (actualRelationshipChange > 0) {
        actualRelationshipChange = Math.max(0, actualRelationshipChange - (socialDeficit * 3));
      } 
      // If it was negative, make it more negative
      else {
        actualRelationshipChange -= (socialDeficit * 2);
      }
    } 
    // If player exceeds required social stat, give a bonus
    else if (option.requiredSocialStat && player.stats.social > option.requiredSocialStat + 2) {
      const socialBonus = player.stats.social - option.requiredSocialStat;
      if (actualRelationshipChange > 0) {
        actualRelationshipChange += Math.min(10, socialBonus * 2);
      }
    }
    
    // Update relationship based on the selected option
    dispatch({
      type: 'UPDATE_RELATIONSHIPS',
      payload: {
        guestId1: player.id,
        guestId2: houseguest.id,
        change: actualRelationshipChange,
        note: `Interaction during eviction phase: ${player.name} chose "${option.text.substring(0, 30)}..."`
      }
    });
    
    // Log the interaction
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: 0, // This will be replaced with the actual week from the state
        phase: 'Eviction',
        type: 'interaction',
        description: `${player.name} had a conversation with ${houseguest.name}.`,
        involvedHouseguests: [player.id, houseguest.id]
      }
    });
  };
  
  const handleComplete = () => {
    onComplete(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Conversation with {houseguest.name}
          </DialogTitle>
          <DialogDescription>
            Choose how to approach {houseguest.name}
            {houseguest.traits.length > 0 && (
              <div className="mt-2">
                <span className="text-sm font-medium">Traits: </span>
                <span className="text-sm">{houseguest.traits.join(', ')}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          {step === 'options' && (
            <InteractionOptions 
              houseguest={houseguest} 
              onSelectOption={handleSelectOption} 
            />
          )}
          
          {step === 'result' && selectedOption && player && (
            <InteractionResults
              selectedOption={selectedOption}
              player={player}
              onComplete={handleComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvictionInteractionDialog;
