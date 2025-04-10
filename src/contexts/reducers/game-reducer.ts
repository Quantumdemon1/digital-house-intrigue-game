
import { GameState } from '../../models/game-state';
import { GameAction } from '../types/game-context-types';
import { setupReducer } from './reducers/setup-reducer';
import { competitionReducer } from './reducers/competition-reducer';
import { nominationReducer } from './reducers/nomination-reducer';
import { relationshipReducer } from './reducers/relationship-reducer';
import { evictionReducer } from './reducers/eviction-reducer';
import { gameProgressReducer } from './reducers/game-progress-reducer';
import { logReducer } from './reducers/log-reducer';

// Game reducer function that delegates to specific reducers based on action type
export function gameReducer(state: GameState, action: GameAction): GameState {
  // Log all actions for debugging
  console.log('Game Reducer:', action.type, action.type === 'ADVANCE_WEEK' ? 'no payload' : action.payload);
  
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
      
    default:
      return state;
  }
}
