
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { FastForwardButton } from './FastForwardButton';
import { useIsMobile } from '@/hooks/use-mobile';

const GameHeader: React.FC = () => {
  const { gameState } = useGame();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-between mb-4 bg-slate-800 p-4 rounded-lg shadow">
      <div>
        <h2 className="text-xl font-bold text-white">
          Week {gameState.week}: {gameState.phase} Phase
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <FastForwardButton />
      </div>
    </div>
  );
};

export default GameHeader;
