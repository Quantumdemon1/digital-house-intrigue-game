/**
 * @file src/utils/stat-checks.ts
 * @description Utility functions for stat-based gameplay mechanics
 */

import { HouseguestStats } from '@/models/houseguest';

/**
 * Calculate success chance for an interaction based on player's Social stat vs required stat
 * @param playerSocialStat Player's Social stat (1-10)
 * @param requiredStat Required Social stat for the interaction (1-10)
 * @returns Success percentage (0-100)
 */
export function calculateSuccessChance(playerSocialStat: number, requiredStat: number): number {
  // Base chance at exact requirement is 60%
  const baseChance = 60;
  
  // Each point above/below requirement adjusts by 15%
  const difference = playerSocialStat - requiredStat;
  const adjustedChance = baseChance + (difference * 15);
  
  // Clamp between 10% (never impossible) and 100% (guaranteed)
  return Math.max(10, Math.min(100, adjustedChance));
}

/**
 * Roll a stat check to determine success/failure
 * @param playerStat Player's relevant stat
 * @param requiredStat Required stat for the action
 * @returns Whether the check succeeded
 */
export function rollStatCheck(playerStat: number, requiredStat: number): boolean {
  const successChance = calculateSuccessChance(playerStat, requiredStat);
  const roll = Math.random() * 100;
  return roll < successChance;
}

/**
 * Get success chance category for UI display
 */
export function getSuccessCategory(chance: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (chance >= 85) {
    return { label: 'Very Likely', color: 'text-green-600', bgColor: 'bg-green-100' };
  }
  if (chance >= 65) {
    return { label: 'Likely', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
  }
  if (chance >= 45) {
    return { label: 'Risky', color: 'text-amber-600', bgColor: 'bg-amber-100' };
  }
  if (chance >= 25) {
    return { label: 'Unlikely', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  }
  return { label: 'Desperate', color: 'text-red-600', bgColor: 'bg-red-100' };
}

/**
 * Strategic intel levels based on Strategic stat
 */
export type StrategicIntelLevel = 'none' | 'basic' | 'advanced' | 'expert' | 'master';

/**
 * Get intel level based on Strategic stat
 * @param strategicStat Player's Strategic stat (1-10)
 * @returns Intel tier
 */
export function getStrategicIntelLevel(strategicStat: number): StrategicIntelLevel {
  if (strategicStat >= 9) return 'master';   // See alliance info
  if (strategicStat >= 7) return 'expert';    // See vote predictions
  if (strategicStat >= 5) return 'advanced';  // See target hints
  if (strategicStat >= 3) return 'basic';     // See relationship sentiment
  return 'none';
}

/**
 * Get loyalty multiplier for promise impacts
 * @param loyaltyStat Player's Loyalty stat (1-10)
 * @returns Multiplier for promise relationship impact
 */
export function getLoyaltyMultiplier(loyaltyStat: number): number {
  // Base is 1.0 at Loyalty 5
  // Formula: 1 + (Loyalty - 5) * 0.15
  // Loyalty 1 = 0.4x, Loyalty 5 = 1.0x, Loyalty 10 = 1.75x
  return 1 + (loyaltyStat - 5) * 0.15;
}

/**
 * Get the broken promise penalty multiplier based on Loyalty
 * High loyalty = bigger betrayal impact when you break promises
 * Low loyalty = people expected it, less damage
 */
export function getBrokenPromisePenaltyMultiplier(loyaltyStat: number): number {
  // Loyalty 1 = 0.5x penalty (expected from low loyalty person)
  // Loyalty 5 = 1.0x penalty
  // Loyalty 10 = 2.0x penalty (trusted betrayal hurts more)
  return 0.5 + (loyaltyStat * 0.15);
}

/**
 * Calculate clutch performance bonus for Competition stat when nominated
 * @param competitionStat Player's Competition stat (1-10)
 * @param isNominated Whether the player is currently nominated
 * @returns Bonus points to add to competition score
 */
export function getClutchBonus(competitionStat: number, isNominated: boolean): number {
  if (!isNominated) return 0;
  // 0.5 points per Competition stat point when on the block
  return competitionStat * 0.5;
}

/**
 * Get relationship sentiment label based on score
 */
export function getRelationshipSentiment(score: number): {
  label: string;
  emoji: string;
  color: string;
} {
  if (score >= 50) return { label: 'Likes you', emoji: '💚', color: 'text-green-600' };
  if (score >= 20) return { label: 'Friendly', emoji: '🙂', color: 'text-emerald-500' };
  if (score >= -20) return { label: 'Neutral', emoji: '😐', color: 'text-muted-foreground' };
  if (score >= -50) return { label: 'Wary', emoji: '😒', color: 'text-orange-500' };
  return { label: 'Dislikes you', emoji: '💔', color: 'text-red-600' };
}

/**
 * Calculate failed interaction penalty
 * When an interaction fails, it can backfire
 */
export function getFailedInteractionPenalty(baseChange: number): number {
  // Failed interactions flip positive to negative with reduced magnitude
  if (baseChange > 0) {
    return -Math.ceil(baseChange * 0.5);
  }
  // Already negative changes get worse
  return Math.floor(baseChange * 1.5);
}

/**
 * Check if a stat meets the threshold for an action
 */
export function meetsStatRequirement(playerStat: number, requiredStat: number): boolean {
  return playerStat >= requiredStat;
}

/**
 * Get stat-based descriptions for tooltips
 */
export const STAT_GAMEPLAY_DESCRIPTIONS: Record<keyof Omit<HouseguestStats, 'nominations'>, string> = {
  physical: 'Boosts Physical competition performance. High Physical (6+) enhances intimidation tactics.',
  mental: 'Boosts Mental competition performance and Final HoH Part 2.',
  endurance: 'Boosts Endurance competition performance and Final HoH Part 1.',
  social: 'Affects interaction success rates. Higher Social = better persuasion outcomes.',
  loyalty: 'Amplifies promise impact. High Loyalty = trusted ally; low = flexible player with less betrayal damage.',
  strategic: 'Reveals hidden intel: relationships (3+), targets (5+), votes (7+), alliances (9+).',
  luck: 'Boosts Crapshoot competitions and may influence tiebreakers.',
  competition: 'Provides a clutch bonus (+0.5 per point) when competing while nominated.',
};
