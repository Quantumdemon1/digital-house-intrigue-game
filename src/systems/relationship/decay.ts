
/**
 * @file src/systems/relationship/decay.ts
 * @description Relationship decay management
 */

import { RelationshipCore } from './core';
import { config } from '../../config';

/**
 * Relationship decay functionality
 */
export class RelationshipDecay {
  private core: RelationshipCore;
  private logger: any;
  private currentWeek: number = 1;
  
  constructor(core: RelationshipCore, logger: any) {
    this.core = core;
    this.logger = logger;
  }

  /**
   * Update the current week
   */
  setCurrentWeek(week: number): void {
    this.currentWeek = week;
  }

  /**
   * Apply relationship decay to all relationships
   */
  applyRelationshipDecay(): void {
    if (config.RELATIONSHIP_DECAY_RATE <= 0) return;
    
    this.logger.info(`Applying relationship decay for week ${this.currentWeek}`);
    
    this.core.getAllRelationships().forEach((guestRelationships, guestId1) => {
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
}
