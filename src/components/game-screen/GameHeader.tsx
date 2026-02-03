
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import SaveLoadButton from './SaveLoadButton';
import FastForwardButton from './FastForwardButton';
import PromiseButton from './PromiseButton';
import GameRecapButton from './GameRecapButton';
import ProfileButton from '../auth/ProfileButton';
import { PhaseIndicator, WeekIndicator } from '@/components/ui/phase-indicator';

const GameHeader: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <header className="relative overflow-hidden rounded-xl border bg-card shadow-game-md">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-surveillance-pattern opacity-5" />
      
      <div className="relative p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side: Title and Week */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="game-title text-lg md:text-xl">Digital House Intrigue</h1>
            </div>
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            <WeekIndicator week={gameState.week} className="hidden md:flex" />
          </div>
          
          {/* Center: Phase Indicator (hidden on mobile) */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-4">
            <PhaseIndicator 
              currentPhase={gameState.phase} 
              week={gameState.week} 
              compact={true}
            />
          </div>
          
          {/* Right side: Action buttons */}
          <div className="flex items-center gap-2">
            <GameRecapButton />
            <PromiseButton />
            <FastForwardButton />
            <SaveLoadButton />
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ProfileButton />
          </div>
        </div>
        
        {/* Mobile: Week and Phase below title */}
        <div className="lg:hidden mt-3 flex items-center justify-between">
          <WeekIndicator week={gameState.week} />
          <PhaseIndicator 
            currentPhase={gameState.phase} 
            week={gameState.week}
            compact={true}
          />
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
