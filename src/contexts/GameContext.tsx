import React, { createContext, useContext, useReducer, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from "sonner"; // Import sonner toast
import { useRelationshipImpact } from './RelationshipImpactContext';

// Import Core Classes & Types
import { BigBrotherGame } from '../models/game/BigBrotherGame';
import { Houseguest } from '../models/houseguest';
import { RelationshipSystem } from '../systems/relationship-system';
import { CompetitionSystem } from '../systems/competition-system';
import { AIIntegrationSystem } from '../systems/ai-integration';
import { PromiseSystem } from '../systems/promise/index'; // Updated import path
import { GameRecapGenerator } from '../utils/recap';
import { Logger, LogLevel } from '../utils/logger';
import { GameAction, GameContextType } from './types/game-context-types';
import { createInitialGameState, GameState } from '../models/game-state';
import { gameReducer } from './reducers/game-reducer';
import { config } from '@/config';

// Create the context
const GameContext = createContext<GameContextType | null>(null);

// --- Provider Component ---
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- Instantiate Systems (runs once) ---
    const logger = useRef(new Logger({ logLevel: LogLevel.INFO })).current;
    const systemsRef = useRef({
        relationshipSystem: new RelationshipSystem(logger),
        competitionSystem: new CompetitionSystem(logger),
        aiSystem: new AIIntegrationSystem(logger, config.GEMINI_API_KEY),
        promiseSystem: new PromiseSystem(logger), // Use PromiseSystem as a class
        recapGenerator: new GameRecapGenerator(),
    });

    // --- State Management ---
    const [gameInstance, setGameInstance] = useState<BigBrotherGame | null>(null);
    const [gameState, dispatch] = useReducer(gameReducer, createInitialGameState());
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Get the relationship impact context
    const relationshipImpact = useRelationshipImpact();
    
    // Handle relationship impact actions
    const interceptedDispatch = useCallback((action: GameAction) => {
        // If this is a relationship impact action, handle it
        if (action.type === 'RELATIONSHIP_IMPACT' && relationshipImpact) {
            const { targetId, targetName, value } = action.payload;
            relationshipImpact.addImpact(targetId, targetName, value);
        }
        
        // Forward the action to the normal reducer
        return dispatch(action);
    }, [relationshipImpact]);
    
    // Initialize game instance with systems
    useEffect(() => {
        if (gameInstance) {
            // Assign systems to game instance
            gameInstance.relationshipSystem = systemsRef.current.relationshipSystem;
            gameInstance.competitionSystem = systemsRef.current.competitionSystem;
            gameInstance.aiSystem = systemsRef.current.aiSystem;
            gameInstance.promiseSystem = systemsRef.current.promiseSystem; // Assign promiseSystem to game instance
        }
    }, [gameInstance]);

    // Log initial game state for debugging
    useEffect(() => {
        logger.info(`Game initialized with phase: ${gameState.phase}`);
    }, []);

    // Helper functions that use the game state
    const getHouseguestById = useCallback((id: string) => {
      return gameState.houseguests.find(guest => guest.id === id);
    }, [gameState.houseguests]);

    const getRelationship = useCallback((guest1Id: string, guest2Id: string) => {
      const relationshipsForGuest1 = gameState.relationships.get(guest1Id);
      if (!relationshipsForGuest1) return 0;
      
      const relationship = relationshipsForGuest1.get(guest2Id);
      return relationship?.score || 0;
    }, [gameState.relationships]);

    const getActiveHouseguests = useCallback(() => {
      return gameState.houseguests.filter(guest => guest.status === 'Active');
    }, [gameState.houseguests]);

    const getRandomNominees = useCallback((count: number = 2, excludeIds: string[] = []) => {
      const active = getActiveHouseguests().filter(hg => !excludeIds.includes(hg.id));
      return [...active].sort(() => 0.5 - Math.random()).slice(0, count);
    }, [getActiveHouseguests]);

    const getGameStatus = useCallback(() => {
      const { week, phase } = gameState;
      const hoh = gameState.hohWinner?.name || null;
      const nominees = gameState.nominees.map(nominee => nominee.name).join(', ');
      const povHolder = gameState.povWinner?.name || null;
      
      return {
        week,
        phase,
        hoh,
        nominees,
        povHolder
      };
    }, [gameState]);

    // Toast function to display notifications
    const showToast = useCallback((
        title: string, 
        options?: { 
          description?: string; 
          variant?: 'success' | 'error' | 'info' | 'warning'; 
          duration?: number 
        }
    ) => {
        logger.info(`[Toast] ${options?.variant || 'info'}: ${title} - ${options?.description || ''}`);
        const toastOptions = {
            description: options?.description,
            duration: options?.duration || 5000,
        };
        
        switch(options?.variant) {
            case 'success': toast.success(title, toastOptions); break;
            case 'error': toast.error(title, toastOptions); break;
            case 'warning': toast.warning(title, toastOptions); break;
            case 'info': // Fallthrough to default
            default: toast.info(title, toastOptions); break;
        }
    }, [logger]);

    // Save game state to localStorage
    const saveGame = useCallback((saveName: string) => {
        try {
            // Serialize relationships map to a plain object
            const serializedRelationships = Array.from(gameState.relationships.entries()).reduce((acc, [guestId1, relationships]) => {
                acc[guestId1] = Array.from(relationships.entries()).reduce((rel, [guestId2, relationship]) => {
                    rel[guestId2] = relationship;
                    return rel;
                }, {} as Record<string, any>);
                return acc;
            }, {} as Record<string, Record<string, any>>);
            
            // Create a serializable version of the game state
            const serializableState = {
                ...gameState,
                relationships: serializedRelationships,
                // Ensure any circular references are removed
                gameInstance: null,
            };
            
            // Create save data object
            const saveData = {
                gameState: serializableState,
                savedAt: new Date().toISOString(),
                name: saveName,
                version: '1.0'
            };
            
            // Save to localStorage
            const existingSaves = JSON.parse(localStorage.getItem('bigBrotherSaves') || '{}');
            existingSaves[saveName] = saveData;
            localStorage.setItem('bigBrotherSaves', JSON.stringify(existingSaves));
            
            showToast("Game saved successfully", { 
                variant: "success",
                description: `Saved as "${saveName}"`
            });
            
            return true;
        } catch (error) {
            logger.error("Failed to save game:", error);
            showToast("Save failed", { 
                variant: "error",
                description: "There was an error saving your game"
            });
            return false;
        }
    }, [gameState, logger, showToast]);

    // Load game state from localStorage
    const loadGame = useCallback((saveName: string) => {
        try {
            setIsLoading(true);
            const saves = JSON.parse(localStorage.getItem('bigBrotherSaves') || '{}');
            const saveData = saves[saveName];
            
            if (!saveData) {
                showToast("Load failed", { 
                    variant: "error",
                    description: "Save file not found"
                });
                setIsLoading(false);
                return false;
            }
            
            // Convert serialized relationships back to Map
            const loadedState = saveData.gameState;
            const relationshipsMap = new Map();
            
            if (loadedState.relationships) {
                Object.entries(loadedState.relationships).forEach(([guestId1, relationships]: [string, any]) => {
                    const innerMap = new Map();
                    Object.entries(relationships).forEach(([guestId2, relationship]: [string, any]) => {
                        innerMap.set(guestId2, relationship);
                    });
                    relationshipsMap.set(guestId1, innerMap);
                });
            }
            
            // Create restored game state
            const restoredState = {
                ...loadedState,
                relationships: relationshipsMap
            };
            
            // Update state with restored data
            dispatch({ type: 'LOAD_GAME', payload: restoredState });
            
            // Create a new game instance if needed
            if (!gameInstance) {
                const newGame = new BigBrotherGame(
                    loadedState.houseguests,
                    loadedState.week,
                    loadedState.phase
                );
                setGameInstance(newGame);
            }
            
            showToast("Game loaded", { 
                variant: "success",
                description: `Loaded "${saveName}"`
            });
            
            setTimeout(() => setIsLoading(false), 500);
            return true;
        } catch (error) {
            logger.error("Failed to load game:", error);
            showToast("Load failed", { 
                variant: "error",
                description: "There was an error loading your game"
            });
            setIsLoading(false);
            return false;
        }
    }, [gameInstance, dispatch, showToast, logger]);

    // Delete a saved game
    const deleteSavedGame = useCallback((saveName: string) => {
        try {
            const saves = JSON.parse(localStorage.getItem('bigBrotherSaves') || '{}');
            if (saves[saveName]) {
                delete saves[saveName];
                localStorage.setItem('bigBrotherSaves', JSON.stringify(saves));
                
                showToast("Save deleted", { 
                    variant: "success",
                    description: `Deleted "${saveName}"`
                });
                return true;
            }
            return false;
        } catch (error) {
            logger.error("Failed to delete save:", error);
            showToast("Delete failed", { 
                variant: "error",
                description: "There was an error deleting the save"
            });
            return false;
        }
    }, [showToast, logger]);

    // Get list of saved games
    const getSavedGames = useCallback(() => {
        try {
            const saves = JSON.parse(localStorage.getItem('bigBrotherSaves') || '{}');
            return Object.keys(saves).map(key => ({
                name: key,
                date: new Date(saves[key].savedAt).toLocaleString(),
                data: saves[key]
            }));
        } catch {
            return [];
        }
    }, []);

    // --- Context Value ---
    const contextValue = useMemo<GameContextType>(() => ({
        game: gameInstance,
        gameState,
        relationshipSystem: systemsRef.current.relationshipSystem,
        competitionSystem: systemsRef.current.competitionSystem,
        aiSystem: systemsRef.current.aiSystem,
        promiseSystem: systemsRef.current.promiseSystem, // Add promiseSystem to context value
        recapGenerator: systemsRef.current.recapGenerator,
        logger,
        dispatch: interceptedDispatch, // Use interceptedDispatch instead of dispatch directly
        getHouseguestById,
        getRelationship,
        getActiveHouseguests,
        getRandomNominees,
        getGameStatus,
        showToast,
        loading: isLoading,
        saveGame,
        loadGame,
        deleteSavedGame,
        getSavedGames
    }), [
      gameInstance, 
      gameState, 
      getHouseguestById, 
      getRelationship, 
      getActiveHouseguests, 
      getRandomNominees,
      getGameStatus,
      logger,
      showToast,
      isLoading,
      interceptedDispatch,
      saveGame,
      loadGame,
      deleteSavedGame,
      getSavedGames
    ]);

    return (
        <GameContext.Provider value={contextValue}>
            {isLoading ? <div className="text-center p-4">Loading Game...</div> : children}
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
