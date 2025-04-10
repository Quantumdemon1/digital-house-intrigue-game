
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { InteractionOption } from './types/interactions';
import { Houseguest } from '@/models/houseguest';

interface InteractionResultsProps {
  selectedOption: InteractionOption;
  player: Houseguest;
  onComplete: () => void;
}

const InteractionResults: React.FC<InteractionResultsProps> = ({ selectedOption, player, onComplete }) => {
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
        <Button onClick={onComplete}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default InteractionResults;
