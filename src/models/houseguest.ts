
export type PersonalityTrait = 
  | 'Strategic' | 'Social' | 'Competitive' | 'Loyal'
  | 'Sneaky' | 'Confrontational' | 'Emotional' | 'Analytical';

export type CompetitionType = 'Physical' | 'Mental' | 'Endurance' | 'Luck' | 'Social';

export type HouseguestStats = {
  physical: number;  // 1-10 scale
  mental: number;    // 1-10 scale
  endurance: number; // 1-10 scale
  social: number;    // 1-10 scale
  luck: number;      // 1-10 scale
};

// Map traits to their primary and secondary stat boosts
export const TRAIT_STAT_BOOSTS: Record<PersonalityTrait, {primary: keyof HouseguestStats, secondary: keyof HouseguestStats}> = {
  'Strategic': { primary: 'mental', secondary: 'luck' },
  'Social': { primary: 'social', secondary: 'luck' },
  'Competitive': { primary: 'physical', secondary: 'endurance' },
  'Loyal': { primary: 'social', secondary: 'endurance' },
  'Sneaky': { primary: 'mental', secondary: 'luck' },
  'Confrontational': { primary: 'physical', secondary: 'mental' },
  'Emotional': { primary: 'social', secondary: 'physical' },
  'Analytical': { primary: 'mental', secondary: 'endurance' }
};

export const TRAIT_BOOST_VALUES = {
  primary: 2,
  secondary: 1
};

// Trait descriptions for tooltips and UI
export const TRAIT_DESCRIPTIONS: Record<PersonalityTrait, string> = {
  'Strategic': 'Focuses on game moves and long-term planning',
  'Social': 'Builds strong relationships and alliances',
  'Competitive': 'Highly motivated to win competitions',
  'Loyal': 'Values trust and keeps commitments',
  'Sneaky': 'Plays deceptively and gathers information',
  'Confrontational': 'Direct and doesn\'t shy away from conflict',
  'Emotional': 'Makes decisions based on feelings and connections',
  'Analytical': 'Carefully evaluates all options and scenarios'
};

export type HouseguestStatus = 
  | 'Active'       // Still in the game
  | 'Evicted'      // Voted out, not in jury
  | 'Jury'         // Voted out, in jury
  | 'Winner'       // Won the game
  | 'Runner-Up';   // Final 2 but lost

export interface Houseguest {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  bio: string;
  imageUrl: string; // path to avatar image
  traits: PersonalityTrait[];
  stats: HouseguestStats;
  status: HouseguestStatus;
  isPlayer: boolean;
  
  // Game state properties
  isHoH: boolean;
  isPovHolder: boolean;
  isNominated: boolean;
  nominations: number; // How many times they've been nominated
  competitionsWon: {
    hoh: number;
    pov: number;
    other: number;
  };
}

export function createHouseguest(
  id: string,
  name: string, 
  age: number, 
  occupation: string, 
  hometown: string, 
  bio: string,
  imageUrl: string,
  traits: PersonalityTrait[],
  stats: Partial<HouseguestStats> = {},
  isPlayer: boolean = false
): Houseguest {
  // Apply trait boosts to stats
  const boostedStats = { ...stats };
  
  // For players, we use their exact stats (after trait boosts are applied in PlayerForm)
  // For NPCs, we generate random base stats and apply trait boosts
  if (!isPlayer) {
    // Generate base stats first
    const baseStats: HouseguestStats = {
      physical: stats.physical || Math.floor(Math.random() * 8) + 1, // 1-8 range
      mental: stats.mental || Math.floor(Math.random() * 8) + 1,
      endurance: stats.endurance || Math.floor(Math.random() * 8) + 1,
      social: stats.social || Math.floor(Math.random() * 8) + 1,
      luck: stats.luck || Math.floor(Math.random() * 8) + 1,
    };
    
    // Apply trait boosts for NPCs
    traits.forEach(trait => {
      const boost = TRAIT_STAT_BOOSTS[trait];
      baseStats[boost.primary] = Math.min(10, baseStats[boost.primary] + TRAIT_BOOST_VALUES.primary);
      baseStats[boost.secondary] = Math.min(10, baseStats[boost.secondary] + TRAIT_BOOST_VALUES.secondary);
    });
    
    Object.assign(boostedStats, baseStats);
  }

  return {
    id,
    name,
    age,
    occupation,
    hometown,
    bio,
    imageUrl,
    traits,
    stats: {
      physical: boostedStats.physical || Math.floor(Math.random() * 10) + 1,
      mental: boostedStats.mental || Math.floor(Math.random() * 10) + 1,
      endurance: boostedStats.endurance || Math.floor(Math.random() * 10) + 1,
      social: boostedStats.social || Math.floor(Math.random() * 10) + 1, 
      luck: boostedStats.luck || Math.floor(Math.random() * 10) + 1,
    },
    status: 'Active',
    isPlayer,
    isHoH: false,
    isPovHolder: false,
    isNominated: false,
    nominations: 0,
    competitionsWon: {
      hoh: 0,
      pov: 0,
      other: 0,
    },
  };
}

// Function to calculate competition advantage based on traits and competition type
export function calculateCompetitionAdvantage(
  houseguest: Houseguest,
  competitionType: CompetitionType
): number {
  let advantage = 0;
  
  // Base advantage comes from the relevant stat
  switch(competitionType) {
    case 'Physical':
      advantage += houseguest.stats.physical;
      break;
    case 'Mental':
      advantage += houseguest.stats.mental;
      break;
    case 'Endurance':
      advantage += houseguest.stats.endurance;
      break;
    case 'Social':
      advantage += houseguest.stats.social;
      break;
    case 'Luck':
      advantage += houseguest.stats.luck;
      break;
  }
  
  // Additional bonus if houseguest has traits that align with the competition
  houseguest.traits.forEach(trait => {
    const boost = TRAIT_STAT_BOOSTS[trait];
    
    if ((competitionType === 'Physical' && boost.primary === 'physical') ||
        (competitionType === 'Mental' && boost.primary === 'mental') ||
        (competitionType === 'Endurance' && boost.primary === 'endurance') ||
        (competitionType === 'Social' && boost.primary === 'social') ||
        (competitionType === 'Luck' && boost.primary === 'luck')) {
      advantage += TRAIT_BOOST_VALUES.primary;
    }
  });
  
  return advantage;
}
