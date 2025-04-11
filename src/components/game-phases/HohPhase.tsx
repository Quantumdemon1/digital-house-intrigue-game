
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import HOHCompetition from './HOHCompetition';

const HohCompetitionPhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Head of Household Competition</CardTitle>
      </CardHeader>
      <CardContent>
        <HOHCompetition />
      </CardContent>
    </Card>
  );
};

export default HohCompetitionPhase;
