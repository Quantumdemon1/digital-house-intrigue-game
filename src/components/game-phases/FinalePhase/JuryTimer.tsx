
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import CustomProgress from '../../game-phases/NominationPhase/CustomProgress';

interface JuryTimerProps {
  timeRemaining: number;
  onTimeExpired?: () => void;
  totalTime?: number;
}

const JuryTimer: React.FC<JuryTimerProps> = ({ 
  timeRemaining, 
  onTimeExpired,
  totalTime = 30 // Default to 30 seconds for jury voting
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

  // Get text flash for urgent time
  const getFlashClass = () => {
    if (timeRemaining <= 10) return 'animate-pulse';
    return '';
  };
  
  return (
    <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          <h4 className="font-medium">Jury Vote Timer</h4>
        </div>
        <div className={`font-bold text-xl ${getColorClass()} ${getFlashClass()}`}>
          {timeRemaining <= 5 && <AlertCircle className="inline-block mr-1 w-4 h-4" />}
          {timeRemaining}s
        </div>
      </div>
      
      <CustomProgress 
        value={percentRemaining} 
        className="h-2"
        indicatorClassName={getProgressColor()}
      />
      
      <p className="text-xs text-muted-foreground mt-2">
        <strong className="font-semibold">Note:</strong> If time expires, random votes will be cast for any remaining jurors
      </p>
    </div>
  );
};

export default JuryTimer;
