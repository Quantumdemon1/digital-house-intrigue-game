
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';

const HouseguestList: React.FC = () => {
  const { game } = useGame();
  
  if (!game) {
    return <p>No game data available.</p>;
  }
  
  const activeHouseguests = game.getActiveHouseguests();
  const evictedHouseguests = game.houseguests.filter(hg => hg.status === 'Evicted');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Houseguests</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold mb-2">Active ({activeHouseguests.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {activeHouseguests.map(houseguest => (
            <div key={houseguest.id} className="border rounded p-2">
              <div className="font-semibold">{houseguest.name}</div>
              <div className="flex gap-1 flex-wrap mt-1">
                {houseguest.isPlayer && <Badge>Player</Badge>}
                {houseguest.isHoH && <Badge variant="secondary">HoH</Badge>}
                {houseguest.isPovHolder && <Badge variant="outline">PoV</Badge>}
                {houseguest.isNominated && <Badge variant="destructive">Nominated</Badge>}
              </div>
            </div>
          ))}
        </div>
        
        {evictedHouseguests.length > 0 && (
          <>
            <h3 className="font-bold mb-2">Evicted ({evictedHouseguests.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {evictedHouseguests.map(houseguest => (
                <div key={houseguest.id} className="border rounded p-2 opacity-60">
                  <div className="font-semibold">{houseguest.name}</div>
                  <div className="flex gap-1 flex-wrap mt-1">
                    <Badge variant="outline">Evicted</Badge>
                    {game.juryMembers.some(juror => juror.id === houseguest.id) && 
                      <Badge variant="secondary">Jury</Badge>
                    }
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HouseguestList;
