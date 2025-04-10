
import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function logReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'LOG_EVENT') {
    const newEvent = {
      ...action.payload,
      timestamp: Date.now(),
    };
    
    return {
      ...state,
      gameLog: [...state.gameLog, newEvent],
    };
  }
  
  return state;
}
