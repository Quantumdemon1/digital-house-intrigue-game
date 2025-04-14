
import { useState } from 'react';
import { Houseguest } from '@/models/houseguest';

interface AIThought {
  houseguestId: string;
  thought: string;
  timestamp: number;
  type: 'thought' | 'decision' | 'strategy';
}

export function useAIThoughts() {
  const [thoughts, setThoughts] = useState<Record<string, AIThought>>({});
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Add a new thought for a houseguest
  const addThought = (houseguest: Houseguest, thought: string, type: 'thought' | 'decision' | 'strategy' = 'thought') => {
    setThoughts(prev => ({
      ...prev,
      [houseguest.id]: {
        houseguestId: houseguest.id,
        thought,
        timestamp: Date.now(),
        type
      }
    }));
  };

  // Add a decision thought
  const addDecision = (houseguest: Houseguest, thought: string) => {
    addThought(houseguest, thought, 'decision');
  };

  // Add a strategy thought
  const addStrategy = (houseguest: Houseguest, thought: string) => {
    addThought(houseguest, thought, 'strategy');
  };

  // Remove thought for a specific houseguest
  const removeThought = (houseguestId: string) => {
    setThoughts(prev => {
      const newThoughts = { ...prev };
      delete newThoughts[houseguestId];
      return newThoughts;
    });
  };

  // Clear all thoughts
  const clearThoughts = () => {
    setThoughts({});
  };

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
