
import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Card } from '@/components/ui/card';
import GameSetup from './GameSetup';
import GamePhaseHeader from './GamePhaseHeader';
import GameLog from './GameEventLog';
import GameScreen from './game-screen/GameScreen';
import HouseguestListComponent from './HouseguestList';
import { AllianceManager } from './alliance/AllianceManager';
import { Separator } from './ui/separator';
import { AIThoughtsProvider } from './ai-feedback';

const Game = () => {
  const { game, loading, gameState } = useGame();
  const [activeTab, setActiveTab] = useState<'phase' | 'house' | 'log'>('phase');

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-10">
          <p>Loading game...</p>
        </div>
      </Card>
    );
  }

  if (!game) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-10">
          <p>No game data available.</p>
        </div>
      </Card>
    );
  }

  if (game.phase === 'Setup') {
    return <GameSetup />;
  }

  return (
    <AIThoughtsProvider>
      <div className="container py-4 mx-auto">
        <GamePhaseHeader 
          week={game.week}
          phase={game.phase}
          hoh={game.hohWinner ? game.getHouseguestById(game.hohWinner) : null}
          pov={game.povWinner ? game.getHouseguestById(game.povWinner) : null}
          nominees={game.nominees.map(id => game.getHouseguestById(id)).filter(Boolean)}
        />
        
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'phase' 
              ? 'border-b-2 border-primary font-medium text-primary' 
              : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('phase')}
          >
            Game Phase
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'house' 
              ? 'border-b-2 border-primary font-medium text-primary' 
              : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('house')}
          >
            Houseguests
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'log' 
              ? 'border-b-2 border-primary font-medium text-primary' 
              : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('log')}
          >
            Game Log
          </button>
        </div>
        
        <div className="space-y-4">
          {activeTab === 'phase' && <GameScreen />}
          {activeTab === 'house' && <HouseguestListComponent />}
          {activeTab === 'log' && <GameLog />}
        </div>
        
        <AllianceManager />
      </div>
    </AIThoughtsProvider>
  );
};

export default Game;
