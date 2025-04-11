
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import VoterDisplay from './VoterDisplay';
import HohTiebreaker from './HohTiebreaker';
import VotingStatus from './VotingStatus';
import VotingTimer from './VotingTimer';
import { useVotingLogic } from './useVotingLogic';

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
  votes: externalVotes,
  onVoteSubmit,
  timeRemaining,
  totalTime
}) => {
  const { getRelationship, logger } = useGame();
  
  const {
    votes,
    currentVoter,
    isPlayerVoting,
    isVoting,
    showVote,
    handlePlayerVote,
  } = useVotingLogic({
    nominees,
    voters,
    getRelationship,
    onVoteSubmit,
    externalVotes
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
    
    // Log the tie situation for verification
    if (hohNeedsTieBreaker) {
      logger.info(`Eviction vote TIE detected: ${votesForNominee1}-${votesForNominee2}. HOH ${hoh.name} needs to break the tie.`);
    }
  }

  // Handle HOH tiebreaker vote
  const handleHohTiebreaker = (hohId: string, nomineeId: string) => {
    logger.info(`Player Action: HOH ${hoh?.name} breaking tie by voting to evict ${nominees.find(n => n.id === nomineeId)?.name}`);
    onVoteSubmit(hohId, nomineeId);
  };
  
  // Enhance player vote with logging
  const enhancedPlayerVote = (nomineeId: string) => {
    if (currentVoter) {
      logger.info(`Player Action: ${currentVoter.name} voting to evict ${nominees.find(n => n.id === nomineeId)?.name}`);
    }
    handlePlayerVote(nomineeId);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">House Vote</h3>
        <p className="text-muted-foreground">
          Houseguests will vote one by one to evict a nominee.
        </p>
      </div>
      
      {/* Shared timer for all votes */}
      <VotingTimer 
        timeRemaining={timeRemaining}
        totalTime={totalTime}
      />

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
          onVote={enhancedPlayerVote}
        />
      )}
      
      {hohNeedsTieBreaker && hoh && (
        <HohTiebreaker 
          hoh={hoh} 
          nominees={nominees} 
          onVote={handleHohTiebreaker} 
        />
      )}
      
      <VotingStatus voters={voters} votes={votes || externalVotes} />
    </div>
  );
};

export default EvictionVoting;
