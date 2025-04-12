
/**
 * @file src/systems/ai/decision/replacement-validator.ts
 * @description Validates replacement nominee decisions
 */

import type { Logger } from '@/utils/logger';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';

export class ReplacementValidator {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Validates replacement nominee decision
   */
  validateReplacementDecision(decision: any, game: BigBrotherGame, savedNomineeId: string): boolean {
    if (!decision.replacementNominee) {
      this.logger.error("Invalid replacement decision: missing replacementNominee", decision);
      return false;
    }
    
    // Get eligible houseguests (not HoH, not saved nominee, not PoV holder, active)
    const eligibleHouseguests = game.houseguests.filter(hg => 
      hg.status === 'Active' && 
      !hg.isHoH &&
      hg.id !== savedNomineeId &&
      !hg.isPovHolder &&
      !hg.isNominated
    );
    
    // Check if replacement exists and is eligible
    const replacementExists = eligibleHouseguests.some(hg => hg.name === decision.replacementNominee);
    
    if (!replacementExists) {
      this.logger.error("Invalid replacement nominee: not eligible", {
        replacementNominee: decision.replacementNominee,
        validOptions: eligibleHouseguests.map(h => h.name)
      });
      return false;
    }
    
    return true;
  }
}
