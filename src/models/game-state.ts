
/**
 * @file src/models/game-state.ts
 * @description Game state types and interfaces
 */

// Game phases
export type GamePhase = 
  | 'Initialization' 
  | 'HOH Competition' 
  | 'Nomination' 
  | 'POV Competition' 
  | 'POV Meeting' 
  | 'Eviction'
  | 'Finale';

// Import and re-export GameEvent from BigBrotherGame
export { GameEvent } from './BigBrotherGame';
