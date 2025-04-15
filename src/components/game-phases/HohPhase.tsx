
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import HOHCompetition from './HOHCompetition';

const HohCompetitionPhase: React.FC = () => {
  const { gameState, logger } = useGame();
  
  useEffect(() => {
    if (logger) {
      logger.info(`HohCompetitionPhase rendered, current phase: ${gameState.phase}`);
    }
  }, [gameState.phase, logger]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Week {gameState.week} - Head of Household Competition</CardTitle>
      </CardHeader>
      <CardContent>
        <HOHCompetition />
      </CardContent>
    </Card>
  );
};

export default HohCompetitionPhase;
