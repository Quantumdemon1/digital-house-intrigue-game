
import React from 'react';
import { VoteIcon, User, Clock } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import VoterDisplay from './VoterDisplay';
import HohTiebreaker from './HohTiebreaker';
import VotingStatus from './VotingStatus';
import { useVotingLogic } from './useVotingLogic';

interface EvictionVotingProps {
  nominees: Houseguest[];
  voters: Houseguest[];
  hoh: Houseguest | null;
  votes: Record<string, string>;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
}

const EvictionVoting: React.FC<EvictionVotingProps> = ({
  nominees,
  voters,
  hoh,
  votes: externalVotes,
  onVoteSubmit,
}) => {
  const { getRelationship } = useGame();
  
  const {
    votes,
    currentVoter,
    isPlayerVoting,
    isVoting,
    showVote,
    timeRemaining,
    handlePlayerVote,
    handleTimeExpired,
    VOTING_TIME_LIMIT
  } = useVotingLogic({
    nominees,
    voters,
    getRelationship,
    onVoteSubmit
  });
  
  // Check if all votes are in
  const allVotesIn = Object.keys(votes).length >= voters.length || 
                     Object.keys(externalVotes).length >= voters.length;
  
  // If HOH needs to break tie, check if we have the same number of votes for each nominee
  let hohNeedsTieBreaker = false;
  if (allVotesIn && hoh) {
    const votesForNominee1 = Object.values(votes).filter(v => v === nominees[0].id).length;
    const votesForNominee2 = Object.values(votes).filter(v => v === nominees[1].id).length;
    hohNeedsTieBreaker = votesForNominee1 === votesForNominee2;
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">House Vote</h3>
        <p className="text-muted-foreground">
          Houseguests will vote one by one to evict a nominee.
        </p>
      </div>
      
      <div className="flex justify-center items-center gap-10 my-6">
        {nominees.map(nominee => (
          <div key={nominee.id} className="text-center">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
              {nominee.name.charAt(0)}
            </div>
            <p className="font-semibold">{nominee.name}</p>
          </div>
        ))}
      </div>
      
      {!allVotesIn && currentVoter && (
        <VoterDisplay
          currentVoter={currentVoter}
          nominees={nominees}
          isPlayerVoting={isPlayerVoting}
          isVoting={isVoting}
          showVote={showVote}
          timeRemaining={timeRemaining}
          onTimeExpired={handleTimeExpired}
          onVote={handlePlayerVote}
          totalTime={VOTING_TIME_LIMIT}
        />
      )}
      
      {hohNeedsTieBreaker && hoh && (
        <HohTiebreaker 
          hoh={hoh} 
          nominees={nominees} 
          onVote={onVoteSubmit} 
        />
      )}
      
      <VotingStatus voters={voters} votes={votes || externalVotes} />
    </div>
  );
};

export default EvictionVoting;
