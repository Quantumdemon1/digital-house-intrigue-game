
import { useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import { useGameControl } from '@/contexts/GameControlContext';

export function useEvictionCompletion() {
  const { dispatch, gameState } = useGame();
  const { toast } = useToast();
  const { isProcessing } = useGameControl();
  
  // Handle eviction completion
  const handleEvictionComplete = useCallback((evictedHouseguest: Houseguest) => {
    console.log("handleEvictionComplete called for", evictedHouseguest.name);
    
    if (isProcessing) {
      console.log("Skipping eviction action - already processing");
      return;
    }
    
    // Process the eviction using PLAYER_ACTION
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'evict_houseguest',
        params: {
          evictedId: evictedHouseguest.id,
          toJury: gameState.week >= 5
        }
      }
    });
    
    toast({
      title: "Houseguest Evicted",
      description: `${evictedHouseguest.name} has been evicted from the Big Brother house.`,
    });
    
    // Advance to the next week
    setTimeout(() => {
      console.log("Dispatching advance_week action");
      
      dispatch({ 
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'advance_week',
          params: {}
        }
      });
      
      // Also dispatch eviction_complete action to ensure state transition
      dispatch({ 
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'eviction_complete',
          params: {}
        }
      });
      
      toast({
        title: "New Week Begins",
        description: `Week ${gameState.week + 1} has begun.`,
      });
    }, 2000);
  }, [dispatch, gameState.week, toast, isProcessing]);

  return {
    handleEvictionComplete
  };
}
