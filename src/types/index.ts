
/**
 * @file src/types/index.ts
 * @description Central export for all type definitions
 */

export * from './interfaces'; // Export facades

// Export system types
export type { RelationshipSystem } from '../systems/relationship-system';
export type { CompetitionSystem } from '../systems/competition-system';
export type { AIIntegrationSystem } from '../systems/ai-integration';
export type { GameRecapGenerator } from '../utils/recap';
export type { Logger } from '../utils/logger';

// Export model types
export type { Houseguest } from '../models/houseguest';
export type { Alliance } from '../models/alliance';
export type { BigBrotherGame, GameEvent } from '../models/BigBrotherGame';
export type { GamePhase } from '../models/game-state';
