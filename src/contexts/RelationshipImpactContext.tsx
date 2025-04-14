
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  
  // Clear impacts function that can be called manually or from a parent component
  const clearImpacts = useCallback(() => {
    setImpacts([]);
  }, []);

  // Add a new impact to the list
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
  
  return (
    <RelationshipImpactContext.Provider value={{ impacts, addImpact, clearImpacts }}>
      {children}
    </RelationshipImpactContext.Provider>
  );
};
