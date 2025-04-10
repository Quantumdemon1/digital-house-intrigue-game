
import { useState, useEffect, useCallback } from 'react';

interface UseNominationTimerProps {
  initialTime: number;
  isPlayer: boolean; 
  onTimeExpired: () => void;
  isComplete: boolean;
}

export const useNominationTimer = ({ 
  initialTime, 
  isPlayer,
  onTimeExpired,
  isComplete
}: UseNominationTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  
  // Reset timer when component parameters change
  useEffect(() => {
    if (isComplete) {
      return; // Don't reset if complete
    }
    setTimeRemaining(initialTime);
  }, [initialTime, isComplete]);

  // Only run the timer if the player is making a decision
  // and the ceremony is not complete
  useEffect(() => {
    if (!isPlayer || isComplete) return;
    
    let interval: NodeJS.Timeout;
    
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Call onTimeExpired in the next render cycle to avoid state updates during rendering
            setTimeout(() => onTimeExpired(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      // Call onTimeExpired in the next render cycle
      setTimeout(() => onTimeExpired(), 0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining, onTimeExpired, isPlayer, isComplete]);
  
  return { timeRemaining };
};
