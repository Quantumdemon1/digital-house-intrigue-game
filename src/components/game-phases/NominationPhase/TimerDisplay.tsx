
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
  
  // Create our own progress bar since we can't use the Progress component
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
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-300",
            percentRemaining < 25 ? "bg-red-500" : "bg-bb-red"
          )}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
      
      {timeRemaining <= 5 && (
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
