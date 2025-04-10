
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

interface ReplacementNomineeSelectorProps {
  eligibleHouseguests: Houseguest[];
  onSelect: (nominee: Houseguest) => void;
}

const ReplacementNomineeSelector: React.FC<ReplacementNomineeSelectorProps> = ({
  eligibleHouseguests,
  onSelect
}) => {
  const { gameState } = useGame();
  const hoh = gameState.hohWinner;
  
  // Sort houseguests by relationship with HoH if HoH exists
  const sortedHouseguests = [...eligibleHouseguests].sort((a, b) => {
    if (!hoh) return 0;
    
    // Get relationship values
    const getRelationship = (guestId: string) => {
      const hohRelMap = gameState.relationships.get(hoh.id);
      return hohRelMap?.get(guestId)?.score || 0;
    };
    
    return getRelationship(a.id) - getRelationship(b.id);
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sortedHouseguests.map(houseguest => (
          <Button
            key={houseguest.id}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center border-2 hover:border-bb-red hover:bg-red-50 transition-colors"
            onClick={() => onSelect(houseguest)}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg mb-2">
              {houseguest.name.charAt(0)}
            </div>
            <div className="font-semibold">{houseguest.name}</div>
            <div className="text-xs text-muted-foreground">
              {houseguest.age} • {houseguest.occupation}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ReplacementNomineeSelector;
