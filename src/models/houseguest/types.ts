import { Avatar3DConfig } from '@/models/avatar-config';

/**
 * @file models/houseguest/types.ts
 * @description Type definitions for houseguests
 */

// Re-export Avatar3DConfig for convenience
export type { Avatar3DConfig };

// Houseguest Status
export type HouseguestStatus = 'Active' | 'Evicted' | 'Jury' | 'Winner' | 'Runner-Up';

// Basic types
export type PersonalityTrait = 
  | 'Competitive' | 'Strategic' | 'Loyal' | 'Emotional' | 'Funny'
  | 'Charming' | 'Manipulative' | 'Analytical' | 'Impulsive' | 'Deceptive'
  | 'Social' | 'Introverted' | 'Stubborn' | 'Flexible' | 'Intuitive'
  | 'Sneaky' | 'Confrontational';

// Competition types
export type CompetitionType = 'physical' | 'mental' | 'endurance' | 'social' | 'luck';

// Mental state types
export type MoodType = 'Happy' | 'Content' | 'Neutral' | 'Upset' | 'Angry';
export type StressLevelType = 'Relaxed' | 'Normal' | 'Tense' | 'Stressed' | 'Overwhelmed';

// Stat boost structure for personality traits
export interface StatBoost {
  primary: keyof HouseguestStats;
  secondary: keyof HouseguestStats;
}

// Define the nomination count interface
export interface NominationCount {
  times: number;
  receivedOn: number[];
}

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
  nominations?: NominationCount;
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

/**
 * Extended Houseguest interface with 3D avatar support
 */
export interface Houseguest3DExtension {
  avatarConfig?: Avatar3DConfig;
}
