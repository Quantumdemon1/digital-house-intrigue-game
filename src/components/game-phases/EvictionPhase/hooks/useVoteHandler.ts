
import { useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';

export function useVoteHandler() {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const { dispatch } = useGame();
  const { toast } = useToast();
  
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

    return votes;
  }, [votes, dispatch]);

  // Handle random votes for remaining voters
  const handleRandomVotes = useCallback((missingVoters: Houseguest[], nominees: Houseguest[]) => {
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
    
    toast({
      title: "Time Expired!",
      description: "Voting time has expired. Random votes have been cast for remaining houseguests.",
      variant: "destructive",
    });
    
    setVotes(newVotes);
    return newVotes;
  }, [votes, dispatch, toast]);
  
  return {
    votes,
    setVotes,
    handleVoteSubmit,
    handleRandomVotes
  };
}
