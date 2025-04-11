/**
 * @file src/systems/ai/fallback-generator.ts
 * @description Provides fallback decisions when AI API calls fail
 */

import type { Logger } from '@/utils/logger';
import type { RelationshipSystem } from '../relationship-system';

export class AIFallbackGenerator {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Generate a basic fallback decision based on decision type
   */
  getFallbackDecision(decisionType: string, context: any): any {
    this.logger.info(`Using fallback decision for ${decisionType}`);
    
    switch (decisionType) {
      case 'nomination':
        return this.getNominationFallback(context);
      case 'veto':
        return this.getVetoFallback(context);
      case 'replacement':
        return this.getReplacementFallback(context);
      case 'eviction_vote':
        return this.getEvictionVoteFallback(context);
      case 'jury_vote':
        return this.getJuryVoteFallback(context);
      case 'dialogue':
        return this.getDialogueFallback(context);
      case 'alliance_proposal':
        return this.getAllianceProposalFallback(context);
      case 'alliance_response':
        return this.getAllianceResponseFallback(context);
      default:
        this.logger.warn(`Unknown decision type: ${decisionType}, using random`);
        return this.getRandomDecision(context);
    }
  }

  /**
   * Generate relationship-aware fallback decisions
   */
  getRelationshipAwareFallbackDecision(
    decisionType: string, 
    context: any, 
    houseguestId: string,
    relationshipSystem: RelationshipSystem
  ): any {
    this.logger.info(`Using relationship-aware fallback for ${decisionType}`);
    
    switch (decisionType) {
      case 'nomination':
        return this.getRelationshipAwareNominations(context, houseguestId, relationshipSystem);
      case 'veto':
        return this.getRelationshipAwareVetoDecision(context, houseguestId, relationshipSystem);
      case 'replacement':
        return this.getRelationshipAwareReplacement(context, houseguestId, relationshipSystem);
      case 'eviction_vote':
        return this.getRelationshipAwareEvictionVote(context, houseguestId, relationshipSystem);
      default:
        // If no special relationship-aware handler, use the base fallback
        return this.getFallbackDecision(decisionType, context);
    }
  }
  
  /**
   * Generate nominations based on relationship scores
   */
  private getRelationshipAwareNominations(context: any, hohId: string, relationshipSystem: RelationshipSystem): any {
    const eligible = context.eligible || [];
    if (eligible.length < 2) {
      return this.getNominationFallback(context);
    }
    
    // Calculate scores for each eligible houseguest
    const scoredHouseguests = eligible.map((name: string) => {
      // Find the ID for this houseguest
      // In a real implementation, we would have a proper lookup method
      const targetId = name.toLowerCase().replace(/\s/g, '-');
      
      // Get relationship info
      const baseScore = relationshipSystem.getRelationship(hohId, targetId);
      const effectiveScore = relationshipSystem.getEffectiveRelationship(hohId, targetId);
      const reciprocity = relationshipSystem.calculateReciprocityModifier(targetId, hohId);
      
      // Combine factors - lower scores are more likely to be nominated
      const nominationScore = effectiveScore + (reciprocity * 20);
      
      return { name, score: nominationScore };
    });
    
    // Sort by score (lowest first = most likely to be nominated)
    scoredHouseguests.sort((a, b) => a.score - b.score);
    
    // Pick the two with lowest scores
    const nominee1 = scoredHouseguests[0]?.name;
    const nominee2 = scoredHouseguests[1]?.name;
    
    this.logger.info(`Relationship-based nomination fallback: ${nominee1} and ${nominee2}`);
    
    return {
      nominee1,
      nominee2
    };
  }
  
  /**
   * Generate veto decision based on relationship scores
   */
  private getRelationshipAwareVetoDecision(context: any, povHolderId: string, relationshipSystem: RelationshipSystem): any {
    const nominees = context.nominees || [];
    const isNominated = context.isNominated || false;
    
    // If POV holder is nominated, always use veto
    if (isNominated) {
      return {
        useVeto: true,
        saveNominee: context.povHolderName || "self"
      };
    }
    
    // Check relationships with nominees
    let bestRelationship = -101;
    let bestNominee = null;
    
    nominees.forEach((nomineeName: string) => {
      // Find the ID for this nominee
      const nomineeId = nomineeName.toLowerCase().replace(/\s/g, '-');
      
      const relationshipScore = relationshipSystem.getEffectiveRelationship(povHolderId, nomineeId);
      if (relationshipScore > bestRelationship) {
        bestRelationship = relationshipScore;
        bestNominee = nomineeName;
      }
    });
    
    // Use veto if there's a nominee with positive relationship
    const useVeto = bestRelationship > 20;
    
    this.logger.info(`Relationship-based veto fallback: ${useVeto ? 'use' : 'don\'t use'}, save ${bestNominee}`);
    
    return {
      useVeto,
      saveNominee: useVeto ? bestNominee : null
    };
  }
  
  /**
   * Generate replacement nomination based on relationship scores
   */
  private getRelationshipAwareReplacement(context: any, hohId: string, relationshipSystem: RelationshipSystem): any {
    const eligible = context.eligible || [];
    if (eligible.length === 0) {
      return this.getReplacementFallback(context);
    }
    
    // Calculate scores for each eligible houseguest
    const scoredHouseguests = eligible.map((name: string) => {
      // Find the ID for this houseguest
      const targetId = name.toLowerCase().replace(/\s/g, '-');
      
      // Get relationship info
      const effectiveScore = relationshipSystem.getEffectiveRelationship(hohId, targetId);
      
      return { name, score: effectiveScore };
    });
    
    // Sort by score (lowest first = most likely to be nominated)
    scoredHouseguests.sort((a, b) => a.score - b.score);
    
    // Pick the one with lowest score
    const replacementNominee = scoredHouseguests[0]?.name;
    
    this.logger.info(`Relationship-based replacement fallback: ${replacementNominee}`);
    
    return {
      replacementNominee
    };
  }
  
