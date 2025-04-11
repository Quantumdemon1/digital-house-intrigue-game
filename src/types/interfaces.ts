
import type { Logger } from "../utils/logger";
import type { AIIntegrationSystem } from "../systems/ai/ai-integration-system";
import type { RelationshipSystem } from "../systems/relationship-system";
import type { BigBrotherGame } from "../models/BigBrotherGame";
import type { AllianceSystem } from "../systems/alliance-system";

/**
 * Interface for the game controller facade
 * This provides access to key game systems and controllers
 */
export interface IGameControllerFacade {
  logger: Logger;
  relationshipSystem: RelationshipSystem;
  aiSystem?: AIIntegrationSystem;
  allianceSystem?: AllianceSystem;
  gameState: BigBrotherGame;
  promptNextAction: () => void;
  saveGame: () => void;
  loadGame: () => void;
  openAllianceProposalUI: () => void;
}
