
import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useEvictionStages } from './hooks/useEvictionStages';
import { useVotingTimer } from './hooks/useVotingTimer';
import { useVoteHandler } from './hooks/useVoteHandler';
import { useEvictionCompletion } from './hooks/useEvictionCompletion';
import { useTimeExpirationHandler } from './hooks/useTimeExpirationHandler';

export function useEvictionPhase() {
  const { gameState } = useGame();
  
  // Get data from the smaller hooks
  const { stage, handleProceedToVoting, progressToResults } = useEvictionStages();
  const { timeRemaining, timerExpired, setTimerExpired, VOTING_TIME_LIMIT } = useVotingTimer(stage);
  const { votes, handleVoteSubmit, handleRandomVotes } = useVoteHandler();
  const { handleEvictionComplete } = useEvictionCompletion();
  
  // Get the needed data from game state
  const nominees = gameState.nominees;
  const activeHouseguests = gameState.houseguests.filter(guest => guest.status === 'Active');
  const nonNominees = activeHouseguests.filter(
    guest => !nominees.some(nominee => nominee.id === guest.id) && !guest.isHoH
  );
  const hoh = gameState.hohWinner;
  
  // Check if player is one of the nominees
  const playerIsNominee = nominees.some(nominee => nominee.isPlayer);

  // Set up the time expiration handler
  const { handleTimeExpired } = useTimeExpirationHandler({
    stage,
    timerExpired,
    nonNominees,
    nominees,
    votes,
    handleRandomVotes,
    progressToResults
  });

  // Handle time expiration
  useEffect(() => {
    if (timeRemaining === 0 && stage === 'voting' && !timerExpired) {
      setTimerExpired(true); // Prevent multiple executions
      console.log("Eviction voting timer expired");
      handleTimeExpired();
    }
  }, [timeRemaining, stage, timerExpired, setTimerExpired, handleTimeExpired]);

  // Handle vote submission with automatic transition to results
  const enhancedVoteSubmit = (voterId: string, nomineeId: string) => {
    handleVoteSubmit(voterId, nomineeId);
    
    // Check if all votes are in after this vote
    const updatedVotes = { ...votes, [voterId]: nomineeId };
    if (Object.keys(updatedVotes).length >= nonNominees.length) {
      // All votes are in, move to results
      setTimeout(() => {
        progressToResults();
      }, 2000);
    }
  };

  return {
    stage,
    votes,
    timeRemaining,
    nominees,
    nonNominees,
    hoh,
    playerIsNominee,
    handleProceedToVoting,
    handleVoteSubmit: enhancedVoteSubmit,
    handleEvictionComplete,
    VOTING_TIME_LIMIT
  };
}
