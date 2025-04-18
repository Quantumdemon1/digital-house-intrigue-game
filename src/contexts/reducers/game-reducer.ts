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
      
    default:
      return state;
  }
};
