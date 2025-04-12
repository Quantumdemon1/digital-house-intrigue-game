
/**
 * @file src/systems/ai/fallback-coordinator.ts
 * @description Coordinates fallback decisions when AI API fails
 */

import { Logger } from '@/utils/logger';
import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { AIFallbackGenerator } from './fallback-generator';

export class FallbackCoordinator {
  private logger: Logger;
  private fallbackGenerator: AIFallbackGenerator;
  
  constructor(logger: Logger) {
    this.logger = logger;
    this.fallbackGenerator = new AIFallbackGenerator(logger);
  }

  /**
   * Get fallback decisions when AI fails
   */
  getFallbackDecision(houseguestName: string, decisionType: string, context: any, game: BigBrotherGame): any {
    try {
      // Find houseguest by name
      const houseguest = game.houseguests.find(h => h.name === houseguestName);
      if (!houseguest) {
        this.logger.error(`Houseguest "${houseguestName}" not found for fallback decision`);
        // Return basic fallback if houseguest not found
        return this.fallbackGenerator.getFallbackDecision(decisionType, context);
      }
      
      // Get relationship-aware fallback if relationship system is available
      if (game.relationshipSystem) {
        return this.fallbackGenerator.getRelationshipAwareFallbackDecision(
          decisionType, 
          context, 
          houseguest.id,
          game.relationshipSystem
        );
      } else {
        // Use basic fallback
        return this.fallbackGenerator.getFallbackDecision(decisionType, context);
      }
    } catch (error: any) {
      // Last resort error handling - return something that won't break the game
      this.logger.error(`Critical error in fallback decision generator: ${error.message}`);
      
      return this.getEmergencyFallback(decisionType, context);
    }
  }
  
  /**
   * Emergency fallback that returns the absolute minimum to not crash the game
   */
  private getEmergencyFallback(decisionType: string, context: any): any {
    switch (decisionType) {
      case 'nomination':
        const eligibleNames = (context.eligible || []).slice(0, 2);
        return { 
          nominee1: eligibleNames[0] || "Unknown", 
          nominee2: eligibleNames[1] || "Unknown" 
        };
      case 'veto':
        return { useVeto: false, saveNominee: null };
      case 'replacement':
        return { replacementNominee: (context.eligible || [])[0] || "Unknown" };
      case 'eviction_vote':
        return { voteToEvict: (context.nominees || [])[0] || "Unknown" };
      case 'jury_vote':
        return { voteForWinner: (context.finalists || [])[0] || "Unknown" };
      case 'dialogue':
        return { 
          response: "I need to think about the game situation.", 
          tone: "neutral",
          thoughts: "I should be careful with what I say."
        };
      default:
        return {};
    }
  }
}
