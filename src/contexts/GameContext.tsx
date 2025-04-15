
import React, { createContext, useContext, useReducer, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from "sonner"; // Import sonner toast
import { useRelationshipImpact } from './RelationshipImpactContext';
import { gameReducer } from './reducers/game-reducer';
import { BigBrotherGame } from '../models/game/BigBrotherGame';
import { GameAction, GameState, GameContextType } from './types/game-context-types';
import { initialGameState } from '../models/game-state';
import { useNavigate } from 'react-router-dom';
import { RelationshipSystem } from '../systems/relationship';
import { CompetitionSystem } from '../systems/competition-system';
import { AIIntegrationSystem } from '../systems/ai-integration';
import { Logger } from '../utils/logger';
import { useAuth } from './AuthContext';

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const relationshipImpact = useRelationshipImpact();
  const [loading, setLoading] = useState(true);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  const gameRef = useRef<BigBrotherGame | null>(null);
  const relationshipSystemRef = useRef<RelationshipSystem | null>(null);
  const competitionSystemRef = useRef<CompetitionSystem | null>(null);
  const aiSystemRef = useRef<AIIntegrationSystem | null>(null);
  const promiseSystemRef = useRef<any>(null);
  const recapGeneratorRef = useRef<any>(null);
  const loggerRef = useRef<Logger | null>(null);
  
  const initializeGameSystems = useCallback(() => {
    loggerRef.current = new Logger();
    relationshipSystemRef.current = new RelationshipSystem();
    competitionSystemRef.current = new CompetitionSystem();
    aiSystemRef.current = new AIIntegrationSystem();
    promiseSystemRef.current = {}; // Assuming PromiseSystem doesn't require instantiation
    recapGeneratorRef.current = {}; // Assuming RecapGenerator doesn't require instantiation
  }, []);
  
  const initializeGame = useCallback(() => {
    if (!relationshipSystemRef.current || !competitionSystemRef.current || !aiSystemRef.current || !loggerRef.current) {
      console.error('Game systems not initialized');
      return;
    }
    
    // Fix the constructor call by passing the right parameters
    gameRef.current = new BigBrotherGame(
      gameState.houseguests,
      gameState.week,
      gameState.phase
    );
  }, [gameState]);
  
  useEffect(() => {
    initializeGameSystems();
    initializeGame();
    setLoading(false);
  }, [initializeGameSystems, initializeGame]);
  
  const game = useMemo(() => gameRef.current, []);
  const relationshipSystem = useMemo(() => relationshipSystemRef.current!, []);
  const competitionSystem = useMemo(() => competitionSystemRef.current!, []);
  const aiSystem = useMemo(() => aiSystemRef.current!, []);
  const promiseSystem = useMemo(() => promiseSystemRef.current!, []);
  const recapGenerator = useMemo(() => recapGeneratorRef.current!, []);
  const logger = useMemo(() => loggerRef.current!, []);
  
  const getHouseguestById = useCallback((id: string) => {
    return game?.getHouseguestById(id);
  }, [game]);
  
  const getRelationship = useCallback((guest1Id: string, guest2Id: string) => {
    return relationshipSystem?.getRelationship(guest1Id, guest2Id) || 0;
  }, [relationshipSystem]);
  
  const getActiveHouseguests = useCallback(() => {
    return game?.getActiveHouseguests() || [];
  }, [game]);
  
  // Define getRandomNominees as it's missing in the BigBrotherGame
  const getRandomNominees = useCallback((count: number = 2, excludeIds: string[] = []) => {
    const activeHouseguests = getActiveHouseguests();
    const eligibleHouseguests = activeHouseguests.filter(hg => !excludeIds.includes(hg.id));
    
    // Shuffle the array
    const shuffled = [...eligibleHouseguests].sort(() => 0.5 - Math.random());
    // Get the first 'count' elements
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }, [getActiveHouseguests]);
  
  const getGameStatus = useCallback(() => {
    return {
      week: game?.week || 0,
      phase: game?.phase || 'Setup',
      hoh: game?.hohWinner || null,
      nominees: game?.nominees?.join(', ') || '',
      povHolder: game?.povWinner || null,
    };
  }, [game]);
  
  const showToast = useCallback((title: string, options: { description?: string; variant?: 'success' | 'error' | 'info' | 'warning'; duration?: number } = {}) => {
    toast(title, options);
  }, []);

  // Update the saveGame function to include user ID
  const saveGame = (saveName: string): boolean => {
    try {
      // If there's no game instance active, return false
      if (!game) {
        return false;
      }

      // Create a save name with a timestamp
      const timestamp = new Date().toISOString();
      const saveNameWithTimestamp = `${saveName}_${timestamp}`;
      
      // Store the entire game state
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      // Get existing saves or create an empty array
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      let existingSaves = JSON.parse(existingSavesStr);
      
      // Add the new save
      existingSaves.push({
        name: saveNameWithTimestamp,
        date: timestamp,
        data: gameState
      });
      
      // Save back to localStorage
      localStorage.setItem(saveKey, JSON.stringify(existingSaves));
      
      toast.success(`Game saved as ${saveName}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      toast.error('Failed to save game');
      return false;
    }
  };

  // Update the loadGame function to use user ID
  const loadGame = (saveName: string): boolean => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      const existingSaves = JSON.parse(existingSavesStr);
      
      // Find the save with the given name
      const saveToLoad = existingSaves.find((save: any) => save.name === saveName);
      
      if (!saveToLoad) {
        toast.error(`Save '${saveName}' not found`);
        return false;
      }
      
      // Dispatch the loaded game state
      dispatch({ type: 'LOAD_GAME', payload: saveToLoad.data });
      
      toast.success(`Game loaded: ${saveName}`);
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      toast.error('Failed to load game');
      return false;
    }
  };

  // Update the deleteSavedGame function to use user ID
  const deleteSavedGame = (saveName: string): boolean => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      let existingSaves = JSON.parse(existingSavesStr);
      
      // Filter out the save to delete
      existingSaves = existingSaves.filter((save: any) => save.name !== saveName);
      
      // Save the updated list back to localStorage
      localStorage.setItem(saveKey, JSON.stringify(existingSaves));
      
      toast.success(`Save '${saveName}' deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      toast.error('Failed to delete save');
      return false;
    }
  };

  // Update the getSavedGames function to use user ID
  const getSavedGames = (): Array<{ name: string; date: string; data: any }> => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      return JSON.parse(existingSavesStr);
    } catch (error) {
      console.error('Failed to get saved games:', error);
      return [];
    }
  };

  const contextValue: GameContextType = {
    game,
    gameState,
    relationshipSystem,
    competitionSystem,
    aiSystem,
    promiseSystem,
    recapGenerator,
    logger,
    dispatch,
    getHouseguestById,
    getRelationship,
    getActiveHouseguests,
    getRandomNominees,
    getGameStatus,
    showToast,
    loading,
    saveGame,
    loadGame,
    deleteSavedGame,
    getSavedGames
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
