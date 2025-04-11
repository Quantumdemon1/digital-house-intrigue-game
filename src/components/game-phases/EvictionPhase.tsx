
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

const EvictionPhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eviction Ceremony</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a placeholder for the eviction phase.</p>
        <p>Current week: {game?.week}</p>
        {game?.nominees && game.nominees.length > 0 && (
          <p>Current nominees: {game.nominees.map(nominee => nominee.name).join(', ')}</p>
        )}
        <div className="mt-4">
          <Button>Next Phase</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvictionPhase;
