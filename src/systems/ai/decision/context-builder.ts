
/**
 * @file src/systems/ai/decision/context-builder.ts
 * @description Builds decision context for different decision types
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';

export class DecisionContextBuilder {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Builds nomination decision context
   */
  buildNominationContext(hoh: Houseguest, game: BigBrotherGame): any {
    const eligibleHouseguests = game.houseguests.filter(
      hg => hg.status === 'Active' && hg.id !== hoh.id
    );
    
    // Build relationships object
    const relationships: Record<string, number> = {};
    eligibleHouseguests.forEach(hg => {
      // Simplified - in real implementation would use relationship system
      const relationshipValue = this.getRelationshipValue(hoh.id, hg.id, game);
      relationships[hg.name] = relationshipValue;
    });
    
    return {
      eligible: eligibleHouseguests.map(hg => hg.name),
      relationships,
      situation: 'You are the Head of Household and must nominate two houseguests for eviction.'
    };
  }
  
  /**
   * Builds veto decision context
   */
  buildVetoContext(vetoHolder: Houseguest, game: BigBrotherGame): any {
    const nominees = game.nominees?.map(nom => {
      // Make sure we're getting the full houseguest object
      const nominee = game.houseguests.find(hg => hg.id === nom.id);
      return nominee;
    }).filter(Boolean) as Houseguest[];
    
    // Build relationships object
    const relationships: Record<string, number> = {};
    nominees.forEach(nominee => {
      const relationshipValue = this.getRelationshipValue(vetoHolder.id, nominee.id, game);
      relationships[nominee.name] = relationshipValue;
    });
    
    return {
      nominees: nominees.map(n => n.name),
      relationships,
      situation: 'You have won the Power of Veto and must decide whether to use it to save a nominee.'
    };
  }
  
  /**
   * Helper to get relationship value between two houseguests
   */
  private getRelationshipValue(id1: string, id2: string, game: BigBrotherGame): number {
    // Simplified - in real implementation would use relationship system
    // Random value between -5 and 5 for demo purposes
    return Math.floor(Math.random() * 10) - 5;
  }
}
