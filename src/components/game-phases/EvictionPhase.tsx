
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import EvictionInteractionStage from './EvictionPhase/EvictionInteractionStage';
import EvictionVoting from './EvictionPhase/EvictionVoting';
import EvictionResults from './EvictionPhase/EvictionResults';

type EvictionStage = 'interaction' | 'voting' | 'results';

const VOTING_TIME_LIMIT = 60; // 60 seconds for all voting

const EvictionPhase: React.FC = () => {
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
          
          // Update in game state
          dispatch({
            type: 'LOG_EVENT',
            payload: {
              week: gameState.week,
              phase: gameState.phase,
              type: 'vote',
              description: `${voter.name} ran out of time and a random vote was cast.`,
              involvedHouseguests: [voter.id, randomNominee.id]
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
    
    // Update in game state
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: gameState.phase,
        type: 'vote',
        description: `A houseguest voted to evict someone.`,
        involvedHouseguests: [voterId, nomineeId]
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
    // Process the eviction
    dispatch({
      type: 'EVICT_HOUSEGUEST',
      payload: {
        evicted: evictedHouseguest,
        toJury: gameState.week >= 5 // For example, after week 5 evicted HGs go to jury
      }
    });
    
    // Log the eviction
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: gameState.phase,
        type: 'eviction',
        description: `${evictedHouseguest.name} has been evicted from the house.`,
        involvedHouseguests: [evictedHouseguest.id]
      }
    });
    
    // Advance to the next week
    setTimeout(() => {
      dispatch({ type: 'ADVANCE_WEEK' });
      
      toast({
        title: "New Week Begins",
        description: `Week ${gameState.week + 1} has begun.`,
      });
    }, 5000);
  };
  
  return (
    <Card className="shadow-lg border-bb-red">
      <CardHeader className="bg-bb-red text-white">
        <CardTitle className="flex items-center">
          <UserX className="mr-2" /> Eviction Night
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {stage === 'interaction' && (
          <EvictionInteractionStage
            nominees={nominees}
            nonNominees={nonNominees}
            playerIsNominee={playerIsNominee}
            onInteractionStageComplete={handleProceedToVoting}
          />
        )}
        
        {stage === 'voting' && (
          <EvictionVoting 
            nominees={nominees} 
            voters={nonNominees}
            hoh={hoh}
            onVoteSubmit={handleVoteSubmit}
            votes={votes}
            timeRemaining={timeRemaining}
            totalTime={VOTING_TIME_LIMIT}
          />
        )}
        
        {stage === 'results' && (
          <EvictionResults 
            nominees={nominees}
            votes={votes}
            onComplete={handleEvictionComplete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EvictionPhase;
