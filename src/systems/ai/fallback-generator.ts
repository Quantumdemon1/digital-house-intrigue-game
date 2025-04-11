
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
      
      case 'dialogue': {
        // Provide generic dialogue response
        const responses = [
          "Hey, what's up?", 
          "I'm just thinking about the game.", 
          "Not sure what to do next.", 
          "Trying to figure out who to trust."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        decision = { 
          response: randomResponse,
          tone: "neutral",
          thoughts: "I should be careful what I say."
        };
        this.logger.info(`🎯 Fallback dialogue: "${randomResponse}"`);
        return decision;
      }
      
      case 'alliance_proposal': {
        // Default to not proposing alliance in fallback
        decision = { 
          propose: false, 
          allianceName: null, 
          targetMemberNames: null, 
          reasoning: "Fallback: Not proposing alliance" 
        };
        this.logger.info(`🎯 Fallback alliance proposal: Not proposing`);
        return decision;
      }
      
      case 'alliance_response': {
        // Random response to alliance proposal in fallback
        const accept = Math.random() > 0.5;
        decision = { 
          accept, 
          reasoning: `Fallback: ${accept ? 'Accepted' : 'Declined'} alliance proposal randomly` 
        };
        this.logger.info(`🎯 Fallback alliance response: ${accept ? 'ACCEPT' : 'DECLINE'}`);
        return decision;
      }
      
      default:
        this.logger.error(`Unknown decision type: ${decisionType}`);
        return { error: "Unknown decision type" };
    }
  }
  
  /**
   * Describes a relationship based on numeric score
   */
  describeRelationship(score: number): string {
    if (score >= 75) return 'Loyal Ally';
    if (score >= 50) return 'Close Friend';
    if (score >= 25) return 'Friend';
    if (score >= 10) return 'Friendly';
    if (score >= -10) return 'Neutral';
    if (score >= -25) return 'Unfriendly';
    if (score >= -50) return 'Dislike';
    if (score >= -75) return 'Enemy';
    return 'Bitter Rival';
  }
}
