
/**
 * @file src/systems/relationship/dynamics.ts
 * @description Group dynamics and relationship effects
 */

import { RelationshipCore } from './core';
import { config } from '../../config';

/**
 * Advanced relationship dynamics functionality
 */
export class RelationshipDynamics {
  private core: RelationshipCore;
  
  constructor(core: RelationshipCore) {
    this.core = core;
  }

  /**
   * Gets the effective relationship score, considering group dynamics
   * This accounts for allies-of-allies and enemies-of-allies
   */
  getEffectiveRelationship(guestId1: string, guestId2: string): number {
    const baseScore = this.core.getRelationship(guestId1, guestId2);
    
    // Skip group dynamics calculation if disabled
    if (config.GROUP_DYNAMICS_WEIGHT <= 0) return baseScore;
    
    // Get all relationships for both houseguests
    const relationships1 = this.core.getAllRelationships().get(guestId1);
    const relationships2 = this.core.getAllRelationships().get(guestId2);
    
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

  /**
   * Calculate reciprocity - how much does the imbalance in relationships affect actions
   * Returns a modifier value that can be used to adjust decision weights
   * Positive means guest2 should be more favorable to guest1
   * Negative means guest2 should be less favorable to guest1
   */
  calculateReciprocityModifier(guestId1: string, guestId2: string): number {
    const rel1to2 = this.core.getRelationship(guestId1, guestId2);
    const rel2to1 = this.core.getRelationship(guestId2, guestId1);
    
    // Calculate the imbalance - how much more/less does guest1 like guest2 than vice versa
    const imbalance = rel1to2 - rel2to1;
    
    // Apply reciprocity factor to determine how much this imbalance affects decisions
    const modifier = imbalance * config.RECIPROCITY_FACTOR / 100;
    
    return modifier;
  }

  /**
   * Get average relationship with a group of houseguests
   */
  getAverageRelationship(houseguestId: string, others?: string[]): number {
    const houseguestMap = this.core.getAllRelationships().get(houseguestId);
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

  /**
   * Get relationship level description based on score
   */
  getRelationshipLevel(guestId1: string, guestId2: string): string {
    const score = this.core.getRelationship(guestId1, guestId2);
    
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
}
