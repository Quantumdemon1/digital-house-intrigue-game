
import React from 'react';
import { Clock } from 'lucide-react';

// Create a simple custom progress component since the shadcn/ui Progress is not accessible
const Progress = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div 
      className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className || ''}`}
    >
      <div 
        className="h-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

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
