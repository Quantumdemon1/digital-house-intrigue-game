
import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { Houseguest } from '@/models/houseguest';

export const usePhaseTransition = (winner: Houseguest | null, transitionAttempted: boolean, setTransitionAttempted: (value: boolean) => void) => {
  const { gameState, dispatch, logger } = useGame();
  const { toast } = useToast();
  const transitioningRef = useRef(false);

  // Function to safely advance to the nomination phase
  const advanceToNomination = useCallback(() => {
    // Prevent duplicate transitions with both ref and state
    if (transitionAttempted || transitioningRef.current) {
      logger?.warn("Phase transition already attempted, ignoring duplicate request");
      return;
    }
    
    // Set both flags to prevent race conditions
    transitioningRef.current = true;
    setTransitionAttempted(true);
    
    logger?.info("Advancing to nomination phase");
    
    // Add a small delay to ensure React state updates properly
    setTimeout(() => {
      // Method 1: Primary method - dispatch SET_PHASE action
      dispatch({
        type: 'SET_PHASE',
        payload: 'Nomination'
      });
      
      // Method 2: Secondary method - dispatch player action for game engine
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
    }, 100); // Small delay to prevent React state issues
  }, [dispatch, logger, toast, transitionAttempted, setTransitionAttempted]);
  
  // Effect to monitor phase transitions
  useEffect(() => {
    // Only start if we're in the HoH phase and there's a winner but haven't attempted phase transition yet
    if (winner && !transitionAttempted && !transitioningRef.current && gameState.phase === 'HoH') {
      logger?.info("Winner selected, scheduling transition");
      const transitionTimer = setTimeout(() => {
        advanceToNomination();
      }, 4000); // 4 seconds after displaying the results
      
      return () => clearTimeout(transitionTimer);
    }
  }, [gameState.phase, winner, logger, transitionAttempted, advanceToNomination]);

  return { advanceToNomination };
};
