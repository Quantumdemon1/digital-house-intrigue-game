
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import GamePhaseHeader from './GamePhaseHeader';
import HouseguestCard from './HouseguestCard';
import GameEventLog from './GameEventLog';
import HOHCompetition from './game-phases/HOHCompetition';
import NominationPhase from './game-phases/NominationPhase';
import POVCompetition from './game-phases/POVCompetition';
import POVMeeting from './game-phases/POVMeeting';
import EvictionPhase from './game-phases/EvictionPhase';
import FinalePhase from './game-phases/FinalePhase';
import GameOverPhase from './game-phases/GameOverPhase';

const GameScreen: React.FC = () => {
  const { gameState, getActiveHouseguests } = useGame();
  const { phase } = gameState;
  const activeHouseguests = getActiveHouseguests();

  // Render the appropriate phase component based on the current game phase
  const renderPhaseComponent = () => {
    switch (phase) {
      case 'HoH':
        return <HOHCompetition />;
      case 'Nomination':
        return <NominationPhase />;
      case 'PoV':
        return <POVCompetition />;
      case 'PoVMeeting':
        return <POVMeeting />;
      case 'Eviction':
        return <EvictionPhase />;
      case 'Finale':
        return <FinalePhase />;
      case 'GameOver':
        return <GameOverPhase />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 surveillance-bg">
      <GamePhaseHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main game area */}
        <div className="lg:col-span-2 space-y-6">
          {renderPhaseComponent()}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Houseguest list */}
          <div className="bg-white rounded-lg shadow-lg p-4 border">
            <h2 className="font-bold text-lg mb-4">Houseguests</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {activeHouseguests.map(houseguest => (
                <HouseguestCard 
                  key={houseguest.id} 
                  houseguest={houseguest}
                  showRelationship={true}
                />
              ))}
            </div>
          </div>
          
          {/* Game Event Log */}
          <div className="bg-white rounded-lg shadow-lg p-4 border">
            <h2 className="font-bold text-lg mb-4">House Activity</h2>
            <GameEventLog />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
