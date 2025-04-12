
/**
 * @file src/systems/relationship/events.ts
 * @description Relationship event management
 */

import { RelationshipEventType } from '../../models/relationship-event';
import { RelationshipCore } from './core';
import { config } from '../../config';

/**
 * Relationship event handling functionality
 */
export class RelationshipEvents {
  private core: RelationshipCore;
  private logger: any;
  
  constructor(core: RelationshipCore, logger: any) {
    this.core = core;
    this.logger = logger;
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
    const relationship = this.core.getOrCreateRelationship(guestId1, guestId2);
    
    const event = {
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
    
    this.logger.debug(`Added relationship event: ${guestId1} -> ${guestId2}: ${eventType} (${impactScore})`);
  }

  /**
   * Get all significant events between two houseguests
   */
  getRelationshipEvents(guestId1: string, guestId2: string): any[] {
    const relationship = this.core.getOrCreateRelationship(guestId1, guestId2);
    return [...relationship.events];
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
}
