
import React from 'react';
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
  const percentRemaining = (timeRemaining / totalTime) * 100;
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Use our CustomProgress component
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-800">Time Remaining</span>
        <span className={cn(
          "text-sm font-medium",
          percentRemaining < 25 ? "text-red-600" : "text-gray-800"
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
      
      {timeRemaining <= 5 && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertDescription className="text-white">
            Time is running out! Make your decision quickly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TimerDisplay;
