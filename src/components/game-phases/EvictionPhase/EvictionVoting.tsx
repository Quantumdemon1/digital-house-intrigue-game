
import React, { useState } from 'react';
import { Houseguest } from '@/models/houseguest';
import VoterDisplay from './VoterDisplay';
import NomineeDisplay from './NomineeDisplay';
import VotingStatus from './VotingStatus';
import VotingTimer from './VotingTimer';
import VoterDecisionDisplay from './VoterDecisionDisplay';

interface EvictionVotingProps {
  nominees: Houseguest[];
  voters: Houseguest[];
  hoh: Houseguest | null;
  votes: Record<string, string>;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
  timeRemaining: number;
  totalTime: number;
}

const EvictionVoting: React.FC<EvictionVotingProps> = ({
  nominees,
  voters,
  hoh,
  votes,
  onVoteSubmit,
  timeRemaining,
  totalTime
}) => {
  const [currentVoter, setCurrentVoter] = useState<Houseguest | null>(null);
  const [showDecision, setShowDecision] = useState(false);

  // Handle showing AI decision process
  const handleShowDecision = (voter: Houseguest) => {
    setCurrentVoter(voter);
    setShowDecision(true);
  };

  // Handle completing the decision display
  const handleDecisionComplete = () => {
    if (!currentVoter) return;
    
    // Select a random nominee to vote for
    const nomineeToVote = nominees[Math.floor(Math.random() * nominees.length)];
    onVoteSubmit(currentVoter.id, nomineeToVote.id);
    setShowDecision(false);
    setCurrentVoter(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Eviction Voting</h3>
        <p className="text-muted-foreground">
          Houseguests must vote on who they want to evict from the game.
        </p>
      </div>
      
      <VotingTimer timeRemaining={timeRemaining} totalTime={totalTime} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Nominees</h4>
          <div className="space-y-3">
            {nominees.map(nominee => (
              <NomineeDisplay key={nominee.id} nominee={nominee} />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Voters</h4>
          <div className="space-y-3">
            {voters.map(voter => (
              <div key={voter.id} className="relative">
                <VoterDisplay
                  voter={voter}
                  nominees={nominees}
                  votes={votes}
                  onVoteSubmit={onVoteSubmit}
                  onShowDecision={voter.isPlayer ? undefined : () => handleShowDecision(voter)}
                />
                
                {currentVoter?.id === voter.id && showDecision && (
                  <VoterDecisionDisplay
                    voter={voter}
                    nominees={nominees}
                    onDecisionComplete={handleDecisionComplete}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <VotingStatus voters={voters} votes={votes} hoh={hoh} />
    </div>
  );
};

export default EvictionVoting;
