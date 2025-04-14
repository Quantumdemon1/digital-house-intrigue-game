
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Check } from 'lucide-react';

interface VotingStatusProps {
  voters: Houseguest[];  // Changed from votersCount to accept array of voters
  votes: Record<string, string>;
  hoh?: Houseguest | null;  // Made optional
}

const VotingStatus: React.FC<VotingStatusProps> = ({
  voters,
  votes,
  hoh
}) => {
  return (
    <div className="mt-4 border border-gray-200 rounded-md p-4">
      <h4 className="text-sm font-medium mb-2">Voting Status</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {voters.map(voter => {
          const hasVoted = Object.keys(votes).includes(voter.id);
          return (
            <div 
              key={voter.id} 
              className={`flex items-center gap-1 p-2 rounded-md ${hasVoted ? 'bg-green-50' : 'bg-gray-50'}`}
            >
              {hasVoted && <Check className="h-3 w-3 text-green-500" />}
              <span className="text-sm truncate text-zinc-950">{voter.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VotingStatus;
