
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Shield, Target, Users, FileText, Handshake } from "lucide-react";
import HouseguestListComponent from '../HouseguestList';
import GameLog from "../GameEventLog";
import PromiseManager from '../promise/PromiseManager';
import { StatusAvatar } from '@/components/ui/status-avatar';

const GameSidebar: React.FC = () => {
  const { gameState, getHouseguestById } = useGame();
  
  // Get houseguest data directly from gameState (they're already full objects)
  const hohHouseguest = gameState.hohWinner 
    ? gameState.houseguests.find(h => h.id === gameState.hohWinner.id) || gameState.hohWinner
    : null;
  const povHouseguest = gameState.povWinner 
    ? gameState.houseguests.find(h => h.id === gameState.povWinner.id) || gameState.povWinner
    : null;
  const nominees = gameState.nominees
    .map(nominee => gameState.houseguests.find(h => h.id === nominee.id) || nominee)
    .filter(Boolean);
  
  return (
    <div className="space-y-4">
      {/* Game Status Section */}
      <Card className="game-card overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-bb-blue/10 to-transparent">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-bb-blue/10">
              <Crown className="h-4 w-4 text-bb-blue" />
            </div>
            Current Power
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* HoH Display */}
          {hohHouseguest && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-bb-gold/5 border border-bb-gold/20">
              <StatusAvatar 
                name={hohHouseguest.name} 
                status="hoh" 
                size="sm" 
                isPlayer={hohHouseguest.isPlayer}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Head of Household</div>
                <div className="font-semibold truncate">{hohHouseguest.name}</div>
              </div>
            </div>
          )}
          
          {/* PoV Holder */}
          {povHouseguest && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-bb-gold/5 border border-bb-gold/20">
              <StatusAvatar 
                name={povHouseguest.name} 
                status="pov" 
                size="sm"
                isPlayer={povHouseguest.isPlayer}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Power of Veto</div>
                <div className="font-semibold truncate">{povHouseguest.name}</div>
              </div>
            </div>
          )}
          
          {/* Nominees */}
          {nominees.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3 w-3 text-bb-red" />
                Nominees
              </div>
              <div className="flex gap-2">
                {nominees.map((nominee: any) => (
                  <div key={nominee.id} className="flex items-center gap-2 p-2 rounded-lg bg-bb-red/5 border border-bb-red/20 flex-1">
                    <StatusAvatar 
                      name={nominee.name} 
                      status="nominee" 
                      size="sm"
                      showBadge={false}
                      isPlayer={nominee.isPlayer}
                    />
                    <span className="text-sm font-medium truncate">{nominee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!hohHouseguest && !povHouseguest && nominees.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No active powers this week
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Promise Manager */}
      <PromiseManager />
      
      {/* Tabs for Houseguests and Game Log */}
      <Tabs defaultValue="houseguests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="houseguests" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Houseguests</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="houseguests" className="mt-2">
          <Card className="game-card">
            <ScrollArea className="h-[400px]">
              <CardContent className="p-3">
                <HouseguestListComponent />
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>
        <TabsContent value="log" className="mt-2">
          <Card className="game-card">
            <ScrollArea className="h-[400px]">
              <CardContent className="p-3">
                <GameLog />
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameSidebar;
