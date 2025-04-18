
/**
 * @file src/types/index.ts
 * @description Central export for all type definitions
 */

export * from './interfaces'; // Export facades

// Export system types
export type { RelationshipSystem } from '../systems/relationship-system';
export type { CompetitionSystem } from '../systems/competition-system';
export type { AIIntegrationSystem } from '../systems/ai-integration';
export { PromiseSystem } from '../systems/promise/index'; // Updated export path
export type { GameRecapGenerator } from '../utils/recap/recap-generator';
export type { Logger } from '../utils/logger';

// Export model types
export type { Houseguest } from '../models/houseguest';
export type { Alliance } from '../models/alliance';
export type { BigBrotherGame } from '../models/game/BigBrotherGame';
export type { GameEvent, GamePhase } from '../models/game-state';

// Export context types - use the re-exported GameState from game-context-types
export type { GameAction, GameContextType, GameState } from '../contexts/types/game-context-types';
