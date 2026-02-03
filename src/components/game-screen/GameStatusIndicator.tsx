
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown, Users, Shield, Target } from 'lucide-react';
import { PhaseBadge } from '@/components/ui/phase-indicator';

const GameStatusIndicator: React.FC = () => {
  const { gameState, getActiveHouseguests, getHouseguestById } = useGame();
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
    <div className="flex flex-wrap items-center justify-between gap-2 w-full bg-card/50 backdrop-blur-sm rounded-lg p-3 border shadow-game-sm">
      {/* Left: Week and Phase */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bb-badge muted">
          <Clock className="h-3 w-3" />
          Week {gameState.week}
        </Badge>
        
        <PhaseBadge phase={gameState.phase} />
      </div>
      
      {/* Right: Status badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bb-badge muted">
          <Users className="h-3 w-3" />
          {activeHouseguests.length} Active
        </Badge>
        
        {hohName && (
          <Badge variant="outline" className="bb-badge gold">
            <Crown className="h-3 w-3" />
            HoH: {hohName}
          </Badge>
        )}
        
        {povName && (
          <Badge variant="outline" className="bb-badge gold">
            <Shield className="h-3 w-3" />
            PoV: {povName}
          </Badge>
        )}
        
        {gameState.nominees.length > 0 && (
          <Badge variant="outline" className="bb-badge danger">
            <Target className="h-3 w-3" />
            {gameState.nominees.length} Nominee{gameState.nominees.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default GameStatusIndicator;
