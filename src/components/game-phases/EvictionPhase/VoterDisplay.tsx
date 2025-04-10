
import React from 'react';
import { Clock, User } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import VotingTimer from './VotingTimer';

interface VoterDisplayProps {
  currentVoter: Houseguest;
  nominees: Houseguest[];
  isPlayerVoting: boolean;
  isVoting: boolean;
  showVote: boolean;
  timeRemaining: number;
  onTimeExpired: () => void;
  onVote: (nomineeId: string) => void;
  totalTime: number;
}

const VoterDisplay: React.FC<VoterDisplayProps> = ({
  currentVoter,
  nominees,
  isPlayerVoting,
  isVoting,
  showVote,
  timeRemaining,
  onTimeExpired,
  onVote,
  totalTime,
}) => {
  return (
    <div className="bg-gray-100 p-4 rounded-md text-center">
      <p className="font-medium mb-2">
        <span className="text-bb-red">Current Voter:</span> {currentVoter.name}
        {currentVoter.isPlayer ? " (You)" : ""}
      </p>
      
      {isPlayerVoting && !isVoting && (
        <VotingTimer 
          timeRemaining={timeRemaining}
          onTimeExpired={onTimeExpired}
          totalTime={totalTime}
        />
      )}
      
      {isVoting && (
        <div className="flex items-center justify-center">
          <Clock className="animate-pulse mr-2" />
          <span>{showVote ? "Vote cast!" : "Thinking..."}</span>
        </div>
      )}
      
      {isPlayerVoting && !isVoting && (
        <div className="mt-4 space-y-2">
          <p>Vote to evict:</p>
          <div className="flex justify-center gap-4">
            {nominees.map(nominee => (
              <Button
                key={nominee.id}
                variant="destructive"
                className="flex items-center"
                onClick={() => onVote(nominee.id)}
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

export default VoterDisplay;
