
/**
 * @file src/systems/relationship/core.ts
 * @description Core relationship management functionality
 */

import { Relationship, RelationshipMap } from './types';
import { config } from '../../config';

/**
 * Core relationship management functions
 */
export class RelationshipCore {
  private relationships: RelationshipMap = new Map();
  private logger: any;
  private currentWeek: number = 1;

  constructor(logger: any) {
    this.logger = logger;
  }
  
  // Update the current week
  setCurrentWeek(week: number): void {
    this.currentWeek = week;
  }

  // Get or create the map for a specific houseguest
  getOrCreateGuestMap(guestId: string): Map<string, Relationship> {
    let guestMap = this.relationships.get(guestId);
    if (!guestMap) {
      guestMap = new Map<string, Relationship>();
      this.relationships.set(guestId, guestMap);
    }
    return guestMap;
  }

  // Get or create a relationship between two houseguests
  getOrCreateRelationship(guestId1: string, guestId2: string): Relationship {
    // Get or create the map for guest1
    const guest1Map = this.getOrCreateGuestMap(guestId1);
    
    // Get or create the relationship
    let relationship = guest1Map.get(guestId2);
    if (!relationship) {
      relationship = { 
        score: 0, 
        alliance: null, 
        notes: [],
        events: [],
        lastInteractionWeek: this.currentWeek
      };
      guest1Map.set(guestId2, relationship);
    }
    
    return relationship;
  }

  // Get the relationship score between two houseguests
  getRelationship(guestId1: string, guestId2: string): number {
    const guest1Map = this.relationships.get(guestId1);
    if (!guest1Map) return 0;
    
    const relationship = guest1Map.get(guestId2);
    return relationship ? relationship.score : 0;
  }

  // Set the relationship score between two houseguests
  setRelationship(guestId1: string, guestId2: string, score: number, note?: string): void {
    const relationship = this.getOrCreateRelationship(guestId1, guestId2);
    relationship.score = Math.max(config.RELATIONSHIP_MIN, Math.min(config.RELATIONSHIP_MAX, score)); // Clamp between -100 and 100
    
    if (note) {
      relationship.notes.push(note);
    }
    
    // Update last interaction week
    relationship.lastInteractionWeek = this.currentWeek;
  }

  // Update the relationship score between two houseguests
  updateRelationship(guestId1: string, guestId2: string, change: number, note?: string): void {
    const currentScore = this.getRelationship(guestId1, guestId2);
    this.setRelationship(guestId1, guestId2, currentScore + change, note);
    
    this.logger.debug(`Updated relationship: ${guestId1} -> ${guestId2} by ${change} to ${currentScore + change}`);
  }

  // Get all relationships
  getAllRelationships(): RelationshipMap {
    return this.relationships;
  }

  // Set all relationships
  setRelationships(relationships: RelationshipMap): void {
    this.relationships = relationships;
  }
}
