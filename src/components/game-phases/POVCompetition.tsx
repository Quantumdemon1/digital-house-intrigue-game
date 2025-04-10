
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

const POVCompetition: React.FC = () => {
  const { gameState, dispatch } = useGame();

  // In a real implementation, this would have the full POV competition logic
  // For now, this is just a placeholder
  
  return (
    <Card className="shadow-lg border-bb-green">
      <CardHeader className="bg-bb-green text-bb-dark">
        <CardTitle className="flex items-center">
          <Award className="mr-2" /> Power of Veto Competition
        </CardTitle>
        <CardDescription className="text-bb-dark/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Coming Soon</h3>
          <p className="text-muted-foreground">
            The Power of Veto competition will be implemented in a future update.
          </p>
          <p className="mt-4">
            This phase lets players compete for the Power of Veto, which gives the ability to
            remove one of the nominees from the block.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default POVCompetition;
