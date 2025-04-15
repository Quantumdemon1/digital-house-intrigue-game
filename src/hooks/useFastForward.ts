
import { useCallback } from 'react';
import { useGame } from '@/contexts/game';
import { useGameControl } from '@/contexts/GameControlContext';
import { handleHouseguestEviction, completeEvictionProcess } from '@/utils/eviction-utils';

export function useFastForward() {
  const { dispatch, gameState } = useGame();
  const { isProcessing, fastForward } = useGameControl();
  
  const handleFastForward = useCallback(() => {
    console.log("Fast forward triggered, current phase:", gameState.phase);
    
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

    // Special handling for Eviction phase
    if (gameState.phase === 'Eviction') {
      console.log("Fast-forwarding Eviction phase");
      
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
  }, [gameState.phase, gameState.nominees, gameState.week, dispatch, fastForward]);

  return {
    handleFastForward,
    isProcessing
  };
}
