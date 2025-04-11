
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface GameControlContextType {
  fastForward: () => void;
  isProcessing: boolean;
}

const GameControlContext = createContext<GameControlContextType | null>(null);

export const GameControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fastForward = useCallback(() => {
    setIsProcessing(true);
    
    // Dispatch a custom event that components can listen for
    document.dispatchEvent(new CustomEvent('game:fastForward'));
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  }, []);
  
  return (
    <GameControlContext.Provider value={{ fastForward, isProcessing }}>
      {children}
    </GameControlContext.Provider>
  );
};

export const useGameControl = (): GameControlContextType => {
  const context = useContext(GameControlContext);
  if (!context) {
    throw new Error('useGameControl must be used within a GameControlProvider');
  }
  return context;
};
