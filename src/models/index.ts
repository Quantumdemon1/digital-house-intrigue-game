
/**
 * @file src/models/index.ts
 * @description Exports all model components
 */

export * from './houseguest';
export * from './alliance';
export { BigBrotherGame } from './game/BigBrotherGame';
export { 
  GameEvent, 
  GamePhase,
  getOrCreateRelationship,
  createInitialGameState,
  RelationshipMap
} from './game-state'; // Export specific types but not GameState 
export * from './game/types'; // This includes GameState from types.ts

