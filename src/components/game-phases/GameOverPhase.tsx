
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import WinnerDisplay from './GameOverPhase/WinnerDisplay';
import GameSummary from './GameOverPhase/GameSummary';
import PlayerStats from './GameOverPhase/PlayerStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GameOverPhase: React.FC = () => {
  const { game } = useGame();
  
  if (!game || !game.winner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Over</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Game data is not available.</p>
          <div className="mt-4">
            <Button>New Game</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
          <CardTitle className="text-center text-2xl md:text-3xl">Game Complete</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <WinnerDisplay winner={game.winner} runnerUp={game.runnerUp} />
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Game Summary</TabsTrigger>
          <TabsTrigger value="stats">Player Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-4">
          <GameSummary />
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <PlayerStats />
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-4">
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          Start New Game
        </Button>
      </div>
    </div>
  );
};

export default GameOverPhase;
