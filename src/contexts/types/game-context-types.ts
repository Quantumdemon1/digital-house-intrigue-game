
import type { GamePhase } from '../../models/game-state'; 
import type { BigBrotherGame } from '../../models/BigBrotherGame'; 
import type { Houseguest } from '../../models/houseguest';
import type { IGameControllerFacade, IUIManagerFacade } from '../../types/interfaces';
import type { RelationshipSystem } from '../../systems/relationship-system';
import type { CompetitionSystem } from '../../systems/competition-system';
import type { AIIntegrationSystem } from '../../systems/ai-integration';
import type { GameRecapGenerator } from '../../utils/recap';
import type { Logger } from '../../utils/logger';

// --- Action Definitions ---

// Actions primarily handled by the main controller/provider
type SystemAction =
  | { type: 'INITIALIZE_GAME'; payload: { playerName: string } } 
  | { type: 'START_NEW_GAME_INSTANCE'; payload: { gameInstance: BigBrotherGame } }
  | { type: 'LOAD_GAME_INSTANCE'; payload: { gameInstance: BigBrotherGame } }
  | { type: 'SAVE_GAME_REQUEST' }
  | { type: 'LOAD_GAME_REQUEST' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'FORCE_REFRESH' };

// Actions routed to the current game state via gameInstance.handleAction
type PlayerAction = {
  type: 'PLAYER_ACTION';
  payload: {
    actionId: string; // e.g., 'make_nominations', 'cast_eviction_vote'
    params: any;      // Data specific to the action
  };
};

// Actions possibly dispatched internally by states/systems to update UI *indirectly*
type UIUpdateAction =
  | { type: 'SHOW_NARRATOR_MESSAGE'; payload: string }
  | { type: 'SHOW_DIALOGUE'; payload: { speakerName: string; text: string; mood?: string } };

export type GameAction = SystemAction | PlayerAction | UIUpdateAction;

// --- Context Type Definition ---
export type GameContextType = {
    game: BigBrotherGame | null;
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
};
