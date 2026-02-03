
import { GameState, GamePhase } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { HouseguestStatus } from '../../../models/houseguest';

/**
 * Big Brother USA Weekly Cycle Order:
 * 1. HoH Competition
 * 2. Nomination Ceremony
 * 3. PoV Player Selection
 * 4. PoV Competition  
 * 5. PoV Meeting (Veto Ceremony)
 * 6. Eviction
 * 7. Social Interaction (between weeks)
 * 8. Next Week's HoH Competition
 */

export function gameProgressReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      // Count active houseguests
      const activeHouseguestsCount = state.houseguests.filter(h => h.status === 'Active').length;
      
      // Normalize the phase name to handle different casing/formats
      const normalizedPhase = normalizePhase(action.payload as string);
      
      // Override: If only 2 houseguests remain and we're not already at finale phases, go to Jury Questioning
      const finalePhases = ['juryquestioning', 'finale', 'gameover'];
      if (activeHouseguestsCount <= 2 && !finalePhases.includes(normalizedPhase)) {
        console.log(`SET_PHASE override: Only ${activeHouseguestsCount} houseguests, redirecting to JuryQuestioning`);
        return {
          ...state,
          phase: 'JuryQuestioning' as GamePhase,
          isFinalStage: true
        };
      }
      
      // Override: If 3 houseguests and trying to enter normal weekly phases, go to FinalHoH
      const weeklyPhases = ['hoh', 'nomination', 'pov', 'povmeeting', 'povplayerselection', 'eviction'];
      if (activeHouseguestsCount === 3 && !state.isFinalStage && weeklyPhases.includes(normalizedPhase)) {
        console.log(`SET_PHASE override: 3 houseguests in weekly phase, redirecting to FinalHoH`);
        return {
          ...state,
          phase: 'FinalHoH' as GamePhase,
          isFinalStage: true
        };
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
      
      // BB USA Format: Social Interaction happens AFTER Eviction, before next HoH
      // This is the "between weeks" period
      if (normalizedPhase === 'socialinteraction') {
        return {
          ...state,
          phase: 'SocialInteraction' as GamePhase,
        };
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
