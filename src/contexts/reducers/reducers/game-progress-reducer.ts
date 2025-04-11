
import { GameState, GamePhase } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { HouseguestStatus } from '../../../models/houseguest';

export function gameProgressReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      // Handle the special case for final 3
      if (action.payload === 'PoV' && state.houseguests.filter(h => h.status === 'Active').length <= 3) {
        // Skip PoV at final 3 and go straight to finale
        return {
          ...state,
          phase: 'Finale' as GamePhase,
        };
      }
      return {
        ...state,
        phase: action.payload as GamePhase,
      };
      
    case 'ADVANCE_WEEK':
      // Reset HoH and PoV statuses
      const resetHouseguests = state.houseguests.map(guest => ({
        ...guest,
        isHoH: false,
        isPovHolder: false,
        isNominated: false,
      }));
      
      // Check if we're at final 3 - if so, skip to finale
      const activeHouseguests = resetHouseguests.filter(h => h.status === 'Active').length;
      const nextPhase = activeHouseguests <= 3 ? ('Finale' as GamePhase) : ('HoH' as GamePhase);
      
      return {
        ...state,
        week: state.week + 1,
        phase: nextPhase,
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
        phase: 'GameOver' as GamePhase,
        houseguests: finalHouseguests,
        winner: { ...winner, status: 'Winner' as HouseguestStatus },
        runnerUp: { ...runnerUp, status: 'Runner-Up' as HouseguestStatus },
      };
    }
    
    default:
      return state;
  }
}
