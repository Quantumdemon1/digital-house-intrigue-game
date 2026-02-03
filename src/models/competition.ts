/**
 * @file src/models/competition.ts
 * @description Competition types and interfaces for Big Brother USA format
 */

// BB USA Competition Categories
export type BBCompetitionCategory = 
  | 'Endurance'   // Long-lasting physical challenges (wall comp, hanging)
  | 'Physical'    // Strength/agility-based (running, climbing)
  | 'Mental'      // Puzzles, memory, quizzes
  | 'Skill'       // Precision tasks (stacking, throwing)
  | 'Crapshoot';  // Luck-based (spinning wheel, dice)

// Competition context determines stat weighting
export interface CompetitionWeights {
  physical: number;
  mental: number;
  endurance: number;
  social: number;
  luck: number;
}

// Define weights for each competition category
export const COMPETITION_WEIGHTS: Record<BBCompetitionCategory, CompetitionWeights> = {
  'Endurance': {
    physical: 0.3,
    mental: 0.1,
    endurance: 0.5,
    social: 0.0,
    luck: 0.1
  },
  'Physical': {
    physical: 0.5,
    mental: 0.1,
    endurance: 0.2,
    social: 0.0,
    luck: 0.2
  },
  'Mental': {
    physical: 0.0,
    mental: 0.6,
    endurance: 0.1,
    social: 0.1,
    luck: 0.2
  },
  'Skill': {
    physical: 0.3,
    mental: 0.3,
    endurance: 0.1,
    social: 0.0,
    luck: 0.3
  },
  'Crapshoot': {
    physical: 0.0,
    mental: 0.1,
    endurance: 0.0,
    social: 0.0,
    luck: 0.9
  }
};

// Competition result with placement
export interface CompetitionResult {
  houseguestId: string;
  placement: number;
  score: number;
  eliminated?: boolean;
  eliminatedAt?: number; // For endurance comps - time when eliminated
}

// Full competition interface
export interface Competition {
  id: string;
  name: string;
  category: BBCompetitionCategory;
  description: string;
  week: number;
  type: 'HoH' | 'PoV' | 'FinalHoH1' | 'FinalHoH2' | 'FinalHoH3';
  participants: string[];
  results: CompetitionResult[];
  winnerId?: string;
  isComplete: boolean;
}

// Competition names by category for flavor
export const COMPETITION_NAMES: Record<BBCompetitionCategory, string[]> = {
  'Endurance': [
    'Wall of Champions',
    'Pressure Cooker',
    'Hang in There',
    'Slip & Slide',
    'Swinging in the Rain'
  ],
  'Physical': [
    'Ready, Set, Whoa!',
    'Big Brother Knockout',
    'Counting Sheep',
    'Berry Bold',
    'Bowled Over'
  ],
  'Mental': [
    'Before or After',
    'Spelling Bee',
    'What the Bleep?',
    'Majority Rules',
    'Face the Facts'
  ],
  'Skill': [
    'Egg Head',
    'Chicken Wire',
    'BB Golf',
    'Ricochets',
    'Putt Putt'
  ],
  'Crapshoot': [
    'Big Brother Roulette',
    'Lucky Lottery',
    'Spin Cycle',
    'Roll the Dice',
    'Wheel of Fortune'
  ]
};

// Get random competition name
export function getRandomCompetitionName(category: BBCompetitionCategory): string {
  const names = COMPETITION_NAMES[category];
  return names[Math.floor(Math.random() * names.length)];
}

// Get random competition category
export function getRandomCompetitionCategory(): BBCompetitionCategory {
  const categories: BBCompetitionCategory[] = ['Endurance', 'Physical', 'Mental', 'Skill', 'Crapshoot'];
  return categories[Math.floor(Math.random() * categories.length)];
}

// Final HoH Part descriptions
export const FINAL_HOH_DESCRIPTIONS = {
  part1: {
    name: 'Endurance Challenge',
    category: 'Endurance' as BBCompetitionCategory,
    description: 'All three houseguests compete in an endurance challenge. The winner advances directly to Part 3, while the other two face off in Part 2.'
  },
  part2: {
    name: 'Skill Challenge', 
    category: 'Skill' as BBCompetitionCategory,
    description: 'The two losers from Part 1 compete in a skill/memory challenge. The winner advances to Part 3 to face the Part 1 winner.'
  },
  part3: {
    name: 'Jury Questions',
    category: 'Mental' as BBCompetitionCategory,
    description: 'The winners of Parts 1 and 2 answer questions about the jury members. The winner becomes the Final HoH and chooses who to take to the Final 2.'
  }
};
