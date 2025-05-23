
import { useCallback, useState } from 'react';
import { useGame } from '@/contexts/game';
import { useGameControl } from '@/contexts/GameControlContext';
import { handleHouseguestEviction, completeEvictionProcess } from '@/utils/eviction-utils';

export function useFastForward() {
  const { dispatch, gameState, logger } = useGame();
  const { isProcessing, fastForward } = useGameControl();
  const [internalProcessing, setInternalProcessing] = useState(false);
  
  const handleFastForward = useCallback(() => {
    // Prevent duplicate fast forwards
    if (internalProcessing) {
      return;
    }
    
    setInternalProcessing(true);
    logger?.info("Fast forward triggered, current phase:", gameState.phase);
    
    // Trigger the fast forward in the game control context
    fastForward();
    
    // Dispatch player action to the game reducer
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'fast_forward',
        params: { currentPhase: gameState.phase }
      }
    });

    // Create and dispatch a custom event for component listeners
    // This is the critical part that triggers component-specific fast forward handling
    logger?.info("Dispatching game:fastForward event");
    const fastForwardEvent = new Event('game:fastForward');
    document.dispatchEvent(fastForwardEvent);

    // Special handling for Eviction phase
    if (gameState.phase === 'Eviction') {
      logger?.info("Fast-forwarding Eviction phase");
      
      if (gameState.nominees && gameState.nominees.length > 0) {
        const evictedNominee = gameState.nominees[0];
        
        // Use the shared utility to handle eviction
        handleHouseguestEviction(
          dispatch, 
          evictedNominee, 
          gameState.week >= 5
        );
        
        // Complete the eviction process
        completeEvictionProcess(dispatch);
      } else {
        // Complete the eviction if no nominees are available
        completeEvictionProcess(dispatch);
      }
    }
    
    // For other phases, try a direct phase transition as a backup
    // This is a failsafe in case the event listener doesn't work
    if (gameState.phase === 'HoH') {
      logger?.info("Backup phase transition for HoH phase");
      setTimeout(() => {
        if (gameState.phase === 'HoH') {
          logger?.info("Attempting direct phase change as backup");
          dispatch({
            type: 'SET_PHASE',
            payload: 'Nomination'
          });
        }
      }, 1000);
    }
    
    // Reset processing state after delay
    setTimeout(() => {
      setInternalProcessing(false);
      logger?.info("Fast forward processing complete, state reset");
    }, 1500);
  }, [gameState.phase, gameState.nominees, gameState.week, dispatch, fastForward, logger, internalProcessing]);

  return {
    handleFastForward,
    isProcessing: isProcessing || internalProcessing
  };
}
