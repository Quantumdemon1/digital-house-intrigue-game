
import { GameState, GamePhase } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function logReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'LOG_EVENT') {
    const { week, phase, type, description, involvedHouseguests } = action.payload;
    
    const newEvent = {
      week,
      phase, // GamePhase type is ensured in the GameAction type definition
      type,
      description,
      involvedHouseguests,
      timestamp: Date.now(),
    };
    
    return {
      ...state,
      gameLog: [...state.gameLog, newEvent],
    };
  }
  
  return state;
}
