
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserX, Users, Heart, MessageSquare } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import EvictionInteractionDialog from './EvictionPhase/EvictionInteractionDialog';
import EvictionVoting from './EvictionPhase/EvictionVoting';
import EvictionResults from './EvictionPhase/EvictionResults';

type EvictionStage = 'interaction' | 'voting' | 'results';

const EvictionPhase: React.FC = () => {
  const { gameState, dispatch, getActiveHouseguests } = useGame();
  const { toast } = useToast();
  const [stage, setStage] = useState<EvictionStage>('interaction');
  const [selectedHouseguest, setSelectedHouseguest] = useState<Houseguest | null>(null);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [remainingInteractions, setRemainingInteractions] = useState(3);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isInteractionStageComplete, setIsInteractionStageComplete] = useState(false);
  
  const nominees = gameState.nominees;
  const activeHouseguests = getActiveHouseguests();
  const nonNominees = activeHouseguests.filter(
    guest => !nominees.some(nominee => nominee.id === guest.id) && !guest.isHoH
  );
  const hoh = gameState.hohWinner;
  
  // Check if all non-nominees have voted
  useEffect(() => {
    if (stage === 'voting') {
      const eligibleVoters = nonNominees.filter(guest => !guest.isHoH).length;
      const votesCount = Object.keys(votes).length;
      
      if (eligibleVoters > 0 && votesCount >= eligibleVoters) {
        // All eligible houseguests have voted, move to results
        setTimeout(() => {
          setStage('results');
        }, 2000);
      }
    }
  }, [votes, nonNominees, stage]);
  
  const handleInteractWithHouseguest = (houseguest: Houseguest) => {
    if (remainingInteractions <= 0) {
      toast({
        title: "No Interactions Left",
        description: "You've used all your interactions for this round.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedHouseguest(houseguest);
    setIsInteractionDialogOpen(true);
  };
  
  const handleInteractionComplete = (success: boolean) => {
    setIsInteractionDialogOpen(false);
    
    if (success) {
      setRemainingInteractions(prev => prev - 1);
      
      toast({
        title: "Interaction Complete",
        description: `You have ${remainingInteractions - 1} interactions left.`,
      });
      
      if (remainingInteractions - 1 <= 0) {
        setIsInteractionStageComplete(true);
      }
    }
  };
  
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
  
  const handleProceedToVoting = () => {
    setStage('voting');
    
    toast({
      title: "Voting Phase",
      description: "Houseguests will now cast their votes to evict.",
    });
  };
  
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
  
  // If a player is one of the nominees, they get to interact with houseguests
  const playerIsNominee = nominees.some(nominee => nominee.isPlayer);

  // Render appropriate content based on the stage
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
        {stage === 'interaction' && playerIsNominee && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Campaign for Votes</h3>
              <p className="text-muted-foreground mb-2">
                You're on the block! Interact with houseguests to build relationships and save yourself.
              </p>
              <p className="font-semibold text-bb-red">
                Interactions remaining: {remainingInteractions}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {nonNominees.map(houseguest => (
                <Button
                  key={houseguest.id}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center border-2 hover:border-bb-red transition-colors"
                  disabled={remainingInteractions <= 0}
                  onClick={() => handleInteractWithHouseguest(houseguest)}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg mb-2">
                    {houseguest.name.charAt(0)}
                  </div>
                  <div className="font-semibold">{houseguest.name}</div>
                  <div className="flex items-center mt-2">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>Interact</span>
                  </div>
                </Button>
              ))}
            </div>
            
            {isInteractionStageComplete && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="default"
                  className="bg-bb-red hover:bg-red-700"
                  onClick={handleProceedToVoting}
                >
                  Proceed to Voting
                </Button>
              </div>
            )}
          </div>
        )}
        
        {stage === 'interaction' && !playerIsNominee && (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Nominees Are Campaigning</h3>
            <p className="text-muted-foreground">
              The nominated houseguests are campaigning to stay in the house.
            </p>
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
            <Button 
              variant="default"
              className="bg-bb-red hover:bg-red-700"
              onClick={handleProceedToVoting}
            >
              Proceed to Voting
            </Button>
          </div>
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
      
      {selectedHouseguest && (
        <EvictionInteractionDialog
          open={isInteractionDialogOpen}
          houseguest={selectedHouseguest}
          onClose={() => setIsInteractionDialogOpen(false)}
          onComplete={handleInteractionComplete}
        />
      )}
    </Card>
  );
};

export default EvictionPhase;
