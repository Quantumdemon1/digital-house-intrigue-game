
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';
import { Heart, HeartOff } from 'lucide-react';

interface InteractionOption {
  id: string;
  text: string;
  responseText: string;
  relationshipChange: number;
}

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
  
  // Generate interaction options based on the houseguest's traits
  const getInteractionOptions = (): InteractionOption[] => {
    const options: InteractionOption[] = [
      {
        id: 'emotional',
        text: `Appeal to ${houseguest.name}'s emotions and share how much you want to stay.`,
        responseText: houseguest.traits.includes('Emotional') 
          ? `${houseguest.name} is moved by your sincerity.`
          : `${houseguest.name} seems unmoved by emotional appeals.`,
        relationshipChange: houseguest.traits.includes('Emotional') ? 15 : -5,
      },
      {
        id: 'logical',
        text: `Make a strategic case about why keeping you benefits ${houseguest.name}'s game.`,
        responseText: houseguest.traits.includes('Strategic') || houseguest.traits.includes('Analytical')
          ? `${houseguest.name} appreciates your logical approach to the game.`
          : `${houseguest.name} seems skeptical of your strategic reasoning.`,
        relationshipChange: (houseguest.traits.includes('Strategic') || houseguest.traits.includes('Analytical')) ? 15 : -5,
      },
      {
        id: 'loyalty',
        text: `Remind ${houseguest.name} of your loyalty and offer future protection.`,
        responseText: houseguest.traits.includes('Loyal') 
          ? `${houseguest.name} values loyalty and appreciates your commitment.`
          : `${houseguest.name} questions your promises of future protection.`,
        relationshipChange: houseguest.traits.includes('Loyal') ? 15 : -5,
      },
    ];
    
    return options;
  };
  
  const handleSelectOption = (option: InteractionOption) => {
    setSelectedOption(option);
    setStep('result');
    
    // Update relationship based on the selected option
    dispatch({
      type: 'UPDATE_RELATIONSHIPS',
      payload: {
        guestId1: player.id,
        guestId2: houseguest.id,
        change: option.relationshipChange,
        note: `Interaction during eviction phase, Week ${player.name} chose: "${option.text.substring(0, 30)}..."`
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
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          {step === 'options' && (
            <div className="space-y-3">
              {getInteractionOptions().map(option => (
                <Button
                  key={option.id}
                  variant="outline" 
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => handleSelectOption(option)}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          )}
          
          {step === 'result' && selectedOption && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium text-gray-700">{selectedOption.responseText}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-2">Relationship change:</div>
                  {selectedOption.relationshipChange > 0 ? (
                    <span className="flex items-center text-green-600">
                      <Heart className="w-4 h-4 mr-1" />
                      +{selectedOption.relationshipChange}
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <HeartOff className="w-4 h-4 mr-1" />
                      {selectedOption.relationshipChange}
                    </span>
                  )}
                </div>
                <Button onClick={handleComplete}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvictionInteractionDialog;
