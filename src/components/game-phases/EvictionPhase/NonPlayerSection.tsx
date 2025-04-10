
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import NomineeDisplay from './NomineeDisplay';

interface NonPlayerSectionProps {
  nominees: Houseguest[];
  nonNominees: Houseguest[];
  remainingInteractions: number;
  onHouseguestSelect: (houseguest: Houseguest) => void;
}

const NonPlayerSection: React.FC<NonPlayerSectionProps> = ({
  nominees,
  nonNominees,
  remainingInteractions,
  onHouseguestSelect
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold">Nominees Are Campaigning</h3>
        <p className="text-muted-foreground">
          The nominated houseguests are campaigning to stay in the house.
        </p>
      </div>
      
      <NomineeDisplay nominees={nominees} />
      
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Talk to houseguests:</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Interactions remaining: {remainingInteractions}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {nonNominees.map(houseguest => (
            <Button
              key={houseguest.id}
              variant="outline"
              className="h-auto py-3 flex flex-col items-center"
              disabled={remainingInteractions <= 0}
              onClick={() => onHouseguestSelect(houseguest)}
            >
              <span>{houseguest.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NonPlayerSection;
