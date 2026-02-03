
import React from 'react';
import { Clock, Brain, Check, Vote } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface VoterDisplayProps {
  voter: Houseguest;
  nominees: Houseguest[];
  votes: Record<string, string>;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
  onShowDecision?: () => void;
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
    <div className={`
      p-4 rounded-xl border transition-all duration-300
      ${hasVoted 
        ? 'bg-bb-green/5 border-bb-green/30' 
        : isPlayer 
          ? 'bg-bb-blue/5 border-bb-blue/30' 
          : 'bg-card border-border hover:border-muted-foreground/30'
      }
    `}>
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <StatusAvatar
            name={voter.name}
            imageUrl={voter.imageUrl}
            isPlayer={isPlayer}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              {voter.name}
              {isPlayer && <span className="text-bb-blue ml-1">(You)</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{voter.occupation}</p>
          </div>
        </div>
        
        {hasVoted ? (
          <span className="flex items-center gap-1 text-xs font-medium bg-bb-green/10 text-bb-green px-3 py-1.5 rounded-full">
            <Check className="h-3 w-3" /> Voted
          </span>
        ) : isPlayer ? (
          <div className="flex gap-2">
            {nominees.map(nominee => (
              <Button 
                key={nominee.id}
                size="sm" 
                variant="destructive"
                className="bg-bb-red hover:bg-bb-red/90 text-white"
                onClick={() => onVoteSubmit(voter.id, nominee.id)}
              >
                <Vote className="h-3 w-3 mr-1" />
                {nominee.name}
              </Button>
            ))}
          </div>
        ) : onShowDecision ? (
          <Button
            variant="outline"
            size="sm"
            className="border-bb-blue/30 text-bb-blue hover:bg-bb-blue/10"
            onClick={onShowDecision}
          >
            <Brain className="h-3 w-3 mr-1" /> Thoughts
          </Button>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full animate-pulse">
            <Clock className="h-3 w-3" /> Thinking...
          </span>
        )}
      </div>
    </div>
  );
};

export default VoterDisplay;
