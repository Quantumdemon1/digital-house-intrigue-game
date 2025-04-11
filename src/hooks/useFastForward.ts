
import { useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useGameControl } from '@/contexts/GameControlContext';

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
        
        // Evict the first nominee
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'evict_houseguest',
            params: {
              evictedId: evictedNominee.id,
              toJury: gameState.week >= 5
            }
          }
        });
        
        // Complete the eviction process
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'eviction_complete',
            params: {}
          }
        });
      } else {
        // Complete the eviction if no nominees are available
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'eviction_complete',
            params: {}
          }
        });
      }
    }
  }, [gameState.phase, gameState.nominees, gameState.week, dispatch, fastForward]);

  return {
    handleFastForward,
    isProcessing
  };
}
