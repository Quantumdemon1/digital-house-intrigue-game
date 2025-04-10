
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

const POVMeeting: React.FC = () => {
  const { gameState } = useGame();
  
  // In a real implementation, this would have the full POV meeting logic
  // For now, this is just a placeholder
  
  return (
    <Card className="shadow-lg border-bb-green">
      <CardHeader className="bg-bb-green text-bb-dark">
        <CardTitle className="flex items-center">
          <Shield className="mr-2" /> Power of Veto Meeting
        </CardTitle>
        <CardDescription className="text-bb-dark/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Coming Soon</h3>
          <p className="text-muted-foreground">
            The Power of Veto meeting will be implemented in a future update.
          </p>
          <p className="mt-4">
            This phase lets the POV winner decide whether to use the veto to save one of the nominees,
            forcing the HoH to name a replacement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default POVMeeting;
