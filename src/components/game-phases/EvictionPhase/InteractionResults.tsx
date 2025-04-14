
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff, Minus } from 'lucide-react';
import { InteractionOption } from './types/interactions';
import { Houseguest } from '@/models/houseguest';
import { useRelationshipImpact } from '@/contexts/RelationshipImpactContext';

interface InteractionResultsProps {
  selectedOption: InteractionOption;
  houseguest: Houseguest;
  onComplete: () => void;
}

const InteractionResults: React.FC<InteractionResultsProps> = ({
  selectedOption,
  houseguest,
  onComplete
}) => {
  const relationshipChange = selectedOption.relationshipChange;
  const { addImpact } = useRelationshipImpact();
  
  // Show relationship impact when component mounts
  useEffect(() => {
    if (relationshipChange !== 0) {
      addImpact(houseguest.id, houseguest.name, relationshipChange);
    }
  }, [houseguest.id, houseguest.name, relationshipChange, addImpact]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Display the outcome text */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md border border-border">
         <p className="font-medium text-foreground mb-2">Their Response:</p>
         <p className="text-sm italic text-muted-foreground">"{selectedOption.responseText}"</p>
      </div>

      {/* Display relationship change */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center font-medium">
          <span className="mr-2">Relationship Change:</span>
          {relationshipChange > 0 ? (
            <span className="flex items-center text-green-600">
              <Heart className="w-4 h-4 mr-1 fill-current" />
              +{relationshipChange}
            </span>
          ) : relationshipChange < 0 ? (
             <span className="flex items-center text-red-600">
                 <HeartOff className="w-4 h-4 mr-1" />
                 {relationshipChange}
             </span>
           ) : (
              <span className="flex items-center text-muted-foreground">
                  <Minus className="w-4 h-4 mr-1" />
                  No Change
              </span>
           )}
        </div>
        <Button onClick={onComplete}>Continue</Button>
      </div>
    </div>
  );
};

export default InteractionResults;
