
import React from 'react';
import { Clock, User, Brain, Check } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';

interface VoterDisplayProps {
  voter: Houseguest;  // Added to match what's being passed
  nominees: Houseguest[];
  votes: Record<string, string>;  // Added to match what's being passed
  onVoteSubmit: (voterId: string, nomineeId: string) => void;  // Added to match what's being passed
  onShowDecision?: () => void;  // Made optional to match what's being passed
}

const VoterDisplay: React.FC<VoterDisplayProps> = ({
  voter,
  nominees,
  votes,
  onVoteSubmit,
  onShowDecision
}) => {
  const hasVoted = Object.keys(votes).includes(voter.id);
  const isPlayer = voter.isPlayer;

  return (
    <div className="p-3 border rounded-md shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {voter.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{voter.name}</p>
            <p className="text-xs text-muted-foreground">{voter.occupation}</p>
          </div>
        </div>
        
        {hasVoted ? (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
            <Check className="h-3 w-3 mr-1" /> Voted
          </span>
        ) : isPlayer ? (
          <div className="space-x-1">
            {nominees.map(nominee => (
              <Button 
                key={nominee.id}
                size="sm" 
                variant="destructive"
                onClick={() => onVoteSubmit(voter.id, nominee.id)}
              >
                Evict {nominee.name}
              </Button>
            ))}
          </div>
        ) : onShowDecision ? (
          <Button
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1"
            onClick={onShowDecision}
          >
            <Brain className="h-3 w-3" /> Show thoughts
          </Button>
        ) : (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Thinking...
          </span>
        )}
      </div>
    </div>
  );
};

export default VoterDisplay;
