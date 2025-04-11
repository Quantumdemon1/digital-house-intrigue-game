
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
  
  // Reset timer when initialTime or isComplete changes
  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime, isComplete]);

  // Timer countdown effect
  useEffect(() => {
    // Only run timer if player is active, ceremony isn't complete, and time is remaining
    if (!isPlayer || isComplete || timeRemaining <= 0) return;
    
    console.log("Starting nomination timer countdown from", timeRemaining);
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timer); // Clear interval when we reach zero
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(timer);
  }, [isPlayer, isComplete, timeRemaining]);
  
  // Handle timer expiration
  useEffect(() => {
    if (timeRemaining === 0 && isPlayer && !isComplete) {
      console.log("Nomination timer expired, calling onTimeExpired");
      onTimeExpired();
    }
  }, [timeRemaining, isPlayer, isComplete, onTimeExpired]);
  
  return { timeRemaining };
};
