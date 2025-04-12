
/**
 * @file src/systems/ai/decision/validator.ts
 * @description Validates decision outputs and handles edge cases
 */

import type { Logger } from '@/utils/logger';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';

export class DecisionValidator {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Validates nomination decision
   */
  validateNominationDecision(decision: any, game: BigBrotherGame): boolean {
    if (!decision.nominee1 || !decision.nominee2) {
      this.logger.error("Invalid nomination decision: missing nominees", decision);
      return false;
    }
    
    // Check if nominees exist in the game
    const nominee1Exists = game.houseguests.some(hg => hg.name === decision.nominee1);
    const nominee2Exists = game.houseguests.some(hg => hg.name === decision.nominee2);
    
    if (!nominee1Exists || !nominee2Exists) {
      this.logger.error("Invalid nominees: one or more do not exist", {
        nominee1: decision.nominee1,
        nominee2: decision.nominee2,
        validHouseguests: game.houseguests.map(h => h.name)
      });
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates veto decision
   */
  validateVetoDecision(decision: any, game: BigBrotherGame): boolean {
    if (typeof decision.useVeto !== 'boolean') {
      this.logger.error("Invalid veto decision: useVeto must be boolean", decision);
      return false;
    }
    
    // If using veto, validate saveNominee
    if (decision.useVeto && !decision.saveNominee) {
      this.logger.error("Invalid veto decision: using veto but no saveNominee specified", decision);
      return false;
    }
    
    // If using veto, check if nominee exists
    if (decision.useVeto) {
      // Convert nominees from IDs to Houseguests, handling both object and string types
      const nominees = game.nominees?.map(nom => {
        if (nom === null) return null;
        
        // Process non-null values
        if (typeof nom === 'object' && nom !== null && 'id' in nom) {
          // Make sure we're getting the full houseguest object
          return game.houseguests.find(hg => hg.id === (nom as {id: string}).id) || null;
        }
        else if (typeof nom === 'string') {
          // If nom is a string (an ID), find the corresponding houseguest
          return game.houseguests.find(hg => hg.id === nom) || null;
        }
        return null;
      }).filter(Boolean) as Houseguest[]; // Filter out null values and assert type
      
      const nomineeNames = nominees.map(nominee => nominee.name);
      const saveNomineeExists = nomineeNames.includes(decision.saveNominee);
      
      if (!saveNomineeExists) {
        this.logger.error("Invalid save nominee: not in current nominees", {
          saveNominee: decision.saveNominee,
          validNominees: nomineeNames
        });
        return false;
      }
    }
    
    return true;
  }
}

// Add the Houseguest type import to fix the type assertion
interface Houseguest {
  id: string;
  name: string;
  [key: string]: any;
}
