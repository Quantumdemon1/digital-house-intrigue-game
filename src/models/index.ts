
/**
 * @file src/models/index.ts
 * @description Exports all model components
 */

export * from './houseguest';
export * from './alliance';
export { BigBrotherGame } from './game/BigBrotherGame';
export * from './game-state'; // This includes GameEvent but not GameState (avoiding duplicate export)
export * from './game/types'; // Export new game types

