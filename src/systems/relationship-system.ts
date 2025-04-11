import { Houseguest } from '../models/houseguest';
import { RelationshipEvent, RelationshipEventType } from '../models/relationship-event';
import { config } from '../config';

export interface Relationship {
  score: number;        // -100 to 100 scale
  alliance: string | null; // alliance ID if they're in an alliance together
  notes: string[];      // Important events that affected relationship
  events: RelationshipEvent[]; // History of significant relationship events
  lastInteractionWeek: number; // Last week there was a direct interaction
}

export type RelationshipMap = Map<string, Map<string, Relationship>>;

export class RelationshipSystem {
  private relationships: RelationshipMap = new Map();
  private logger: any;
  private currentWeek: number = 1;

  constructor(logger: any) {
    this.logger = logger;
  }

  // Update the current week
  setCurrentWeek(week: number): void {
    this.currentWeek = week;
    // When week changes, handle relationship decay
    if (config.RELATIONSHIP_DECAY_RATE > 0) {
      this.applyRelationshipDecay();
    }
  }

  // Apply relationship decay to all relationships
  private applyRelationshipDecay(): void {
    this.logger.info(`Applying relationship decay for week ${this.currentWeek}`);
    
    this.relationships.forEach((guestRelationships, guestId1) => {
      guestRelationships.forEach((relationship, guestId2) => {
        // Only decay if there hasn't been an interaction this week
        if (relationship.lastInteractionWeek < this.currentWeek) {
          const weeksWithoutInteraction = this.currentWeek - relationship.lastInteractionWeek;
          
          // Apply decay to the overall score
          if (relationship.score !== 0) {
            const decayAmount = relationship.score * config.RELATIONSHIP_DECAY_RATE * weeksWithoutInteraction;
            relationship.score -= decayAmount;
            
            // Move toward 0 (neutral)
            if ((relationship.score > 0 && relationship.score - decayAmount < 0) ||
                (relationship.score < 0 && relationship.score - decayAmount > 0)) {
              relationship.score = 0;
            }
            
            this.logger.debug(`Relationship decay: ${guestId1} -> ${guestId2}: ${decayAmount.toFixed(2)}`);
          }
          
          // Also apply decay to individual event impacts if they're decayable
          relationship.events.forEach(event => {
            if (event.decayable) {
              const eventAgeInWeeks = (this.currentWeek - Math.floor(event.timestamp / 604800000));
              if (eventAgeInWeeks > config.MEMORY_RETENTION_WEEKS) {
                const decayRate = event.decayRate || config.RELATIONSHIP_DECAY_RATE;
                const decayFactor = Math.pow(1 - decayRate, eventAgeInWeeks - config.MEMORY_RETENTION_WEEKS);
                event.impactScore *= decayFactor;
              }
            }
          });
        }
      });
    });
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

  getRelationship(guestId1: string, guestId2: string): number {
    const guest1Map = this.relationships.get(guestId1);
    if (!guest1Map) return 0;
    
    const relationship = guest1Map.get(guestId2);
    return relationship ? relationship.score : 0;
  }

  /**
   * Gets the effective relationship score, considering group dynamics
   * This accounts for allies-of-allies and enemies-of-allies
   */
  getEffectiveRelationship(guestId1: string, guestId2: string): number {
    const baseScore = this.getRelationship(guestId1, guestId2);
    
    // Skip group dynamics calculation if disabled
    if (config.GROUP_DYNAMICS_WEIGHT <= 0) return baseScore;
    
    // Get all relationships for both houseguests
    const relationships1 = this.relationships.get(guestId1);
    const relationships2 = this.relationships.get(guestId2);
    
    if (!relationships1 || !relationships2) return baseScore;
    
    let groupModifier = 0;
    let relationshipsConsidered = 0;
    
    // Check shared relationships (both positive and negative)
    relationships1.forEach((rel1, sharedId) => {
      if (sharedId !== guestId2 && relationships2.has(sharedId)) {
        const rel2 = relationships2.get(sharedId)!;
        
        // If both have similar feelings toward a third person, strengthen relationship
        // If opposite feelings, weaken relationship
        const similarity = Math.sign(rel1.score) === Math.sign(rel2.score) ? 1 : -1;
        const magnitude = Math.min(Math.abs(rel1.score), Math.abs(rel2.score)) / 100;
        
        groupModifier += similarity * magnitude;
        relationshipsConsidered++;
      }
    });
    
    // If no shared relationships considered, return base score
    if (relationshipsConsidered === 0) return baseScore;
    
    // Average the modifiers and apply group dynamics weight
    const averageModifier = groupModifier / relationshipsConsidered * config.GROUP_DYNAMICS_WEIGHT * 10;
    const effectiveScore = Math.max(config.RELATIONSHIP_MIN, 
      Math.min(config.RELATIONSHIP_MAX, baseScore + averageModifier));
    
    return effectiveScore;
  }

  setRelationship(guestId1: string, guestId2: string, score: number, note?: string): void {
    const relationship = this.getOrCreateRelationship(guestId1, guestId2);
    relationship.score = Math.max(config.RELATIONSHIP_MIN, Math.min(config.RELATIONSHIP_MAX, score)); // Clamp between -100 and 100
    
    if (note) {
      relationship.notes.push(note);
    }
    
    // Update last interaction week
    relationship.lastInteractionWeek = this.currentWeek;
  }

  /**
   * Add a significant relationship event
   */
  addRelationshipEvent(
    guestId1: string, 
    guestId2: string, 
    eventType: RelationshipEventType, 
    description: string, 
    impactScore: number,
    decayable: boolean = true,
    decayRate?: number
  ): void {
    const relationship = this.getOrCreateRelationship(guestId1, guestId2);
    
    const event: RelationshipEvent = {
      timestamp: Date.now(),
      type: eventType,
      description,
      impactScore,
      decayable,
      decayRate
    };
    
    relationship.events.push(event);
    relationship.notes.push(description);
    
    // Update the relationship score
    relationship.score = Math.max(config.RELATIONSHIP_MIN, 
      Math.min(config.RELATIONSHIP_MAX, relationship.score + impactScore));
    
    // Update last interaction week
    relationship.lastInteractionWeek = this.currentWeek;
    
    this.logger.debug(`Added relationship event: ${guestId1} -> ${guestId2}: ${eventType} (${impactScore})`);
  }

  /**
   * Get all significant events between two houseguests
   */
  getRelationshipEvents(guestId1: string, guestId2: string): RelationshipEvent[] {
    const relationship = this.getOrCreateRelationship(guestId1, guestId2);
    return [...relationship.events];
  }

  /**
   * Calculate reciprocity - how much does the imbalance in relationships affect actions
   * Returns a modifier value that can be used to adjust decision weights
   * Positive means guest2 should be more favorable to guest1
   * Negative means guest2 should be less favorable to guest1
   */
  calculateReciprocityModifier(guestId1: string, guestId2: string): number {
    const rel1to2 = this.getRelationship(guestId1, guestId2);
    const rel2to1 = this.getRelationship(guestId2, guestId1);
    
    // Calculate the imbalance - how much more/less does guest1 like guest2 than vice versa
    const imbalance = rel1to2 - rel2to1;
    
    // Apply reciprocity factor to determine how much this imbalance affects decisions
    const modifier = imbalance * config.RECIPROCITY_FACTOR / 100;
    
    return modifier;
  }

  updateRelationship(guestId1: string, guestId2: string, change: number, note?: string): void {
    const currentScore = this.getRelationship(guestId1, guestId2);
    this.setRelationship(guestId1, guestId2, currentScore + change, note);
    
    this.logger.debug(`Updated relationship: ${guestId1} -> ${guestId2} by ${change} to ${currentScore + change}`);
  }

  updateRelationships(guest1: Houseguest, guest2: Houseguest, change: number, note?: string, eventType?: RelationshipEventType): void {
    // Calculate base relationship change
    let actualChange = change;
    
    // Apply social stat influence for player-initiated interactions
    if (guest1.isPlayer && change > 0) {
      // For positive changes, player's social stat can enhance the effect
      const socialBonus = Math.max(0, guest1.stats.social - 5) * 0.1; // 10% bonus per point over 5
      actualChange = Math.round(change * (1 + socialBonus));
    }
    
    this.logger.info(`Relationship update: ${guest1.name} -> ${guest2.name}, change: ${actualChange}`);
    
    // Add as relationship event if eventType is provided
    if (eventType) {
      this.addRelationshipEvent(
        guest1.id, 
        guest2.id, 
        eventType, 
        note || `Relationship changed by ${actualChange}`, 
        actualChange
      );
    } else {
      // Otherwise just update score directly
      this.updateRelationship(guest1.id, guest2.id, actualChange, note);
    }
    
    // Update relationship from guest2 to guest1 (with a slight variation)
    // The reciprocal relationship changes slightly differently
    const reciprocalChange = change * (0.8 + Math.random() * 0.4); // 80-120% of original change
    
    if (eventType) {
      this.addRelationshipEvent(
        guest2.id, 
        guest1.id, 
        eventType, 
        note || `Relationship changed by ${reciprocalChange.toFixed(1)}`, 
        reciprocalChange
      );
    } else {
      this.updateRelationship(guest2.id, guest1.id, reciprocalChange, note);
    }
  }

  /**
   * Record a betrayal event (strong negative effect)
   */
  recordBetrayal(betrayerId: string, targetId: string, description: string): void {
    // Add a significant betrayal event with the configured penalty
    this.addRelationshipEvent(
      targetId,
      betrayerId,
      'betrayal',
      description,
      config.BACKSTAB_PENALTY,
      false // Don't decay betrayals, they're remembered
    );
    
    this.logger.info(`Betrayal recorded: ${betrayerId} betrayed ${targetId}: ${description}`);
  }
  
  /**
   * Record a saved ally event (strong positive effect)
   */
  recordSave(saviorId: string, savedId: string, description: string): void {
    // Add a significant save event with the configured bonus
    this.addRelationshipEvent(
      savedId,
      saviorId,
      'saved',
      description,
      config.SAVED_ALLY_BONUS,
      false // Don't decay saves, they're remembered
    );
    
    this.logger.info(`Save recorded: ${saviorId} saved ${savedId}: ${description}`);
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
          notes: Array.isArray(rel.notes) ? [...rel.notes] : [],
          events: Array.isArray(rel.events) ? [...rel.events] : [],
          lastInteractionWeek: rel.lastInteractionWeek || this.currentWeek
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
