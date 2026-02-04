/**
 * @file src/systems/ai/threat-assessment.ts
 * @description Evaluates competition and social threats for NPCs
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { RelationshipSystem } from '../relationship-system';

/**
 * Threat assessment breakdown for debugging/display
 */
export interface ThreatBreakdown {
  competitionThreat: number;  // 0-40: Based on wins
  socialThreat: number;       // 0-30: Based on relationships
  allianceThreat: number;     // 0-20: Based on alliance power
  potentialThreat: number;    // 0-10: Based on stats
  total: number;              // 0-100: Combined threat level
}

/**
 * Calculate competition threat based on wins
 */
function calculateCompetitionThreat(target: Houseguest): number {
  let threat = 0;

  const hohWins = target.competitionsWon?.hoh || 0;
  const povWins = target.competitionsWon?.pov || 0;

  // HoH wins are more threatening (power position)
  threat += hohWins * 8;
  
  // PoV wins show competition ability
  threat += povWins * 6;

  // Cap at 40 points
  return Math.min(40, threat);
}

/**
 * Calculate social threat based on house relationships
 */
function calculateSocialThreat(
  target: Houseguest,
  allHouseguests: Houseguest[],
  relationshipSystem: RelationshipSystem | null
): number {
  if (!relationshipSystem) return 15; // Default middle value

  let totalRelationship = 0;
  let count = 0;

  allHouseguests.forEach(hg => {
    if (hg.id !== target.id && hg.status === 'Active') {
      const rel = relationshipSystem.getRelationship(hg.id, target.id);
      totalRelationship += rel;
      count++;
    }
  });

  if (count === 0) return 15;

  // Average relationship: -100 to 100
  const avgRelationship = totalRelationship / count;

  // Convert to threat: -100 -> 0, 0 -> 15, 100 -> 30
  const threat = Math.max(0, (avgRelationship + 100) * 0.15);

  return Math.min(30, threat);
}

/**
 * Calculate alliance threat based on alliance memberships
 */
function calculateAllianceThreat(
  target: Houseguest,
  game: BigBrotherGame
): number {
  if (!game.allianceSystem) return 0;

  const alliances = game.allianceSystem.getAlliances?.() || [];
  let threat = 0;

  alliances.forEach((alliance: any) => {
    if (alliance.members.includes(target.id)) {
      // More members = more threat (voting bloc)
      threat += alliance.members.length * 4;
    }
  });

  // Cap at 20 points
  return Math.min(20, threat);
}

/**
 * Calculate potential threat based on stats
 */
function calculatePotentialThreat(target: Houseguest): number {
  let threat = 0;

  // Competition stat indicates future win potential
  threat += (target.stats.competition / 10) * 3;

  // Strategic stat indicates dangerous gameplay
  threat += (target.stats.strategic / 10) * 2;

  // High social + strategic = jury threat
  if (target.stats.social >= 7 && target.stats.strategic >= 7) {
    threat += 2;
  }

  // Cap at 10 points
  return Math.min(10, threat);
}

/**
 * Get a detailed breakdown of threat assessment
 */
export function getThreatBreakdown(
  evaluator: Houseguest,
  target: Houseguest,
  game: BigBrotherGame,
  relationshipSystem?: RelationshipSystem | null
): ThreatBreakdown {
  const competitionThreat = calculateCompetitionThreat(target);
  const socialThreat = calculateSocialThreat(
    target,
    game.houseguests.filter(h => h.status === 'Active'),
    relationshipSystem ?? null
  );
  const allianceThreat = calculateAllianceThreat(target, game);
  const potentialThreat = calculatePotentialThreat(target);

  const total = Math.min(100, competitionThreat + socialThreat + allianceThreat + potentialThreat);

  return {
    competitionThreat,
    socialThreat,
    allianceThreat,
    potentialThreat,
    total,
  };
}

/**
 * Calculate the overall threat level of a target houseguest
 * Returns 0-100 where higher = more threatening
 */
export function calculateThreatLevel(
  evaluator: Houseguest,
  target: Houseguest,
  game: BigBrotherGame,
  relationshipSystem?: RelationshipSystem | null
): number {
  const breakdown = getThreatBreakdown(evaluator, target, game, relationshipSystem);
  return breakdown.total;
}

/**
 * Get all houseguests ranked by threat level
 */
export function rankByThreat(
  evaluator: Houseguest,
  game: BigBrotherGame,
  relationshipSystem?: RelationshipSystem | null
): { houseguest: Houseguest; threat: number; breakdown: ThreatBreakdown }[] {
  const activeHouseguests = game.houseguests.filter(
    h => h.status === 'Active' && h.id !== evaluator.id
  );

  const ranked = activeHouseguests.map(target => {
    const breakdown = getThreatBreakdown(evaluator, target, game, relationshipSystem);
    return {
      houseguest: target,
      threat: breakdown.total,
      breakdown,
    };
  });

  // Sort by threat descending (highest threat first)
  ranked.sort((a, b) => b.threat - a.threat);

  return ranked;
}

/**
 * Determine if a houseguest should be considered a "major threat"
 */
export function isMajorThreat(
  evaluator: Houseguest,
  target: Houseguest,
  game: BigBrotherGame,
  relationshipSystem?: RelationshipSystem | null
): boolean {
  const threat = calculateThreatLevel(evaluator, target, game, relationshipSystem);
  
  // Consider major threat if above 50 or has 2+ HoH wins
  const hohWins = target.competitionsWon?.hoh || 0;
  
  return threat >= 50 || hohWins >= 2;
}

/**
 * Get threat description for display
 */
export function getThreatDescription(threatLevel: number): string {
  if (threatLevel >= 80) return "Extreme Threat";
  if (threatLevel >= 60) return "High Threat";
  if (threatLevel >= 40) return "Moderate Threat";
  if (threatLevel >= 20) return "Low Threat";
  return "Minimal Threat";
}

/**
 * Simplified threat calculation for use in decision engine
 * This is the main export used by the decision engine
 */
export function assessThreat(
  evaluator: Houseguest,
  target: Houseguest,
  game: BigBrotherGame
): number {
  // Use relationship system from game if available
  const relationshipSystem = game.relationshipSystem as RelationshipSystem | null;
  return calculateThreatLevel(evaluator, target, game, relationshipSystem);
}
