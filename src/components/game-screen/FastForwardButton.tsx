
import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipForward } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useGameControl } from '@/contexts/GameControlContext';
import { useToast } from '@/hooks/use-toast';

export const FastForwardButton: React.FC = () => {
  const { dispatch, gameState } = useGame();
  const { isProcessing } = useGameControl();
  const { toast } = useToast();

  const handleFastForward = () => {
    // Dispatch the action to the game reducer
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'fast_forward',
        params: { currentPhase: gameState.phase }
      }
    });

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
