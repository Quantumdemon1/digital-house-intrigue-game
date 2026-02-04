
import { useState, useRef, useCallback } from 'react';
import { Houseguest } from '@/models/houseguest';
import { config } from '@/config';

interface AIThought {
  houseguestId: string;
  thought: string;
  timestamp: number;
  type: 'thought' | 'decision' | 'strategy';
}

export function useAIThoughts() {
  const [thoughts, setThoughts] = useState<Record<string, AIThought>>({});
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Remove thought for a specific houseguest
  const removeThought = useCallback((houseguestId: string) => {
    // Clear any existing timeout
    if (timeoutRefs.current[houseguestId]) {
      clearTimeout(timeoutRefs.current[houseguestId]);
      delete timeoutRefs.current[houseguestId];
    }
    
    setThoughts(prev => {
      const newThoughts = { ...prev };
      delete newThoughts[houseguestId];
      return newThoughts;
    });
  }, []);

  // Add a new thought for a houseguest
  const addThought = useCallback((houseguest: Houseguest, thought: string, type: 'thought' | 'decision' | 'strategy' = 'thought') => {
    // Clear any existing timeout for this houseguest
    if (timeoutRefs.current[houseguest.id]) {
      clearTimeout(timeoutRefs.current[houseguest.id]);
    }
    
    setThoughts(prev => ({
      ...prev,
      [houseguest.id]: {
        houseguestId: houseguest.id,
        thought,
        timestamp: Date.now(),
        type
      }
    }));
    
    // Auto-remove thought after display time
    timeoutRefs.current[houseguest.id] = setTimeout(() => {
      removeThought(houseguest.id);
    }, config.NPC_THOUGHT_DISPLAY_TIME);
  }, [removeThought]);

  // Add a decision thought
  const addDecision = useCallback((houseguest: Houseguest, thought: string) => {
    addThought(houseguest, thought, 'decision');
  }, [addThought]);

  // Add a strategy thought
  const addStrategy = useCallback((houseguest: Houseguest, thought: string) => {
    addThought(houseguest, thought, 'strategy');
  }, [addThought]);

  // Clear all thoughts
  const clearThoughts = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = {};
    setThoughts({});
  }, []);

  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return {
    thoughts,
    isVisible,
    addThought,
    addDecision,
    addStrategy,
    removeThought,
    clearThoughts,
    toggleVisibility
  };
}
