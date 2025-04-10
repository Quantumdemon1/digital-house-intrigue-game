
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useFinalePhase } from './useFinalePhase';
import FinalHoHCompetition from './FinalHoHCompetition';
import FinalDecision from './FinalDecision';
import JuryVoteSection from './JuryVoteSection';
import ResultsSection from './ResultsSection';

const FinalePhase: React.FC = () => {
  const { gameState, dispatch, getRelationship } = useGame();
  
  const {
    stage,
    finalHoH,
    finalist,
    winner,
    activeHouseguests,
    startFinalHoHCompetition,
    handleFinalHoHDecision,
    handleJuryVoteComplete,
    continueToGameSummary
  } = useFinalePhase(gameState, dispatch, getRelationship);
  
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2" /> Season Finale
        </CardTitle>
        <CardDescription className="text-white/80">
          Final Week
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {stage === 'HoHCompetition' && (
          <FinalHoHCompetition 
            activeHouseguests={activeHouseguests}
            startFinalHoHCompetition={startFinalHoHCompetition}
          />
        )}
        
        {stage === 'FinalDecision' && finalHoH && finalHoH.isPlayer && (
          <FinalDecision
            finalHoH={finalHoH}
            activeHouseguests={activeHouseguests}
            handleFinalHoHDecision={handleFinalHoHDecision}
          />
        )}
        
        {stage === 'JuryVote' && finalHoH && finalist && (
          <JuryVoteSection
            finalHoH={finalHoH}
            finalist={finalist}
            juryMembers={gameState.juryMembers}
            handleJuryVoteComplete={handleJuryVoteComplete}
            getRelationship={getRelationship}
          />
        )}
        
        {stage === 'Results' && winner && (
          <ResultsSection
            winner={winner}
            onContinue={continueToGameSummary}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FinalePhase;
