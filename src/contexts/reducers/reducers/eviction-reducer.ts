
import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { HouseguestStatus } from '../../../models/houseguest';

export function evictionReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_EVICTION_VOTE':
      // Add or update a vote in the eviction votes record
      return {
        ...state,
        evictionVotes: {
          ...state.evictionVotes,
          [action.payload.voterId]: action.payload.nomineeId
        }
      };
      
    case 'EVICT_HOUSEGUEST': {
      const { evicted, toJury } = action.payload;
      
      // Update the houseguest's status
      const updatedHouseguestsAfterEviction = state.houseguests.map(guest => {
        if (guest.id === evicted.id) {
          return {
            ...guest,
            status: toJury ? 'Jury' as HouseguestStatus : 'Evicted' as HouseguestStatus,
            isNominated: false,
            isPovHolder: false, // Clear POV status when evicted
          };
        }
        // Clear nomination status for everyone else too
        if (guest.isNominated) {
          return { ...guest, isNominated: false };
        }
        return guest;
      });
      
      // Update jury if needed
      const updatedJury = toJury 
        ? [...state.juryMembers, { ...evicted, status: 'Jury' as HouseguestStatus }]
        : state.juryMembers;
      
      return {
        ...state,
        houseguests: updatedHouseguestsAfterEviction,
        nominees: [],
        juryMembers: updatedJury,
        evictionVotes: {},
      };
    }
    
    default:
      return state;
  }
}
