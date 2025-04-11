
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import POVCompetition from './POVCompetition';

const PovCompetitionPhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Power of Veto Competition</CardTitle>
      </CardHeader>
      <CardContent>
        <POVCompetition />
      </CardContent>
    </Card>
  );
};

export default PovCompetitionPhase;
