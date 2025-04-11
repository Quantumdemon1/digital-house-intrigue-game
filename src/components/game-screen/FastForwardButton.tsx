
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
    if (gameState.phase === 'Eviction') {
      console.log("In Eviction phase, also dispatching eviction_complete");
      dispatch({
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'eviction_complete',
          params: {}
        }
      });
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
