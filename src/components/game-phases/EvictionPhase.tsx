
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import EvictionInteractionStage from './EvictionPhase/EvictionInteractionStage';
import EvictionVoting from './EvictionPhase/EvictionVoting';
import EvictionResults from './EvictionPhase/EvictionResults';

type EvictionStage = 'interaction' | 'voting' | 'results';

const EvictionPhase: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const { toast } = useToast();
  const [stage, setStage] = useState<EvictionStage>('interaction');
  const [votes, setVotes] = useState<Record<string, string>>({});
  
  const nominees = gameState.nominees;
  const activeHouseguests = gameState.houseguests.filter(guest => guest.status === 'Active');
  const nonNominees = activeHouseguests.filter(
    guest => !nominees.some(nominee => nominee.id === guest.id) && !guest.isHoH
  );
  const hoh = gameState.hohWinner;
  
  // Check if player is one of the nominees
  const playerIsNominee = nominees.some(nominee => nominee.isPlayer);
  
  // Handle when interaction stage completes
  const handleProceedToVoting = () => {
    setStage('voting');
    
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
