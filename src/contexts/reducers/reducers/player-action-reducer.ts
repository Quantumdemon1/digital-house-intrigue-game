
import { GameState, GamePhase } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { Promise, PromiseType } from '../../../models/promise';

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
          const activeCount = state.houseguests.filter(h => h.status === 'Active').length;
          
          // Check for final stages
          if (activeCount <= 2) {
            return {
              ...state,
              week: state.week + 1,
              phase: 'JuryQuestioning' as GamePhase,
              isFinalStage: true,
              nominees: [],
              evictionVotes: {}
            };
          }
          if (activeCount <= 3) {
            return {
              ...state,
              week: state.week + 1,
              phase: 'FinalHoH' as GamePhase,
              isFinalStage: true,
              nominees: [],
              evictionVotes: {}
            };
          }
          
          // Normal week advancement
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
      case 'advance_week': {
        const actionName = payload.actionId === 'eviction_complete' ? 'Eviction complete' : 'Advancing week';
        console.log(`${actionName}, checking houseguest count for final stages`);
        
        // Count active houseguests
        const activeCount = state.houseguests.filter(h => h.status === 'Active').length;
        console.log(`Active houseguests: ${activeCount}`);
        
        // If only 2 remain, go to Jury Questioning
        if (activeCount <= 2) {
          console.log('Only 2 houseguests remain - advancing to Jury Questioning');
          return {
            ...state,
            week: state.week + 1,
            phase: 'JuryQuestioning' as GamePhase,
            isFinalStage: true,
            nominees: [],
            evictionVotes: {}
          };
        }
        
        // If 3 remain, go to Final HoH
        if (activeCount <= 3) {
          console.log('3 houseguests remain - advancing to Final HoH');
          return {
            ...state,
            week: state.week + 1,
            phase: 'FinalHoH' as GamePhase,
            isFinalStage: true,
            nominees: [],
            evictionVotes: {}
          };
        }
        
        // Normal week advancement
        return {
          ...state,
          week: state.week + 1,
          phase: 'HoH' as GamePhase,
          nominees: [],
          evictionVotes: {}
        };
      }
        
      case 'make_promise':
        // Process a player-made promise
        if (payload.params.targetId && payload.params.promiseType) {
          // Create the promise object
          const newPromise: Promise = {
            id: `promise-${Date.now()}`,
            fromId: payload.params.voterId || state.houseguests.find(h => h.isPlayer)?.id || '',
            toId: payload.params.targetId,
            type: payload.params.promiseType as PromiseType,
            description: payload.params.promiseDescription || `Made a promise to ${payload.params.targetName}`,
            week: state.week,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            impactLevel: 'medium',
            context: {}
          };
          
          // Add to promises array
          const updatedPromises = state.promises ? [...state.promises, newPromise] : [newPromise];
          
          return {
            ...state,
            promises: updatedPromises
          };
        }
        break;
      
      case 'strategic_discussion':
      case 'relationship_building':
      case 'eavesdrop':
        // These are handled by the game state machine
        // No immediate state updates needed
        break;
        
      default:
        // No immediate state update needed
        break;
    }
  }
  
  // Return state unchanged if no specific handling
  return state;
}
