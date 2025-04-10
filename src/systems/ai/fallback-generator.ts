
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
    this.logger.warn(`Using fallback decision for ${decisionType}`);
    
    switch (decisionType) {
      case 'nomination': {
        // Randomly pick two nominees from eligible list
        if (!context.eligible || context.eligible.length < 2) {
          return { nominee1: "Unknown1", nominee2: "Unknown2" };
        }
        const shuffled = [...context.eligible].sort(() => 0.5 - Math.random());
        return { nominee1: shuffled[0], nominee2: shuffled[1] };
      }
      
      case 'veto': {
        // 50% chance to use veto
        const useVeto = Math.random() > 0.5;
        return {
          useVeto,
          saveNominee: useVeto && context.nominees?.length ? context.nominees[0] : null
        };
      }
      
      case 'replacement': {
        // Randomly pick a replacement
        if (!context.eligible || context.eligible.length < 1) {
          return { replacementNominee: "Unknown" };
        }
        return { replacementNominee: context.eligible[Math.floor(Math.random() * context.eligible.length)] };
      }
      
      case 'eviction_vote': {
        // Randomly vote to evict one nominee
        if (!context.nominees || context.nominees.length < 1) {
          return { voteToEvict: "Unknown" };
        }
        return { voteToEvict: context.nominees[Math.floor(Math.random() * context.nominees.length)] };
      }
      
      case 'jury_vote': {
        // Randomly vote for one finalist
        if (!context.finalists || context.finalists.length < 1) {
          return { voteForWinner: "Unknown" };
        }
        return { voteForWinner: context.finalists[Math.floor(Math.random() * context.finalists.length)] };
      }
      
      default:
        return { error: "Unknown decision type" };
    }
  }
}
