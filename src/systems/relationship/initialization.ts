
/**
 * @file src/systems/relationship/initialization.ts
 * @description Relationship initialization functionality
 */

import { Houseguest } from '../../models/houseguest';
import { RelationshipCore } from './core';

/**
 * Relationship initialization functionality
 */
export class RelationshipInitialization {
  private core: RelationshipCore;
  private logger: any;
  
  constructor(core: RelationshipCore, logger: any) {
    this.core = core;
    this.logger = logger;
  }

  /**
   * Initialize relationships between all houseguests
   */
  initializeRelationships(houseguests: Houseguest[]): void {
    this.logger.info('Initializing relationship matrix for all houseguests');
    
    // Create relationships between all houseguests
    houseguests.forEach(guest1 => {
      houseguests.forEach(guest2 => {
        if (guest1.id !== guest2.id) {
          // Initialize with a slightly random starting value
          const baseScore = Math.floor(Math.random() * 20) - 5; // -5 to 15 range
          this.core.setRelationship(guest1.id, guest2.id, baseScore);
        }
      });
    });
  }
  
  /**
   * Deserialize relationships from saved data
   */
  deserialize(data: any): void {
    // Deserialize relationships from saved data
    if (!data) return;
    
    const relationships = new Map();
    
    Object.entries(data).forEach(([guestId1, relations]: [string, any]) => {
      const guestMap = new Map();
      relationships.set(guestId1, guestMap);
      
      Object.entries(relations).forEach(([guestId2, rel]: [string, any]) => {
        guestMap.set(guestId2, {
          score: rel.score || 0,
          alliance: rel.alliance || null,
          notes: Array.isArray(rel.notes) ? [...rel.notes] : [],
          events: Array.isArray(rel.events) ? [...rel.events] : [],
          lastInteractionWeek: rel.lastInteractionWeek || 1
        });
      });
    });
    
    this.core.setRelationships(relationships);
  }
  
  /**
   * Serialize relationships for saving
   */
  serialize(): any {
    // Serialize relationships for saving
    const serialized: Record<string, Record<string, any>> = {};
    
    this.core.getAllRelationships().forEach((guestMap, guestId1) => {
      serialized[guestId1] = {};
      guestMap.forEach((relationship, guestId2) => {
        serialized[guestId1][guestId2] = { ...relationship };
      });
    });
    
    return serialized;
  }
}
