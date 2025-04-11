
import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export interface NominationCount {
  times: number;
  receivedOn: number[];
}

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
    
    // Update nomination count in houseguest stats
    houseguestsWithNominations.forEach(houseguest => {
      if (action.payload.some(nominee => nominee.id === houseguest.id)) {
        updateNominationCount(houseguest, state.week);
      }
    });
    
    return {
      ...state,
      nominees: action.payload,
      houseguests: houseguestsWithNominations,
    };
  }
  
  return state;
}

// Update the nomination count in the houseguest stats
const updateNominationCount = (houseguest: any, week: number): void => {
  // Initialize nomination stats if not present
  if (!houseguest.stats.nominations) {
    houseguest.stats.nominations = { times: 0, receivedOn: [] };
  }
  
  // Increment nomination count and track the week
  houseguest.stats.nominations.times += 1;
  houseguest.stats.nominations.receivedOn.push(week);
};
