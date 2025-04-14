
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useGame } from './GameContext';

export interface RelationshipImpact {
  id: string;
  houseguestId: string;
  houseguestName: string;
  impactValue: number;
  timestamp: number;
}

interface RelationshipImpactContextType {
  impacts: RelationshipImpact[];
  addImpact: (houseguestId: string, houseguestName: string, impactValue: number) => void;
  clearImpacts: () => void;
}

const RelationshipImpactContext = createContext<RelationshipImpactContextType | null>(null);

export const useRelationshipImpact = () => {
  const context = useContext(RelationshipImpactContext);
  if (!context) {
    throw new Error('useRelationshipImpact must be used within a RelationshipImpactProvider');
  }
  return context;
};

export const RelationshipImpactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [impacts, setImpacts] = useState<RelationshipImpact[]>([]);
  const { gameState } = useGame();
  
  // Remove impacts after they've been displayed for a while
  useEffect(() => {
    const timer = setInterval(() => {
      setImpacts(prev => prev.filter(impact => {
        const now = Date.now();
        return now - impact.timestamp < 4000; // Remove after 4 seconds
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Clear impacts on phase change
  useEffect(() => {
    clearImpacts();
  }, [gameState.phase]);
  
  const addImpact = useCallback((houseguestId: string, houseguestName: string, impactValue: number) => {
    // Don't show impacts of 0
    if (impactValue === 0) return;
    
    const newImpact = {
      id: `${houseguestId}-${Date.now()}`,
      houseguestId,
      houseguestName,
      impactValue,
      timestamp: Date.now()
    };
    
    setImpacts(prev => [...prev, newImpact]);
  }, []);
  
  const clearImpacts = useCallback(() => {
    setImpacts([]);
  }, []);
  
  return (
    <RelationshipImpactContext.Provider value={{ impacts, addImpact, clearImpacts }}>
      {children}
    </RelationshipImpactContext.Provider>
  );
};
