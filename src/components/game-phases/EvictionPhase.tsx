
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { UserX, Users, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { updateHouseguestMentalState } from '@/models/houseguest';
import EvictionInteractionStage from './EvictionPhase/EvictionInteractionStage';
import EvictionVoting from './EvictionPhase/EvictionVoting';
import EvictionResults from './EvictionPhase/EvictionResults';
import { useEvictionPhase } from './EvictionPhase/useEvictionPhase';

const EvictionPhase: React.FC = () => {
  const {
    gameState,
    logger
  } = useGame();

  // Use the eviction hook to manage state and logic
  const {
    stage,
    votes,
    timeRemaining,
    nominees,
    nonNominees,
    hoh,
    playerIsNominee,
    isFinal3,
    handleProceedToVoting,
    handleVoteSubmit,
    handleEvictionComplete,
    VOTING_TIME_LIMIT
  } = useEvictionPhase();

  // Render different content based on the current stage
  const renderStageContent = () => {
    // Special case for Final 3
    if (isFinal3) {
      return (
        <div className="text-center space-y-6">
          <h3 className="text-xl font-semibold mb-4">Final 3 Eviction</h3>
          <p className="text-muted-foreground mb-6">
            At the final 3, the Head of Household solely decides who to evict and who to take to the finale.
          </p>
          
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
            {nominees.map(nominee => (
              <div key={nominee.id} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl mb-2">
                  {nominee.name.charAt(0)}
                </div>
                <p className="font-medium">{nominee.name}</p>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => handleEvictionComplete(nominee)}
                >
                  Evict {nominee.name}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              The evicted houseguest will become the final member of the jury.
            </p>
          </div>
        </div>
      );
    }

    // Regular eviction process
    switch (stage) {
      case 'interaction':
        return <EvictionInteractionStage nominees={nominees} nonNominees={nonNominees} playerIsNominee={playerIsNominee} onInteractionStageComplete={handleProceedToVoting} />;
      case 'voting':
        return <EvictionVoting nominees={nominees} voters={nonNominees} hoh={hoh} votes={votes} onVoteSubmit={handleVoteSubmit} timeRemaining={timeRemaining} totalTime={VOTING_TIME_LIMIT} />;
      case 'results':
        return <EvictionResults nominees={nominees} votes={votes} onComplete={handleEvictionComplete} />;
      default:
        return <p>Preparing eviction ceremony...</p>;
    }
  };

  return <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-red-100/30">
      <CardHeader className="bg-bb-blue text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-200 rounded-full">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl">
              {isFinal3 ? "Final 3 Decision" : "Eviction Ceremony"}
            </CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Week {gameState.week}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Nominees banner - made more prominent */}
        <div className="bg-bb-blue text-white p-4 rounded-md border-2 border-red-300 shadow-md">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-300">
              {isFinal3 ? "Final 3 Houseguests" : "Current Nominees"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Target className="h-5 w-5 text-red-400 animate-pulse" />
              <p className="text-lg font-semibold">
                {nominees.map(nom => nom.name).join(' & ')}
              </p>
              <Target className="h-5 w-5 text-red-400 animate-pulse" />
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Dynamic content based on stage */}
        {renderStageContent()}
      </CardContent>
    </Card>;
};

export default EvictionPhase;
