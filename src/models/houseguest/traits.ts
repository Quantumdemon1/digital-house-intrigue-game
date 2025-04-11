
/**
 * @file models/houseguest/traits.ts
 * @description Personality traits and their effects on houseguest stats
 */

import { PersonalityTrait, StatBoost } from './types';

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
  'Intuitive': { primary: 'mental', secondary: 'luck' },
  'Sneaky': { primary: 'strategic', secondary: 'mental' },
  'Confrontational': { primary: 'social', secondary: 'endurance' }
};

// Boost values for primary and secondary stats
export const TRAIT_BOOST_VALUES = {
  primary: 2,
  secondary: 1
};
