
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import { SaveLoadButton } from './SaveLoadButton';
import FastForwardButton from './FastForwardButton';
import PromiseButton from './PromiseButton';
import GameRecapButton from './GameRecapButton';
import ProfileButton from '../auth/ProfileButton';

const GameHeader: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <header className="p-4 border-b bg-card">
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Digital House Intrigue</h1>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-sm text-muted-foreground">
            Week {gameState.week} • {gameState.phase}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <GameRecapButton />
          <PromiseButton />
          <FastForwardButton />
          <SaveLoadButton />
          <ProfileButton />
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
