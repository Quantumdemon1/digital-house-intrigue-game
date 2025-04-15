
import { useCallback, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { Houseguest } from '@/models/houseguest';

export const usePhaseTransition = (winner: Houseguest | null, transitionAttempted: boolean, setTransitionAttempted: (value: boolean) => void) => {
  const { gameState, dispatch, game, logger } = useGame();
  const { toast } = useToast();

  // Function to safely advance to the nomination phase
  const advanceToNomination = useCallback(() => {
    // Mark that we've attempted a transition
    setTransitionAttempted(true);
    
    logger?.info("Attempting to advance to nomination phase with multiple methods");
    
    // Method 1: Use dispatch to update the game state phase
    dispatch({
      type: 'SET_PHASE',
      payload: 'Nomination'
    });
    
    // Method 2: Try using game.changeState if available
    if (game) {
      logger?.info("Using game.changeState method");
      try {
        if (typeof game.changeState === 'function') {
          game.changeState('NominationState');
          logger?.info("Successfully called game.changeState('NominationState')");
        } else {
          logger?.warn("game.changeState is not a function");
          
          // Method 3: As a fallback, set phase directly
          logger?.info("Attempting fallback: setting phase directly");
          if ('phase' in game) {
            game.phase = 'Nomination';
            logger?.info("Set game phase directly to Nomination");
          }
        }
      } catch (error) {
        logger?.error("Error changing game state:", error);
      }
    } else {
      logger?.warn("Game object not available for state transition");
    }
    
    // Method 4: Additional dispatch for the game engine
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_nominations',
        params: {}
      }
    });
    
    // Show a toast to inform the user
    toast({
      title: "Moving to Nominations",
      description: "The Head of Household will now nominate two houseguests.",
    });
  }, [dispatch, game, logger, toast, setTransitionAttempted]);
  
  // Effect to monitor phase transitions
  useEffect(() => {
    // Only start if we're in the HoH phase and there's a winner but haven't attempted phase transition yet
    if (winner && !transitionAttempted && gameState.phase === 'HoH') {
      logger?.info("Winner selected but phase transition not attempted yet, scheduling transition");
      const transitionTimer = setTimeout(() => {
        advanceToNomination();
      }, 4000); // 4 seconds after displaying the results
      
      return () => clearTimeout(transitionTimer);
    }
  }, [gameState.phase, winner, logger, transitionAttempted, advanceToNomination]);

  return { advanceToNomination };
};
