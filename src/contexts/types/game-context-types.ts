
import type { GamePhase } from '../../models/game-state';
import type { BigBrotherGame } from '../../models/BigBrotherGame'; 
import type { Houseguest } from '../../models/houseguest';
import type { Alliance } from '../../models/alliance';
import type { IGameControllerFacade, IUIManagerFacade } from '../../types/interfaces';
import type { RelationshipSystem } from '../../systems/relationship-system';
import type { CompetitionSystem } from '../../systems/competition-system';
import type { AIIntegrationSystem } from '../../systems/ai-integration';
import type { GameRecapGenerator } from '../../utils/recap';
import type { Logger } from '../../utils/logger';

// --- Action Definitions ---

// System actions
type SystemAction =
  | { type: 'INITIALIZE_GAME'; payload: { playerName: string } } 
  | { type: 'START_NEW_GAME_INSTANCE'; payload: { gameInstance: BigBrotherGame } }
  | { type: 'LOAD_GAME_INSTANCE'; payload: { gameInstance: BigBrotherGame } }
  | { type: 'SAVE_GAME_REQUEST' }
  | { type: 'LOAD_GAME_REQUEST' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'FORCE_REFRESH' };

// Player actions
type PlayerAction = {
  type: 'PLAYER_ACTION';
  payload: {
    actionId: string;
    params: any;
  };
};

// UI update actions
type UIUpdateAction =
  | { type: 'SHOW_NARRATOR_MESSAGE'; payload: string }
  | { type: 'SHOW_DIALOGUE'; payload: { speakerName: string; text: string; mood?: string } };

// Game state actions - these were previously in the application but not defined in types
type GameStateAction =
  | { type: 'START_GAME'; payload: Houseguest[] }
  | { type: 'SET_HOH'; payload: Houseguest }
  | { type: 'SET_POV_WINNER'; payload: Houseguest }
  | { type: 'SET_NOMINEES'; payload: Houseguest[] }
  | { type: 'UPDATE_RELATIONSHIPS'; payload: { guestId1: string; guestId2: string; change: number; note?: string } }
  | { type: 'SET_EVICTION_VOTE'; payload: { voterId: string; nomineeId: string } }
  | { type: 'EVICT_HOUSEGUEST'; payload: { evicted: Houseguest; toJury: boolean } }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'END_GAME'; payload: { winner: Houseguest; runnerUp: Houseguest } }
  | { type: 'LOG_EVENT'; payload: { week: number; phase: GamePhase; type: string; description: string; involvedHouseguests: string[] } };

// Combined action type
export type GameAction = SystemAction | PlayerAction | UIUpdateAction | GameStateAction;

// --- Game State Definition ---
// This represents the game state maintained by the reducer
export interface GameState {
  houseguests: Houseguest[];
  alliances: Alliance[]; // Required property
  hohWinner: Houseguest | null;
  povWinner: Houseguest | null;
  nominees: Houseguest[];
  juryMembers: Houseguest[];
  winner: Houseguest | null;
  runnerUp: Houseguest | null;
  week: number;
  phase: GamePhase;
  relationships: Map<string, Map<string, { score: number; alliance: string | null; notes: string[] }>>;
  evictionVotes: Record<string, string>;
  gameLog: Array<{
    week: number;
    phase: GamePhase;
    type: string;
    description: string;
    involvedHouseguests: string[];
    timestamp: number;
  }>;
}

// --- Context Type Definition ---
export type GameContextType = {
    game: BigBrotherGame | null;
    gameState: GameState;  // Keep the gameState property to maintain compatibility
    relationshipSystem: RelationshipSystem | null;
    competitionSystem: CompetitionSystem | null;
    aiSystem: AIIntegrationSystem | null;
    recapGenerator: GameRecapGenerator | null;
    logger: Logger;
    dispatch: React.Dispatch<GameAction>;
    getHouseguestById: (id: string) => Houseguest | undefined;
    getRelationship: (guest1Id: string, guest2Id: string) => number;
    getActiveHouseguests: () => Houseguest[];
    getRandomNominees: (count?: number, excludeIds?: string[]) => Houseguest[];
    getGameStatus: () => { week: number; phase: string; hoh: string | null; nominees: string; povHolder: string | null; };
    showToast: (title: string, options?: { description?: string; variant?: 'success' | 'error' | 'info' | 'warning'; duration?: number }) => void;
};
