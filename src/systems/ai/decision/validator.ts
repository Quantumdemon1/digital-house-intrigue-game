
/**
 * @file src/systems/ai/decision/validator.ts
 * @description Validates decision outputs and handles edge cases
 */

import type { Logger } from '@/utils/logger';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Houseguest } from '@/models/houseguest';

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
          } else if (typeof nom === 'object' && nom !== null && 'id' in nom) {
            // Fixed here: Using safe navigation for property access
            const nomId = nom?.id;
            if (typeof nomId === 'string') {
              houseguest = game.houseguests.find(hg => hg.id === nomId);
            }
          } else if (typeof nom === 'string') {
            houseguest = game.houseguests.find(hg => hg.id === nom);
          }
          
          // Only add valid houseguests to the nominees array
          if (houseguest && isValidHouseguest(houseguest)) {
            nominees.push(houseguest);
          }
        }
      }
      
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
