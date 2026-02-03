
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Trophy, BarChart, Home, RefreshCw, History, Sparkles } from 'lucide-react';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent, GameCardFooter } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import GameSummary from './GameOverPhase/GameSummary';
import PlayerStats from './GameOverPhase/PlayerStats';
import WinnerDisplay from './GameOverPhase/WinnerDisplay';
import SeasonRecap from './GameOverPhase/SeasonRecap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const GameOverPhase: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const navigate = useNavigate();
  const [showRecap, setShowRecap] = useState(false);
  
  const availableActions = gameState.phase === 'GameOver' ? 
    [
      { actionId: 'new_game', text: 'Start New Game', icon: RefreshCw, primary: true },
      { actionId: 'season_recap', text: 'Season Timeline', icon: History, primary: false },
      { actionId: 'view_stats', text: 'View Statistics', icon: BarChart, primary: false },
      { actionId: 'exit_game', text: 'Exit to Menu', icon: Home, primary: false },
    ] : [];
  
  useEffect(() => {
    if (gameState.phase !== 'GameOver') {
      console.warn("GameOverPhase component loaded but game is not in GameOver phase");
    }
  }, [gameState.phase]);
  
  const winner = gameState.houseguests.find(hg => hg.isWinner || hg.status === 'Winner');
  const runnerUp = gameState.houseguests.find(hg => hg.status === 'Runner-Up');
  
  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'new_game':
        toast.success("Starting New Game", {
          description: "Setting up a new game with new houseguests"
        });
        dispatch({
          type: 'PLAYER_ACTION',
          payload: { actionId: 'new_game' }
        });
        break;
        
      case 'view_stats':
        toast.info("Viewing game statistics");
        dispatch({
          type: 'PLAYER_ACTION',
          payload: { actionId: 'view_stats' }
        });
        break;
        
      case 'season_recap':
        setShowRecap(true);
        break;
        
      case 'exit_game':
        toast.info("Returning to main menu");
        navigate('/');
        break;
    }
  };
  
  const generateRecap = () => {
    return {
      season: {
        winner: winner?.name || "Unknown",
        runnerUp: runnerUp?.name || "Unknown",
        weeks: gameState.week,
        events: gameState.gameLog || []
      }
    };
  };
  
  if (showRecap) {
    return (
      <GameCard variant="gold" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="gold" icon={History}>
          <div className="flex items-center justify-between w-full">
            <div>
              <GameCardTitle>Season Timeline</GameCardTitle>
              <GameCardDescription>Relive the journey</GameCardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowRecap(false)} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              Back to Results
            </Button>
          </div>
        </GameCardHeader>
        <GameCardContent>
          <SeasonRecap recap={generateRecap()} />
        </GameCardContent>
      </GameCard>
    );
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Winner Card */}
      <GameCard variant="gold" className="w-full max-w-4xl mx-auto overflow-visible">
        <GameCardHeader variant="gold" icon={Trophy}>
          <div className="flex items-center justify-between w-full">
            <div>
              <GameCardTitle className="text-2xl">Game Over</GameCardTitle>
              <GameCardDescription>The season has concluded!</GameCardDescription>
            </div>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              <Sparkles className="h-3 w-3 mr-1" /> Champion Crowned
            </Badge>
          </div>
        </GameCardHeader>
        
        <GameCardContent>
          {winner ? (
            <WinnerDisplay winner={winner} runnerUp={runnerUp} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No winner determined.
            </div>
          )}
        </GameCardContent>
        
        <GameCardFooter className="flex-wrap gap-3 justify-center">
          {availableActions.map(action => (
            <Button 
              key={action.actionId}
              onClick={() => handleAction(action.actionId)}
              variant={action.primary ? 'default' : 'outline'}
              size="lg"
              className={action.primary 
                ? 'bg-gradient-to-r from-bb-gold to-amber-500 hover:from-bb-gold/90 hover:to-amber-500/90 text-white shadow-game-md'
                : 'border-border'
              }
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.text}
            </Button>
          ))}
        </GameCardFooter>
      </GameCard>
      
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <GameSummary gameState={gameState} />
        <PlayerStats gameState={gameState} />
      </div>
    </div>
  );
};

export default GameOverPhase;
