
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
      physical: stats.physical || Math.floor(Math.random() * 10) + 1,
      mental: stats.mental || Math.floor(Math.random() * 10) + 1,
      endurance: stats.endurance || Math.floor(Math.random() * 10) + 1,
      social: stats.social || Math.floor(Math.random() * 10) + 1, 
      luck: stats.luck || Math.floor(Math.random() * 10) + 1,
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
