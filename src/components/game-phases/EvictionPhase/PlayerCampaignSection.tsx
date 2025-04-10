
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';

interface PlayerCampaignSectionProps {
  nonNominees: Houseguest[];
  remainingInteractions: number;
  onHouseguestSelect: (houseguest: Houseguest) => void;
}

const PlayerCampaignSection: React.FC<PlayerCampaignSectionProps> = ({
  nonNominees,
  remainingInteractions,
  onHouseguestSelect
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold">Campaign for Votes</h3>
        <p className="text-muted-foreground mb-2">
          You're on the block! Interact with houseguests to build relationships and save yourself.
        </p>
        <p className="font-semibold text-bb-red">
          Interactions remaining: {remainingInteractions}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nonNominees.map(houseguest => (
          <Button
            key={houseguest.id}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center border-2 hover:border-bb-red transition-colors"
            disabled={remainingInteractions <= 0}
            onClick={() => onHouseguestSelect(houseguest)}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg mb-2">
              {houseguest.name.charAt(0)}
            </div>
            <div className="font-semibold">{houseguest.name}</div>
            <div className="flex items-center mt-2">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>Interact</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PlayerCampaignSection;
