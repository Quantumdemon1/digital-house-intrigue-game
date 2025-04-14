import { GameState, RelationshipMap } from '../../models/game-state';

// Add the new RELATIONSHIP_IMPACT action to the union type
type GameAction =
  // ... keep existing code (action types)
  | { type: 'RELATIONSHIP_IMPACT'; payload: { targetId: string; targetName: string; value: number } };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
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
