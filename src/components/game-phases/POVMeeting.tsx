
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import POVMeetingContent from './POVMeeting/POVMeetingContent';

const POVMeeting: React.FC = () => {
  const { gameState } = useGame();
  
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
        <POVMeetingContent />
      </CardContent>
    </Card>
  );
};

export default POVMeeting;