  /**
   * Generate eviction vote based on relationship scores
   */
  private getRelationshipAwareEvictionVote(context: any, voterId: string, relationshipSystem: RelationshipSystem): any {
    const nominees = context.nominees || [];
    if (nominees.length !== 2) {
      return this.getEvictionVoteFallback(context);
    }
    
    // Get relationships with both nominees
    const nominee1Id = nominees[0].toLowerCase().replace(/\s/g, '-');
    const nominee2Id = nominees[1].toLowerCase().replace(/\s/g, '-');
    
    const rel1 = relationshipSystem.getEffectiveRelationship(voterId, nominee1Id);
    const rel2 = relationshipSystem.getEffectiveRelationship(voterId, nominee2Id);
    
    // Vote to evict the one with lower relationship score
    const voteToEvict = rel1 < rel2 ? nominees[0] : nominees[1];
    
    this.logger.info(`Relationship-based eviction vote fallback: evict ${voteToEvict}`);
    
    return {
      voteToEvict
    };
  }

  /**
   * Basic nomination fallback (random)
   */
  private getNominationFallback(context: any): any {
    const eligible = context.eligible || [];
    if (eligible.length < 2) {
      return { nominee1: null, nominee2: null };
    }
    
    // Shuffle array
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    
    return {
      nominee1: shuffled[0],
      nominee2: shuffled[1]
    };
  }

  /**
   * Generate veto decision based on relationship scores
   */
  private getVetoFallback(context: any): any {
    const isNominated = context.isNominated || false;
    return {
      useVeto: isNominated, // Use veto if nominated, otherwise 50% chance
      saveNominee: isNominated ? context.povHolderName || "self" : null
    };
  }
  
  /**
   * Generate replacement nomination based on relationship scores
   */
  private getReplacementFallback(context: any): any {
    const eligible = context.eligible || [];
    if (eligible.length === 0) {
      return { replacementNominee: null };
    }
    
    // Pick random eligible houseguest
    const randomIndex = Math.floor(Math.random() * eligible.length);
    
    return {
      replacementNominee: eligible[randomIndex]
    };
  }
  
  /**
   * Generate eviction vote based on relationship scores
   */
  private getEvictionVoteFallback(context: any): any {
    const nominees = context.nominees || [];
    if (nominees.length === 0) {
      return { voteToEvict: null };
    }
    
    // Pick random nominee
    const randomIndex = Math.floor(Math.random() * nominees.length);
    
    return {
      voteToEvict: nominees[randomIndex]
    };
  }
  
  /**
   * Generate jury vote based on relationship scores
   */
  private getJuryVoteFallback(context: any): any {
    const finalists = context.finalists || [];
    if (finalists.length === 0) {
      return { voteForWinner: null };
    }
    
    // Pick random finalist
    const randomIndex = Math.floor(Math.random() * finalists.length);
    
    return {
      voteForWinner: finalists[randomIndex]
    };
  }
  
  /**
   * Generate dialogue response based on relationship scores
   */
  private getDialogueFallback(context: any): any {
    const tones = ['friendly', 'strategic', 'cautious', 'neutral'];
    const randomTone = tones[Math.floor(Math.random() * tones.length)];
    
    return {
      response: "I see what you're saying. Let me think about that.",
      tone: randomTone,
      thoughts: "I should be careful about what I reveal."
    };
  }
  
  /**
   * Generate alliance proposal based on relationship scores
   */
  private getAllianceProposalFallback(context: any): any {
    // 30% chance to propose alliance
    const propose = Math.random() < 0.3;
    
    if (propose && context.eligibleNames && context.eligibleNames.length > 0) {
      // Select 1-3 random members
      const shuffled = [...context.eligibleNames].sort(() => 0.5 - Math.random());
      const memberCount = Math.min(3, Math.floor(Math.random() * 3) + 1);
      const members = shuffled.slice(0, memberCount);
      
      const allianceNames = ["Power Players", "Final Alliance", "Secret Six", "The Outsiders", "Dream Team"];
      const randomName = allianceNames[Math.floor(Math.random() * allianceNames.length)];
      
      return {
        propose: true,
        allianceName: randomName,
        targetMemberNames: members
      };
    }
    
    return {
      propose: false,
      allianceName: null,
      targetMemberNames: null
    };
  }
  
  /**
   * Generate alliance response based on relationship scores
   */
  private getAllianceResponseFallback(context: any): any {
    // 60% chance to accept alliance
    const accept = Math.random() < 0.6;
    
    return {
      accept
    };
  }
  
  /**
   * Generate random decision based on relationship scores
   */
  private getRandomDecision(context: any): any {
    // Generic random decision for unknown types
    return {
      success: true,
      randomChoice: Math.floor(Math.random() * 3)
    };
  }
  
  /**
   * Describe relationship score as text
   */
  describeRelationship(score: number): string {
    if (score >= 75) return "Loyal Ally";
    if (score >= 50) return "Close Friend";
    if (score >= 25) return "Friend";
    if (score >= 10) return "Friendly";
    if (score >= -10) return "Neutral";
    if (score >= -25) return "Unfriendly";
    if (score >= -50) return "Dislike";
    if (score >= -75) return "Enemy";
    return "Bitter Rival";
  }
}
