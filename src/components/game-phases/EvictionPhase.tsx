import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { UserX, Users, Clock } from 'lucide-react';
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
    handleProceedToVoting,
    handleVoteSubmit,
    handleEvictionComplete,
    VOTING_TIME_LIMIT
  } = useEvictionPhase();

  // Render different content based on the current stage
  const renderStageContent = () => {
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
            <CardTitle className="text-xl md:text-2xl">Eviction Ceremony</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Week {gameState.week}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Nominees banner */}
        <div className="bg-bb-blue text-white">
          <div>
            <p className="text-sm text-muted-foreground">Current Nominees</p>
            <p className="text-lg font-semibold">
              {nominees.map(nom => nom.name).join(' & ')}
            </p>
          </div>
          
        </div>
        
        <Separator className="my-4" />
        
        {/* Dynamic content based on stage */}
        {renderStageContent()}
      </CardContent>
    </Card>;
};
export default EvictionPhase;