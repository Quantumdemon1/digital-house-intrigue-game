
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import HOHCompetition from './HOHCompetition';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';

const HohCompetitionPhase: React.FC = () => {
  const { gameState, logger, game, dispatch } = useGame();
  const { toast } = useToast();
  const [monitorActive, setMonitorActive] = useState(false);
  const [stuckDetected, setStuckDetected] = useState(false);
  
  // Use an effect to log important information when the component mounts
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
    setMonitorActive(true);
    
    return () => {
      setMonitorActive(false);
      logger?.info('HohCompetitionPhase component unmounted');
    };
  }, [gameState, logger, game]);
  
  // Monitor effect that checks for and handles stuck states
  useEffect(() => {
    if (!monitorActive) return;
    
    const monitorId = setInterval(() => {
      // Check if we've detected a winner but haven't advanced phases
      if (gameState.phase === 'HoH' && gameState.hohWinner) {
        const stuckTime = 10000; // 10 seconds
        logger?.info('Detected potential stuck state: HoH winner selected but phase not advancing');
        
        // Only show the toast once
        if (!stuckDetected) {
          setStuckDetected(true);
          toast({
            title: "Phase transition delayed",
            description: "Attempting to continue to nominations...",
            variant: "default", 
            icon: <AlertCircle className="h-4 w-4" />
          });
        }
        
        // Try multiple methods to advance the phase
        logger?.info('Attempting to recover from stuck state');
        
        // Method 1: Use dispatch to update the game state phase
        dispatch({
          type: 'SET_PHASE',
          payload: 'Nomination'
        });
        
        // Method 2: Try using game.changeState if available
        if (game) {
          try {
            // First try changeState method
            if (typeof game.changeState === 'function') {
              logger?.info("Using game.changeState('NominationState')");
              game.changeState('NominationState');
            } 
            // Direct property set as fallback
            else {
              logger?.info("Setting game.phase directly");
              game.phase = 'Nomination';
            }
          } catch (error) {
            logger?.error("Error changing game state:", error);
          }
        }
        
        // Method 3: Use PLAYER_ACTION to trigger state machine
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'continue_to_nominations',
            params: {}
          }
        });
        
        logger?.info("Multiple recovery methods attempted");
      } else {
        // Reset stuck detection if we're not in a potentially stuck state
        setStuckDetected(false);
      }
    }, stuckTime);
    
    return () => {
      clearInterval(monitorId);
    };
  }, [gameState, game, dispatch, logger, monitorActive, stuckDetected, toast]);
  
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
