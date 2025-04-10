
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import CustomProgress from './CustomProgress';

interface TimerDisplayProps {
  timeRemaining: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeRemaining }) => {
  // Calculate percentage of time remaining (60 seconds total)
  const percentRemaining = (timeRemaining / 60) * 100;
  
  // Determine color based on time remaining
  const getColorClass = () => {
    if (timeRemaining > 30) return 'text-green-600';
    if (timeRemaining > 10) return 'text-amber-500';
    return 'text-red-600';
  };
  
  // Get progress color
  const getProgressColor = () => {
    if (timeRemaining > 30) return 'bg-green-600';
    if (timeRemaining > 10) return 'bg-amber-500';
    return 'bg-red-600';
  };
  
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          <h4 className="font-medium">Time Remaining</h4>
        </div>
        <div className={`font-bold ${getColorClass()}`}>
          {timeRemaining < 10 && <AlertCircle className="inline-block mr-1 w-4 h-4" />}
          {timeRemaining}s
        </div>
      </div>
      
      <CustomProgress 
        value={percentRemaining} 
        className="h-2"
        indicatorClassName={getProgressColor()}
      />
      
      <p className="text-xs text-muted-foreground mt-1">
        If time expires, nominees will be randomly selected
      </p>
    </div>
  );
};

export default TimerDisplay;
