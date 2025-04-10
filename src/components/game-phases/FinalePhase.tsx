
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

const FinalePhase: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2" /> Season Finale
        </CardTitle>
        <CardDescription className="text-white/80">
          Final Week
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Coming Soon</h3>
          <p className="text-muted-foreground">
            The Season Finale will be implemented in a future update.
          </p>
          <p className="mt-4">
            This phase includes the final HoH competition, jury voting, and 
            crowning of the Big Brother champion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalePhase;
