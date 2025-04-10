
import React from 'react';
import { Button } from '@/components/ui/button';
import { InteractionOption } from './types/interactions';
import { Heart, HeartOff, Minus } from 'lucide-react';

interface InteractionResultsProps {
  selectedOption: InteractionOption;
  houseguest?: any; // Made optional since we're not using it directly
  onComplete: () => void;
}

const InteractionResults: React.FC<InteractionResultsProps> = ({
  selectedOption,
  onComplete
}) => {
  return (
    <div className="mt-4 space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-md border border-border">
        <p className="text-sm font-medium mb-1">Their Response:</p>
        <p className="text-sm italic text-muted-foreground">"{selectedOption.responseText}"</p>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t">
        <div className="flex items-center">
          <span className="mr-2 text-sm">Relationship change:</span>
          {selectedOption.relationshipChange > 0 ? (
            <span className="flex items-center text-green-600 font-medium">
              <Heart className="h-4 w-4 mr-1 fill-current" />
              +{selectedOption.relationshipChange}
            </span>
          ) : selectedOption.relationshipChange < 0 ? (
            <span className="flex items-center text-red-600 font-medium">
              <HeartOff className="h-4 w-4 mr-1" />
              {selectedOption.relationshipChange}
            </span>
          ) : (
            <span className="flex items-center text-muted-foreground font-medium">
              <Minus className="h-4 w-4 mr-1" />
              0
            </span>
          )}
        </div>
        
        <Button variant="default" onClick={onComplete}>Continue</Button>
      </div>
    </div>
  );
};

export default InteractionResults;
