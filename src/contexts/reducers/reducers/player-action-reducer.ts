import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function playerActionReducer(state: GameState, action: GameAction): GameState {
  if (action.type !== 'PLAYER_ACTION') return state;
  
  // Log all player actions for debugging
  console.log("Player Action:", action.payload.actionId, action.payload.params);
  
  // Player actions handled by the game state system
  // We don't modify state here, but we do pass through specific actions
  // that require immediate UI updates
  
  const { actionId, params } = action.payload;
  
  switch (actionId) {
    case 'make_nominations':
      if (params && params.nomineeIds && Array.isArray(params.nomineeIds)) {
        console.log("Player nominated:", params.nomineeIds);
        
        // Find the nominee objects for the IDs
        const nomineeObjects = params.nomineeIds.map(
          id => state.houseguests.find(h => h.id === id)
        ).filter(Boolean);
        
        // Update nominees immediately in the UI
        if (nomineeObjects.length === 2) {
          return {
            ...state,
            nominees: nomineeObjects,
          };
        }
      }
      break;
      
    case 'continue_to_pov':
      // For immediate UI feedback, set phase to PoV
      // The actual state transition is handled by the game state system
      return {
        ...state,
        phase: 'PoV'
      };
      
    // Handle other player actions as needed
  }
  
  return state;
}
