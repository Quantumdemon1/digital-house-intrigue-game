
import React, { createContext, useContext, useReducer } from 'react';
import { createInitialGameState } from '../models/game-state';
import { gameReducer } from './reducers/game-reducer';
import { GameContextType } from './types/game-context-types';
import { useGameHelpers } from './hooks/useGameHelpers';

// Create the context
const GameContext = createContext<GameContextType | null>(null);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, createInitialGameState());
  
  // Get helper functions
  const { getHouseguestById, getRelationship, getActiveHouseguests, getRandomNominees } = useGameHelpers(gameState);
  
  return (
    <GameContext.Provider value={{ 
      gameState, 
      dispatch, 
      getHouseguestById, 
      getRelationship,
      getActiveHouseguests,
      getRandomNominees,
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
