
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Shield, Target } from 'lucide-react';
import SaveLoadButton from './SaveLoadButton';
import FastForwardButton from './FastForwardButton';
import PromiseButton from './PromiseButton';
import GameRecapButton from './GameRecapButton';

const GameStatusIndicator: React.FC = () => {
  const { gameState, getActiveHouseguests } = useGame();
  const activeHouseguests = getActiveHouseguests();

  // Get HoH name directly from gameState (it's already a full Houseguest object)
  const getHoHName = () => {
    if (!gameState.hohWinner) return null;
    return gameState.hohWinner.name || null;
  };

  // Get PoV holder name directly from gameState (it's already a full Houseguest object)
  const getPoVName = () => {
    if (!gameState.povWinner) return null;
    return gameState.povWinner.name || null;
  };

  const hohName = getHoHName();
  const povName = getPoVName();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 w-full bg-card/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 border shadow-game-sm max-w-full overflow-hidden">
      {/* Left: Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
        <SaveLoadButton />
        <GameRecapButton />
        <PromiseButton />
        <FastForwardButton />
      </div>
      
      {/* Right: Status badges */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-center sm:justify-end">
        <Badge variant="outline" className="bb-badge muted text-xs">
          <Users className="h-3 w-3" />
          <span className="hidden xs:inline">{activeHouseguests.length} Active</span>
          <span className="xs:hidden">{activeHouseguests.length}</span>
        </Badge>
        
        {hohName && (
          <Badge variant="outline" className="bb-badge gold text-xs">
            <Crown className="h-3 w-3" />
            <span className="hidden sm:inline">HoH:</span> <span className="truncate max-w-[60px] sm:max-w-none">{hohName}</span>
          </Badge>
        )}
        
        {povName && (
          <Badge variant="outline" className="bb-badge gold text-xs">
            <Shield className="h-3 w-3" />
            <span className="hidden sm:inline">PoV:</span> <span className="truncate max-w-[60px] sm:max-w-none">{povName}</span>
          </Badge>
        )}
        
        {gameState.nominees.length > 0 && (
          <Badge variant="outline" className="bb-badge danger text-xs">
            <Target className="h-3 w-3" />
            <span className="hidden xs:inline">{gameState.nominees.length} Nom{gameState.nominees.length > 1 ? 's' : ''}</span>
            <span className="xs:hidden">{gameState.nominees.length}</span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default GameStatusIndicator;
