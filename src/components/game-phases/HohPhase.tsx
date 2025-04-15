
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import HOHCompetition from './HOHCompetition';

const HohCompetitionPhase: React.FC = () => {
  const { gameState, logger, game, dispatch } = useGame();
  
  useEffect(() => {
    if (logger) {
      logger.info(`HohCompetitionPhase rendered, current phase: ${gameState.phase}`);
      logger.info('Game state details:', {
        week: gameState.week,
        phase: gameState.phase,
        hohWinner: gameState.hohWinner,
        houseguestCount: gameState.houseguests.filter(h => h.status === 'Active').length
      });
      
      // Add check for game object to help debug
      if (game) {
        logger.info('Game object available', {
          gamePhase: game.phase,
          hohWinner: game.hohWinner,
          currentState: game.currentState ? game.currentState.constructor.name : 'None'
        });
      } else {
        logger.warn('Game object not available in HohPhase');
      }
    }
    
    // Set up a periodic monitor to detect stuck competition
    const monitorId = setInterval(() => {
      if (gameState.phase === 'HoH' && game?.phase === 'HoH' && gameState.hohWinner) {
        logger.info('Detected HoH winner but phase not advancing, attempting to force transition');
        dispatch({
          type: 'SET_PHASE',
          payload: 'Nomination'
        });
        
        if (game) {
          try {
            game.phase = 'Nomination';
            logger.info('Forced phase transition to Nomination');
          } catch (error) {
            logger.error('Failed to force phase transition:', error);
          }
        }
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(monitorId);
      logger?.info('HohCompetitionPhase component unmounted');
    };
  }, [gameState, logger, game, dispatch]);
  
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
