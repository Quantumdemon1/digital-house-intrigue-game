
import { useState, useEffect, useCallback } from 'react';

interface AnimationStateOptions {
  initialState?: boolean;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Hook for managing animation states with timing control
 */
export function useAnimationState(options: AnimationStateOptions = {}) {
  const { 
    initialState = false, 
    duration = 300, 
    delay = 0, 
    onComplete 
  } = options;
  
  const [isActive, setIsActive] = useState(initialState);
  const [isComplete, setIsComplete] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'enter' | 'active' | 'exit'>('idle');
  
  // Start animation sequence
  const startAnimation = useCallback(() => {
    setIsActive(true);
    setIsComplete(false);
    setTransitionPhase('enter');
    
    // After enter phase completes
    const enterTimer = setTimeout(() => {
      setTransitionPhase('active');
      
      // When animation should complete
      const completeTimer = setTimeout(() => {
        setIsComplete(true);
        setTransitionPhase('exit');
        
        // After exit animation
        const exitTimer = setTimeout(() => {
          setTransitionPhase('idle');
          if (onComplete) onComplete();
        }, duration);
        
        return () => clearTimeout(exitTimer);
      }, duration);
      
      return () => clearTimeout(completeTimer);
    }, delay);
    
    return () => clearTimeout(enterTimer);
  }, [delay, duration, onComplete]);
  
  // Reset animation state
  const resetAnimation = useCallback(() => {
    setIsActive(false);
    setIsComplete(false);
    setTransitionPhase('idle');
  }, []);
  
  // Returns animation classes based on current state
  const getAnimationClasses = useCallback((baseClass: string = '') => {
    const classes = [baseClass];
    
    switch (transitionPhase) {
      case 'enter':
        classes.push('animate-fade-in');
        break;
      case 'exit':
        classes.push('animate-fade-out');
        break;
      case 'active':
        classes.push('opacity-100');
        break;
      case 'idle':
        classes.push('opacity-0');
        break;
    }
    
    return classes.join(' ');
  }, [transitionPhase]);
  
  return {
    isActive,
    isComplete,
    transitionPhase,
    startAnimation,
    resetAnimation,
    getAnimationClasses
  };
}

export default useAnimationState;
