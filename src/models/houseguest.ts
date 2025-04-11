
/**
 * @file models/houseguest.ts
 * @description Definition of a Big Brother houseguest
 */

import { v4 as uuidv4 } from 'uuid';
import { AllianceSystem } from '../systems/alliance-system';

// Houseguest Status
export type HouseguestStatus = 'Active' | 'Evicted' | 'Jury' | 'Winner' | 'Runner-Up';

// Basic types
export type PersonalityTrait = 
  | 'Competitive' | 'Strategic' | 'Loyal' | 'Emotional' | 'Funny'
  | 'Charming' | 'Manipulative' | 'Analytical' | 'Impulsive' | 'Deceptive'
  | 'Social' | 'Introverted' | 'Stubborn' | 'Flexible' | 'Intuitive';

// Stat boost structure for personality traits
export interface StatBoost {
  primary: keyof HouseguestStats;
  secondary: keyof HouseguestStats;
}

// Mapping of traits to their stat boosts
export const TRAIT_STAT_BOOSTS: Record<PersonalityTrait, StatBoost> = {
  'Competitive': { primary: 'physical', secondary: 'endurance' },
  'Strategic': { primary: 'mental', secondary: 'strategic' },
  'Loyal': { primary: 'loyalty', secondary: 'social' },
  'Emotional': { primary: 'social', secondary: 'loyalty' },
  'Funny': { primary: 'social', secondary: 'mental' },
  'Charming': { primary: 'social', secondary: 'strategic' },
  'Manipulative': { primary: 'strategic', secondary: 'mental' },
  'Analytical': { primary: 'mental', secondary: 'strategic' },
  'Impulsive': { primary: 'physical', secondary: 'endurance' },
  'Deceptive': { primary: 'strategic', secondary: 'social' },
  'Social': { primary: 'social', secondary: 'luck' },
  'Introverted': { primary: 'mental', secondary: 'loyalty' },
  'Stubborn': { primary: 'endurance', secondary: 'physical' },
  'Flexible': { primary: 'strategic', secondary: 'mental' },
  'Intuitive': { primary: 'mental', secondary: 'luck' }
};

// Boost values for primary and secondary stats
export const TRAIT_BOOST_VALUES = {
  primary: 2,
  secondary: 1
};

// Houseguest stats
export interface HouseguestStats {
  physical: number;
  mental: number;
  endurance: number;
  social: number;
  luck: number;
  competition: number;
  strategic: number;
  loyalty: number;
}

// Houseguest competition stats
export interface CompetitionStats {
  hoh: number;
  pov: number;
  other: number;
}

// Mental state interface for AI integration
export interface MentalState {
  feelings: {
    [houseguestId: string]: {
      sentiment: number; // -1 to 1 scale
      notes: string[];
    }
  };
  goals: string[];
  memories: {
    general: string[]; // General memories about the game
    aboutPlayers: {
      [houseguestId: string]: string[]; // Memories about specific players
    };
  };
  reflections: string[]; // Internal monologue/thoughts
}

// Main houseguest interface
export interface Houseguest {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  bio: string;
  isPlayer: boolean;
  status: HouseguestStatus;
  stats: HouseguestStats;
  traits: PersonalityTrait[];
  
  // Competition status
  isHoH: boolean;
  isPovHolder: boolean;
  isNominated: boolean;
  
  // Competition history
  competitionsWon: CompetitionStats;
  nominations: number;
  timesVetoed: number;
  
  // Visual representation
  imageUrl?: string;
  avatarUrl?: string;
  
  // Advanced state for AI
  mentalState?: MentalState;
}

/**
 * Creates a new houseguest
 */
export function createHouseguest(
  id: string,
  name: string,
  age: number = 25,
  occupation: string = "",
  hometown: string = "",
  bio: string = "",
  imageUrl: string = "",
  traits: PersonalityTrait[] = [],
  statsOverrides: Partial<HouseguestStats> = {},
  isPlayer: boolean = false
): Houseguest {
  // Generate base stats (1-10 scale)
  const baseStats: HouseguestStats = {
    physical: Math.floor(Math.random() * 5) + 3, // 3-7
    mental: Math.floor(Math.random() * 5) + 3, // 3-7
    endurance: Math.floor(Math.random() * 5) + 3, // 3-7
    social: Math.floor(Math.random() * 5) + 3, // 3-7
    luck: Math.floor(Math.random() * 5) + 3, // 3-7
    competition: Math.floor(Math.random() * 5) + 3, // 3-7
    strategic: Math.floor(Math.random() * 5) + 3, // 3-7
    loyalty: Math.floor(Math.random() * 5) + 3, // 3-7
  };
  
  // Apply trait boosts to stats
  for (const trait of traits) {
    if (TRAIT_STAT_BOOSTS[trait]) {
      const { primary, secondary } = TRAIT_STAT_BOOSTS[trait];
      baseStats[primary] = Math.min(10, baseStats[primary] + TRAIT_BOOST_VALUES.primary);
      baseStats[secondary] = Math.min(10, baseStats[secondary] + TRAIT_BOOST_VALUES.secondary);
    }
  }
  
  // Apply any stat overrides
  const stats = { ...baseStats, ...statsOverrides };
  
  return {
    id: id || uuidv4(),
    name,
    age,
    occupation,
    hometown,
    bio,
    isPlayer,
    status: 'Active',
    stats,
    traits,
    isHoH: false,
    isPovHolder: false,
    isNominated: false,
    competitionsWon: { hoh: 0, pov: 0, other: 0 },
    nominations: 0,
    timesVetoed: 0,
    imageUrl,
    avatarUrl: imageUrl, // Set avatarUrl to the same as imageUrl initially
    mentalState: {
      feelings: {},
      goals: [],
      memories: { 
        general: [], 
        aboutPlayers: {} 
      },
      reflections: []
    }
  };
}

/**
 * Calculate advantage in competitions based on houseguest stats
 */
export function calculateCompetitionAdvantage(
  houseguest: Houseguest, 
  competitionType: 'physical' | 'mental' | 'endurance' | 'social' | 'luck'
): number {
  const { stats } = houseguest;
  let advantage = stats[competitionType];
  
  // Add a small boost from competition stat
  advantage += stats.competition * 0.2;
  
  // Add random factor (luck)
  advantage += stats.luck * Math.random() * 0.3;
  
  return advantage;
}

/**
 * Generate a reflection prompt for AI
 */
export function generateReflectionPrompt(
  houseguest: Houseguest,
  game: any, // Game state reference
  currentEvent: string,
  allianceSystem: AllianceSystem
): string {
  // Get alliances that the houseguest is part of
  const alliances = allianceSystem.getAllAlliances().filter(alliance => 
    alliance.members.includes(houseguest.id)
  );
  
  // Generate base prompt
  let prompt = `You are ${houseguest.name}, a ${houseguest.age}-year-old ${houseguest.occupation} from ${houseguest.hometown}. `;
  
  // Add personality traits
  prompt += `Your personality traits are: ${houseguest.traits.join(', ')}. `;
  
  // Add alliance information
  if (alliances.length > 0) {
    prompt += `You are in ${alliances.length} alliance(s): ${alliances.map(a => a.name).join(', ')}. `;
  } else {
    prompt += `You are not currently in any alliances. `;
  }
  
  // Add current game status
  prompt += `It is currently week ${game.week}, and ${currentEvent}. `;
  
  // Add reflection request
  prompt += `Based on your personality and game position, what are your thoughts about this situation?`;
  
  return prompt;
}
