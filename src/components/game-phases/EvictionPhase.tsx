
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX } from 'lucide-react';
import { useEvictionPhase } from './EvictionPhase/useEvictionPhase';
import EvictionInteractionStage from './EvictionPhase/EvictionInteractionStage';
import EvictionVoting from './EvictionPhase/EvictionVoting';
import EvictionResults from './EvictionPhase/EvictionResults';

const EvictionPhase: React.FC = () => {
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
  
  return (
    <Card className="shadow-lg border-bb-red">
      <CardHeader className="bg-bb-red text-white">
        <CardTitle className="flex items-center">
          <UserX className="mr-2" /> Eviction Night
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {/* Get week from context */}
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
