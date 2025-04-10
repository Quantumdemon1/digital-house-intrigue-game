
import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function nominationReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'SET_NOMINEES') {
    // Update the nominated status of all houseguests
    const houseguestsWithNominations = state.houseguests.map(guest => ({
      ...guest,
      isNominated: action.payload.some(nominee => nominee.id === guest.id),
      nominations: action.payload.some(nominee => nominee.id === guest.id) 
        ? guest.nominations + 1 
        : guest.nominations
    }));
    
    return {
      ...state,
      nominees: action.payload,
      houseguests: houseguestsWithNominations,
    };
  }
  
  return state;
}
