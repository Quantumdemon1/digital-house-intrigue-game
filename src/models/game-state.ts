
/**
 * @file src/models/game-state.ts
 * @description Game state types and interfaces
 */

// Game phases
export type GamePhase = 
  | 'Initialization' 
  | 'HOH Competition' 
  | 'Nomination' 
  | 'POV Player Selection' // Added new phase for selecting PoV players
  | 'POV Competition' 
  | 'POV Meeting' 
  | 'Eviction'
  | 'Final HOH Part1' // Added for final HoH competition
  | 'Final HOH Part2'
  | 'Final HOH Part3'
  | 'Jury Questioning' // Added for jury questioning final 2
  | 'Finale'
  | 'Setup'
  | 'HoH'
  | 'PoV'
  | 'PoVPlayerSelection' // Added alias for the selection phase
  | 'PoVMeeting'
  | 'SocialInteraction'
  | 'FinalHoH'
  | 'JuryQuestioning'
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

// Import Promise type
import { Promise } from './promise';

// Define GameState interface - explicitly export this
export interface GameState {
  houseguests: any[];
  alliances: any[];
  hohWinner: any | null;
  povWinner: any | null;
  povPlayers: any[]; // Added to track the 6 PoV competition players
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
  finalHoHWinners?: {part1: string | null, part2: string | null, part3: string | null}; // Added to track final HoH winners
  isFinalStage: boolean; // Added to track when we're in the final stages
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    houseguests: [],
    alliances: [],
    hohWinner: null,
    povWinner: null,
    povPlayers: [], // Initialize empty array for PoV players
    nominees: [],
    juryMembers: [],
    winner: null,
    runnerUp: null,
    week: 0,
    phase: 'Setup',
    relationships: new Map(),
    evictionVotes: {},
    gameLog: [],
    promises: [], // Initialize empty promises array
    finalHoHWinners: {part1: null, part2: null, part3: null},
    isFinalStage: false
  };
}

// Create and export initialGameState
export const initialGameState: GameState = createInitialGameState();

// Define relationship map type for use in other components
export type RelationshipMap = Map<string, Map<string, { 
  score: number; 
  alliance: string | null; 
  notes: string[];
  events: any[];
  lastInteractionWeek: number;
}>>;
