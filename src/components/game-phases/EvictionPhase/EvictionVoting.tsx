
import React, { useState } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Users, Vote } from 'lucide-react';
import VoterDisplay from './VoterDisplay';
import VotingStatus from './VotingStatus';
import VotingTimer from './VotingTimer';
import VoterDecisionDisplay from './VoterDecisionDisplay';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { VoteCounter } from '@/components/ui/vote-counter';

interface EvictionVotingProps {
  nominees: Houseguest[];
  voters: Houseguest[];
  hoh: Houseguest | null;
  votes: Record<string, string>;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
  timeRemaining: number;
  totalTime: number;
  isFinal4?: boolean;
  soleVoter?: Houseguest | null;
}

const EvictionVoting: React.FC<EvictionVotingProps> = ({
  nominees,
  voters,
  hoh,
  votes,
  onVoteSubmit,
  timeRemaining,
  totalTime,
  isFinal4 = false,
  soleVoter = null
}) => {
  const [currentVoter, setCurrentVoter] = useState<Houseguest | null>(null);
  const [showDecision, setShowDecision] = useState(false);

  // Calculate vote counts for each nominee
  const voteCounts = nominees.reduce((acc, nominee) => {
    acc[nominee.id] = Object.values(votes).filter(v => v === nominee.id).length;
    return acc;
  }, {} as Record<string, number>);

  // Handle showing AI decision process
  const handleShowDecision = (voter: Houseguest) => {
    setCurrentVoter(voter);
    setShowDecision(true);
  };

  // Handle completing the decision display
  const handleDecisionComplete = () => {
    if (!currentVoter) return;
    
    const nomineeToVote = nominees[Math.floor(Math.random() * nominees.length)];
    onVoteSubmit(currentVoter.id, nomineeToVote.id);
    setShowDecision(false);
    setCurrentVoter(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-bb-red/10 mb-2">
          <Vote className="h-6 w-6 text-bb-red" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">Eviction Voting</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Houseguests must vote on who they want to evict from the game.
        </p>
      </div>
      
      <VotingTimer timeRemaining={timeRemaining} totalTime={totalTime} />
      
      {/* Nominees with Vote Counters - Side by Side */}
      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        {nominees.map((nominee) => (
          <div 
            key={nominee.id}
            className="relative flex flex-col items-center p-6 rounded-xl bg-gradient-to-b from-card to-muted/20 border border-border"
          >
            <StatusAvatar
              name={nominee.name}
              imageUrl={nominee.imageUrl}
              status="nominee"
              size="lg"
              className="mb-3"
            />
            <h4 className="font-semibold text-lg text-foreground mb-1">{nominee.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">{nominee.occupation}</p>
            
            <VoteCounter 
              count={voteCounts[nominee.id]} 
              maxVotes={voters.length}
              label="Votes to Evict"
              variant={voteCounts[nominee.id] > (voters.length / 2) ? 'danger' : 'default'}
            />
          </div>
        ))}
      </div>
      
      {/* Voters Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-lg font-semibold text-foreground">Voters</h4>
          <span className="text-sm text-muted-foreground">
            ({Object.keys(votes).length}/{voters.length} voted)
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      
      <VotingStatus voters={voters} votes={votes} hoh={hoh} />
    </div>
  );
};

export default EvictionVoting;
