
import { GameState, GamePhase } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { HouseguestStatus } from '../../../models/houseguest';

export function gameProgressReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      // Count active houseguests
      const activeHouseguestsCount = state.houseguests.filter(h => h.status === 'Active').length;
      
      // Normalize the phase name to handle different casing/formats
      const normalizedPhase = normalizePhase(action.payload as string);
      
      // Handle the special cases for final 3
      if (activeHouseguestsCount <= 3 && !state.isFinalStage) {
        // When reaching final 3, transition to final stage
        if (normalizedPhase === 'pov') {
          return {
            ...state,
            phase: 'FinalHoH' as GamePhase,
            isFinalStage: true
          };
        }
        
        if (normalizedPhase === 'povmeeting') {
          // Skip PoV Meeting at final 3 and go straight to special Final HoH
          return {
            ...state,
            phase: 'FinalHoH' as GamePhase,
            isFinalStage: true
          };
        }
      }
      
      // If we're already in the final stages, manage the proper flow
      if (state.isFinalStage) {
        if (normalizedPhase === 'finalhoh' || normalizedPhase === 'finalhohpart1') {
          return {
            ...state,
            phase: 'Final HOH Part1' as GamePhase,
          };
        } else if (normalizedPhase === 'finalhohpart2') {
          return {
            ...state,
            phase: 'Final HOH Part2' as GamePhase,
          };
        } else if (normalizedPhase === 'finalhohpart3') {
          return {
            ...state,
            phase: 'Final HOH Part3' as GamePhase,
          };
        } else if (normalizedPhase === 'juryquestioning') {
          return {
            ...state,
            phase: 'Jury Questioning' as GamePhase,
          };
        } else if (normalizedPhase === 'finale') {
          return {
            ...state,
            phase: 'Finale' as GamePhase,
          };
        }
      }
      
      // For regular phases, directly set the phase as provided
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
      
      // Check if we're at final 3 - if so, transition to final stage
      const activeHouseguests = resetHouseguests.filter(h => h.status === 'Active').length;
      let nextPhase: GamePhase = 'HoH';
      let isFinalStage = state.isFinalStage;
      
      if (activeHouseguests <= 3 && !state.isFinalStage) {
        nextPhase = 'FinalHoH';
        isFinalStage = true;
      }
      
      return {
        ...state,
        week: state.week + 1,
        phase: nextPhase,
        hohWinner: null,
        povWinner: null,
        povPlayers: [], // Reset PoV players
        nominees: [],
        houseguests: resetHouseguests,
        evictionVotes: {},
        isFinalStage
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

// Helper function to normalize phase names for consistent comparison
function normalizePhase(phase: string): string {
  // Remove spaces, convert to lowercase, and remove any special characters
  return phase.toLowerCase().replace(/[\s-_]/g, '');
}
