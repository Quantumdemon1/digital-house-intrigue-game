
import React from 'react';
import { Target, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { StatusAvatar } from '@/components/ui/status-avatar';

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
    <div className="text-center space-y-8 py-8">
      {/* HOH Avatar */}
      <StatusAvatar
        name={hoh.name}
        avatarUrl={hoh.avatarUrl}
        status="hoh"
        size="xl"
        isPlayer={hoh.isPlayer}
      />
      
      {/* Title */}
      <div className="space-y-3">
        <h3 className="text-2xl font-display font-bold text-foreground">
          Nomination Ceremony
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          {isPlayerHoH 
            ? "As Head of Household, you must nominate two houseguests for eviction."
            : `${hoh.name} must nominate two houseguests for eviction.`}
        </p>
        <p className="text-sm text-muted-foreground/80 max-w-sm mx-auto">
          These houseguests will have a chance to save themselves in the Power of Veto competition.
        </p>
      </div>
      
      {/* Start Button */}
      <Button 
        onClick={startCeremony} 
        size="lg"
        className="bg-bb-red hover:bg-bb-red/90 text-white font-semibold px-8 py-6 text-lg shadow-game-lg hover:shadow-game-xl transition-all"
      >
        <Target className="h-5 w-5 mr-2" />
        Start Nomination Ceremony
      </Button>
    </div>
  );
};

export default NominationContent;
