
/**
 * @file src/systems/relationship/index.ts
 * @description Main relationship system that integrates all functionality
 */

import { Houseguest } from '../../models/houseguest';
import { RelationshipEventType } from '../../models/relationship-event';
import { RelationshipCore } from './core';
import { RelationshipEvents } from './events';
import { RelationshipDynamics } from './dynamics';
import { RelationshipDecay } from './decay';
import { RelationshipInitialization } from './initialization';
import { RelationshipMap } from './types';

export type { RelationshipMap, Relationship } from './types';

/**
 * Integrated relationship system that combines all relationship functionality
 */
export class RelationshipSystem {
  private core: RelationshipCore;
  private events: RelationshipEvents;
  private dynamics: RelationshipDynamics;
  private decay: RelationshipDecay;
  private initialization: RelationshipInitialization;
  private logger: any;
  private currentWeek: number = 1;

  constructor(logger: any) {
    this.logger = logger;
    this.core = new RelationshipCore(logger);
    this.events = new RelationshipEvents(this.core, logger);
    this.dynamics = new RelationshipDynamics(this.core);
    this.decay = new RelationshipDecay(this.core, logger);
    this.initialization = new RelationshipInitialization(this.core, logger);
  }

  // Update the current week
  setCurrentWeek(week: number): void {
    this.currentWeek = week;
    this.core.setCurrentWeek(week);
    this.decay.setCurrentWeek(week);
    
    // When week changes, handle relationship decay
    this.decay.applyRelationshipDecay();
  }

  // Pass-through to core functions
  getOrCreateRelationship(guestId1: string, guestId2: string) {
    return this.core.getOrCreateRelationship(guestId1, guestId2);
  }
  
  getRelationship(guestId1: string, guestId2: string): number {
    return this.core.getRelationship(guestId1, guestId2);
  }
  
  setRelationship(guestId1: string, guestId2: string, score: number, note?: string): void {
    this.core.setRelationship(guestId1, guestId2, score, note);
  }
  
  updateRelationship(guestId1: string, guestId2: string, change: number, note?: string): void {
    this.core.updateRelationship(guestId1, guestId2, change, note);
  }
  
  getAllRelationships(): RelationshipMap {
    return this.core.getAllRelationships();
  }

  // Pass-through to dynamics functions
  getEffectiveRelationship(guestId1: string, guestId2: string): number {
    return this.dynamics.getEffectiveRelationship(guestId1, guestId2);
  }
  
  calculateReciprocityModifier(guestId1: string, guestId2: string): number {
    return this.dynamics.calculateReciprocityModifier(guestId1, guestId2);
  }
  
  getAverageRelationship(houseguestId: string, others?: string[]): number {
    return this.dynamics.getAverageRelationship(houseguestId, others);
  }
  
  getRelationshipLevel(guestId1: string, guestId2: string): string {
    return this.dynamics.getRelationshipLevel(guestId1, guestId2);
  }

  // Pass-through to events functions
  addRelationshipEvent(
    guestId1: string, 
    guestId2: string, 
    eventType: RelationshipEventType, 
    description: string, 
    impactScore: number,
    decayable: boolean = true,
    decayRate?: number
  ): void {
    this.events.addRelationshipEvent(guestId1, guestId2, eventType, description, impactScore, decayable, decayRate);
  }
  
  getRelationshipEvents(guestId1: string, guestId2: string): any[] {
    return this.events.getRelationshipEvents(guestId1, guestId2);
  }
  
  recordBetrayal(betrayerId: string, targetId: string, description: string): void {
    this.events.recordBetrayal(betrayerId, targetId, description);
  }
  
  recordSave(saviorId: string, savedId: string, description: string): void {
    this.events.recordSave(saviorId, savedId, description);
  }

  // Pass-through to initialization functions
  initializeRelationships(houseguests: Houseguest[]): void {
    this.initialization.initializeRelationships(houseguests);
  }
  
  deserialize(data: any): void {
    this.initialization.deserialize(data);
  }
  
  serialize(): any {
    return this.initialization.serialize();
  }

  // Game integration methods
  initialize(houseguests: Houseguest[]): void {
    this.initializeRelationships(houseguests);
  }

  handleEviction(evictedId: string): void {
    // Implementation for relationship adjustments after eviction
    this.logger.debug(`Processing relationship changes after eviction of houseguest ${evictedId}`);
    // Logic would go here in Phase 2
  }
  
  // Alliance management methods - stub implementation for Phase 1
  serializeAlliances(): any {
    return {}; // In Phase 2, we'll implement actual alliance serialization
  }
  
  deserializeAlliances(data: any): void {
    // In Phase 2, we'll implement actual alliance deserialization
  }
  
  // Convenience method for updating relationships between houseguests
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
}
