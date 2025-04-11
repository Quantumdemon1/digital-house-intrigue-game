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
      case 'fast_forward':
        // Fast forward is handled by the game state machine
        // Just log it here for debugging
        console.log('Fast forwarding from phase:', payload.params.currentPhase);
        
        // For immediate UI feedback while the state machine processes
        // Always advance to the next phase
        if (payload.params.currentPhase === 'Nomination') {
          return {
            ...state,
            phase: 'PoV' as GamePhase  // Immediately update UI phase
          };
        }
        
        if (payload.params.currentPhase === 'Eviction') {
          console.log("Fast forwarding from Eviction - advancing week");
          // For eviction phase, we advance the week and go to HoH
          return {
            ...state,
            week: state.week + 1,
            phase: 'HoH' as GamePhase,
            nominees: [],
            evictionVotes: {}
          };
        }
        break;
        
      case 'continue_to_pov':
        // For immediate UI feedback while the state machine processes
        console.log('Continue to PoV - updating UI phase');
        return {
          ...state,
          phase: 'PoV' as GamePhase  // Immediately update UI phase
        };
        
      case 'make_nominations':
        // This is typically handled in nomination-reducer, just for transparency
        console.log('Player nominated:', payload.params.nomineeIds);
        break;
        
      case 'cast_vote':
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
        
      case 'evict_houseguest':
        console.log('Processing eviction for:', payload.params.evictedId);
        break;
        
      case 'eviction_complete':
        console.log('Eviction complete, advancing to next phase');
        // For immediate UI feedback while the state machine processes
        return {
          ...state,
          week: state.week + 1,
          phase: 'HoH' as GamePhase,
          nominees: [],
          evictionVotes: {}
        };
        
      case 'advance_week':
        console.log('Advancing week to', state.week + 1);
        // For immediate UI feedback while the state machine processes
        return {
          ...state,
          week: state.week + 1,
          phase: 'HoH' as GamePhase,
          nominees: [],
          evictionVotes: {}
        };
        
      default:
        // No immediate state update needed
        break;
    }
  }
  
  // Return state unchanged if no specific handling
  return state;
}
