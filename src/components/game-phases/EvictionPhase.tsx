
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

const EvictionPhase: React.FC = () => {
  const { gameState } = useGame();
  
  // In a real implementation, this would have the full eviction logic
  // For now, this is just a placeholder
  
  return (
    <Card className="shadow-lg border-bb-red">
      <CardHeader className="bg-bb-red text-white">
        <CardTitle className="flex items-center">
          <UserX className="mr-2" /> Eviction Night
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Coming Soon</h3>
          <p className="text-muted-foreground">
            The Eviction phase will be implemented in a future update.
          </p>
          <p className="mt-4">
            This phase is where houseguests vote to evict one of the two nominees,
            with the HoH only voting in the case of a tie.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvictionPhase;
