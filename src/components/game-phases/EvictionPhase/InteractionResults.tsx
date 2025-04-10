
import React from 'react';
import { Button } from '@/components/ui/button';
import { InteractionOption } from './types/interactions';
import { Houseguest } from '@/models/houseguest';

interface InteractionResultsProps {
  selectedOption: InteractionOption;
  houseguest: Houseguest;
  onComplete: () => void;
}

export const InteractionResults: React.FC<InteractionResultsProps> = ({
  selectedOption,
  houseguest,
  onComplete
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 bg-gray-100 rounded-md">
        <p className="text-sm">{selectedOption.responseText}</p>
        <p className="text-sm mt-2">
          Relationship change: <span className={selectedOption.relationshipChange > 0 ? 'text-green-600' : 'text-red-600'}>
            {selectedOption.relationshipChange > 0 ? '+' : ''}{selectedOption.relationshipChange}
          </span>
        </p>
      </div>
      
      <Button variant="default" onClick={onComplete}>Continue</Button>
    </div>
  );
};
