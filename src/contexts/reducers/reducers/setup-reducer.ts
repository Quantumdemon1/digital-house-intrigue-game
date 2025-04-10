
import { GameState, getOrCreateRelationship } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function setupReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'START_GAME') {
    // Initialize relationship map for all houseguests
    const relationships = new Map();
    
    action.payload.forEach(guest1 => {
      action.payload.forEach(guest2 => {
        if (guest1.id !== guest2.id) {
          getOrCreateRelationship(relationships, guest1.id, guest2.id);
        }
      });
    });
    
    return {
      ...state,
      houseguests: action.payload,
      phase: 'HoH',
      relationships,
    };
  }
  
  return state;
}
