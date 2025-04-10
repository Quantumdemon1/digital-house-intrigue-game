
import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { HouseguestStatus } from '../../../models/houseguest';

export function gameProgressReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      };
      
    case 'ADVANCE_WEEK':
      // Reset HoH and PoV statuses
      const resetHouseguests = state.houseguests.map(guest => ({
        ...guest,
        isHoH: false,
        isPovHolder: false,
        isNominated: false,
      }));
      
      return {
        ...state,
        week: state.week + 1,
        phase: 'HoH',
        hohWinner: null,
        povWinner: null,
        nominees: [],
        houseguests: resetHouseguests,
        evictionVotes: {},
      };
      
    case 'END_GAME': {
      const { winner, runnerUp } = action.payload;
      
      // Update statuses
      const finalHouseguests = state.houseguests.map(guest => {
        if (guest.id === winner.id) {
          return { ...guest, status: 'Winner' as HouseguestStatus };
        }
        if (guest.id === runnerUp.id) {
          return { ...guest, status: 'Runner-Up' as HouseguestStatus };
        }
        return guest;
      });
      
      return {
        ...state,
        phase: 'GameOver',
        houseguests: finalHouseguests,
        winner: { ...winner, status: 'Winner' as HouseguestStatus },
        runnerUp: { ...runnerUp, status: 'Runner-Up' as HouseguestStatus },
      };
    }
    
    default:
      return state;
  }
}
