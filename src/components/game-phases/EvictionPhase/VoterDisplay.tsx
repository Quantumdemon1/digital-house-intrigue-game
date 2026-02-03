
import React from 'react';
import { Clock, Brain, Check, Vote } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Get first name for compact button display
  const getFirstName = (fullName: string) => fullName.split(' ')[0];

  return (
    <div className={`
      p-3 rounded-xl border transition-all duration-300
      ${hasVoted 
        ? 'bg-bb-green/5 border-bb-green/30' 
        : isPlayer 
          ? 'bg-bb-blue/5 border-bb-blue/30' 
          : 'bg-card border-border hover:border-muted-foreground/30'
      }
    `}>
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <StatusAvatar
            name={voter.name}
            imageUrl={voter.imageUrl}
            isPlayer={isPlayer}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate text-sm">
              {voter.name}
              {isPlayer && <span className="text-bb-blue ml-1">(You)</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{voter.occupation}</p>
          </div>
        </div>
        
        {hasVoted ? (
          <span className="flex items-center gap-1 text-xs font-medium bg-bb-green/10 text-bb-green px-2.5 py-1.5 rounded-full flex-shrink-0">
            <Check className="h-3 w-3" /> Voted
          </span>
        ) : isPlayer ? (
          <TooltipProvider>
            <div className="flex gap-2 flex-shrink-0">
              {nominees.map(nominee => (
                <Tooltip key={nominee.id}>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="bg-bb-red hover:bg-bb-red/90 text-white px-3"
                      onClick={() => onVoteSubmit(voter.id, nominee.id)}
                    >
                      <Vote className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[60px]">{getFirstName(nominee.name)}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vote to evict {nominee.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        ) : onShowDecision ? (
          <Button
            variant="outline"
            size="sm"
            className="border-bb-blue/30 text-bb-blue hover:bg-bb-blue/10 flex-shrink-0"
            onClick={onShowDecision}
          >
            <Brain className="h-3 w-3 mr-1" /> Thoughts
          </Button>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium bg-amber-500/10 text-amber-600 px-2.5 py-1.5 rounded-full animate-pulse flex-shrink-0">
            <Clock className="h-3 w-3" /> Thinking...
          </span>
        )}
      </div>
    </div>
  );
};

export default VoterDisplay;
