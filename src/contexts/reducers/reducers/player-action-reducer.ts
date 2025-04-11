import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export interface PlayerActionPayload {
  actionId: string;
  params: any;
}

export function playerActionReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'PLAYER_ACTION') {
    const payload = action.payload as PlayerActionPayload;
    
    // Log the player action for debugging
    console.log(`Player Action: ${payload.actionId}`, payload.params);
    
    // Handle specific player actions that need to be processed immediately
    // Note: Most of these will also be handled by the game state machine
    
    switch (payload.actionId) {
      case 'make_nominations':
        // This is typically handled in nomination-reducer, just for transparency
        console.log('Player nominated:', payload.params.nomineeIds);
        break;
        
      case 'cast_eviction_vote':
        if (payload.params.voterId && payload.params.nomineeId) {
          // Update the eviction votes record
          return {
            ...state,
            evictionVotes: {
              ...state.evictionVotes,
              [payload.params.voterId]: payload.params.nomineeId
            }
          };
        }
        break;
        
      case 'use_veto':
        console.log('Player decision on veto use:', payload.params.useVeto ? 'use' : 'not use');
        break;
        
      case 'select_replacement':
        console.log('Player selected replacement nominee:', payload.params.replacementId);
        break;
        
      case 'hoh_tiebreaker':
        if (payload.params.hohId && payload.params.nomineeId) {
          // Update the eviction votes record with the HoH's tiebreaker
          return {
            ...state,
            evictionVotes: {
              ...state.evictionVotes,
              [payload.params.hohId + '_tiebreaker']: payload.params.nomineeId
            }
          };
        }
        break;
        
      default:
        // No immediate state update needed
        break;
    }
  }
  
  // Return state unchanged if no specific handling
  return state;
}
