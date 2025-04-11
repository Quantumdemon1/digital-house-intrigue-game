
import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export interface NominationCount {
  times: number;
  receivedOn: number[];
}

export function nominationReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'SET_NOMINEES') {
    // Update the nominated status of all houseguests
    const houseguestsWithNominations = state.houseguests.map(guest => {
      const isNominated = action.payload.some(nominee => nominee.id === guest.id);
      
      // Create a proper nominations object if it doesn't exist yet
      if (!guest.nominations || typeof guest.nominations !== 'object') {
        guest.nominations = { times: 0, receivedOn: [] };
      }
      
      // Update nomination count if this houseguest is nominated
      if (isNominated) {
        return {
          ...guest,
          isNominated,
          nominations: {
            times: guest.nominations.times + 1,
            receivedOn: [...guest.nominations.receivedOn, state.week]
          }
        };
      }
      
      return { ...guest, isNominated };
    });
    
    return {
      ...state,
      nominees: action.payload,
      houseguests: houseguestsWithNominations,
    };
  }
  
  return state;
}
