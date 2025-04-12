
/**
 * @file src/systems/ai/decision-helper.ts
 * @description Helper functions for AI decision making
 */

import { Logger } from '@/utils/logger';
import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { EnhancedGameLogger } from '@/utils/game-log';
import { AIDecisionResponse } from './response-parser';
import { Houseguest } from '@/models/houseguest';

export class AIDecisionHelper {
  private logger: Logger;
  private enhancedLogger: EnhancedGameLogger | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Setup enhanced logger if available
   */
  setupEnhancedLogger(game: BigBrotherGame): void {
    if (!this.enhancedLogger && game) {
      this.enhancedLogger = new EnhancedGameLogger(game, this.logger);
    }
  }

  /**
   * Extract affected houseguests from a decision
   */
  getAffectedHouseguests(decision: any, decisionType: string): string[] {
    const affected: string[] = [];
    
    switch (decisionType) {
      case 'nomination':
        if (decision.nominee1) affected.push(decision.nominee1);
        if (decision.nominee2) affected.push(decision.nominee2);
        break;
      case 'veto':
        if (decision.saveNominee) affected.push(decision.saveNominee);
        break;
      case 'replacement':
        if (decision.replacementNominee) affected.push(decision.replacementNominee);
        break;
      case 'eviction_vote':
        if (decision.voteToEvict) affected.push(decision.voteToEvict);
        break;
    }
    
    return affected;
  }

  /**
   * Log AI decision with reasoning
   */
  logAIDecision(
    houseguest: Houseguest, 
    decisionType: string,
    parsedResponse: AIDecisionResponse,
    game: BigBrotherGame
  ): void {
    // Log AI decision with reasoning if available
    if (parsedResponse.reasoning && this.enhancedLogger) {
      const affectedHouseguests = this.getAffectedHouseguests(parsedResponse.decision, decisionType);
      
      this.enhancedLogger.logAIDecision(
        houseguest, 
        `make ${decisionType} decision`, 
        parsedResponse.reasoning,
        affectedHouseguests
      );
    }
  }
}
