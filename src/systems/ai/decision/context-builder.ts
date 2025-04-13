
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
    // Type guard function to ensure we have valid Houseguest objects
    const isValidHouseguest = (hg: any): hg is Houseguest => 
      hg !== null && typeof hg === 'object' && 'name' in hg && 'id' in hg;
    
    // Get nominees safely
    const nominees: Houseguest[] = [];
    
    if (Array.isArray(game.nominees)) {
      // Process each nominee entry
      for (const nom of game.nominees) {
        // Skip null entries
        if (nom === null) continue;
        
        let houseguest: Houseguest | undefined | null = null;
        
        // Handle different nominee representations
        if (isValidHouseguest(nom)) {
          houseguest = nom;
        } else if (typeof nom === 'object' && 'id' in nom) {
          const nomId = (nom as {id: string}).id;
          houseguest = game.houseguests.find(hg => hg.id === nomId);
        } else if (typeof nom === 'string') {
          houseguest = game.houseguests.find(hg => hg.id === nom);
        }
        
        // Only add valid houseguests to the nominees array
        if (houseguest && isValidHouseguest(houseguest)) {
          nominees.push(houseguest);
        }
      }
    }
    
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
