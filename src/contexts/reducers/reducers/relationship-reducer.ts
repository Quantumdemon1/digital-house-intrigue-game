
import { GameState, getOrCreateRelationship } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function relationshipReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'UPDATE_RELATIONSHIPS') {
    const { guestId1, guestId2, change, note } = action.payload;
    const newRelationships = new Map(state.relationships);
    
    // Update relationship from guest1 to guest2
    const rel1 = getOrCreateRelationship(newRelationships, guestId1, guestId2);
    rel1.score = Math.max(-100, Math.min(100, rel1.score + change));
    if (note) {
      rel1.notes.push(note);
    }
    
    // Update relationship from guest2 to guest1 (with a slight variation)
    const rel2 = getOrCreateRelationship(newRelationships, guestId2, guestId1);
    // The reciprocal relationship changes slightly differently
    const reciprocalChange = change * (0.8 + Math.random() * 0.4); // 80-120% of original change
    rel2.score = Math.max(-100, Math.min(100, rel2.score + reciprocalChange));
    if (note) {
      rel2.notes.push(note);
    }
    
    return {
      ...state,
      relationships: newRelationships,
    };
  }
  
  return state;
}
