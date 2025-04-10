
import { GameState, GamePhase, GameEvent } from '../../models/game-state';
import { Houseguest } from '../../models/houseguest';

// Define action types for our reducer
export type GameAction = 
  | { type: 'START_GAME'; payload: Houseguest[] }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SET_HOH'; payload: Houseguest }
  | { type: 'SET_NOMINEES'; payload: Houseguest[] }
  | { type: 'SET_POV_WINNER'; payload: Houseguest }
  | { type: 'UPDATE_RELATIONSHIPS'; payload: { guestId1: string; guestId2: string; change: number; note?: string } }
  | { type: 'SET_EVICTION_VOTE'; payload: { voterId: string; nomineeId: string } }
  | { type: 'EVICT_HOUSEGUEST'; payload: { evicted: Houseguest; toJury: boolean } }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'LOG_EVENT'; payload: Omit<GameEvent, 'timestamp'> }
  | { type: 'END_GAME'; payload: { winner: Houseguest; runnerUp: Houseguest } };

// Game context type
export type GameContextType = {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  getHouseguestById: (id: string) => Houseguest | undefined;
  getRelationship: (guest1Id: string, guest2Id: string) => number;
  getActiveHouseguests: () => Houseguest[];
  getRandomNominees: (count?: number, excludeIds?: string[]) => Houseguest[];
};
