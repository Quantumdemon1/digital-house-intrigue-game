
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GameControlContextType {
  fastForward: () => void;
  isProcessing: boolean;
}

const GameControlContext = createContext<GameControlContextType | null>(null);

export const GameControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const fastForward = useCallback(() => {
    if (isProcessing) {
      console.log("Already processing, ignoring fast forward request");
      return;
    }
    
    setIsProcessing(true);
    console.log("GameControlContext: Fast forward triggered");
    
    // Dispatch a custom event that components can listen for
    document.dispatchEvent(new CustomEvent('game:fastForward'));
    
    toast({
      description: "Fast forwarding to next phase...",
      duration: 2000,
    });
    
    // Reset processing state after a delay
    setTimeout(() => {
      setIsProcessing(false);
      console.log("Fast forward processing complete, state reset");
    }, 2000);
  }, [isProcessing, toast]);
  
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
