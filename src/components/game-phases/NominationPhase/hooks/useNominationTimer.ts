
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
    
    const timerId = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => {
      clearInterval(timerId);
    };
  }, [isPlayer, isComplete]); // Only rerun when isPlayer or isComplete changes
  
  // Separate effect to handle time expiry
  useEffect(() => {
    if (timeRemaining === 0 && isPlayer && !isComplete) {
      // Call onTimeExpired in the next render cycle to avoid state updates during rendering
      const timeoutId = setTimeout(onTimeExpired, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [timeRemaining, isPlayer, isComplete, onTimeExpired]);
  
  return { timeRemaining };
};
