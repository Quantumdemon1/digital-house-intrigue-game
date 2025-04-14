
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Trophy, BarChart, Home, RefreshCw } from 'lucide-react';
import GameSummary from './GameOverPhase/GameSummary';
import PlayerStats from './GameOverPhase/PlayerStats';
import WinnerDisplay from './GameOverPhase/WinnerDisplay';
import SeasonRecap from './GameOverPhase/SeasonRecap';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const GameOverPhase: React.FC = () => {
  const { gameState, dispatch, recapGenerator } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get available actions from the game state
  const availableActions = gameState.currentState?.getAvailableActions() || [];
  
  useEffect(() => {
    // When component mounts, make sure we're in the right game state
    if (gameState.phase !== 'GameOver') {
      // If somehow we're viewing this component but not in game over state
      console.warn("GameOverPhase component loaded but game is not in GameOver phase");
    }
  }, [gameState.phase]);
  
  // Get winner information
  const winner = gameState.houseguests.find(hg => hg.isWinner);
  
  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'new_game':
        toast({
          title: "Starting New Game",
          description: "Setting up a new game with new houseguests"
        });
        dispatch({
          type: 'PLAYER_ACTION',
          payload: { actionId: 'new_game' }
        });
        break;
        
      case 'view_stats':
        toast({
          description: "Viewing game statistics"
        });
        dispatch({
          type: 'PLAYER_ACTION',
          payload: { actionId: 'view_stats' }
        });
        break;
        
      case 'exit_game':
        toast({
          description: "Returning to main menu"
        });
        navigate('/');
        break;
    }
  };
  
  return (
    <div className="space-y-8">
      <Card className="border-2 border-amber-100">
        <CardHeader className="bg-gradient-to-r from-amber-400 to-amber-300 text-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-800" />
              <div>
                <CardTitle className="text-2xl">Game Over</CardTitle>
                <CardDescription className="text-black/70">The season has concluded!</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Winner Display */}
          {winner ? (
            <WinnerDisplay winner={winner} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No winner determined.
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            {availableActions.map(action => {
              let icon;
              switch (action.actionId) {
                case 'new_game': icon = <RefreshCw className="mr-2 h-4 w-4" />; break;
                case 'view_stats': icon = <BarChart className="mr-2 h-4 w-4" />; break;
                case 'exit_game': icon = <Home className="mr-2 h-4 w-4" />; break;
                default: icon = null;
              }
              
              return (
                <Button 
                  key={action.actionId}
                  className="min-w-[180px]"
                  onClick={() => handleAction(action.actionId)}
                  variant={action.actionId === 'new_game' ? 'default' : 'outline'}
                >
                  {icon}
                  {action.text}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Game Recap */}
      <div className="grid md:grid-cols-2 gap-6">
        <GameSummary gameState={gameState} />
        <PlayerStats gameState={gameState} />
      </div>
      
      <SeasonRecap recap={recapGenerator.generateSeasonRecap(gameState)} />
    </div>
  );
};

export default GameOverPhase;
