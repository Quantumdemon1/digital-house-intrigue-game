
import React, { createContext, useContext, useReducer, useRef, useEffect, useState, useCallback, useMemo } from 'react';

// Import Core Classes & Types
import { BigBrotherGame } from '../models/BigBrotherGame';
import { Houseguest } from '../models/houseguest';
import { RelationshipSystem } from '../systems/relationship-system';
import { CompetitionSystem } from '../systems/competition-system';
import { AIIntegrationSystem } from '../systems/ai-integration';
import { GameRecapGenerator } from '../utils/recap';
import { Logger, LogLevel } from '../utils/logger';
import { GameAction, GameContextType, GameState } from './types/game-context-types';
import { gameReducer } from './reducers/game-reducer';

// Create the context
const GameContext = createContext<GameContextType | null>(null);

// Initial state for the game
const initialGameState: GameState = {
  houseguests: [],
  alliances: [],
  hohWinner: null,
  povWinner: null,
  nominees: [],
  juryMembers: [],
  winner: null,
  runnerUp: null,
  week: 1,
  phase: 'Setup',
  relationships: new Map(),
  evictionVotes: {},
  gameLog: []
};

// --- Provider Component ---
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- Instantiate Systems (runs once) ---
    const logger = new Logger({ logLevel: LogLevel.INFO });
    const systemsRef = useRef({
        relationshipSystem: new RelationshipSystem(logger),
        competitionSystem: new CompetitionSystem(logger),
        aiSystem: new AIIntegrationSystem(logger),
        recapGenerator: new GameRecapGenerator(),
    });

    // --- State Management ---
    const [gameInstance, setGameInstance] = useState<BigBrotherGame | null>(null);
    const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    // --- Context Value ---
    const contextValue = useMemo<GameContextType>(() => ({
        game: gameInstance,
        gameState,
        relationshipSystem: systemsRef.current.relationshipSystem,
        competitionSystem: systemsRef.current.competitionSystem,
        aiSystem: systemsRef.current.aiSystem,
        recapGenerator: systemsRef.current.recapGenerator,
        logger,
        dispatch,
        getHouseguestById,
        getRelationship,
        getActiveHouseguests,
        getRandomNominees,
        getGameStatus,
    }), [
      gameInstance, 
      gameState, 
      getHouseguestById, 
      getRelationship, 
      getActiveHouseguests, 
      getRandomNominees,
      getGameStatus,
      logger
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
