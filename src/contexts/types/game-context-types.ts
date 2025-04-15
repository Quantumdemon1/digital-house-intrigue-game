
import { GameState } from '../../models/game-state';
import { Houseguest } from '../../models/houseguest';
import { BigBrotherGame } from '../../models/game/BigBrotherGame';
import { RelationshipSystem } from '../../systems/relationship/RelationshipSystem';
import { CompetitionSystem } from '../../systems/competition/CompetitionSystem';
import { AISystem } from '../../systems/ai/AISystem';
import { PromiseSystem } from '../../systems/promise/PromiseSystem';
import { RecapGenerator } from '../../systems/recap/RecapGenerator';
import { GameLogger } from '../../systems/logger/GameLogger';

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
  logger: GameLogger | null;
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
