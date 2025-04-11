
import React from 'react';
import { User } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

interface HohTiebreakerProps {
  hoh: Houseguest;
  nominees: Houseguest[];
  onVote: (hohId: string, nomineeId: string) => void;
}

const HohTiebreaker: React.FC<HohTiebreakerProps> = ({ hoh, nominees, onVote }) => {
  const { logger } = useGame();

  // Handle the HOH's tiebreaker vote with clear logging
  const handleTiebreakerVote = (nomineeId: string) => {
    logger.info(`HoH Tiebreaker: ${hoh.name} casting tiebreaker vote`);
    onVote(hoh.id, nomineeId);
  };

  return (
    <div className="bg-yellow-50 p-4 rounded-md text-center border border-yellow-200">
      <p className="font-medium mb-2">
        There's a tie! Head of Household {hoh.name} must break the tie.
      </p>
      
      {hoh.isPlayer && (
        <div className="mt-4 space-y-2">
          <p>As HoH, vote to evict:</p>
          <div className="flex justify-center gap-4">
            {nominees.map(nominee => (
              <Button
                key={nominee.id}
                variant="destructive"
                className="flex items-center"
                onClick={() => handleTiebreakerVote(nominee.id)}
              >
                <User className="mr-1 h-4 w-4" />
                {nominee.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HohTiebreaker;
