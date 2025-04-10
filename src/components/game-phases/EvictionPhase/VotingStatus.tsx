
import React from 'react';
import { VoteIcon } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';

interface VotingStatusProps {
  voters: Houseguest[];
  votes: Record<string, string>;
}

const VotingStatus: React.FC<VotingStatusProps> = ({ voters, votes }) => {
  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Voting Status:</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {voters.map(voter => (
          <div 
            key={voter.id} 
            className={`text-center p-2 rounded-md ${
              votes[voter.id] ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}
          >
            <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-sm mb-1">
              {voter.name.charAt(0)}
            </div>
            <p className="text-xs font-medium">{voter.name}</p>
            {votes[voter.id] && (
              <VoteIcon className="h-3 w-3 mx-auto mt-1 text-green-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingStatus;
