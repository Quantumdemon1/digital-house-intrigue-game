
import { Houseguest } from '../models/houseguest';

export interface Relationship {
  score: number;        // -100 to 100 scale
  alliance: string | null; // alliance ID if they're in an alliance together
  notes: string[];      // Important events that affected relationship
}

export type RelationshipMap = Map<string, Map<string, Relationship>>;

export class RelationshipSystem {
  private relationships: RelationshipMap = new Map();
  private logger: any;

  constructor(logger: any) {
    this.logger = logger;
  }

  initializeRelationships(houseguests: Houseguest[]): void {
    this.logger.info('Initializing relationship matrix for all houseguests');
    
    // Create relationships between all houseguests
    houseguests.forEach(guest1 => {
      houseguests.forEach(guest2 => {
        if (guest1.id !== guest2.id) {
          // Initialize with a slightly random starting value
          const baseScore = Math.floor(Math.random() * 20) - 5; // -5 to 15 range
          this.setRelationship(guest1.id, guest2.id, baseScore);
        }
      });
    });
  }

  getOrCreateRelationship(guestId1: string, guestId2: string): Relationship {
    // Get or create the map for guest1
    let guest1Map = this.relationships.get(guestId1);
    if (!guest1Map) {
      guest1Map = new Map<string, Relationship>();
      this.relationships.set(guestId1, guest1Map);
    }
    
    // Get or create the relationship
    let relationship = guest1Map.get(guestId2);
    if (!relationship) {
      relationship = { score: 0, alliance: null, notes: [] };
      guest1Map.set(guestId2, relationship);
    }
    
    return relationship;
  }

  getRelationship(guestId1: string, guestId2: string): number {
    const guest1Map = this.relationships.get(guestId1);
    if (!guest1Map) return 0;
    
    const relationship = guest1Map.get(guestId2);
    return relationship ? relationship.score : 0;
  }

  setRelationship(guestId1: string, guestId2: string, score: number, note?: string): void {
    const relationship = this.getOrCreateRelationship(guestId1, guestId2);
    relationship.score = Math.max(-100, Math.min(100, score)); // Clamp between -100 and 100
    
    if (note) {
      relationship.notes.push(note);
    }
  }

  updateRelationship(guestId1: string, guestId2: string, change: number, note?: string): void {
    const currentScore = this.getRelationship(guestId1, guestId2);
    this.setRelationship(guestId1, guestId2, currentScore + change, note);
    
    this.logger.debug(`Updated relationship: ${guestId1} -> ${guestId2} by ${change} to ${currentScore + change}`);
  }

  updateRelationships(guest1: Houseguest, guest2: Houseguest, change: number, note?: string): void {
    // Calculate base relationship change
    let actualChange = change;
    
    // Apply social stat influence for player-initiated interactions
    if (guest1.isPlayer && change > 0) {
      // For positive changes, player's social stat can enhance the effect
      const socialBonus = Math.max(0, guest1.stats.social - 5) * 0.1; // 10% bonus per point over 5
      actualChange = Math.round(change * (1 + socialBonus));
    }
    
    this.logger.info(`Relationship update: ${guest1.name} -> ${guest2.name}, change: ${actualChange}`);
    
    // Update relationship from guest1 to guest2
    this.updateRelationship(guest1.id, guest2.id, actualChange, note);
    
    // Update relationship from guest2 to guest1 (with a slight variation)
    // The reciprocal relationship changes slightly differently
    const reciprocalChange = change * (0.8 + Math.random() * 0.4); // 80-120% of original change
    this.updateRelationship(guest2.id, guest1.id, reciprocalChange, note);
  }

  getRelationshipLevel(guestId1: string, guestId2: string): string {
    const score = this.getRelationship(guestId1, guestId2);
    
    if (score >= 75) return 'Loyal Ally';
    if (score >= 50) return 'Close Friend';
    if (score >= 25) return 'Friend';
    if (score >= 10) return 'Friendly';
    if (score >= -10) return 'Neutral';
    if (score >= -25) return 'Unfriendly';
    if (score >= -50) return 'Dislike';
    if (score >= -75) return 'Enemy';
    return 'Bitter Rival';
  }

  getAllRelationships(): RelationshipMap {
    return this.relationships;
  }

  setRelationships(relationships: RelationshipMap): void {
    this.relationships = relationships;
  }

  getAverageRelationship(houseguestId: string, others?: string[]): number {
    const houseguestMap = this.relationships.get(houseguestId);
    if (!houseguestMap) return 0;
    
    const relations = Array.from(houseguestMap.entries());
    if (relations.length === 0) return 0;
    
    const filteredRelations = others 
      ? relations.filter(([otherId]) => others.includes(otherId))
      : relations;
    
    if (filteredRelations.length === 0) return 0;
    
    const sum = filteredRelations.reduce((total, [_, rel]) => total + rel.score, 0);
    return sum / filteredRelations.length;
  }
  
  // New methods for Phase 1 integration
  initialize(houseguests: Houseguest[]): void {
    this.initializeRelationships(houseguests);
  }

  handleEviction(evictedId: string): void {
    // Implementation for relationship adjustments after eviction
    this.logger.debug(`Processing relationship changes after eviction of houseguest ${evictedId}`);
    // Logic would go here in Phase 2
  }

  serialize(): any {
    // Serialize relationships for saving
    const serialized: Record<string, Record<string, Relationship>> = {};
    
    this.relationships.forEach((guestMap, guestId1) => {
      serialized[guestId1] = {};
      guestMap.forEach((relationship, guestId2) => {
        serialized[guestId1][guestId2] = { ...relationship };
      });
    });
    
    return serialized;
  }

  deserialize(data: any): void {
    // Deserialize relationships from saved data
    if (!data) return;
    
    this.relationships = new Map();
    
    Object.entries(data).forEach(([guestId1, relations]: [string, any]) => {
      const guestMap = new Map<string, Relationship>();
      this.relationships.set(guestId1, guestMap);
      
      Object.entries(relations).forEach(([guestId2, rel]: [string, any]) => {
        guestMap.set(guestId2, {
          score: rel.score || 0,
          alliance: rel.alliance || null,
          notes: Array.isArray(rel.notes) ? [...rel.notes] : []
        });
      });
    });
  }
  
  // Alliance management methods - stub implementation for Phase 1
  serializeAlliances(): any {
    return {}; // In Phase 2, we'll implement actual alliance serialization
  }
  
  deserializeAlliances(data: any): void {
    // In Phase 2, we'll implement actual alliance deserialization
  }
}
