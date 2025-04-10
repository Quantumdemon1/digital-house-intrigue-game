
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import NomineeDisplay from './NomineeDisplay';

interface NonPlayerSectionProps {
  nominees: Houseguest[];
  onInteractionStageComplete: () => void;
}

const NonPlayerSection: React.FC<NonPlayerSectionProps> = ({
  nominees,
  onInteractionStageComplete
}) => {
  return (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-bold">Nominees Are Campaigning</h3>
      <p className="text-muted-foreground">
        The nominated houseguests are campaigning to stay in the house.
      </p>
      
      <NomineeDisplay nominees={nominees} />
      
      <Button 
        variant="default"
        className="bg-bb-red hover:bg-red-700"
        onClick={onInteractionStageComplete}
      >
        Proceed to Voting
      </Button>
    </div>
  );
};

export default NonPlayerSection;
