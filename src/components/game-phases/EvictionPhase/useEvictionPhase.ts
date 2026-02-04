
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useEvictionStages } from './hooks/useEvictionStages';
import { useVotingTimer } from './hooks/useVotingTimer';
import { useVoteHandler } from './hooks/useVoteHandler';
import { useEvictionCompletion } from './hooks/useEvictionCompletion';
import { useTimeExpirationHandler } from './hooks/useTimeExpirationHandler';
import { Houseguest } from '@/models/houseguest';

export function useEvictionPhase() {
  const { gameState } = useGame();
  const spectatorAutoStartRef = useRef(false);
  
  // Get data from the smaller hooks
  const { 
    stage, 
    handleProceedToVoting, 
    handleSpeechesComplete,
    progressToTiebreaker,
    progressToResults 
  } = useEvictionStages();
  const { timeRemaining, timerExpired, setTimerExpired, VOTING_TIME_LIMIT } = useVotingTimer(stage);
  const { votes, handleVoteSubmit, handleRandomVotes } = useVoteHandler();
  const { handleEvictionComplete } = useEvictionCompletion();
  
  // Tiebreaker state
  const [tiebreakerVote, setTiebreakerVote] = useState<string | null>(null);
  
  // Get the needed data from game state
  const nominees = gameState.nominees;
  const activeHouseguests = gameState.houseguests.filter(guest => guest.status === 'Active');
  const nonNominees = activeHouseguests.filter(
    guest => !nominees.some(nominee => nominee.id === guest.id) && !guest.isHoH
  );
  const hoh = gameState.hohWinner;
  
  // Check if we're at final 3 (HoH evicts one of the other two - this is after Final HoH)
  const isFinal3 = activeHouseguests.length <= 3 && gameState.isFinalStage;
  
  // Check if we're at final 4 (only 1 person votes - non-HoH, non-nominee)
  const isFinal4 = activeHouseguests.length === 4;
  
  // The sole voter at Final 4 (non-HoH, non-nominee)
  const soleVoter = isFinal4 ? nonNominees[0] : null;
  
  // Check if player is one of the nominees
  const playerIsNominee = nominees.some(nominee => nominee.isPlayer);

  // Auto-advance in spectator mode - skip interaction stage
  useEffect(() => {
    if (gameState.isSpectatorMode && stage === 'interaction' && !spectatorAutoStartRef.current) {
      spectatorAutoStartRef.current = true;
      const timer = setTimeout(() => {
        handleProceedToVoting();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isSpectatorMode, stage, handleProceedToVoting]);

  // Check for tie in votes
  const checkForTie = useCallback((currentVotes: Record<string, string>): boolean => {
    if (nominees.length !== 2) return false;
    
    const voteCounts = nominees.reduce((counts, nominee) => {
      counts[nominee.id] = 0;
      return counts;
    }, {} as Record<string, number>);
    
    Object.values(currentVotes).forEach(nomineeId => {
      if (voteCounts[nomineeId] !== undefined) {
        voteCounts[nomineeId]++;
      }
    });
    
    const voteValues = Object.values(voteCounts);
    return voteValues.length === 2 && voteValues[0] === voteValues[1];
  }, [nominees]);

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

  // Handle vote submission with automatic transition to results or tiebreaker
  const enhancedVoteSubmit = useCallback((voterId: string, nomineeId: string) => {
    handleVoteSubmit(voterId, nomineeId);
    
    // Check if all votes are in after this vote
    const updatedVotes = { ...votes, [voterId]: nomineeId };
    if (Object.keys(updatedVotes).length >= nonNominees.length) {
      // All votes are in, check for tie
      setTimeout(() => {
        if (checkForTie(updatedVotes) && hoh) {
          // Tie detected - go to tiebreaker
          progressToTiebreaker();
        } else {
          // No tie - go to results
          progressToResults();
        }
      }, 2000);
    }
  }, [votes, nonNominees.length, checkForTie, hoh, progressToTiebreaker, progressToResults, handleVoteSubmit]);

  // Handle HoH tiebreaker vote
  const handleTiebreakerVote = useCallback((hohId: string, nomineeId: string) => {
    setTiebreakerVote(nomineeId);
    // Add tiebreaker vote and proceed to results
    handleVoteSubmit(hohId, nomineeId);
    setTimeout(() => {
      progressToResults();
    }, 1500);
  }, [handleVoteSubmit, progressToResults]);

  // Get evicted houseguest considering tiebreaker
  const getEvictedHouseguest = useCallback((): Houseguest | null => {
    if (nominees.length !== 2) return null;
    
    // Count all votes including potential tiebreaker
    const allVotes = { ...votes };
    if (tiebreakerVote && hoh) {
      allVotes[hoh.id] = tiebreakerVote;
    }
    
    const voteCounts = nominees.reduce((counts, nominee) => {
      counts[nominee.id] = 0;
      return counts;
    }, {} as Record<string, number>);
    
    Object.values(allVotes).forEach(nomineeId => {
      if (voteCounts[nomineeId] !== undefined) {
        voteCounts[nomineeId]++;
      }
    });
    
    // The nominee with MORE votes is evicted
    return voteCounts[nominees[0].id] > voteCounts[nominees[1].id] 
      ? nominees[0] 
      : nominees[1];
  }, [nominees, votes, tiebreakerVote, hoh]);

  return {
    stage,
    votes,
    timeRemaining,
    nominees,
    nonNominees,
    hoh,
    playerIsNominee,
    isFinal3,
    isFinal4,
    soleVoter,
    tiebreakerVote,
    handleProceedToVoting,
    handleSpeechesComplete,
    handleVoteSubmit: enhancedVoteSubmit,
    handleTiebreakerVote,
    handleEvictionComplete,
    getEvictedHouseguest,
    checkForTie,
    progressToResults,
    VOTING_TIME_LIMIT
  };
}
