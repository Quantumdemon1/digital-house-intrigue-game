
import { GameState } from '../../../models/game-state';

export const loadGameReducer = (state: GameState, loadedGameState: GameState): GameState => {
  // Return the loaded game state directly
  return loadedGameState;
};
