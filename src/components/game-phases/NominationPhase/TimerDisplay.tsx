
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import CustomProgress from './CustomProgress';

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
  const percentRemaining = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  
  // Call onTimeExpired when timer reaches zero
  useEffect(() => {
    if (timeRemaining <= 0) {
      console.log("Timer reached zero in TimerDisplay");
    }
  }, [timeRemaining, onTimeExpired]);
  
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
        <span className={cn(
          "text-sm font-medium",
          percentRemaining < 25 && "text-red-500"
        )}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      <CustomProgress 
        value={percentRemaining}
        indicatorClassName={cn(
          percentRemaining < 25 ? "bg-red-500" : "bg-bb-red"
        )}
      />
      
      {timeRemaining <= 5 && timeRemaining > 0 && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertDescription>
            Time is running out! Make your decision quickly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TimerDisplay;
