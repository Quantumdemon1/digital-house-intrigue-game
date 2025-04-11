import React from 'react';
import { useGame } from '@/contexts/GameContext';
import HouseguestCard from '../HouseguestCard';
import GameEventLog from '../GameEventLog';
import { ScrollArea } from '@/components/ui/scroll-area';
const GameSidebar: React.FC = () => {
  const {
    gameState,
    getActiveHouseguests
  } = useGame();
  const activeHouseguests = getActiveHouseguests();
  const inactiveHouseguests = gameState.houseguests.filter(h => h.status !== 'Active').sort((a, b) => a.status === 'Jury' ? -1 : 1); // Show jury above evicted

  return <ScrollArea className="h-full">
      <div className="space-y-6 pr-2">
        {/* Houseguest list */}
        <div className="rounded-lg shadow-lg p-4 border bg-[#005a9a]">
          <h2 className="font-bold text-lg mb-4">Houseguests</h2>
          
          <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Active</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 mb-4">
            {activeHouseguests.map(houseguest => <HouseguestCard key={houseguest.id} houseguest={houseguest} showRelationship={true} />)}
          </div>
          
          {inactiveHouseguests.length > 0 && <>
              <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-2 mt-4 pt-2 border-t">Inactive</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {inactiveHouseguests.map(houseguest => <HouseguestCard key={houseguest.id} houseguest={houseguest} showRelationship={true} />)}
              </div>
            </>}
        </div>
        
        {/* Game Event Log */}
        <div className="rounded-lg shadow-lg p-4 border bg-[#005a9a]">
          <h2 className="font-bold text-lg mb-4">House Activity</h2>
          <GameEventLog />
        </div>
      </div>
    </ScrollArea>;
};
export default GameSidebar;