
/**
 * @file src/systems/ai/fallback-generator.ts
 * @description Provides fallback decision logic when AI decisions cannot be made
 */

import type { Logger } from '@/utils/logger';

export class AIFallbackGenerator {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Provides fallback decisions when the API fails
   */
  getFallbackDecision(decisionType: string, context: any): any {
    this.logger.warn(`⚡ FALLBACK ENGAGED: Using fallback decision for ${decisionType} ⚡`);
    this.logger.debug(`Fallback context:`, context);
    
    let decision;
    switch (decisionType) {
      case 'nomination': {
        // Randomly pick two nominees from eligible list
        if (!context.eligible || context.eligible.length < 2) {
          this.logger.warn(`Fallback nomination failed: Not enough eligible houseguests`);
          return { nominee1: "Unknown1", nominee2: "Unknown2" };
        }
        const shuffled = [...context.eligible].sort(() => 0.5 - Math.random());
        decision = { nominee1: shuffled[0], nominee2: shuffled[1] };
        this.logger.info(`🎯 Fallback nominated: ${decision.nominee1} and ${decision.nominee2}`);
        return decision;
      }
      
      case 'veto': {
        // 50% chance to use veto
        const useVeto = Math.random() > 0.5;
        decision = {
          useVeto,
          saveNominee: useVeto && context.nominees?.length ? context.nominees[0] : null
        };
        this.logger.info(`🎯 Fallback veto decision: ${useVeto ? 'USE veto' : 'DO NOT USE veto'}`);
        return decision;
      }
      
      case 'replacement': {
        // Randomly pick a replacement
        if (!context.eligible || context.eligible.length < 1) {
          this.logger.warn(`Fallback replacement failed: No eligible houseguests`);
          return { replacementNominee: "Unknown" };
        }
        decision = { replacementNominee: context.eligible[Math.floor(Math.random() * context.eligible.length)] };
        this.logger.info(`🎯 Fallback replacement nominee: ${decision.replacementNominee}`);
        return decision;
      }
      
      case 'eviction_vote': {
        // Randomly vote to evict one nominee
        if (!context.nominees || context.nominees.length < 1) {
          this.logger.warn(`Fallback eviction vote failed: No nominees found`);
          return { voteToEvict: "Unknown" };
        }
        decision = { voteToEvict: context.nominees[Math.floor(Math.random() * context.nominees.length)] };
        this.logger.info(`🎯 Fallback eviction vote: Evict ${decision.voteToEvict}`);
        return decision;
      }
      
      case 'jury_vote': {
        // Randomly vote for one finalist
        if (!context.finalists || context.finalists.length < 1) {
          this.logger.warn(`Fallback jury vote failed: No finalists found`);
          return { voteForWinner: "Unknown" };
        }
        decision = { voteForWinner: context.finalists[Math.floor(Math.random() * context.finalists.length)] };
        this.logger.info(`🎯 Fallback jury vote: Vote for ${decision.voteForWinner}`);
        return decision;
      }
      
      default:
        this.logger.error(`Unknown decision type: ${decisionType}`);
        return { error: "Unknown decision type" };
    }
  }
}
