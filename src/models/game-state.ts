
import type { Houseguest } from './houseguest';
import type { Alliance } from './alliance';
import type { RelationshipEvent } from './relationship-event';

export type GamePhase = 
  | 'Setup'           // Game setup, player creation
  | 'HoH'             // Head of Household competition
  | 'Nomination'      // HoH nominates two houseguests
  | 'PoV'             // Power of Veto competition
  | 'PoVMeeting'      // Decision to use or not use veto
  | 'Eviction'        // House votes to evict one nominee
  | 'SocialInteraction' // Social interactions between houseguests
  | 'Finale'          // Final HoH, jury vote
  | 'GameOver';       // Game recap, winner celebration

export type Relationship = {
  score: number;        // -100 to 100 scale
  alliance: string | null; // alliance ID if they're in an alliance together
  notes: string[];      // Important events that affected relationship
  events: RelationshipEvent[]; // History of significant relationship events
  lastInteractionWeek: number; // Last week there was a direct interaction
};

export type RelationshipMap = Map<string, Map<string, Relationship>>;

export interface GameState {
  week: number;
  phase: GamePhase;
  houseguests: Houseguest[];
  alliances: Alliance[];
  hohWinner: Houseguest | null;
  povWinner: Houseguest | null;
  nominees: Houseguest[];
  relationships: RelationshipMap;
  evictionVotes: Record<string, string>; // voterId -> nomineeId
  juryMembers: Houseguest[];
  winner: Houseguest | null;
  runnerUp: Houseguest | null;
  gameLog: GameEvent[];
}

export type GameEvent = {
  week: number;
  phase: GamePhase;
  type: string;
  description: string;
  involvedHouseguests: string[]; // Houseguest IDs
  timestamp: number;
};

export function createInitialGameState(): GameState {
  return {
    week: 1,
    phase: 'Setup',
    houseguests: [],
    alliances: [],
    hohWinner: null,
    povWinner: null,
    nominees: [],
    relationships: new Map(),
    evictionVotes: {},
    juryMembers: [],
    winner: null,
    runnerUp: null,
    gameLog: [],
  };
}

// Initialize or get relationship between two houseguests
export function getOrCreateRelationship(
  relationships: RelationshipMap, 
  guest1Id: string, 
  guest2Id: string
): Relationship {
  // Get or create the map for guest1
  let guest1Map = relationships.get(guest1Id);
  if (!guest1Map) {
    guest1Map = new Map<string, Relationship>();
    relationships.set(guest1Id, guest1Map);
  }
  
  // Get or create the relationship
  let relationship = guest1Map.get(guest2Id);
  if (!relationship) {
    relationship = { 
      score: 0, 
      alliance: null, 
      notes: [],
      events: [],
      lastInteractionWeek: 1
    };
    guest1Map.set(guest2Id, relationship);
  }
  
  return relationship;
}
