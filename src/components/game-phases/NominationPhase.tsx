
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

const NominationPhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nomination Ceremony</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a placeholder for the nomination phase.</p>
        <p>Current week: {game?.week}</p>
        {game?.hohWinner && (
          <p>Current HoH: {game.hohWinner.name}</p>
        )}
        {game?.nominees && game.nominees.length > 0 && (
          <p>Nominees: {game.nominees.map(nominee => nominee.name).join(', ')}</p>
        )}
        <div className="mt-4">
          <Button>Next Phase</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NominationPhase;
