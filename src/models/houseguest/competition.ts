
/**
 * @file models/houseguest/competition.ts
 * @description Functions related to houseguest competition performance
 */

import { Houseguest } from './model';
import { CompetitionType } from './types';

/**
 * Calculate advantage in competitions based on houseguest stats
 */
export function calculateCompetitionAdvantage(
  houseguest: Houseguest, 
  competitionType: CompetitionType
): number {
  const { stats } = houseguest;
  let advantage = stats[competitionType];
  
  // Add a small boost from competition stat
  advantage += stats.competition * 0.2;
  
  // Add random factor (luck)
  advantage += stats.luck * Math.random() * 0.3;
  
  return advantage;
}
