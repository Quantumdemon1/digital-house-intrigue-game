
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
    
    let timerId: number;
    
    if (timeRemaining > 0) {
      timerId = window.setInterval(() => {
        setTimeRemaining(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(timerId);
            return 0;
          }
          return newValue;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      // Call onTimeExpired in the next render cycle to avoid state updates during rendering
      window.setTimeout(onTimeExpired, 0);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeRemaining, onTimeExpired, isPlayer, isComplete]);
  
  // Trigger the time expired callback when time reaches zero
  useEffect(() => {
    if (timeRemaining === 0 && isPlayer && !isComplete) {
      onTimeExpired();
    }
  }, [timeRemaining, isPlayer, isComplete, onTimeExpired]);
  
  return { timeRemaining };
};
