
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

const NominationPhase: React.FC = () => {
  const { game, getHouseguestById } = useGame();
  
  // Convert IDs to houseguest objects
  const hoh = game?.hohWinner ? getHouseguestById(game.hohWinner) : null;
  const nominees = game?.nominees?.map(nomineeId => 
    getHouseguestById(nomineeId)
  ).filter(Boolean) || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nomination Ceremony</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a placeholder for the nomination phase.</p>
        <p>Current week: {game?.week}</p>
        {hoh && (
          <p>Current HoH: {hoh.name}</p>
        )}
        {nominees.length > 0 && (
          <p>Nominees: {nominees.map(nominee => nominee.name).join(', ')}</p>
        )}
        <div className="mt-4">
          <Button>Next Phase</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NominationPhase;
