
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface TimerDisplayProps {
  timeRemaining: number;
  onTimeExpired: () => void;
  totalTime: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeRemaining, 
  onTimeExpired, 
  totalTime 
}) => {
  // Calculate percentage of time remaining
  const percentRemaining = (timeRemaining / totalTime) * 100;
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Time Remaining</span>
        <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
      </div>
      <Progress 
        value={percentRemaining} 
        className={`h-2 ${percentRemaining < 25 ? 'bg-red-200' : 'bg-gray-200'}`}
      />
    </div>
  );
};

export default TimerDisplay;
