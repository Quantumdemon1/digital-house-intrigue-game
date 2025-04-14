
import { useState } from 'react';
import { Houseguest } from '@/models/houseguest';

interface AIThought {
  houseguestId: string;
  thought: string;
  timestamp: number;
}

export function useAIThoughts() {
  const [thoughts, setThoughts] = useState<Record<string, AIThought>>({});
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Add a new thought for a houseguest
  const addThought = (houseguest: Houseguest, thought: string) => {
    setThoughts(prev => ({
      ...prev,
      [houseguest.id]: {
        houseguestId: houseguest.id,
        thought,
        timestamp: Date.now()
      }
    }));
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
    removeThought,
    clearThoughts,
    toggleVisibility
  };
}
