
import { v4 as uuidv4 } from 'uuid';

export type HouseguestStatus = 'Active' | 'Evicted' | 'Jury';

export interface HouseguestStats {
  competition: number; // 1-10 scale
  social: number;      // 1-10 scale
  strategic: number;   // 1-10 scale
  loyalty: number;     // 1-10 scale
}

export interface Houseguest {
  id: string;
  name: string;
  isPlayer: boolean;
  status: HouseguestStatus;
  avatarUrl?: string;  // Added avatarUrl
  stats: HouseguestStats;
  traits: string[];
  isHoH: boolean;
  isPovHolder: boolean;
  isNominated: boolean;
  votedBy?: string[];  // IDs of houseguests who voted for this person
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
      loyalty: 4 + Math.floor(Math.random() * 6)
    },
    traits: [],
    isHoH: false,
    isPovHolder: false,
    isNominated: false
  };
}

// Assign random traits to a houseguest
export function assignRandomTraits(houseguest: Houseguest, possibleTraits: string[], count: number = 3): void {
  // Shuffle array
  const shuffled = [...possibleTraits].sort(() => 0.5 - Math.random());
  // Get first n elements
  houseguest.traits = shuffled.slice(0, count);
}
