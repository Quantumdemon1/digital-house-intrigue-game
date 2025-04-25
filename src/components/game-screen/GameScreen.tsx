
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import PhaseContent from './PhaseContent';
import FastForwardButton from './FastForwardButton';
import GameRecapButton from './GameRecapButton';
import GameSidebar from './GameSidebar';
import SaveLoadButton from './SaveLoadButton';
import GameHeader from './GameHeader';
import GameStatusIndicator from './GameStatusIndicator';

const GameScreen: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <GameHeader />
      </div>
      
      <div className="mb-4">
        <GameStatusIndicator />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-3/4">
          <Card className="overflow-hidden shadow-md">
            <div className="p-0">
              <PhaseContent phase={gameState.phase} />
            </div>
          </Card>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <FastForwardButton />
            <GameRecapButton />
            <SaveLoadButton />
          </div>
        </div>
        
        <div className="lg:w-1/4 mt-4 lg:mt-0">
          <GameSidebar />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
