
/**
 * @file src/contexts/reducers/reducers/load-game-reducer.ts
 * @description Reducer for loading saved games
 */

import { GameState } from '../../../models/game-state';

// Action type
export const LOAD_GAME = 'LOAD_GAME';

/**
 * Reducer for loading a saved game
 * Simply replaces the entire state with the loaded game state
 */
export const loadGameReducer = (state: GameState, payload: GameState): GameState => {
  return payload;
};
