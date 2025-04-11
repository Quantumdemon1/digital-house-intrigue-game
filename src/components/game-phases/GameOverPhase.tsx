
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

const GameOverPhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Over</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a placeholder for the game over phase.</p>
        {game?.winner && (
          <p>Winner: {game.winner.name}</p>
        )}
        <div className="mt-4">
          <Button>New Game</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameOverPhase;
