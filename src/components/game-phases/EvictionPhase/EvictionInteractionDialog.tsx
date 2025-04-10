
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
    
    // Calculate actual relationship change based on multiple factors
    let actualRelationshipChange = option.relationshipChange;
    
    // Factor 1: Check if player's social stat meets the requirement
    const socialStatFactor = calculateSocialStatFactor(player, option);
    
    // Factor 2: Check trait compatibility
    const traitCompatibilityFactor = calculateTraitCompatibilityFactor(houseguest, option);
    
    // Apply both factors to the base relationship change
    actualRelationshipChange = Math.round(actualRelationshipChange * socialStatFactor * traitCompatibilityFactor);
    
    // Ensure relationship change is within reasonable bounds
    actualRelationshipChange = Math.max(-25, Math.min(25, actualRelationshipChange));
    
    // Update relationship based on the selected option
    dispatch({
      type: 'UPDATE_RELATIONSHIPS',
      payload: {
        guestId1: player.id,
        guestId2: houseguest.id,
        change: actualRelationshipChange,
        note: `Interaction during eviction phase: ${player.name} chose "${option.text.substring(0, 30)}..." (${actualRelationshipChange > 0 ? '+' : ''}${actualRelationshipChange})`
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
  
  // Calculate how player's social stat affects the interaction outcome
  const calculateSocialStatFactor = (player: Houseguest, option: InteractionOption): number => {
    if (!option.requiredSocialStat) return 1;
    
    // If player's social stat is much lower than required, reduce effectiveness
    if (player.stats.social < option.requiredSocialStat - 2) {
      const deficit = option.requiredSocialStat - player.stats.social;
      return Math.max(0.1, 1 - (deficit * 0.15)); // Up to 90% reduction for large deficits
    }
    
    // If player's social stat is slightly lower, minor reduction
    if (player.stats.social < option.requiredSocialStat) {
      return 0.75; // 25% reduction
    }
    
    // If player meets requirement, normal effectiveness
    if (player.stats.social === option.requiredSocialStat) {
      return 1;
    }
    
    // If player exceeds requirement, bonus effectiveness
    const excess = player.stats.social - option.requiredSocialStat;
    return Math.min(1.5, 1 + (excess * 0.1)); // Up to 50% bonus
  };
  
  // Calculate how houseguest's traits affect their reaction to the interaction
  const calculateTraitCompatibilityFactor = (houseguest: Houseguest, option: InteractionOption): number => {
    if (!option.compatibleTraits && !option.incompatibleTraits) return 1;
    
    let factor = 1;
    
    // Check for compatible traits (positive reaction)
    if (option.compatibleTraits) {
      const compatibleTraitsCount = houseguest.traits.filter(trait => 
        option.compatibleTraits?.includes(trait)
      ).length;
      
      factor += compatibleTraitsCount * 0.25; // +25% per compatible trait
    }
    
    // Check for incompatible traits (negative reaction)
    if (option.incompatibleTraits) {
      const incompatibleTraitsCount = houseguest.traits.filter(trait => 
        option.incompatibleTraits?.includes(trait)
      ).length;
      
      factor -= incompatibleTraitsCount * 0.5; // -50% per incompatible trait
    }
    
    return Math.max(0.1, factor); // Ensure minimum effectiveness of 10%
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
              targetHouseguest={houseguest} // Pass the houseguest directly instead of using localStorage
              onComplete={handleComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvictionInteractionDialog;
