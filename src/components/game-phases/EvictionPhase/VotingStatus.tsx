
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Check, Clock } from 'lucide-react';

interface VotingStatusProps {
  voters: Houseguest[];
  votes: Record<string, string>;
  hoh?: Houseguest | null;
}

const VotingStatus: React.FC<VotingStatusProps> = ({
  voters,
  votes,
  hoh
}) => {
  const votedCount = Object.keys(votes).length;
  const totalVoters = voters.length;
  const progressPercent = (votedCount / totalVoters) * 100;

  return (
    <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">Voting Progress</h4>
        <span className="text-sm text-muted-foreground">
          {votedCount} of {totalVoters} votes cast
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-bb-blue to-bb-green transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Voter status grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {voters.map(voter => {
          const hasVoted = Object.keys(votes).includes(voter.id);
          return (
            <div 
              key={voter.id} 
              className={`
                flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium transition-all duration-300
                ${hasVoted 
                  ? 'bg-bb-green/10 text-bb-green' 
                  : 'bg-muted/50 text-muted-foreground'
                }
              `}
            >
              {hasVoted ? (
                <Check className="h-3 w-3 flex-shrink-0" />
              ) : (
                <Clock className="h-3 w-3 flex-shrink-0 animate-pulse" />
              )}
              <span className="truncate">{voter.name}</span>
            </div>
          );
        })}
      </div>
      
      {hoh && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {hoh.name} (HoH) will break any tie votes
        </p>
      )}
    </div>
  );
};

export default VotingStatus;
