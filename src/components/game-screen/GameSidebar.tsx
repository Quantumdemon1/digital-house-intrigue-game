
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import HouseguestCard from '../houseguest/HouseguestCard';
import GameEventLog from '../GameEventLog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Users } from 'lucide-react';
import { Badge } from '../ui/badge';

const GameSidebar: React.FC = () => {
  const {
    game,
    gameState,
    getActiveHouseguests
  } = useGame();
  
  const activeHouseguests = getActiveHouseguests();
  const inactiveHouseguests = gameState.houseguests.filter(h => h.status !== 'Active').sort((a, b) => a.status === 'Jury' ? -1 : 1); // Show jury above evicted
  
  // Get alliances involving the player
  const playerAlliances = game?.allianceSystem?.getAlliancesForHouseguest(
    gameState.houseguests.find(h => h.isPlayer)?.id || ''
  ) || [];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-2">
        {/* Houseguest list */}
        <div>
          <h2 className="font-bold text-lg mb-4">Houseguests</h2>
          
          <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Active</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 mb-4">
            {activeHouseguests.map(houseguest => <HouseguestCard key={houseguest.id} houseguest={houseguest} showRelationship={true} />)}
          </div>
          
          {inactiveHouseguests.length > 0 && (
            <>
              <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-2 mt-4 pt-2 border-t">Inactive</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {inactiveHouseguests.map(houseguest => <HouseguestCard key={houseguest.id} houseguest={houseguest} showRelationship={true} />)}
              </div>
            </>
          )}
        </div>
        
        {/* Player Alliances */}
        {playerAlliances.length > 0 && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <Handshake className="h-4 w-4 mr-2 text-purple-600" />
                Your Alliances
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {playerAlliances.map(alliance => (
                <div key={alliance.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">{alliance.name}</h4>
                    <Badge variant={alliance.isPublic ? "default" : "outline"} className={alliance.isPublic ? "bg-purple-600" : "text-purple-700 border-purple-300"}>
                      {alliance.isPublic ? "Public" : "Secret"}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1">
                    <Users className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">
                      {alliance.members.length} members • Week {alliance.createdOnWeek}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Game Event Log */}
        <div className="rounded-lg shadow-lg p-4 border">
          <h2 className="font-bold text-lg mb-4">House Activity</h2>
          <GameEventLog />
        </div>
      </div>
    </ScrollArea>
  );
};

export default GameSidebar;
