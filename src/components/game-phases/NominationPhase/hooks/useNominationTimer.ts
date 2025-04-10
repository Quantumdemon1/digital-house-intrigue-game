
import { useState, useEffect } from 'react';

interface UseNominationTimerProps {
  initialTime: number;
  isNominating: boolean;
  ceremonyComplete: boolean;
  onTimeExpired: () => void;
}

export const useNominationTimer = ({
  initialTime,
  isNominating,
  ceremonyComplete,
  onTimeExpired,
}: UseNominationTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [timerActive, setTimerActive] = useState(true);
  
  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && !isNominating && !ceremonyComplete && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timerActive && timeRemaining <= 0) {
      // When timer reaches zero
      setTimerActive(false);
      onTimeExpired();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeRemaining, timerActive, isNominating, ceremonyComplete, onTimeExpired]);
  
  // Stop timer when nominations are confirmed
  useEffect(() => {
    if (isNominating || ceremonyComplete) {
      setTimerActive(false);
    }
  }, [isNominating, ceremonyComplete]);
  
  return {
    timeRemaining,
    timerActive,
    setTimerActive,
    setTimeRemaining
  };
};
