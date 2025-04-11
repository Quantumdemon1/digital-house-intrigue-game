
/**
 * @file models/houseguest/creation.ts
 * @description Functions for creating and configuring houseguests
 */

import { v4 as uuidv4 } from 'uuid';
import { Houseguest } from './model';
import { PersonalityTrait, HouseguestStats } from './types';
import { TRAIT_STAT_BOOSTS, TRAIT_BOOST_VALUES } from './traits';

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
      // Skip if primary/secondary is 'nominations'
      if (primary !== 'nominations' && typeof baseStats[primary] === 'number') {
        baseStats[primary] = Math.min(10, (baseStats[primary] as number) + TRAIT_BOOST_VALUES.primary);
      }
      if (secondary !== 'nominations' && typeof baseStats[secondary] === 'number') {
        baseStats[secondary] = Math.min(10, (baseStats[secondary] as number) + TRAIT_BOOST_VALUES.secondary);
      }
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
    nominations: { times: 0, receivedOn: [] }, // Always initialize as a proper object
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
    },
    // Initialize mental state properties
    mood: 'Neutral',
    stressLevel: 'Normal',
    currentGoals: [],
    internalThoughts: [],
    lastReflectionWeek: 0
  };
}
