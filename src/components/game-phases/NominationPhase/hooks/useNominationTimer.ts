
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
    // Only start timer if player is active and ceremony isn't complete
    if (!isPlayer || isComplete || timeRemaining <= 0) return;
    
    console.log("Starting nomination timer countdown from", timeRemaining);
    
    const timer = setTimeout(() => {
      setTimeRemaining(prevTime => prevTime - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, isPlayer, isComplete]);
  
  // Handle timer expiration
  useEffect(() => {
    if (timeRemaining === 0 && isPlayer && !isComplete) {
      console.log("Nomination timer expired, calling onTimeExpired");
      onTimeExpired();
    }
  }, [timeRemaining, isPlayer, isComplete, onTimeExpired]);
  
  return { timeRemaining };
};
