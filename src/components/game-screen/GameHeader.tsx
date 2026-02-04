
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import ProfileButton from '../auth/ProfileButton';
import { PhaseIndicator, WeekIndicator } from '@/components/ui/phase-indicator';

const GameHeader: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <header className="relative overflow-hidden rounded-xl border bg-card shadow-game-md">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-surveillance-pattern opacity-5" />
      
      <div className="relative p-4">
        {/* Top row: Title, Week, Profile */}
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Title and Week */}
          <div className="flex items-center gap-4">
            <h1 className="game-title text-lg md:text-xl">Digital House Intrigue</h1>
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            <WeekIndicator week={gameState.week} className="hidden md:flex" />
          </div>
          
          {/* Right side: Profile only */}
          <ProfileButton />
        </div>
        
        {/* Phase Indicator - Full width below title */}
        <div className="mt-4">
          <PhaseIndicator 
            currentPhase={gameState.phase} 
            week={gameState.week} 
          />
        </div>
        
        {/* Mobile: Week indicator below phase on small screens */}
        <div className="md:hidden mt-3 flex justify-center">
          <WeekIndicator week={gameState.week} />
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
