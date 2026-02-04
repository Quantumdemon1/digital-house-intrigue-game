/**
 * @file src/systems/competition/competition-runner.ts
 * @description Runs competitions using BB USA format with weighted stats
 */

import type { Houseguest, HouseguestStats } from '@/models/houseguest';
import type { 
  BBCompetitionCategory, 
  Competition, 
  CompetitionResult 
} from '@/models/competition';
import { COMPETITION_WEIGHTS, getRandomCompetitionName } from '@/models/competition';
import { v4 as uuidv4 } from 'uuid';
import { getClutchBonus } from '@/utils/stat-checks';

export interface CompetitionRunnerOptions {
  category?: BBCompetitionCategory;
  type: 'HoH' | 'PoV' | 'FinalHoH1' | 'FinalHoH2' | 'FinalHoH3';
  week: number;
  participants: Houseguest[];
  nominees?: string[]; // IDs of nominated houseguests for clutch bonus calculation
}

/**
 * Calculate a houseguest's competition score based on category weights
 * @param stats The houseguest's stats
 * @param category The competition category
 * @param isNominated Whether this houseguest is currently nominated (for clutch bonus)
 */
function calculateScore(
  stats: HouseguestStats, 
  category: BBCompetitionCategory,
  isNominated: boolean = false
): number {
  const weights = COMPETITION_WEIGHTS[category];
  
  // Base score from weighted stats
  const baseScore = 
    (stats.physical * weights.physical) +
    (stats.mental * weights.mental) +
    (stats.endurance * weights.endurance) +
    (stats.social * weights.social) +
    (stats.luck * weights.luck);
  
  // Add randomness factor (±25%)
  const randomFactor = 0.75 + (Math.random() * 0.5);
  
  // Additional luck modifier for Crapshoot comps
  const luckBonus = category === 'Crapshoot' ? (Math.random() * 3) : 0;
  
  // Clutch bonus for nominated houseguests (Competition stat)
  const clutchBonus = getClutchBonus(stats.competition, isNominated);
  
  return (baseScore * randomFactor) + luckBonus + clutchBonus;
}

/**
 * Run a competition and return results
 */
export function runCompetition(options: CompetitionRunnerOptions): Competition {
  const { type, week, participants, nominees = [] } = options;
  
  // Select category if not specified
  const category = options.category || selectCategoryForType(type);
  const competitionName = getRandomCompetitionName(category);
  
  // Calculate scores for each participant, applying clutch bonus to nominated houseguests
  const scoredResults: { houseguest: Houseguest; score: number; hadClutchBonus: boolean }[] = participants.map(hg => {
    const isNominated = nominees.includes(hg.id);
    return {
      houseguest: hg,
      score: calculateScore(hg.stats, category, isNominated),
      hadClutchBonus: isNominated && hg.stats.competition > 0
    };
  });
  
  // Sort by score descending
  scoredResults.sort((a, b) => b.score - a.score);
  
  // Create placement results
  const results: CompetitionResult[] = scoredResults.map((result, index) => ({
    houseguestId: result.houseguest.id,
    placement: index + 1,
    score: result.score
  }));
  
  const winner = scoredResults[0].houseguest;
  
  // Log clutch bonus if winner was nominated
  const winnerResult = scoredResults[0];
  if (winnerResult.hadClutchBonus) {
    console.log(`🔥 Clutch performance! ${winner.name} won while on the block (Competition stat: ${winner.stats.competition})`);
  }
  
  return {
    id: uuidv4(),
    name: competitionName,
    category,
    description: `${competitionName} - ${getCategoryDescription(category)}`,
    week,
    type,
    participants: participants.map(p => p.id),
    results,
    winnerId: winner.id,
    isComplete: true
  };
}

/**
 * Run an endurance competition with elimination order
 */
export function runEnduranceCompetition(options: CompetitionRunnerOptions): Competition {
  const { type, week, participants } = options;
  const category: BBCompetitionCategory = 'Endurance';
  const competitionName = getRandomCompetitionName(category);
  
  // For endurance, use weighted random elimination
  const remaining = [...participants];
  const eliminationOrder: { houseguest: Houseguest; time: number }[] = [];
  let time = 0;
  
  while (remaining.length > 1) {
    time += 10 + Math.random() * 20; // Random time increment
    
    // Calculate survival chances based on endurance stat
    const survivalChances = remaining.map(hg => {
      const enduranceScore = hg.stats.endurance + (hg.stats.physical * 0.3);
      return {
        houseguest: hg,
        survivalChance: enduranceScore * (0.5 + Math.random() * 0.5)
      };
    });
    
    // Find the houseguest with lowest survival chance
    survivalChances.sort((a, b) => a.survivalChance - b.survivalChance);
    const eliminated = survivalChances[0].houseguest;
    
    eliminationOrder.push({ houseguest: eliminated, time });
    remaining.splice(remaining.indexOf(eliminated), 1);
  }
  
  // Winner is the last one standing
  const winner = remaining[0];
  
  // Create results with elimination times
  const results: CompetitionResult[] = [
    {
      houseguestId: winner.id,
      placement: 1,
      score: time + 10,
      eliminated: false
    },
    ...eliminationOrder.reverse().map((elim, index) => ({
      houseguestId: elim.houseguest.id,
      placement: index + 2,
      score: elim.time,
      eliminated: true,
      eliminatedAt: elim.time
    }))
  ];
  
  return {
    id: uuidv4(),
    name: competitionName,
    category,
    description: `${competitionName} - Last one standing wins!`,
    week,
    type,
    participants: participants.map(p => p.id),
    results,
    winnerId: winner.id,
    isComplete: true
  };
}

/**
 * Select appropriate category based on competition type
 */
function selectCategoryForType(type: string): BBCompetitionCategory {
  switch (type) {
    case 'FinalHoH1':
      return 'Endurance';
    case 'FinalHoH2':
      return 'Skill';
    case 'FinalHoH3':
      return 'Mental';
    default:
      // Random selection with weighted distribution
      const roll = Math.random();
      if (roll < 0.25) return 'Endurance';
      if (roll < 0.45) return 'Physical';
      if (roll < 0.65) return 'Mental';
      if (roll < 0.85) return 'Skill';
      return 'Crapshoot';
  }
}

/**
 * Get user-friendly category description
 */
function getCategoryDescription(category: BBCompetitionCategory): string {
  switch (category) {
    case 'Endurance':
      return 'Outlast the competition in this test of willpower!';
    case 'Physical':
      return 'Strength and agility will determine the winner!';
    case 'Mental':
      return 'Use your brain to solve puzzles and answer questions!';
    case 'Skill':
      return 'Precision and focus are key to victory!';
    case 'Crapshoot':
      return 'Anyone can win this game of chance!';
  }
}
