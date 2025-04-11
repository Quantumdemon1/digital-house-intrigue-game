
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

const FinalePhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finale</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a placeholder for the finale phase.</p>
        <p>Season finale!</p>
        <div className="mt-4">
          <Button>Next Phase</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalePhase;
