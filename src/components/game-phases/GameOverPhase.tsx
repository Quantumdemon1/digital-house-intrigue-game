
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

const GameOverPhase: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <Card className="shadow-lg border-bb-green">
      <CardHeader className="bg-bb-green text-bb-dark">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2" /> Game Over
        </CardTitle>
        <CardDescription className="text-bb-dark/80">
          Season Recap
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Coming Soon</h3>
          <p className="text-muted-foreground">
            The Game Over recap will be implemented in a future update.
          </p>
          <p className="mt-4">
            This phase provides a recap of the entire season, highlighting key moments
            and the player's journey through the game.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameOverPhase;
