import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Trophy, Medal, ChartBar, FileText, ArrowLeft, ArrowRight, RefreshCw, Save } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import SeasonRecap from './GameOverPhase/SeasonRecap';
import PlayerStats from './GameOverPhase/PlayerStats';
import GameSummary from './GameOverPhase/GameSummary';
import WinnerDisplay from './GameOverPhase/WinnerDisplay';

const GameOverPhase: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('winner');
  
  if (!gameState.winner) {
    return (
      <Card className="shadow-lg border-bb-green">
        <CardContent className="pt-6">
          <div className="text-center p-8">
            <p>Loading game results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleNewGame = () => {
    // Reset game state to setup phase
    dispatch({ type: 'SET_PHASE', payload: 'Setup' });
    toast({
      title: "New Game",
      description: "Starting a new game setup...",
    });
  };

  const handleSaveResults = () => {
    // For now, just simulate saving by showing a toast
    // This could be expanded later to actually save to localStorage or a database
    const savedData = {
      winner: gameState.winner?.name,
      runnerUp: gameState.runnerUp?.name,
      weekCount: gameState.week,
      timestamp: new Date().toISOString(),
    };
    
    // Save to localStorage
    const savedGames = JSON.parse(localStorage.getItem('savedBigBrotherGames') || '[]');
    savedGames.push(savedData);
    localStorage.setItem('savedBigBrotherGames', JSON.stringify(savedGames));
    
    toast({
      title: "Game Saved",
      description: `Saved ${gameState.winner?.name}'s victory for future reference.`,
      variant: "default",
    });
  };
  
  return (
    <Card className="shadow-lg border-bb-green">
      <CardHeader className="bg-bb-green text-bb-dark">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2" /> Game Over
        </CardTitle>
        <CardDescription className="text-bb-dark/80">
          Season Complete
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-0">
        <Tabs 
          defaultValue="winner" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6 mx-4">
            <TabsTrigger value="winner" className="flex items-center gap-1">
              <Trophy size={16} /> Winner
            </TabsTrigger>
            <TabsTrigger value="recap" className="flex items-center gap-1">
              <Medal size={16} /> Recap
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <ChartBar size={16} /> Stats
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <FileText size={16} /> Summary
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="winner" className="px-4">
            <WinnerDisplay winner={gameState.winner} runnerUp={gameState.runnerUp} />
          </TabsContent>
          
          <TabsContent value="recap" className="px-4">
            <SeasonRecap />
          </TabsContent>
          
          <TabsContent value="stats" className="px-4">
            <PlayerStats />
          </TabsContent>
          
          <TabsContent value="summary" className="px-4">
            <GameSummary />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center gap-4 mt-6 px-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              const currentIndex = ['winner', 'recap', 'stats', 'summary'].indexOf(activeTab);
              const prevIndex = (currentIndex - 1 + 4) % 4;
              setActiveTab(['winner', 'recap', 'stats', 'summary'][prevIndex]);
            }}
          >
            <ArrowLeft size={16} /> Previous
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              const currentIndex = ['winner', 'recap', 'stats', 'summary'].indexOf(activeTab);
              const nextIndex = (currentIndex + 1) % 4;
              setActiveTab(['winner', 'recap', 'stats', 'summary'][nextIndex]);
            }}
          >
            Next <ArrowRight size={16} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pt-2 pb-6">
        <Button 
          onClick={handleNewGame} 
          variant="default" 
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} /> New Game
        </Button>
        <Button 
          onClick={handleSaveResults} 
          variant="secondary" 
          className="flex items-center gap-2"
        >
          <Save size={16} /> Save Results
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameOverPhase;
