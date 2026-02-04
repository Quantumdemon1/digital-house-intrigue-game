/**
 * @file src/systems/ai/npc-decision-engine.ts
 * @description Core decision-making system for NPC houseguests with multi-factor weighting
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { RelationshipSystem } from '../relationship-system';
import { config } from '@/config';

/**
 * All factors considered when making a decision about another houseguest
 */
export interface DecisionFactors {
  relationship: number;        // -100 to 100 (base relationship score)
  threatLevel: number;         // 0 to 100 (competition/social threat)
  allianceLoyalty: number;     // 0 to 100 (shared alliance membership)
  reciprocity: number;         // -1 to 1 (balance of relationship)
  recentEvents: number;        // -50 to 50 (recent positive/negative events)
  personalityBias: number;     // -20 to 20 (trait-based modifier)
  strategicValue: number;      // 0 to 100 (how useful is this person)
  promiseObligations: number;  // -30 to 30 (active promise effects)
}

/**
 * Trait-specific weight modifiers for decision making
 */
export interface TraitWeights {
  threatWeight: number;
  loyaltyWeight: number;
  relationshipWeight: number;
  promiseWeight: number;
  strategicWeight: number;
}

/**
 * Calculate trait-specific decision weights
 */
export function getTraitWeights(traits: string[]): TraitWeights {
  // Default weights from config
  let weights: TraitWeights = {
    threatWeight: config.NPC_THREAT_WEIGHT,
    loyaltyWeight: config.NPC_LOYALTY_WEIGHT,
    relationshipWeight: config.NPC_RELATIONSHIP_WEIGHT,
    promiseWeight: config.NPC_PROMISE_WEIGHT,
    strategicWeight: config.NPC_PERSONALITY_WEIGHT,
  };

  // Adjust weights based on personality traits
  traits.forEach(trait => {
    switch (trait) {
      case 'Strategic':
        weights.threatWeight += 0.15;
        weights.relationshipWeight -= 0.1;
        weights.strategicWeight += 0.1;
        break;
      case 'Loyal':
        weights.loyaltyWeight += 0.2;
        weights.promiseWeight += 0.15;
        weights.threatWeight -= 0.1;
        break;
      case 'Competitive':
        weights.threatWeight += 0.1;
        weights.strategicWeight += 0.05;
        break;
      case 'Emotional':
        weights.relationshipWeight += 0.2;
        weights.threatWeight -= 0.15;
        break;
      case 'Sneaky':
        weights.loyaltyWeight -= 0.15;
        weights.strategicWeight += 0.15;
        weights.promiseWeight -= 0.1;
        break;
      case 'Confrontational':
        weights.relationshipWeight += 0.1;
        weights.loyaltyWeight -= 0.1;
        break;
      case 'Paranoid':
        weights.threatWeight += 0.2;
        weights.loyaltyWeight -= 0.15;
        break;
      case 'Floater':
        weights.threatWeight -= 0.1;
        weights.loyaltyWeight -= 0.1;
        weights.relationshipWeight += 0.1;
        break;
      case 'Analytical':
        weights.threatWeight += 0.1;
        weights.strategicWeight += 0.1;
        weights.relationshipWeight -= 0.1;
        break;
    }
  });

  // Normalize weights to sum to 1.0
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (total > 0) {
    weights.threatWeight /= total;
    weights.loyaltyWeight /= total;
    weights.relationshipWeight /= total;
    weights.promiseWeight /= total;
    weights.strategicWeight /= total;
  }

  return weights;
}

/**
 * Calculate the alliance loyalty score between two houseguests
 */
export function calculateAllianceLoyalty(
  evaluatorId: string,
  targetId: string,
  game: BigBrotherGame
): number {
  if (!game.allianceSystem) return 0;

  const alliances = game.allianceSystem.getAlliances?.() || [];
  let loyaltyScore = 0;

  alliances.forEach((alliance: any) => {
    const evaluatorInAlliance = alliance.members.includes(evaluatorId);
    const targetInAlliance = alliance.members.includes(targetId);

    if (evaluatorInAlliance && targetInAlliance) {
      // Both in same alliance - high loyalty
      const allianceStrength = Math.min(alliance.members.length * 10, 50);
      loyaltyScore += allianceStrength;
      
      // Bonus for smaller, tighter alliances
      if (alliance.members.length <= 3) {
        loyaltyScore += 20;
      }
    }
  });

  return Math.min(100, loyaltyScore);
}

/**
 * Calculate promise obligations between two houseguests
 */
export function calculatePromiseObligations(
  evaluatorId: string,
  targetId: string,
  game: BigBrotherGame
): number {
  const promises = game.promises || [];
  let obligationScore = 0;

  promises.forEach(promise => {
    const isPromiser = promise.fromId === evaluatorId;
    const isPromisee = promise.toId === evaluatorId;
    const involvesTarget = promise.fromId === targetId || promise.toId === targetId;

    if (!involvesTarget) return;

    if (promise.status === 'pending' || promise.status === 'active') {
      if (isPromiser) {
        // I made a promise to this person - strong obligation
        switch (promise.type) {
          case 'safety':
            obligationScore += 30;
            break;
          case 'vote':
            obligationScore += 20;
            break;
          case 'alliance_loyalty':
            obligationScore += 15;
            break;
          default:
            obligationScore += 10;
        }
      } else if (isPromisee) {
        // They made a promise to me - mild positive
        obligationScore += 10;
      }
    } else if (promise.status === 'broken') {
      if (promise.fromId === targetId) {
        // They broke a promise to me - negative
        obligationScore -= 25;
      }
    }
  });

  return Math.max(-30, Math.min(30, obligationScore));
}

