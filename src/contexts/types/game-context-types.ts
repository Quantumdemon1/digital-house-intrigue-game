
import { Houseguest } from '../../models/houseguest';
import { BigBrotherGame } from '../../models/game/BigBrotherGame';
import { RelationshipSystem } from '../../systems/relationship';
import { CompetitionSystem } from '../../systems/competition-system';
import { AIIntegrationSystem as AISystem } from '../../systems/ai/ai-integration-system';
import { PromiseSystem } from '../../systems/promise';
import { RecapGenerator } from '../../utils/recap/recap-generator';
import { Logger } from '../../utils/logger';
import { GameState } from '../../models/game-state';

// Re-export GameState so other modules can import it
export type { GameState };

// Define Action type
export type GameAction = {
  type: string;
  payload?: any;
};

// Context type
export interface GameContextType {
  game: BigBrotherGame | null;
  gameState: GameState;
  relationshipSystem: RelationshipSystem | null;
  competitionSystem: CompetitionSystem | null;
  aiSystem: AISystem | null;
  promiseSystem: PromiseSystem | null;
  recapGenerator: RecapGenerator | null;
  logger: Logger | null;
  dispatch: React.Dispatch<GameAction>;
  getHouseguestById: (id: string) => Houseguest | undefined;
  getRelationship: (guest1Id: string, guest2Id: string) => number;
  getActiveHouseguests: () => Houseguest[];
  getRandomNominees: (count?: number, excludeIds?: string[]) => Houseguest[];
  getGameStatus: () => {
    week: number;
    phase: string;
    hoh: Houseguest | null;
    nominees: string;
    povHolder: Houseguest | null;
  };
  showToast: (title: string, options?: { 
    description?: string; 
    variant?: 'success' | 'error' | 'info' | 'warning'; 
    duration?: number 
  }) => void;
  loading: boolean;
  saveGame: (name: string) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  deleteSavedGame: (gameId: string) => Promise<void>;
  getSavedGames: () => Promise<any[]>;
}
