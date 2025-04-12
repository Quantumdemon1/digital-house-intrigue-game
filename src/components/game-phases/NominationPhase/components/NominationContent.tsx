
import React from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';

export interface NominationContentProps {
  hoh: Houseguest;
  isPlayerHoH: boolean;
  startCeremony: () => void;
}

const NominationContent: React.FC<NominationContentProps> = ({ 
  hoh, 
  isPlayerHoH,
  startCeremony 
}) => {
  return (
    <CardContent className="p-6 space-y-6">
      <div className="text-center space-y-6 py-8">
        <h3 className="text-xl font-semibold">Nomination Ceremony</h3>
        <p className="text-muted-foreground">
          {isPlayerHoH 
            ? "As Head of Household, you must nominate two houseguests for eviction."
            : `${hoh.name} must nominate two houseguests for eviction.`}
          These houseguests will have a chance to save themselves in the Power of Veto competition.
        </p>
        <Button 
          onClick={startCeremony} 
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-6"
        >
          Start Nomination Ceremony
        </Button>
      </div>
    </CardContent>
  );
};

export default NominationContent;
