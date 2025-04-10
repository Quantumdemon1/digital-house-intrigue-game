import React from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { useGame } from '@/contexts/GameContext';
import GameSetup from '@/components/GameSetup';
import GameScreen from '@/components/game-screen';
import { TooltipProvider } from '@/components/ui/tooltip';
const GameContent = () => {
  const {
    gameState
  } = useGame();

  // Display game setup screen or the actual game based on the phase
  return gameState.phase === 'Setup' ? <GameSetup /> : <GameScreen />;
};
const Index = () => {
  return <div className="min-h-screen flex flex-col bg-slate-900">
      <GameProvider>
        <TooltipProvider>
          <GameContent />
        </TooltipProvider>
      </GameProvider>
    </div>;
};
export default Index;