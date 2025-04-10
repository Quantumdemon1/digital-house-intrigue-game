
import { GameState } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function competitionReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_HOH': {
      // Reset previous HoH
      const updatedHouseguests = state.houseguests.map(guest => ({
        ...guest,
        isHoH: guest.id === action.payload.id
      }));
      
      // Update the HoH's competition stats
      const newHohWinner = { 
        ...action.payload,
        isHoH: true,
        competitionsWon: {
          ...action.payload.competitionsWon,
          hoh: action.payload.competitionsWon.hoh + 1
        }
      };
      
      return {
        ...state,
        hohWinner: newHohWinner,
        houseguests: updatedHouseguests.map(h => 
          h.id === newHohWinner.id ? newHohWinner : h
        ),
      };
    }
    
    case 'SET_POV_WINNER': {
      // Reset previous PoV holder
      const updatedHouseguestsForPov = state.houseguests.map(guest => ({
        ...guest,
        isPovHolder: guest.id === action.payload.id
      }));
      
      // Update the PoV winner's competition stats
      const newPovWinner = { 
        ...action.payload, 
        isPovHolder: true,
        competitionsWon: {
          ...action.payload.competitionsWon,
          pov: action.payload.competitionsWon.pov + 1
        }
      };
      
      return {
        ...state,
        povWinner: newPovWinner,
        houseguests: updatedHouseguestsForPov.map(h => 
          h.id === newPovWinner.id ? newPovWinner : h
        ),
      };
    }
    
    default:
      return state;
  }
}
