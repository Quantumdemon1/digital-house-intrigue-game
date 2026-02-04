
import { useCallback, useState, useRef, useEffect } from 'react';
import { useGame } from '@/contexts/game';
import { useGameControl } from '@/contexts/GameControlContext';
import { handleHouseguestEviction, completeEvictionProcess } from '@/utils/eviction-utils';

export function useFastForward() {
  const { dispatch, gameState, logger } = useGame();
  const { isProcessing, fastForward } = useGameControl();
  const [internalProcessing, setInternalProcessing] = useState(false);
  
  // Use ref to always have access to fresh state (avoids stale closure issues)
  const gameStateRef = useRef(gameState);
  
  // Keep ref updated with latest state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  const handleFastForward = useCallback(() => {
    // Prevent duplicate fast forwards
    if (internalProcessing) {
      logger?.info("Fast forward blocked: already processing");
      return;
    }
    
    // Get fresh state from ref
    const currentState = gameStateRef.current;
    
    setInternalProcessing(true);
    logger?.info("Fast forward triggered, current phase:", currentState.phase);
    
    // CRITICAL: Validate eviction phase has nominees before allowing fast-forward
    if (currentState.phase === 'Eviction') {
      if (!currentState.nominees || currentState.nominees.length < 2) {
        logger?.warn("Fast-forward blocked: Eviction phase has no/insufficient nominees", {
          nominees: currentState.nominees?.length || 0
        });
        setInternalProcessing(false);
        return; // Block the fast-forward entirely
      }
      
      // Also check if eviction already happened this week
      if (currentState.evictionCompletedThisWeek) {
        logger?.info("Eviction already completed this week, proceeding to next phase");
      }
    }
    
    // Trigger the fast forward in the game control context
    fastForward();
    
    // Dispatch player action to the game reducer
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'fast_forward',
        params: { currentPhase: currentState.phase }
      }
    });

    // Create and dispatch a custom event for component listeners
    logger?.info("Dispatching game:fastForward event");
    const fastForwardEvent = new Event('game:fastForward');
    document.dispatchEvent(fastForwardEvent);

    // Special handling for Eviction phase
    if (currentState.phase === 'Eviction') {
      logger?.info("Fast-forwarding Eviction phase");
      
      if (currentState.nominees && currentState.nominees.length > 0) {
        const evictedNominee = currentState.nominees[0];
        
        // Use the shared utility to handle eviction
        handleHouseguestEviction(
          dispatch, 
          evictedNominee, 
          currentState.week >= 5,
          currentState.week
        );
        
        // Complete the eviction process
        completeEvictionProcess(dispatch);
      } else {
        // Complete the eviction if no nominees are available
        completeEvictionProcess(dispatch);
      }
    }
    
    // For other phases, try a direct phase transition as a backup
    if (currentState.phase === 'HoH') {
      logger?.info("Backup phase transition for HoH phase");
      setTimeout(() => {
        const freshState = gameStateRef.current;
        if (freshState.phase === 'HoH') {
          logger?.info("Attempting direct phase change as backup");
          dispatch({
            type: 'SET_PHASE',
            payload: 'Nomination'
          });
        }
      }, 1000);
    }
    
    // Reset processing state after longer delay to prevent rapid clicks
    setTimeout(() => {
      setInternalProcessing(false);
      logger?.info("Fast forward processing complete, state reset");
    }, 3000); // Increased from 1500ms to 3000ms
  }, [dispatch, fastForward, logger, internalProcessing]);

  return {
    handleFastForward,
    isProcessing: isProcessing || internalProcessing
  };
}
