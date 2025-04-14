
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Trophy, Users } from "lucide-react";
import HouseguestListComponent from '../HouseguestList';
import GameLog from "../GameEventLog";
import PromiseManager from '../promise/PromiseManager';

const GameSidebar: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <div className="space-y-4">
      {/* Game Status Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <Info className="h-4 w-4 mr-2 text-blue-500" />
            Game Status
          </CardTitle>
          <CardDescription>Week {gameState.week}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {gameState.hohWinner && (
            <div className="flex items-center justify-between border-b pb-1">
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm">Head of Household</span>
              </div>
              <span className="text-sm font-medium">{gameState.hohWinner.name}</span>
            </div>
          )}
          
          {gameState.povWinner && (
            <div className="flex items-center justify-between border-b pb-1">
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-emerald-500" />
                <span className="text-sm">Power of Veto</span>
              </div>
              <span className="text-sm font-medium">{gameState.povWinner.name}</span>
            </div>
          )}
          
          {gameState.nominees.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">Nominees</span>
              </div>
              <div className="text-sm font-medium text-right">
                {gameState.nominees.map(n => n.name).join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Promise Manager */}
      <PromiseManager />
      
      {/* Tabs for Houseguests and Game Log */}
      <Tabs defaultValue="houseguests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="houseguests">Houseguests</TabsTrigger>
          <TabsTrigger value="log">Game Log</TabsTrigger>
        </TabsList>
        <TabsContent value="houseguests" className="mt-2">
          <Card>
            <ScrollArea className="h-[400px]">
              <CardContent className="p-2">
                <HouseguestListComponent />
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>
        <TabsContent value="log" className="mt-2">
          <Card>
            <ScrollArea className="h-[400px]">
              <CardContent className="p-2">
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
