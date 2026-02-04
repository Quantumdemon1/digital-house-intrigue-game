import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, SkipForward, Eye, Loader2 } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useFastForward } from '@/hooks/useFastForward';
import { cn } from '@/lib/utils';

const SpectatorBanner: React.FC = () => {
  const { gameState } = useGame();
  const { handleFastForward, isProcessing } = useFastForward();
  
  if (!gameState.isSpectatorMode) return null;
  
  const player = gameState.houseguests.find(h => h.isPlayer);
  const playerStatus = player?.status;
  const isJury = playerStatus === 'Jury';
  
  return (
    <div className="bg-gradient-to-r from-purple-900/90 to-purple-800/90 text-white px-4 py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-purple-500/30 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-purple-700/50">
          {isJury ? (
            <Users className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-semibold">
            {isJury 
              ? "You are now a jury member" 
              : "You have been evicted"
            }
          </p>
          <p className="text-sm text-purple-200">
            {isJury 
              ? "Watch the remaining game unfold and vote for the winner in the finale."
              : "Watch the remaining game unfold."
            }
          </p>
        </div>
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleFastForward}
        disabled={isProcessing}
        className={cn(
          "bg-white/10 hover:bg-white/20 text-white border-white/20 shrink-0",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <SkipForward className="h-4 w-4 mr-1" />
            Skip to Next Phase
          </>
        )}
      </Button>
    </div>
  );
};

export default SpectatorBanner;
