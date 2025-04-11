
import type { Logger } from "../utils/logger";
import type { AIIntegrationSystem } from "../systems/ai/ai-integration-system";
import type { RelationshipSystem } from "../systems/relationship-system";
import type { BigBrotherGame } from "../models/game/BigBrotherGame";
import type { AllianceSystem } from "../systems/alliance-system";
import type { GameState } from "../models/game-state";
import type { Houseguest } from "../models/houseguest";
import type { GameStateBase } from "../game-states/GameStateBase";

/**
 * Interface for the game controller facade
 * This provides access to key game systems and controllers
 */
export interface IGameControllerFacade {
  logger: Logger;
  relationshipSystem: RelationshipSystem;
  aiSystem?: AIIntegrationSystem;
  allianceSystem?: AllianceSystem;
  gameState: GameState;
  currentLocation: string;
  currentState?: GameStateBase;
  game: BigBrotherGame;
  
  // Game state getters
  week: number;
  phase: string;
  houseguests: Houseguest[];
  hohWinner: Houseguest | null;
  povWinner: Houseguest | null;
  nominees: Houseguest[];
  gameLog: any[];
  
  // Methods
  promptNextAction: () => void;
  saveGame: () => void;
  loadGame: () => void;
  openAllianceProposalUI: () => void;
  getActiveHouseguests: () => Houseguest[];
  getHouseguestById: (id: string) => Houseguest | undefined;
  transitionTo: (state: typeof GameStateBase) => Promise<void>;
  changeState: (stateName: string) => void;
  getGameSettings: () => { finalWeek: number };
}

// Export GameEvent type from game-state.ts
export type { GameEvent } from "../models/game-state";
