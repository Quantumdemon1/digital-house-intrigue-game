
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import GamePhaseHeader from '../GamePhaseHeader';
import GameSidebar from './GameSidebar';
import PhaseContent from './PhaseContent';

const GameScreen: React.FC = () => {
  const { gameState } = useGame();
  const { phase } = gameState;

  return (
    <div className="container mx-auto p-4 surveillance-bg">
      <GamePhaseHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main game area */}
        <div className="lg:col-span-2 space-y-6">
          <PhaseContent phase={phase} />
        </div>
        
        {/* Sidebar */}
        <GameSidebar />
      </div>
    </div>
  );
};

export default GameScreen;
