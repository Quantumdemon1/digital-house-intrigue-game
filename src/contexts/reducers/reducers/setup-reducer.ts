
import { GameState } from '../../types/game-context-types';
import { GameAction } from '../../types/game-context-types';
import { getOrCreateRelationship } from '../../../models/game-state';

export function setupReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'START_GAME') {
    // Destructure the action payload
    const houseguests = action.payload;
    
    // Initialize new relationships
    const relationships = new Map();
    for (let i = 0; i < houseguests.length; i++) {
      for (let j = 0; j < houseguests.length; j++) {
        if (i !== j) { // Don't create relationship with self
          const guest1 = houseguests[i];
          const guest2 = houseguests[j];
          
          // Initialize with random value between -20 and 20
          const initialScore = Math.floor(Math.random() * 41) - 20;
          const rel = getOrCreateRelationship(relationships, guest1.id, guest2.id);
          rel.score = initialScore;
        }
      }
    }
    
    // Update the state with initialized values
    return {
      ...state,
      houseguests: action.payload,
      relationships,
      phase: 'HoH',
      week: 1,
      gameLog: [
        {
          week: 1,
          phase: 'Setup',
          type: 'GAME_START',
          description: `The game has begun with ${houseguests.length} houseguests!`,
          involvedHouseguests: houseguests.map(h => h.id),
          timestamp: Date.now()
        }
      ]
    };
  }
  
  return state;
}
