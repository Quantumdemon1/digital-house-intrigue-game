
import { useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest, updateHouseguestMentalState } from '@/models/houseguest';
import { useGameControl } from '@/contexts/GameControlContext';
import { handleHouseguestEviction, completeEvictionProcess } from '@/utils/eviction-utils';

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
    
    // Use the shared utility to handle eviction
    handleHouseguestEviction(
      dispatch, 
      evictedHouseguest, 
      gameState.week >= 5,  // Jury eligibility typically starts around week 5
      gameState.week
    );
    
    toast({
      title: "Houseguest Evicted",
      description: `${evictedHouseguest.name} has been evicted from the Big Brother house.`,
    });
    
    // Update mental state for evicted houseguest
    updateHouseguestMentalState(evictedHouseguest, 'negative_interaction');
    
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
      
      // Complete the eviction process
      completeEvictionProcess(dispatch);
      
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
