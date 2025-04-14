
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import HouseguestCard from '../houseguest/HouseguestCard';
import GameEventLog from '../GameEventLog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Users, Shield } from 'lucide-react';
import { Badge } from '../ui/badge';
import { PromiseDisplay } from '../promise';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const GameSidebar: React.FC = () => {
  const {
    game,
    gameState,
    getActiveHouseguests
  } = useGame();
  
  const [activeTab, setActiveTab] = useState<'houseguests' | 'alliances' | 'promises'>('houseguests');
  
  const activeHouseguests = getActiveHouseguests();
  const inactiveHouseguests = gameState.houseguests.filter(h => h.status !== 'Active').sort((a, b) => a.status === 'Jury' ? -1 : 1); // Show jury above evicted
  
  // Get alliances involving the player
  const playerAlliances = game?.allianceSystem?.getAlliancesForHouseguest(
    gameState.houseguests.find(h => h.isPlayer)?.id || ''
  ) || [];
  
  // Get promises involving the player
  const playerHouseguest = gameState.houseguests.find(h => h.isPlayer);
  const playerPromises = playerHouseguest ? (game?.promises || []).filter(p => 
    p.fromId === playerHouseguest.id || p.toId === playerHouseguest.id
  ) : [];
  const activePromises = playerPromises.filter(p => p.status === 'pending' || p.status === 'active');
  
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-2">
        {/* Tabs for sidebar content */}
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="houseguests">Houseguests</TabsTrigger>
            <TabsTrigger value="alliances">
              Alliances
              {playerAlliances.length > 0 && (
                <Badge variant="secondary" className="ml-1">{playerAlliances.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="promises">
              Promises
              {activePromises.length > 0 && (
                <Badge variant="secondary" className="ml-1">{activePromises.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="houseguests">
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
          </TabsContent>
          
          <TabsContent value="alliances">
            {playerAlliances.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Handshake className="mx-auto h-8 w-8 opacity-50 mb-2" />
                <p>You have no alliances yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="promises">
            {activePromises.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs uppercase text-muted-foreground font-semibold">Active Promises</h3>
                {activePromises.slice(0, 3).map(promise => {
                  const promiserName = game?.getHouseguestById(promise.fromId)?.name || "Unknown";
                  const promiseeName = game?.getHouseguestById(promise.toId)?.name || "Unknown";
                  
                  return (
                    <PromiseDisplay
                      key={promise.id}
                      promiser={promiserName}
                      promisee={promiseeName}
                      description={promise.description}
                      promiseType={promise.type}
                      status={promise.status}
                      week={promise.madeOnWeek}
                      currentWeek={game?.week || 1}
                      className="hover:shadow-md transition-shadow"
                    />
                  );
                })}
                
                {activePromises.length > 3 && (
                  <div className="text-center mt-2">
                    <Button variant="ghost" size="sm" className="text-green-600">
                      View All Promises
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="mx-auto h-8 w-8 opacity-50 mb-2" />
                <p>No active promises</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
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
