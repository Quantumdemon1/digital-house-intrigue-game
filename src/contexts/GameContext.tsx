
import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { createInitialGameState, GameState, GamePhase, GameEvent } from '../models/game-state';
import { Houseguest, HouseguestStatus } from '../models/houseguest';
import { getOrCreateRelationship } from '../models/game-state';
import { v4 as uuidv4 } from 'uuid';

// Define action types for our reducer
type GameAction = 
  | { type: 'START_GAME'; payload: Houseguest[] }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SET_HOH'; payload: Houseguest }
  | { type: 'SET_NOMINEES'; payload: Houseguest[] }
  | { type: 'SET_POV_WINNER'; payload: Houseguest }
  | { type: 'UPDATE_RELATIONSHIPS'; payload: { guestId1: string; guestId2: string; change: number; note?: string } }
  | { type: 'EVICT_HOUSEGUEST'; payload: { evicted: Houseguest; toJury: boolean } }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'LOG_EVENT'; payload: Omit<GameEvent, 'timestamp'> }
  | { type: 'END_GAME'; payload: { winner: Houseguest; runnerUp: Houseguest } };

// Game context type
type GameContextType = {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  getHouseguestById: (id: string) => Houseguest | undefined;
  getRelationship: (guest1Id: string, guest2Id: string) => number;
  getActiveHouseguests: () => Houseguest[];
};

// Create the context
const GameContext = createContext<GameContextType | null>(null);

