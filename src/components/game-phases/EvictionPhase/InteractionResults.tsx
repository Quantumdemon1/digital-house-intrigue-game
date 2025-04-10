
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { InteractionOption } from './types/interactions';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';

interface InteractionResultsProps {
  selectedOption: InteractionOption;
  player: Houseguest;
  onComplete: () => void;
}

const InteractionResults: React.FC<InteractionResultsProps> = ({ selectedOption, player, onComplete }) => {
  const { getRelationship } = useGame();
  
  // Determine if social skill was adequate for selected option
  const getSocialSkillFeedback = () => {
    if (!selectedOption?.requiredSocialStat || !player) return null;
    
    if (player.stats.social < selectedOption.requiredSocialStat - 2) {
      return (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          <p className="font-medium">Social Skills Issue</p>
          Your social skill of {player.stats.social} was significantly below what's needed for this approach. 
          This required at least {selectedOption.requiredSocialStat} social skill for a good outcome.
        </div>
      );
    } else if (player.stats.social < selectedOption.requiredSocialStat) {
      return (
        <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
          <p className="font-medium">Social Skills Challenged</p>
          Your social skill of {player.stats.social} was slightly below what's ideal for this approach.
          This works best with at least {selectedOption.requiredSocialStat} social skill.
        </div>
      );
    } else if (player.stats.social > selectedOption.requiredSocialStat + 2) {
      return (
        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          <p className="font-medium">Social Skills Advantage</p>
          Your high social skill of {player.stats.social} helped you execute this approach perfectly!
        </div>
      );
    }
    return null;
  };
  
  // Provide feedback on trait compatibility
  const getTraitCompatibilityFeedback = () => {
    if (!selectedOption?.compatibleTraits && !selectedOption?.incompatibleTraits) return null;
    
    const compatibleTraits = selectedOption.compatibleTraits || [];
    const incompatibleTraits = selectedOption.incompatibleTraits || [];
    
    const houseguestId = localStorage.getItem('currentInteractionHouseguestId') || '';
    const currentRelationship = getRelationship(player.id, houseguestId);
    
    // Track matches for feedback
    let hasCompatible = false;
    let hasIncompatible = false;
    
    // Check which traits the houseguest has (if any)
    const { getHouseguestById } = useGame();
    const houseguest = getHouseguestById(houseguestId);
    
    if (houseguest) {
      hasCompatible = houseguest.traits.some(trait => compatibleTraits.includes(trait));
      hasIncompatible = houseguest.traits.some(trait => incompatibleTraits.includes(trait));
    }
    
    if (hasIncompatible) {
      return (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          <p className="font-medium">Trait Mismatch</p>
          Your approach conflicted with their personality. This wasn't the best strategy for someone with their traits.
        </div>
      );
    } else if (hasCompatible) {
      return (
        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          <p className="font-medium">Excellent Approach</p>
          Your strategy aligned perfectly with their personality traits. They responded very positively!
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-md">
        <p className="font-medium text-gray-700">{selectedOption.responseText}</p>
        {getSocialSkillFeedback()}
        {getTraitCompatibilityFeedback()}
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
        <Button onClick={onComplete}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default InteractionResults;
