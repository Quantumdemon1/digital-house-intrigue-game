
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { FastForwardButton } from './FastForwardButton';
import { Badge } from '@/components/ui/badge';
import { AIThoughtToggle } from '@/components/ai-feedback';

const GameHeader: React.FC = () => {
  const { game, getActiveHouseguests, gameState } = useGame();
  
  if (!game) {
    return <div className="flex justify-between items-center py-2 mb-4">Loading...</div>;
  }
  
  const activeHouseguests = getActiveHouseguests();
  const weekDisplay = `Week ${game.week}`;
  const phaseDisplay = game.phase;
  
  return (
    <div className="flex justify-between items-center py-2 mb-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-mono text-xs">
          {weekDisplay}
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {phaseDisplay}
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {activeHouseguests.length} Houseguests
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <AIThoughtToggle variant="small" />
        <FastForwardButton />
      </div>
    </div>
  );
};

export default GameHeader;
