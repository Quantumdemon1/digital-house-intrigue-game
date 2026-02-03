
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
            isHoH: false, // Also clear HoH status if they somehow had it
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
      
      // Clear nominees array to ensure evicted players are completely removed
      const updatedNominees = state.nominees.filter(nominee => nominee.id !== evicted.id);
      
      // Enable spectator mode if the player was evicted
      const isPlayerEvicted = evicted.isPlayer === true;
      
      return {
        ...state,
        houseguests: updatedHouseguestsAfterEviction,
        nominees: updatedNominees,
        juryMembers: updatedJury,
        evictionVotes: {}, // Clear votes after eviction
        isSpectatorMode: isPlayerEvicted ? true : state.isSpectatorMode,
      };
    }
    
    default:
      return state;
  }
}
