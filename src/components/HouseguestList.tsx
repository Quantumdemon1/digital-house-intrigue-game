
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import HouseguestCard from './HouseguestCard';

const HouseguestList: React.FC = () => {
  const { gameState } = useGame();
  
  // Group houseguests by status
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  const juryHouseguests = gameState.houseguests.filter(hg => hg.status === 'Jury');
  const evictedHouseguests = gameState.houseguests.filter(hg => hg.status === 'Evicted');
  const finalistsHouseguests = gameState.houseguests.filter(
    hg => hg.status === 'Winner' || hg.status === 'Runner-Up'
  );
  
  return (
    <div className="space-y-6">
      {/* Active houseguests */}
      {activeHouseguests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Houseguests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeHouseguests.map(houseguest => (
              <HouseguestCard key={houseguest.id} houseguest={houseguest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Finalists */}
      {finalistsHouseguests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Finalists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {finalistsHouseguests.map(houseguest => (
              <HouseguestCard key={houseguest.id} houseguest={houseguest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Jury members */}
      {juryHouseguests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Jury Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {juryHouseguests.map(houseguest => (
              <HouseguestCard key={houseguest.id} houseguest={houseguest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Evicted houseguests */}
      {evictedHouseguests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Evicted Houseguests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {evictedHouseguests.map(houseguest => (
              <HouseguestCard key={houseguest.id} houseguest={houseguest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseguestList;
