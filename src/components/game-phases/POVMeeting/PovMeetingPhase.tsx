
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import POVMeetingContent from './POVMeetingContent';

const PovMeetingPhase: React.FC = () => {
  const { game } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Power of Veto Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <POVMeetingContent />
      </CardContent>
    </Card>
  );
};

export default PovMeetingPhase;
