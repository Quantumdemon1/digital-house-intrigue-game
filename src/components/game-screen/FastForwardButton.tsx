
import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipForward } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useGameControl } from '@/contexts/GameControlContext';
import { useToast } from '@/hooks/use-toast';

export const FastForwardButton: React.FC = () => {
  const { dispatch, gameState } = useGame();
  const { isProcessing, fastForward } = useGameControl();
  const { toast } = useToast();

  const handleFastForward = () => {
    console.log("Fast forward button clicked, current phase:", gameState.phase);
    
    // Use the game control context to trigger fast forward
    fastForward();
    
    // Also dispatch the action to the game reducer for state handling
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'fast_forward',
        params: { currentPhase: gameState.phase }
      }
    });

    // If we're in eviction phase, also trigger eviction_complete
    // This ensures the eviction is processed and the houseguest is removed
    if (gameState.phase === 'Eviction') {
      console.log("In Eviction phase, handling eviction and advancing week");
      
      // If we have nominees, pick one to evict automatically
      if (gameState.nominees && gameState.nominees.length > 0) {
        const evictedNominee = gameState.nominees[0]; // Just pick the first nominee
        
        // First evict the houseguest
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'evict_houseguest',
            params: {
              evictedId: evictedNominee.id,
              toJury: gameState.week >= 5 // Jury starts week 5 or later
            }
          }
        });
        
        // Then complete the eviction process
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'eviction_complete',
            params: {}
          }
        });
      } else {
        // Just complete the eviction phase if no nominees are available
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: 'eviction_complete',
            params: {}
          }
        });
      }
    }

    toast({
      title: "Fast forwarding...",
      description: `Skipping to next event`,
    });
  };

  return (
    <Button 
      onClick={handleFastForward}
      variant="secondary"
      className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white"
      disabled={isProcessing}
    >
      <SkipForward className="w-4 h-4" />
      Fast Forward
    </Button>
  );
};
