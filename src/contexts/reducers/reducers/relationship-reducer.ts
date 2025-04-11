
import { GameState, getOrCreateRelationship } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { RelationshipEventType } from '../../../models/relationship-event';
import { config } from '../../../config';

export function relationshipReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'UPDATE_RELATIONSHIPS') {
    const { guestId1, guestId2, change, note, eventType } = (action.payload as { 
      guestId1: string; 
      guestId2: string; 
      change: number; 
      note?: string;
      eventType?: RelationshipEventType;
    });
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
    
    // Get or create relationships
    const rel1 = getOrCreateRelationship(newRelationships, guestId1, guestId2);
    const rel2 = getOrCreateRelationship(newRelationships, guestId2, guestId1);

    // If we have a specific event type, add it as a relationship event
    if (eventType) {
      // Create the event for the first relationship
      const event1 = {
        timestamp: Date.now(),
        type: eventType as RelationshipEventType,
        description: note || `Relationship changed by ${actualChange}`,
        impactScore: actualChange,
        decayable: true
      };
      
      if (!Array.isArray(rel1.events)) {
        rel1.events = [];
      }
      rel1.events.push(event1);
      
      // The reciprocal relationship changes slightly differently
      const reciprocalChange = change * (0.8 + Math.random() * 0.4); // 80-120% of original change
      
      // Create the event for the second relationship
      const event2 = {
        timestamp: Date.now(),
        type: eventType as RelationshipEventType,
        description: note || `Relationship changed by ${reciprocalChange.toFixed(1)}`,
        impactScore: reciprocalChange,
        decayable: true
      };
      
      if (!Array.isArray(rel2.events)) {
        rel2.events = [];
      }
      rel2.events.push(event2);
    }
    
    // Update relationship scores
    rel1.score = Math.max(config.RELATIONSHIP_MIN, Math.min(config.RELATIONSHIP_MAX, rel1.score + actualChange));
    if (note) {
      rel1.notes.push(note);
    }
    rel1.lastInteractionWeek = state.week;
    
    // Update relationship from guest2 to guest1 (with a slight variation)
    const reciprocalChange = change * (0.8 + Math.random() * 0.4); // 80-120% of original change
    rel2.score = Math.max(config.RELATIONSHIP_MIN, Math.min(config.RELATIONSHIP_MAX, rel2.score + reciprocalChange));
    if (note) {
      rel2.notes.push(note);
    }
    rel2.lastInteractionWeek = state.week;
    
    return {
      ...state,
      relationships: newRelationships,
    };
  }
  
  // Handle week changes for relationship decay
  if (action.type === 'ADVANCE_WEEK') {
    const newWeek = state.week + 1; // Since ADVANCE_WEEK doesn't have payload, we increment from current week
    const newRelationships = new Map(state.relationships);
    
    // Apply relationship decay if enabled
    if (config.RELATIONSHIP_DECAY_RATE > 0) {
      newRelationships.forEach((guestRelationships, guestId1) => {
        guestRelationships.forEach((relationship, guestId2) => {
          // Only decay if there hasn't been an interaction this week
          if (relationship.lastInteractionWeek < newWeek) {
            const weeksWithoutInteraction = newWeek - relationship.lastInteractionWeek;
            
            // Apply decay to the overall score
            if (relationship.score !== 0) {
              const decayAmount = relationship.score * config.RELATIONSHIP_DECAY_RATE * weeksWithoutInteraction;
              relationship.score -= decayAmount;
              
              // Move toward 0 (neutral)
              if ((relationship.score > 0 && relationship.score - decayAmount < 0) ||
                  (relationship.score < 0 && relationship.score - decayAmount > 0)) {
                relationship.score = 0;
              }
            }
            
            // Also apply decay to individual event impacts if they're decayable
            if (Array.isArray(relationship.events)) {
              relationship.events.forEach(event => {
                if (event.decayable) {
                  const eventAgeInWeeks = (newWeek - Math.floor(event.timestamp / 604800000));
                  if (eventAgeInWeeks > config.MEMORY_RETENTION_WEEKS) {
                    const decayRate = event.decayRate || config.RELATIONSHIP_DECAY_RATE;
                    const decayFactor = Math.pow(1 - decayRate, eventAgeInWeeks - config.MEMORY_RETENTION_WEEKS);
                    event.impactScore *= decayFactor;
                  }
                }
              });
            }
          }
        });
      });
    }
    
    return {
      ...state,
      week: newWeek,
      relationships: newRelationships
    };
  }
  
  return state;
}
