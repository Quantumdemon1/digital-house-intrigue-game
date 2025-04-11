import { v4 as uuidv4 } from 'uuid';

export type HouseguestStatus = 'Active' | 'Evicted' | 'Jury';

export interface HouseguestStats {
  competition: number; // 1-10 scale
  social: number;      // 1-10 scale
  strategic: number;   // 1-10 scale
  loyalty: number;     // 1-10 scale
  physical: number;    // 1-10 scale
  mental: number;      // 1-10 scale
  endurance: number;   // 1-10 scale
  luck: number;        // 1-10 scale
}

export type CompetitionType = 'Physical' | 'Mental' | 'Endurance' | 'Social' | 'Luck';

export type PersonalityTrait = 
  | 'Strategic' 
  | 'Social' 
  | 'Competitive' 
  | 'Loyal'
  | 'Sneaky' 
  | 'Confrontational' 
  | 'Emotional' 
  | 'Analytical';

// Trait to stat boost mappings
export interface StatBoost {
  primary: keyof HouseguestStats;
  secondary: keyof HouseguestStats;
}

// Define how traits affect stats
export const TRAIT_STAT_BOOSTS: Record<PersonalityTrait, StatBoost> = {
  'Strategic': { primary: 'strategic', secondary: 'mental' },
  'Social': { primary: 'social', secondary: 'luck' },
  'Competitive': { primary: 'competition', secondary: 'physical' },
  'Loyal': { primary: 'loyalty', secondary: 'social' },
  'Sneaky': { primary: 'strategic', secondary: 'social' },
  'Confrontational': { primary: 'competition', secondary: 'physical' },
  'Emotional': { primary: 'social', secondary: 'luck' },
  'Analytical': { primary: 'mental', secondary: 'strategic' }
};

export const TRAIT_BOOST_VALUES = {
  primary: 2,
  secondary: 1
};

export interface Houseguest {
  id: string;
  name: string;
  isPlayer: boolean;
  status: HouseguestStatus;
  avatarUrl?: string;
  stats: HouseguestStats;
  traits: PersonalityTrait[];
  isHoH: boolean;
  isPovHolder: boolean;
  isNominated: boolean;
  votedBy?: string[];  // IDs of houseguests who voted for this person
  age?: number;
  occupation?: string;
  hometown?: string;
  bio?: string;
  competitionsWon?: {
    hoh: number;
    pov: number;
  };
  nominations?: {
    times: number;
    receivedOn: number[];
  };
}

// Create a new houseguest with default values
export function createHouseguest(name: string, isPlayer: boolean = false): Houseguest {
  return {
    id: uuidv4(),
    name,
    isPlayer,
    status: 'Active',
    avatarUrl: '',
    stats: {
      competition: 5 + Math.floor(Math.random() * 5),
      social: 5 + Math.floor(Math.random() * 5),
      strategic: 5 + Math.floor(Math.random() * 5),
      loyalty: 4 + Math.floor(Math.random() * 6),
      physical: 5 + Math.floor(Math.random() * 5),
      mental: 5 + Math.floor(Math.random() * 5),
      endurance: 5 + Math.floor(Math.random() * 5),
      luck: 5 + Math.floor(Math.random() * 5)
    },
    traits: [],
    isHoH: false,
    isPovHolder: false,
    isNominated: false,
    competitionsWon: {
      hoh: 0,
      pov: 0
    },
    nominations: {
      times: 0,
      receivedOn: []
    }
  };
}

// Assign random traits to a houseguest
export function assignRandomTraits(houseguest: Houseguest, possibleTraits: PersonalityTrait[], count: number = 3): void {
  // Shuffle array
  const shuffled = [...possibleTraits].sort(() => 0.5 - Math.random());
  // Get first n elements
  houseguest.traits = shuffled.slice(0, count);
}

// Calculate advantage in competition based on houseguest traits
export function calculateCompetitionAdvantage(houseguest: Houseguest, competitionType: CompetitionType): number {
  let advantage = 0;
  
  // Check for trait-based advantages
  for (const trait of houseguest.traits) {
    switch (trait) {
      case 'Competitive':
        // Competitive gives advantage in Physical and Endurance
        if (competitionType === 'Physical') advantage += 1.5;
        if (competitionType === 'Endurance') advantage += 1;
        break;
      case 'Analytical':
        // Analytical gives advantage in Mental
        if (competitionType === 'Mental') advantage += 2;
        break;
      case 'Social':
        // Social gives advantage in Social comps
        if (competitionType === 'Social') advantage += 2;
        break;
      case 'Sneaky':
        // Sneaky gives slight advantage in Mental and Social
        if (competitionType === 'Mental') advantage += 0.5;
        if (competitionType === 'Social') advantage += 0.5;
        break;
      case 'Strategic':
        // Strategic gives advantage in Mental and slight in others
        if (competitionType === 'Mental') advantage += 1;
        if (competitionType !== 'Mental') advantage += 0.3; 
        break;
      // Other traits don't directly affect competition performance
    }
  }
  
  // Return the calculated advantage
  return advantage;
}
