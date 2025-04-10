
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';
import { Heart, HeartOff, Star, Lightbulb, Users } from 'lucide-react';

interface InteractionOption {
  id: string;
  text: string;
  responseText: string;
  relationshipChange: number;
  icon: React.ReactNode;
  requiredSocialStat?: number; // Minimum social stat required for successful outcome
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
    // Base options that reference houseguest traits
    const options: InteractionOption[] = [
      {
        id: 'emotional',
        text: `Appeal to ${houseguest.name}'s emotions and share how much you want to stay.`,
        responseText: houseguest.traits.includes('Emotional') 
          ? `${houseguest.name} is moved by your sincerity and shares their own feelings about the game.`
          : `${houseguest.name} seems unmoved by emotional appeals and changes the subject.`,
        relationshipChange: houseguest.traits.includes('Emotional') ? 15 : -5,
        icon: <Heart className="w-4 h-4 mr-2" />,
        requiredSocialStat: 5 // Requires average social skills
      },
      {
        id: 'logical',
        text: `Make a strategic case about why keeping you benefits ${houseguest.name}'s game.`,
        responseText: houseguest.traits.includes('Strategic') || houseguest.traits.includes('Analytical')
          ? `${houseguest.name} nods thoughtfully as you lay out your strategic reasoning.`
          : `${houseguest.name} seems skeptical and questions your motives.`,
        relationshipChange: (houseguest.traits.includes('Strategic') || houseguest.traits.includes('Analytical')) ? 15 : -5,
        icon: <Lightbulb className="w-4 h-4 mr-2" />,
        requiredSocialStat: 3 // Requires basic social skills
      },
      {
        id: 'loyalty',
        text: `Remind ${houseguest.name} of your loyalty and offer future protection.`,
        responseText: houseguest.traits.includes('Loyal') 
          ? `${houseguest.name} values loyalty and appreciates your commitment to work together going forward.`
          : `${houseguest.name} questions your promises and wonders if you're just saying this to stay.`,
        relationshipChange: houseguest.traits.includes('Loyal') ? 15 : -5,
        icon: <Users className="w-4 h-4 mr-2" />,
        requiredSocialStat: 4 // Requires good social skills
      },
    ];
    
    // Add a trait-specific option if applicable
    if (houseguest.traits.includes('Competitive')) {
      options.push({
        id: 'competitive',
        text: `Challenge ${houseguest.name} to a friendly competition to prove your value in the house.`,
        responseText: `${houseguest.name}'s competitive spirit is sparked. They appreciate your boldness and willingness to prove yourself.`,
        relationshipChange: 20,
        icon: <Star className="w-4 h-4 mr-2" />,
        requiredSocialStat: 6 // Requires good social skills
      });
    }
    
    if (houseguest.traits.includes('Sneaky')) {
      options.push({
        id: 'info',
        text: `Share some "inside information" about another houseguest's strategy.`,
        responseText: `${houseguest.name} leans in with interest, eager to hear what you know about the others.`,
        relationshipChange: 20,
        icon: <Star className="w-4 h-4 mr-2" />,
        requiredSocialStat: 7 // Requires very good social skills
      });
    }
    
    if (houseguest.traits.includes('Confrontational')) {
      options.push({
        id: 'direct',
        text: `Be brutally honest about the game state and directly ask for their vote.`,
        responseText: `${houseguest.name} appreciates your straightforward approach. They respect that you didn't try to manipulate them.`,
        relationshipChange: 15,
        icon: <Star className="w-4 h-4 mr-2" />,
        requiredSocialStat: 4 // Requires average social skills
      });
    }
    
    return options;
  };
  
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
  
  // Determine if social skill was adequate for selected option
  const getSocialSkillFeedback = () => {
    if (!selectedOption?.requiredSocialStat || !player) return null;
    
    if (player.stats.social < selectedOption.requiredSocialStat) {
      return (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          Your social skill of {player.stats.social} wasn't quite enough for this approach. 
          This required at least {selectedOption.requiredSocialStat} social skill for the best outcome.
        </div>
      );
    } else if (player.stats.social > selectedOption.requiredSocialStat + 2) {
      return (
        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          Your high social skill of {player.stats.social} helped you execute this approach perfectly!
        </div>
      );
    }
    return null;
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
            <div className="space-y-3">
              {getInteractionOptions().map(option => (
                <Button
                  key={option.id}
                  variant="outline" 
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => handleSelectOption(option)}
                >
                  <span className="flex items-center">
                    {option.icon}
                    {option.text}
                  </span>
                </Button>
              ))}
            </div>
          )}
          
          {step === 'result' && selectedOption && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium text-gray-700">{selectedOption.responseText}</p>
                {getSocialSkillFeedback()}
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
