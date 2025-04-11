
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

const HohPhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Head of Household Competition</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a placeholder for the HoH competition phase.</p>
        <p>Current week: {game?.week}</p>
        {game?.hohWinner && (
          <p>Current HoH winner: {game.hohWinner.name}</p>
        )}
        <div className="mt-4">
          <Button>Next Phase</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HohPhase;
