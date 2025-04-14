
import { Dispatch } from 'react';
import { BigBrotherGame } from '../../models/game/BigBrotherGame';
import { GameState } from '../../models/game-state';
import { Logger } from '../../utils/logger';

// Define the action types including the new RELATIONSHIP_IMPACT action
export type GameAction = 
  | { type: 'START_GAME'; payload: any }
  | { type: 'SET_PHASE'; payload: string }
  | { type: 'UPDATE_RELATIONSHIPS'; payload: { guestId1: string; guestId2: string; change: number; note?: string; } }
  | { type: 'PLAYER_ACTION'; payload: { actionId: string; params?: any } }
  | { type: 'LOG_EVENT'; payload: { type: string; description: string; involvedHouseguests: string[]; week: number; phase: string; metadata?: any } }
  | { type: 'RELATIONSHIP_IMPACT'; payload: { targetId: string; targetName: string; value: number } }
  | { type: 'SET_HOH'; payload: any } 
  | { type: 'SET_POV_WINNER'; payload: any }
  | { type: 'SET_NOMINEES'; payload: any }
  | { type: 'SET_EVICTION_VOTE'; payload: any }
  | { type: 'EVICT_HOUSEGUEST'; payload: any }
  | { type: 'ADVANCE_WEEK'; payload?: any }
  | { type: 'END_GAME'; payload: any }
  | { type: 'INITIALIZE_GAME'; payload?: any }
  | { type: 'START_NEW_GAME_INSTANCE'; payload?: any }
  | { type: 'LOAD_GAME_INSTANCE'; payload?: any }
  | { type: 'SAVE_GAME_REQUEST'; payload?: any }
  | { type: 'LOAD_GAME_REQUEST'; payload?: any }
  | { type: 'TOGGLE_PAUSE'; payload?: any }
  | { type: 'FORCE_REFRESH'; payload?: any }
  | { type: 'SHOW_NARRATOR_MESSAGE'; payload?: any }
  | { type: 'SHOW_DIALOGUE'; payload?: any };

// Export the GameState type to fix issues with imports
export { GameState } from '../../models/game-state';

// Export the GameContextType interface
export interface GameContextType {
  game: BigBrotherGame | null;
  gameState: GameState;
  relationshipSystem: any;
  competitionSystem: any;
  aiSystem: any;
  promiseSystem: any;
  recapGenerator: any;
  logger: Logger;
  dispatch: Dispatch<GameAction>;
  getHouseguestById: (id: string) => any;
  getRelationship: (guest1Id: string, guest2Id: string) => number;
  getActiveHouseguests: () => any[];
  getRandomNominees: (count?: number, excludeIds?: string[]) => any[];
  getGameStatus: () => { week: number; phase: string; hoh: string | null; nominees: string; povHolder: string | null };
  showToast: (title: string, options?: { description?: string; variant?: 'success' | 'error' | 'info' | 'warning'; duration?: number }) => void;
  loading?: boolean;
}
