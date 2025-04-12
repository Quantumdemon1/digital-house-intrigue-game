
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseNominationTimerReturn {
  timeRemaining: number;
  totalTime: number;
  hasTimeExpired: boolean;
  startTimer: (seconds?: number) => void;
  resetTimer: () => void;
}

/**
 * Hook to manage nomination timer
 */
export const useNominationTimer = (defaultSeconds: number = 60): UseNominationTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState<number>(defaultSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasTimeExpired, setHasTimeExpired] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeRef = useRef<number>(defaultSeconds);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start the timer with optional custom duration
  const startTimer = useCallback((seconds?: number) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set the time if provided
    if (seconds) {
      setTimeRemaining(seconds);
      totalTimeRef.current = seconds;
    }
    
    setIsActive(true);
    setHasTimeExpired(false);
    
    // Start new interval
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsActive(false);
          setHasTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Reset the timer to original state
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setTimeRemaining(totalTimeRef.current);
    setIsActive(false);
    setHasTimeExpired(false);
  }, []);

  return {
    timeRemaining,
    totalTime: totalTimeRef.current,
    hasTimeExpired,
    startTimer,
    resetTimer
  };
};
