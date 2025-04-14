
import { GameState, GamePhase } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function logReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'LOG_EVENT') {
    const { week, phase, type, description, involvedHouseguests, metadata } = action.payload;
    
    const newEvent = {
      week,
      phase: phase as GamePhase, // Explicitly cast phase to GamePhase
      type,
      description,
      involvedHouseguests,
      timestamp: Date.now(),
      data: metadata // Use metadata field from payload and store it as data
    };
    
    return {
      ...state,
      gameLog: [...state.gameLog, newEvent],
    };
  }
  
  return state;
}
