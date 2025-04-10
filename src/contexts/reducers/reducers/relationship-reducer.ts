
import { GameState, getOrCreateRelationship } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';

export function relationshipReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'UPDATE_RELATIONSHIPS') {
    const { guestId1, guestId2, change, note } = action.payload;
    const newRelationships = new Map(state.relationships);
    
    // Get the houseguests from state
    const guest1 = state.houseguests.find(guest => guest.id === guestId1);
    const guest2 = state.houseguests.find(guest => guest.id === guestId2);
    
    if (!guest1 || !guest2) {
      console.error('Could not find houseguests with IDs:', guestId1, guestId2);
      return state;
    }
    
    // Calculate base relationship change
    let actualChange = change;
    
    // Apply social stat influence for player-initiated interactions
    // This is now primarily handled in the EvictionInteractionDialog component
    // but we keep this minimal adjustment for other relationship updates
    if (guest1.isPlayer && change > 0) {
      // For positive changes, player's social stat can enhance the effect
      const socialBonus = Math.max(0, guest1.stats.social - 5) * 0.1; // 10% bonus per point over 5
      actualChange = Math.round(change * (1 + socialBonus));
    }
    
    console.log(`Relationship update: ${guest1.name} -> ${guest2.name}, change: ${actualChange}`);
    
    // Update relationship from guest1 to guest2
    const rel1 = getOrCreateRelationship(newRelationships, guestId1, guestId2);
    rel1.score = Math.max(-100, Math.min(100, rel1.score + actualChange));
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
