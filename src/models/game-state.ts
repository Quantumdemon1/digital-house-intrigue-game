
/**
 * @file src/models/game-state.ts
 * @description Game state types and interfaces
 */

// Game phases
export type GamePhase = 
  | 'Initialization' 
  | 'HOH Competition' 
  | 'Nomination' 
  | 'POV Competition' 
  | 'POV Meeting' 
  | 'Eviction'
  | 'Finale'
  | 'Setup'
  | 'HoH'
  | 'PoV'
  | 'PoVMeeting'
  | 'SocialInteraction'
  | 'GameOver';

// Game event interface
export interface GameEvent {
  week: number;
  phase: GamePhase;
  type: string;
  description: string;
  involvedHouseguests: string[];
  timestamp: number;
  data?: Record<string, any>; // Optional data field for event-specific information
}

// Helper function to get or create a relationship between two houseguests
export function getOrCreateRelationship(
  relationships: Map<string, Map<string, any>>, 
  guest1Id: string, 
  guest2Id: string
): { 
  score: number; 
  alliance: string | null; 
  notes: string[];
  events: any[];
  lastInteractionWeek: number;
} {
  if (!relationships.has(guest1Id)) {
    relationships.set(guest1Id, new Map());
  }
  
  const guestRelationships = relationships.get(guest1Id)!;
  
  if (!guestRelationships.has(guest2Id)) {
    guestRelationships.set(guest2Id, {
      score: 0,
      alliance: null,
      notes: [],
      events: [],
      lastInteractionWeek: 0
    });
  }
  
  return guestRelationships.get(guest2Id);
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    houseguests: [],
    alliances: [],
    hohWinner: null,
    povWinner: null,
    nominees: [],
    juryMembers: [],
    winner: null,
    runnerUp: null,
    week: 0,
    phase: 'Setup',
    relationships: new Map(),
    evictionVotes: {},
    gameLog: [],
    promises: [] // Initialize empty promises array
  };
}

// Create and export initialGameState
export const initialGameState: GameState = createInitialGameState();

// Import existing types (this would be added to the existing imports)
import { Promise } from './promise';

// Add promise array to GameState (would be added to existing interface)
export interface GameState {
  houseguests: any[];
  alliances: any[];
  hohWinner: any | null;
  povWinner: any | null;
  nominees: any[];
  juryMembers: any[];
  winner: any | null;
  runnerUp: any | null;
  week: number;
  phase: GamePhase;
  relationships: Map<string, Map<string, { 
    score: number; 
    alliance: string | null; 
    notes: string[];
    events: any[];
    lastInteractionWeek: number;
  }>>;
  evictionVotes: Record<string, string>;
  gameLog: GameEvent[];
  promises?: Promise[];
}

// Define relationship map type for use in other components
export type RelationshipMap = Map<string, Map<string, { 
  score: number; 
  alliance: string | null; 
  notes: string[];
  events: any[];
  lastInteractionWeek: number;
}>>;
