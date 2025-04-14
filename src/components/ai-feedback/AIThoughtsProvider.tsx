
import React, { createContext, useContext } from 'react';
import { useAIThoughts } from '@/hooks/useAIThoughts';
import { Houseguest } from '@/models/houseguest';

interface AIThoughtsContextType {
  thoughts: Record<string, {
    houseguestId: string;
    thought: string;
    timestamp: number;
    type: 'thought' | 'decision' | 'strategy';
  }>;
  isVisible: boolean;
  addThought: (houseguest: Houseguest, thought: string, type?: 'thought' | 'decision' | 'strategy') => void;
  addDecision: (houseguest: Houseguest, thought: string) => void;
  addStrategy: (houseguest: Houseguest, thought: string) => void;
  removeThought: (houseguestId: string) => void;
  clearThoughts: () => void;
  toggleVisibility: () => void;
}

const AIThoughtsContext = createContext<AIThoughtsContextType | null>(null);

export function useAIThoughtsContext() {
  const context = useContext(AIThoughtsContext);
  if (!context) {
    throw new Error('useAIThoughtsContext must be used within an AIThoughtsProvider');
  }
  return context;
}

interface AIThoughtsProviderProps {
  children: React.ReactNode;
}

export const AIThoughtsProvider: React.FC<AIThoughtsProviderProps> = ({ children }) => {
  const aiThoughts = useAIThoughts();
  
  return (
    <AIThoughtsContext.Provider value={aiThoughts}>
      {children}
    </AIThoughtsContext.Provider>
  );
};
