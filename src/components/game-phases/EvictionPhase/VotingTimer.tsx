
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface VotingTimerProps {
  timeRemaining: number;
  totalTime: number;
}

const VotingTimer: React.FC<VotingTimerProps> = ({ timeRemaining, totalTime }) => {
  const progressValue = (timeRemaining / totalTime) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Time remaining:</span>
        </div>
        <span className="font-medium">{timeRemaining}s</span>
      </div>
      <Progress value={progressValue} className="h-2" />
    </div>
  );
};

export default VotingTimer;
