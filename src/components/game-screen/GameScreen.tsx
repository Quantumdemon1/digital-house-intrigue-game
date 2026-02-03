
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import PhaseContent from './PhaseContent';
import GameSidebar from './GameSidebar';
import GameHeader from './GameHeader';
import GameStatusIndicator from './GameStatusIndicator';

const GameScreen: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-surveillance-pattern opacity-[0.02] pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-4 md:py-6 space-y-4">
        {/* Header */}
        <GameHeader />
        
        {/* Status Indicator */}
        <GameStatusIndicator />
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Game Area */}
          <div className="lg:flex-1 min-w-0">
            <div className="game-card overflow-hidden">
              <PhaseContent phase={gameState.phase} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="lg:sticky lg:top-4">
              <GameSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