// Game reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      // Initialize relationship map for all houseguests
      const relationships = new Map();
      
      action.payload.forEach(guest1 => {
        action.payload.forEach(guest2 => {
          if (guest1.id !== guest2.id) {
            getOrCreateRelationship(relationships, guest1.id, guest2.id);
          }
        });
      });
      
      return {
        ...state,
        houseguests: action.payload,
        phase: 'HoH',
        relationships,
      };
      
    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      };
      
    case 'SET_HOH':
      // Reset previous HoH
      const updatedHouseguests = state.houseguests.map(guest => ({
        ...guest,
        isHoH: guest.id === action.payload.id
      }));
      
      // Update the HoH's competition stats
      const newHohWinner = { 
        ...action.payload,
        isHoH: true,
        competitionsWon: {
          ...action.payload.competitionsWon,
          hoh: action.payload.competitionsWon.hoh + 1
        }
      };
      
      return {
        ...state,
        hohWinner: newHohWinner,
        houseguests: updatedHouseguests.map(h => 
          h.id === newHohWinner.id ? newHohWinner : h
        ),
      };
      
    case 'SET_NOMINEES':
      // Update the nominated status of all houseguests
      const houseguestsWithNominations = state.houseguests.map(guest => ({
        ...guest,
        isNominated: action.payload.some(nominee => nominee.id === guest.id),
        nominations: action.payload.some(nominee => nominee.id === guest.id) 
          ? guest.nominations + 1 
          : guest.nominations
      }));
      
      return {
        ...state,
        nominees: action.payload,
        houseguests: houseguestsWithNominations,
      };
      
    case 'SET_POV_WINNER':
      // Reset previous PoV holder
      const updatedHouseguestsForPov = state.houseguests.map(guest => ({
        ...guest,
        isPovHolder: guest.id === action.payload.id
      }));
      
      // Update the PoV winner's competition stats
      const newPovWinner = { 
        ...action.payload, 
        isPovHolder: true,
        competitionsWon: {
          ...action.payload.competitionsWon,
          pov: action.payload.competitionsWon.pov + 1
        }
      };
      
      return {
        ...state,
        povWinner: newPovWinner,
        houseguests: updatedHouseguestsForPov.map(h => 
          h.id === newPovWinner.id ? newPovWinner : h
        ),
      };
      
    case 'UPDATE_RELATIONSHIPS':
      const { guestId1, guestId2, change, note } = action.payload;
      const newRelationships = new Map(state.relationships);
      
      // Update relationship from guest1 to guest2
      const rel1 = getOrCreateRelationship(newRelationships, guestId1, guestId2);
      rel1.score = Math.max(-100, Math.min(100, rel1.score + change));
      if (note) {
        rel1.notes.push(note);
      }
      
      // Update relationship from guest2 to guest1 (with a slight variation)
      const rel2 = getOrCreateRelationship(newRelationships, guestId2, guestId1);
      // The reciprocal relationship changes slightly differently
      const reciprocalChange = change * (0.8 + Math.random() * 0.4); // 80-120% of original change
      rel2.score = Math.max(-100, Math.min(100, rel2.score + reciprocalChange));
      if (note) {
        rel2.notes.push(note);
      }
      
      return {
        ...state,
        relationships: newRelationships,
      };
      
    case 'EVICT_HOUSEGUEST':
      const { evicted, toJury } = action.payload;
      
      // Update the houseguest's status
      const updatedHouseguestsAfterEviction = state.houseguests.map(guest => {
        if (guest.id === evicted.id) {
          return {
            ...guest,
            status: toJury ? 'Jury' as HouseguestStatus : 'Evicted' as HouseguestStatus,
            isNominated: false,
          };
        }
        // Clear nomination status for everyone else too
        if (guest.isNominated) {
          return { ...guest, isNominated: false };
        }
        return guest;
      });
      
      // Update jury if needed
      const updatedJury = toJury 
        ? [...state.juryMembers, { ...evicted, status: 'Jury' as HouseguestStatus }]
        : state.juryMembers;
      
      return {
        ...state,
        houseguests: updatedHouseguestsAfterEviction,
        nominees: [],
        juryMembers: updatedJury,
        evictionVotes: {},
      };
      
    case 'ADVANCE_WEEK':
      // Reset HoH and PoV statuses
      const resetHouseguests = state.houseguests.map(guest => ({
        ...guest,
        isHoH: false,
        isPovHolder: false,
        isNominated: false,
      }));
      
      return {
        ...state,
        week: state.week + 1,
        phase: 'HoH',
        hohWinner: null,
        povWinner: null,
        nominees: [],
        houseguests: resetHouseguests,
        evictionVotes: {},
      };
      
    case 'LOG_EVENT':
      const newEvent: GameEvent = {
        ...action.payload,
        timestamp: Date.now(),
      };
      
      return {
        ...state,
        gameLog: [...state.gameLog, newEvent],
      };
      
    case 'END_GAME':
      const { winner, runnerUp } = action.payload;
      
      // Update statuses
      const finalHouseguests = state.houseguests.map(guest => {
        if (guest.id === winner.id) {
          return { ...guest, status: 'Winner' as HouseguestStatus };
        }
        if (guest.id === runnerUp.id) {
          return { ...guest, status: 'Runner-Up' as HouseguestStatus };
        }
        return guest;
      });
      
      return {
        ...state,
        phase: 'GameOver',
        houseguests: finalHouseguests,
        winner: { ...winner, status: 'Winner' as HouseguestStatus },
        runnerUp: { ...runnerUp, status: 'Runner-Up' as HouseguestStatus },
      };
      
    default:
      return state;
  }
}

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, createInitialGameState());
  
  // Helper functions
  const getHouseguestById = (id: string) => {
    return gameState.houseguests.find(guest => guest.id === id);
  };
  
  const getRelationship = (guest1Id: string, guest2Id: string) => {
    const guest1Map = gameState.relationships.get(guest1Id);
    if (!guest1Map) return 0;
    
    const relationship = guest1Map.get(guest2Id);
    return relationship?.score || 0;
  };
  
  const getActiveHouseguests = () => {
    return gameState.houseguests.filter(guest => guest.status === 'Active');
  };
  
  return (
    <GameContext.Provider value={{ 
      gameState, 
      dispatch, 
      getHouseguestById, 
      getRelationship,
      getActiveHouseguests,
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
