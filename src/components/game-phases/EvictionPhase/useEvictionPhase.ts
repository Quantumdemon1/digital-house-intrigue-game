
import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import { useGameControl } from '@/contexts/GameControlContext';

type EvictionStage = 'interaction' | 'voting' | 'results';

const VOTING_TIME_LIMIT = 30; // 30 seconds for voting (changed from 60)

export function useEvictionPhase() {
  const { gameState, dispatch } = useGame();
  const { toast } = useToast();
  const { isProcessing } = useGameControl();
  const [stage, setStage] = useState<EvictionStage>('interaction');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(VOTING_TIME_LIMIT);
  const [votingStarted, setVotingStarted] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  
  const nominees = gameState.nominees;
  const activeHouseguests = gameState.houseguests.filter(guest => guest.status === 'Active');
  const nonNominees = activeHouseguests.filter(
    guest => !nominees.some(nominee => nominee.id === guest.id) && !guest.isHoH
  );
  const hoh = gameState.hohWinner;
  
  // Check if player is one of the nominees
  const playerIsNominee = nominees.some(nominee => nominee.isPlayer);

  // Reset timer when stage changes to voting
  useEffect(() => {
    if (stage === 'voting') {
      setVotingStarted(true);
      setTimeRemaining(VOTING_TIME_LIMIT);
      setTimerExpired(false);
      console.log("Voting stage started, timer reset to", VOTING_TIME_LIMIT);
    }
  }, [stage]);

  // Countdown timer for voting phase
  useEffect(() => {
    if (stage !== 'voting' || !votingStarted || timeRemaining <= 0) return;
    
    console.log("Eviction voting timer: ", timeRemaining);
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, votingStarted, stage]);

  // Handle time expiration
  useEffect(() => {
    if (timeRemaining === 0 && stage === 'voting' && !timerExpired) {
      setTimerExpired(true); // Prevent multiple executions
      console.log("Eviction voting timer expired");
      handleTimeExpired();
    }
  }, [timeRemaining, stage]);

  // Time expiration handler
  const handleTimeExpired = useCallback(() => {
    if (stage !== 'voting' || timerExpired) return;
    
    console.log("Handling time expired for eviction voting");
    
    const missingVoters = nonNominees.filter(voter => !votes[voter.id]);
    
    // Cast random votes for anyone who hasn't voted
    if (missingVoters.length > 0) {
      toast({
        title: "Time Expired!",
        description: "Voting time has expired. Random votes have been cast for remaining houseguests.",
        variant: "destructive",
      });

      const newVotes = {...votes};
      missingVoters.forEach(voter => {
        // Randomly vote for one of the nominees
        const randomNominee = nominees[Math.floor(Math.random() * nominees.length)];
        newVotes[voter.id] = randomNominee.id;
        
        // Update in game state using PLAYER_ACTION
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'cast_vote',
            params: {
              voterId: voter.id,
              nomineeId: randomNominee.id,
              isRandomVote: true
            }
          }
        });
      });
      
      setVotes(newVotes);

      // Move to results after a delay
      setTimeout(() => {
        setStage('results');
      }, 2000);
    }
  }, [votes, nominees, nonNominees, stage, dispatch, toast, timerExpired]);

  // Handle when interaction stage completes
  const handleProceedToVoting = useCallback(() => {
    setStage('voting');
    setVotingStarted(true);
    setTimeRemaining(VOTING_TIME_LIMIT);
    
    toast({
      title: "Voting Phase",
      description: "Houseguests will now cast their votes to evict.",
    });
  }, [toast]);
  
  // Handle vote submission
  const handleVoteSubmit = useCallback((voterId: string, nomineeId: string) => {
    setVotes(prev => ({
      ...prev,
      [voterId]: nomineeId
    }));
    
    // Update in game state using PLAYER_ACTION
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'cast_vote',
        params: {
          voterId,
          nomineeId
        }
      }
    });

    // Check if all votes are in
    const updatedVotes = { ...votes, [voterId]: nomineeId };
    if (Object.keys(updatedVotes).length >= nonNominees.length) {
      // All votes are in, move to results
      setTimeout(() => {
        setStage('results');
      }, 2000);
    }
  }, [votes, nonNominees.length, dispatch]);
  
  // Handle eviction completion
  const handleEvictionComplete = useCallback((evictedHouseguest: Houseguest) => {
    console.log("handleEvictionComplete called for", evictedHouseguest.name);
    
    if (isProcessing) {
      console.log("Skipping eviction action - already processing");
      return;
    }
    
    // Process the eviction using PLAYER_ACTION
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'evict_houseguest',
        params: {
          evictedId: evictedHouseguest.id,
          toJury: gameState.week >= 5
        }
      }
    });
    
    toast({
      title: "Houseguest Evicted",
      description: `${evictedHouseguest.name} has been evicted from the Big Brother house.`,
    });
    
    // Advance to the next week
    setTimeout(() => {
      console.log("Dispatching advance_week action");
      
      dispatch({ 
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'advance_week',
          params: {}
        }
      });
      
      // Also dispatch eviction_complete action to ensure state transition
      dispatch({ 
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'eviction_complete',
          params: {}
        }
      });
      
      toast({
        title: "New Week Begins",
        description: `Week ${gameState.week + 1} has begun.`,
      });
    }, 2000);
  }, [dispatch, gameState.week, toast, isProcessing]);

  return {
    stage,
    votes,
    timeRemaining,
    nominees,
    nonNominees,
    hoh,
    playerIsNominee,
    handleProceedToVoting,
    handleVoteSubmit,
    handleEvictionComplete,
    VOTING_TIME_LIMIT
  };
}
