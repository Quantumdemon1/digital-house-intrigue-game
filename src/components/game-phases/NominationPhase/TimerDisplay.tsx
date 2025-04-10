
import React, { useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import CustomProgress from './CustomProgress';

interface TimerDisplayProps {
  timeRemaining: number;
  onTimeExpired?: () => void;
  totalTime?: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeRemaining, 
  onTimeExpired,
  totalTime = 60 
}) => {
  // Calculate percentage of time remaining
  const percentRemaining = (timeRemaining / totalTime) * 100;
  
  // Determine color based on time remaining
  const getColorClass = () => {
    if (timeRemaining > totalTime / 2) return 'text-green-600';
    if (timeRemaining > totalTime / 6) return 'text-amber-500';
    return 'text-red-600';
  };
  
  // Get progress color
  const getProgressColor = () => {
    if (timeRemaining > totalTime / 2) return 'bg-green-600';
    if (timeRemaining > totalTime / 6) return 'bg-amber-500';
    return 'bg-red-600';
  };

  // Handle timer expiration
  useEffect(() => {
    if (timeRemaining <= 0 && onTimeExpired) {
      onTimeExpired();
    }
  }, [timeRemaining, onTimeExpired]);
  
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          <h4 className="font-medium">Time Remaining</h4>
        </div>
        <div className={`font-bold ${getColorClass()}`}>
          {timeRemaining <= 10 && <AlertCircle className="inline-block mr-1 w-4 h-4" />}
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
