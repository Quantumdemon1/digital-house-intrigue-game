
import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Card } from '@/components/ui/card';
import GameSetup from './GameSetup';
import GamePhaseHeader from './GamePhaseHeader';
import GameLog from './GameEventLog';
import HohPhase from './game-phases/HohPhase';
import NominationPhase from './game-phases/NominationPhase';
import PovPhase from './game-phases/PovPhase';
import PovMeetingPhase from './game-phases/POVMeeting/PovMeetingPhase';
import EvictionPhase from './game-phases/EvictionPhase';
import SocialInteractionPhase from './game-phases/SocialInteractionPhase';
import FinalePhase from './game-phases/FinalePhase';
import GameOverPhase from './game-phases/GameOverPhase';
import HouseguestList from './HouseguestList';
import { AllianceManager } from './alliance/AllianceManager';
import { Separator } from './ui/separator';

const Game = () => {
  const { game, loading } = useGame();
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

  const renderGamePhase = () => {
    switch (game.phase) {
      case 'HoH':
        return <HohPhase />;
      case 'Nomination':
        return <NominationPhase />;
      case 'PoV':
        return <PovPhase />;
      case 'PoVMeeting':
        return <PovMeetingPhase />;
      case 'Eviction':
        return <EvictionPhase />;
      case 'SocialInteraction':
        return <SocialInteractionPhase />;
      case 'Finale':
        return <FinalePhase />;
      case 'GameOver':
        return <GameOverPhase />;
      default:
        return <div>Unknown game phase: {game.phase}</div>;
    }
  };

  return (
    <div className="container py-4 mx-auto">
      {/* Phase header */}
      <GamePhaseHeader
        week={game.week}
        phase={game.phase}
        hoh={game.hohWinner}
        pov={game.povWinner}
        nominees={game.nominees || []}
      />
      
      {/* Navigation tabs */}
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
      
      {/* Main content */}
      <div className="space-y-4">
        {/* Current game phase */}
        {activeTab === 'phase' && renderGamePhase()}
        
        {/* Houseguest list */}
        {activeTab === 'house' && <HouseguestList />}
        
        {/* Game log */}
        {activeTab === 'log' && <GameLog />}
      </div>
      
      {/* Alliance Manager - hidden but functional component */}
      <AllianceManager />
    </div>
  );
};

export default Game;
