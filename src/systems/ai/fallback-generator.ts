/**
 * @file src/systems/ai/fallback-generator.ts
 * @description Provides fallback decisions when AI API calls fail
 * Enhanced with multi-factor NPC intelligence system
 */

import type { Logger } from '@/utils/logger';
import type { RelationshipSystem } from '../relationship-system';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Houseguest } from '@/models/houseguest';
import { 
  rankHouseguestsByScore, 
  getDecisionFactors, 
  calculateDecisionScore, 
  getTraitWeights,
  calculatePromiseObligations,
  calculateAllianceLoyalty
} from './npc-decision-engine';
import { assessThreat, isMajorThreat } from './threat-assessment';

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
      case 'jury_vote':
        return this.getEnhancedJuryVote(context, houseguestId, relationshipSystem);
      default:
        // If no special relationship-aware handler, use the base fallback
        return this.getFallbackDecision(decisionType, context);
    }
  }

  /**
   * Enhanced fallback using full NPC intelligence system
   */
  getIntelligentFallbackDecision(
    decisionType: string,
    context: any,
    houseguest: Houseguest,
    game: BigBrotherGame
  ): any {
    this.logger.info(`Using intelligent fallback for ${decisionType}`);
    
    const relationshipSystem = game.relationshipSystem as RelationshipSystem | null;
    
    switch (decisionType) {
      case 'nomination':
        return this.getIntelligentNominations(context, houseguest, game);
      case 'eviction_vote':
        return this.getIntelligentEvictionVote(context, houseguest, game);
      case 'jury_vote':
        return this.getIntelligentJuryVote(context, houseguest, game);
      default:
        // Fall back to relationship-aware if we have a relationship system
        if (relationshipSystem) {
          return this.getRelationshipAwareFallbackDecision(
            decisionType, 
            context, 
            houseguest.id, 
            relationshipSystem
          );
        }
        return this.getFallbackDecision(decisionType, context);
    }
  }

  /**
   * Intelligent nominations using full decision engine
   */
  private getIntelligentNominations(
    context: any, 
    hoh: Houseguest, 
    game: BigBrotherGame
  ): any {
    const eligible = context.eligible || [];
    if (eligible.length < 2) {
      return this.getNominationFallback(context);
    }

    // Get houseguest objects for eligible nominees
    const eligibleHouseguests = game.houseguests.filter(
      h => eligible.includes(h.name) && h.status === 'Active'
    );

    if (eligibleHouseguests.length < 2) {
      return this.getNominationFallback(context);
    }

    // Rank using full decision engine
    const relationshipSystem = game.relationshipSystem as RelationshipSystem | null;
    const ranked = rankHouseguestsByScore(
      hoh,
      eligibleHouseguests,
      game,
      relationshipSystem,
      assessThreat
    );

    // Pick the two with lowest scores (most likely to target)
    const nominee1 = ranked[0]?.houseguest.name;
    const nominee2 = ranked[1]?.houseguest.name;

    this.logger.info(`Intelligent nomination fallback: ${nominee1} and ${nominee2}`);
    
    return { nominee1, nominee2 };
  }

  /**
   * Intelligent eviction vote using full decision engine
   */
  private getIntelligentEvictionVote(
    context: any,
    voter: Houseguest,
    game: BigBrotherGame
  ): any {
    const nomineeNames = context.nominees || [];
    if (nomineeNames.length !== 2) {
      return this.getEvictionVoteFallback(context);
    }

    // Get houseguest objects for nominees
    const nominees = game.houseguests.filter(
      h => nomineeNames.includes(h.name)
    );

    if (nominees.length !== 2) {
      return this.getEvictionVoteFallback(context);
    }

    const relationshipSystem = game.relationshipSystem as RelationshipSystem | null;
    const weights = getTraitWeights(voter.traits);

    // Calculate scores for both nominees
    const scores = nominees.map(nominee => {
      const factors = getDecisionFactors(voter, nominee, game, relationshipSystem, assessThreat);
      return {
        nominee,
        score: calculateDecisionScore(factors, weights)
      };
    });

    // Vote to evict the one with LOWER score
    scores.sort((a, b) => a.score - b.score);
    const voteToEvict = scores[0].nominee.name;

    this.logger.info(`Intelligent eviction vote: evict ${voteToEvict}`);
    
    return { voteToEvict };
  }

  /**
   * Intelligent jury vote considering gameplay respect
   */
  private getIntelligentJuryVote(
    context: any,
    juror: Houseguest,
    game: BigBrotherGame
  ): any {
    const finalistNames = context.finalists || [];
    if (finalistNames.length < 2) {
      return this.getJuryVoteFallback(context);
    }

    const finalists = game.houseguests.filter(
      h => finalistNames.includes(h.name)
    );

    if (finalists.length < 2) {
      return this.getJuryVoteFallback(context);
    }

    const relationshipSystem = game.relationshipSystem as RelationshipSystem | null;

    // Calculate jury vote scores
    const scores = finalists.map(finalist => {
      const score = this.calculateJuryScore(juror, finalist, game, relationshipSystem);
      return { finalist, score };
    });

    // Vote for the finalist with HIGHER score
    scores.sort((a, b) => b.score - a.score);
    const voteForWinner = scores[0].finalist.name;

    this.logger.info(`Intelligent jury vote: vote for ${voteForWinner}`);
    
    return { voteForWinner };
  }

  /**
   * Calculate comprehensive jury vote score
   */
  private calculateJuryScore(
    juror: Houseguest,
    finalist: Houseguest,
    game: BigBrotherGame,
    relationshipSystem: RelationshipSystem | null
  ): number {
    let score = 0;

    // Personal relationship (30% weight)
    const relationship = relationshipSystem?.getRelationship(juror.id, finalist.id) ?? 0;
    score += relationship * 0.3;

    // Gameplay respect (40% weight)
    const gameplayRespect = this.calculateGameplayRespect(finalist, game);
    score += gameplayRespect * 0.4;

    // Alliance loyalty (15% weight)
    const allianceLoyalty = calculateAllianceLoyalty(juror.id, finalist.id, game);
    score += allianceLoyalty * 0.15;

    // Promise obligations (15% weight)
    const promiseScore = calculatePromiseObligations(juror.id, finalist.id, game);
    score += (promiseScore + 30) * 0.15; // Normalize -30 to 30 -> 0 to 60

    return score;
  }

  /**
   * Calculate gameplay respect for jury voting
   */
  private calculateGameplayRespect(finalist: Houseguest, game: BigBrotherGame): number {
    let respect = 0;

    // Competition performance
    const hohWins = finalist.competitionsWon?.hoh || 0;
    const povWins = finalist.competitionsWon?.pov || 0;
    respect += hohWins * 8;
    respect += povWins * 6;

    // Survived nominations (resilience)
    const nominationTimes = finalist.nominations?.times || 0;
    respect += nominationTimes * 5;

    // Made it to final (baseline)
    respect += 20;

    // Strategic stat bonus
    respect += finalist.stats.strategic;

    return Math.min(100, respect);
  }

  /**
   * Enhanced jury vote with relationship awareness
   */
  private getEnhancedJuryVote(
    context: any,
    voterId: string,
    relationshipSystem: RelationshipSystem
  ): any {
    const finalists = context.finalists || [];
    if (finalists.length < 2) {
      return this.getJuryVoteFallback(context);
    }

    // Get relationships with finalists
    const scores = finalists.map((finalistName: string) => {
      const finalistId = finalistName.toLowerCase().replace(/\\s/g, '-');
      const relationship = relationshipSystem.getEffectiveRelationship(voterId, finalistId);
      
      // Add some randomness to simulate considering gameplay
      const gameplayBonus = Math.random() * 20;
      
      return {
        name: finalistName,
        score: relationship + gameplayBonus
      };
    });

    // Vote for highest score
    scores.sort((a: any, b: any) => b.score - a.score);
    
    return { voteForWinner: scores[0].name };
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
      const targetId = name.toLowerCase().replace(/\\s/g, '-');
      
      const baseScore = relationshipSystem.getRelationship(hohId, targetId);
      const effectiveScore = relationshipSystem.getEffectiveRelationship(hohId, targetId);
      const reciprocity = relationshipSystem.calculateReciprocityModifier(targetId, hohId);
      
      const nominationScore = effectiveScore + (reciprocity * 20);
      
      return { name, score: nominationScore };
    });
    
    scoredHouseguests.sort((a: any, b: any) => a.score - b.score);
    
    const nominee1 = scoredHouseguests[0]?.name;
    const nominee2 = scoredHouseguests[1]?.name;
    
    this.logger.info(`Relationship-based nomination fallback: ${nominee1} and ${nominee2}`);
    
    return { nominee1, nominee2 };
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
