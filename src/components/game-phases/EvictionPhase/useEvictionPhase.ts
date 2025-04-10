
import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';

type EvictionStage = 'interaction' | 'voting' | 'results';

const VOTING_TIME_LIMIT = 60; // 60 seconds for all voting

export function useEvictionPhase() {
  const { gameState, dispatch } = useGame();
  const { toast } = useToast();
  const [stage, setStage] = useState<EvictionStage>('interaction');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(VOTING_TIME_LIMIT);
  const [votingStarted, setVotingStarted] = useState(false);
  
  const nominees = gameState.nominees;
  const activeHouseguests = gameState.houseguests.filter(guest => guest.status === 'Active');
  const nonNominees = activeHouseguests.filter(
    guest => !nominees.some(nominee => nominee.id === guest.id) && !guest.isHoH
  );
  const hoh = gameState.hohWinner;
  
  // Check if player is one of the nominees
  const playerIsNominee = nominees.some(nominee => nominee.isPlayer);

  // Start timer when voting begins
  useEffect(() => {
    if (stage === 'voting' && !votingStarted) {
      setVotingStarted(true);
      setTimeRemaining(VOTING_TIME_LIMIT);
    }
  }, [stage, votingStarted]);

  // Countdown timer for voting phase
  useEffect(() => {
    if (stage !== 'voting' || !votingStarted || timeRemaining <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, votingStarted, stage]);

  // Handle time expiration
  useEffect(() => {
    if (timeRemaining <= 0 && stage === 'voting') {
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
    }
  }, [timeRemaining, votes, nominees, nonNominees, stage, dispatch, gameState, toast]);

  // Handle when interaction stage completes
  const handleProceedToVoting = () => {
    setStage('voting');
    setVotingStarted(true);
    
    toast({
      title: "Voting Phase",
      description: "Houseguests will now cast their votes to evict.",
    });
  };
  
  // Handle vote submission
  const handleVoteSubmit = (voterId: string, nomineeId: string) => {
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
  };
  
  // Handle eviction completion
  const handleEvictionComplete = (evictedHouseguest: Houseguest) => {
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
    
    // Advance to the next week
    setTimeout(() => {
      dispatch({ 
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'advance_week',
          params: {}
        }
      });
      
      toast({
        title: "New Week Begins",
        description: `Week ${gameState.week + 1} has begun.`,
      });
    }, 5000);
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
    handleVoteSubmit,
    handleEvictionComplete,
    VOTING_TIME_LIMIT
  };
}
