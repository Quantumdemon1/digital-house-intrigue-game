
import { PersonalityTrait } from '@/models/houseguest';

export interface DefaultHouseguest {
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  bio: string;
  imageUrl: string;
  traits: PersonalityTrait[];
}

// Default houseguests for the game
export const defaultHouseguests: DefaultHouseguest[] = [
  {
    name: 'Alex Chen',
    age: 28,
    occupation: 'Marketing Executive',
    hometown: 'San Francisco, CA',
    bio: 'Strategic player who excels at social manipulation.',
    imageUrl: '/placeholder.svg',
    traits: ['Strategic', 'Social'],
  },
  {
    name: 'Morgan Lee',
    age: 26,
    occupation: 'Personal Trainer',
    hometown: 'Miami, FL',
    bio: 'Physical competitor who forms genuine alliances.',
    imageUrl: '/placeholder.svg',
    traits: ['Competitive', 'Loyal'],
  },
  {
    name: 'Jordan Taylor',
    age: 31,
    occupation: 'Sales Representative',
    hometown: 'Chicago, IL',
    bio: 'Charismatic and cunning, will do anything to win.',
    imageUrl: '/placeholder.svg',
    traits: ['Social', 'Sneaky'],
  },
  {
    name: 'Casey Wilson',
    age: 24,
    occupation: 'Bartender',
    hometown: 'New Orleans, LA',
    bio: 'Party-loving socialite with a surprising strategic mind.',
    imageUrl: '/placeholder.svg',
    traits: ['Social', 'Strategic'],
  },
  {
    name: 'Riley Johnson',
    age: 29,
    occupation: 'Software Engineer',
    hometown: 'Seattle, WA',
    bio: 'Analytical thinker who struggles with social game.',
    imageUrl: '/placeholder.svg',
    traits: ['Analytical', 'Strategic'],
  },
  {
    name: 'Jamie Roberts',
    age: 27,
    occupation: 'Nurse',
    hometown: 'Boston, MA',
    bio: 'Empathetic but not afraid to make big moves.',
    imageUrl: '/placeholder.svg',
    traits: ['Emotional', 'Strategic'],
  },
  {
    name: 'Quinn Martinez',
    age: 25,
    occupation: 'Social Media Influencer',
    hometown: 'Los Angeles, CA',
    bio: 'Fame-seeking and manipulative, plays for the cameras.',
    imageUrl: '/placeholder.svg',
    traits: ['Confrontational', 'Social'],
  },
  {
    name: 'Avery Thompson',
    age: 32,
    occupation: 'Police Officer',
    hometown: 'Dallas, TX',
    bio: 'Strong-willed and straightforward, values loyalty.',
    imageUrl: '/placeholder.svg',
    traits: ['Loyal', 'Competitive'],
  },
  {
    name: 'Taylor Kim',
    age: 27,
    occupation: 'Fitness Instructor',
    hometown: 'Portland, OR',
    bio: 'Competitive and disciplined, but has a short temper.',
    imageUrl: '/placeholder.svg',
    traits: ['Competitive', 'Confrontational'],
  },
  {
    name: 'Sam Williams',
    age: 34,
    occupation: 'Restaurant Owner',
    hometown: 'Nashville, TN',
    bio: 'Charismatic leader who builds strong alliances.',
    imageUrl: '/placeholder.svg',
    traits: ['Strategic', 'Loyal'],
  },
  {
    name: 'Blake Peterson',
    age: 26,
    occupation: 'Architect',
    hometown: 'Denver, CO',
    bio: 'Quiet observer who strikes at the perfect moment.',
    imageUrl: '/placeholder.svg',
    traits: ['Analytical', 'Sneaky'],
  },
];

export const personalityTraits: PersonalityTrait[] = [
  'Strategic', 'Social', 'Competitive', 'Loyal',
  'Sneaky', 'Confrontational', 'Emotional', 'Analytical'
];
