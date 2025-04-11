
/**
 * @file src/models/index.ts
 * @description Exports all model components
 */

export * from './houseguest';
export * from './alliance';
export { BigBrotherGame } from './game/BigBrotherGame';
export { GameEvent } from './game-state'; 
export type { 
  GamePhase,
  RelationshipMap
} from './game-state'; // Export specific types with 'export type'
export { 
  getOrCreateRelationship,
  createInitialGameState
} from './game-state'; // Export functions normally
export * from './game/types'; // This includes GameState from types.ts
