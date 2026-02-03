
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import HouseguestCardCompact from './houseguest/HouseguestCardCompact';

interface HouseguestListProps {
  compact?: boolean;
}

const HouseguestList: React.FC<HouseguestListProps> = ({ compact = true }) => {
  const { gameState } = useGame();
  
  // Group houseguests by status
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  const juryHouseguests = gameState.houseguests.filter(hg => hg.status === 'Jury');
  const evictedHouseguests = gameState.houseguests.filter(hg => hg.status === 'Evicted');
  const finalistsHouseguests = gameState.houseguests.filter(
    hg => hg.status === 'Winner' || hg.status === 'Runner-Up'
  );
  
  return (
    <div className="space-y-4 overflow-hidden">
      {/* Active houseguests */}
      {activeHouseguests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Active ({activeHouseguests.length})
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {activeHouseguests.map(houseguest => (
              <HouseguestCardCompact 
                key={houseguest.id} 
                houseguest={houseguest} 
                showRelationship
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Finalists */}
      {finalistsHouseguests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Finalists ({finalistsHouseguests.length})
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {finalistsHouseguests.map(houseguest => (
              <HouseguestCardCompact key={houseguest.id} houseguest={houseguest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Jury members */}
      {juryHouseguests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Jury ({juryHouseguests.length})
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {juryHouseguests.map(houseguest => (
              <HouseguestCardCompact key={houseguest.id} houseguest={houseguest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Evicted houseguests */}
      {evictedHouseguests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Evicted ({evictedHouseguests.length})
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {evictedHouseguests.map(houseguest => (
              <HouseguestCardCompact key={houseguest.id} houseguest={houseguest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseguestList;
