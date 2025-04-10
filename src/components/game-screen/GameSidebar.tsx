
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import HouseguestCard from '../HouseguestCard';
import GameEventLog from '../GameEventLog';

const GameSidebar: React.FC = () => {
  const { getActiveHouseguests } = useGame();
  const activeHouseguests = getActiveHouseguests();

  return (
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
  );
};

export default GameSidebar;
