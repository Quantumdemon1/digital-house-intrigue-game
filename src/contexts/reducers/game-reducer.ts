import { GameState, RelationshipMap } from '../../models/game-state';
import { setupReducer } from './reducers/setup-reducer';
import { competitionReducer } from './reducers/competition-reducer';
import { nominationReducer } from './reducers/nomination-reducer';
import { relationshipReducer } from './reducers/relationship-reducer';
import { evictionReducer } from './reducers/eviction-reducer';
import { gameProgressReducer } from './reducers/game-progress-reducer';
import { logReducer } from './reducers/log-reducer';
import { playerActionReducer } from './reducers/player-action-reducer';
import { GameAction } from '../types/game-context-types';
import { loadGameReducer } from './reducers/load-game-reducer';
import { PlayerPerception, CustomAlliance } from '../../models/player-perception';

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  console.log(`Game reducer: ${action.type}`, action.payload);
  
  switch (action.type) {
    // Game setup actions
    case 'START_GAME':
      return setupReducer(state, action);
      
    // Competition actions
    case 'SET_HOH':
    case 'SET_POV_WINNER':
      return competitionReducer(state, action);
      
    // Nomination actions
    case 'SET_NOMINEES':
      return nominationReducer(state, action);
      
    // Relationship actions
    case 'UPDATE_RELATIONSHIPS':
      return relationshipReducer(state, action);
      
    // Eviction actions
    case 'SET_EVICTION_VOTE':
    case 'EVICT_HOUSEGUEST':
      return evictionReducer(state, action);
      
    // Game progression actions
    case 'SET_PHASE':
    case 'ADVANCE_WEEK':
    case 'END_GAME':
      return gameProgressReducer(state, action);
      
    // Log actions
    case 'LOG_EVENT':
      return logReducer(state, action);
    
    // Player action handling
    case 'PLAYER_ACTION':
      return playerActionReducer(state, action);
    
    // Load game action
    case 'LOAD_GAME':
      return loadGameReducer(state, action.payload);
    
    // System actions (usually handled in the context provider)
    case 'INITIALIZE_GAME':
    case 'START_NEW_GAME_INSTANCE':
    case 'LOAD_GAME_INSTANCE':
    case 'SAVE_GAME_REQUEST':
    case 'LOAD_GAME_REQUEST':
    case 'TOGGLE_PAUSE':
    case 'FORCE_REFRESH':
    case 'SHOW_NARRATOR_MESSAGE':
    case 'SHOW_DIALOGUE':
      // These actions are typically handled in the GameContext provider
      // Just return state unchanged in the reducer
      return state;
      
    case 'RELATIONSHIP_IMPACT':
      // This doesn't actually modify the state, but is used by the RelationshipImpactProvider
      return state;
    
    // Player perception actions
    case 'UPDATE_PLAYER_PERCEPTION': {
      const { perception } = action.payload as { perception: PlayerPerception };
      const currentPerceptions = state.playerPerceptions || { perceptions: {}, customAlliances: [] };
      return {
        ...state,
        playerPerceptions: {
          ...currentPerceptions,
          perceptions: {
            ...currentPerceptions.perceptions,
            [perception.houseguestId]: perception
          }
        }
      };
    }
    
    case 'CREATE_CUSTOM_ALLIANCE':
    case 'UPDATE_CUSTOM_ALLIANCE': {
      const { alliance } = action.payload as { alliance: CustomAlliance };
      const currentPerceptions = state.playerPerceptions || { perceptions: {}, customAlliances: [] };
      const existingIndex = currentPerceptions.customAlliances.findIndex(a => a.id === alliance.id);
      
      const updatedAlliances = existingIndex >= 0
        ? currentPerceptions.customAlliances.map((a, i) => i === existingIndex ? alliance : a)
        : [...currentPerceptions.customAlliances, alliance];
      
      return {
        ...state,
        playerPerceptions: {
          ...currentPerceptions,
          customAlliances: updatedAlliances
        }
      };
    }
    
    case 'DELETE_CUSTOM_ALLIANCE': {
      const { allianceId } = action.payload as { allianceId: string };
      const currentPerceptions = state.playerPerceptions || { perceptions: {}, customAlliances: [] };
      return {
        ...state,
        playerPerceptions: {
          ...currentPerceptions,
          customAlliances: currentPerceptions.customAlliances.filter(a => a.id !== allianceId)
        }
      };
    }
      
    default:
      return state;
  }
};
