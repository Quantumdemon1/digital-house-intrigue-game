
/**
 * @file src/systems/ai/decision/replacement-context-builder.ts
 * @description Builds context for replacement nominee decisions
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';

export class ReplacementContextBuilder {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Builds replacement decision context
   */
  buildReplacementContext(
    hoh: Houseguest, 
    savedNominee: Houseguest,
    game: BigBrotherGame
  ): any {
    const eligibleHouseguests = game.houseguests.filter(
      hg => hg.status === 'Active' && 
           hg.id !== hoh.id &&
           !hg.isNominated &&
           hg.id !== savedNominee.id &&
           !hg.isPovHolder
    );
    
    // Build relationships object
    const relationships: Record<string, number> = {};
    eligibleHouseguests.forEach(hg => {
      // Simplified - in real implementation would use relationship system
      const relationshipValue = this.getRelationshipValue(hoh.id, hg.id, game);
      relationships[hg.name] = relationshipValue;
    });
    
    return {
      hohName: hoh.name,
      savedNominee: savedNominee.name,
      eligible: eligibleHouseguests.map(hg => hg.name),
      relationships,
      situation: `You are the Head of Household. ${savedNominee.name} has been saved with the Power of Veto. You must choose a replacement nominee.`
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