/**
 * Calculate strategic value of keeping someone in the game
 */
export function calculateStrategicValue(
  evaluator: Houseguest,
  target: Houseguest,
  game: BigBrotherGame
): number {
  let value = 50; // Base neutral value

  // Shield value - if target is a bigger threat than me
  const evaluatorWins = (evaluator.competitionsWon?.hoh || 0) + (evaluator.competitionsWon?.pov || 0);
  const targetWins = (target.competitionsWon?.hoh || 0) + (target.competitionsWon?.pov || 0);
  
  if (targetWins > evaluatorWins) {
    value += 15; // They're a bigger target than me
  }

  // Number value - less people means I'm closer to danger
  const activeHouseguests = game.getActiveHouseguests().length;
  if (activeHouseguests <= 6) {
    // Late game - keep people who will take me to final 2
    // This is approximated by relationship
  }

  // Competition stat check - can they help me win?
  if (target.stats.competition >= 7) {
    value += 10; // Strong competitor might protect me
  }

  // Social stat check - are they a social threat?
  if (target.stats.social >= 8) {
    value -= 10; // Could beat me in jury vote
  }

  return Math.max(0, Math.min(100, value));
}

/**
 * Calculate personality-based bias toward another houseguest
 */
export function calculatePersonalityBias(
  evaluator: Houseguest,
  target: Houseguest
): number {
  let bias = 0;

  // Similar traits create slight positive bias
  const sharedTraits = evaluator.traits.filter(t => target.traits.includes(t as any));
  bias += sharedTraits.length * 5;

  // Opposing traits create slight negative bias
  const opposingPairs = [
    ['Loyal', 'Sneaky'],
    ['Confrontational', 'Floater'],
    ['Strategic', 'Emotional'],
    ['Competitive', 'Social'],
  ] as const;

  opposingPairs.forEach(([trait1, trait2]) => {
    if (
      (evaluator.traits.includes(trait1 as any) && target.traits.includes(trait2 as any)) ||
      (evaluator.traits.includes(trait2 as any) && target.traits.includes(trait1 as any))
    ) {
      bias -= 5;
    }
  });

  return Math.max(-20, Math.min(20, bias));
}

/**
 * Get all decision factors for evaluating another houseguest
 */
export function getDecisionFactors(
  evaluator: Houseguest,
  target: Houseguest,
  game: BigBrotherGame,
  relationshipSystem: RelationshipSystem | null,
  threatAssessment: (e: Houseguest, t: Houseguest, g: BigBrotherGame) => number
): DecisionFactors {
  const relationship = relationshipSystem?.getRelationship(evaluator.id, target.id) ?? 0;
  const reciprocity = relationshipSystem?.calculateReciprocityModifier(target.id, evaluator.id) ?? 0;

  return {
    relationship,
    threatLevel: threatAssessment(evaluator, target, game),
    allianceLoyalty: calculateAllianceLoyalty(evaluator.id, target.id, game),
    reciprocity,
    recentEvents: 0, // Will be calculated from memory system
    personalityBias: calculatePersonalityBias(evaluator, target),
    strategicValue: calculateStrategicValue(evaluator, target, game),
    promiseObligations: calculatePromiseObligations(evaluator.id, target.id, game),
  };
}

/**
 * Calculate a weighted decision score for another houseguest
 * Positive score = prefer to keep them / work with them
 * Negative score = prefer to target them / vote against them
 */
export function calculateDecisionScore(
  factors: DecisionFactors,
  weights: TraitWeights
): number {
  let score = 0;

  // Relationship (positive = like them)
  score += factors.relationship * weights.relationshipWeight;

  // Threat level (higher threat = more negative)
  score -= factors.threatLevel * weights.threatWeight;

  // Alliance loyalty (higher = want to keep)
  score += factors.allianceLoyalty * weights.loyaltyWeight;

  // Promise obligations (positive = should protect)
  score += factors.promiseObligations * weights.promiseWeight;

  // Strategic value (higher = want to keep)
  score += factors.strategicValue * weights.strategicWeight * 0.5;

  // Personality bias (minor influence)
  score += factors.personalityBias;

  // Reciprocity adjustment (if they don't like us back, reduce positive feelings)
  if (factors.relationship > 0 && factors.reciprocity < -0.3) {
    score *= (1 + factors.reciprocity * 0.5); // Reduce positive feelings
  }

  return score;
}

/**
 * Rank houseguests by decision score (for nominations, targeting, etc.)
 * Lower scores = more likely to target
 */
export function rankHouseguestsByScore(
  evaluator: Houseguest,
  targets: Houseguest[],
  game: BigBrotherGame,
  relationshipSystem: RelationshipSystem | null,
  threatAssessment: (e: Houseguest, t: Houseguest, g: BigBrotherGame) => number
): { houseguest: Houseguest; score: number }[] {
  const weights = getTraitWeights(evaluator.traits);

  const ranked = targets.map(target => {
    const factors = getDecisionFactors(evaluator, target, game, relationshipSystem, threatAssessment);
    const score = calculateDecisionScore(factors, weights);
    return { houseguest: target, score };
  });

  // Sort by score ascending (lowest = most likely to target)
  ranked.sort((a, b) => a.score - b.score);

  return ranked;
}
