
import { PersonalityTrait } from '@/models/houseguest';

import alexChenAvatar from '@/assets/avatars/alex-chen.jpg';
import morganLeeAvatar from '@/assets/avatars/morgan-lee.jpg';
import jordanTaylorAvatar from '@/assets/avatars/jordan-taylor.jpg';
import caseyWilsonAvatar from '@/assets/avatars/casey-wilson.jpg';
import rileyJohnsonAvatar from '@/assets/avatars/riley-johnson.jpg';
import jamieRobertsAvatar from '@/assets/avatars/jamie-roberts.jpg';
import quinnMartinezAvatar from '@/assets/avatars/quinn-martinez.jpg';
import averyThompsonAvatar from '@/assets/avatars/avery-thompson.jpg';
import taylorKimAvatar from '@/assets/avatars/taylor-kim.jpg';
import samWilliamsAvatar from '@/assets/avatars/sam-williams.jpg';
import blakePetersonAvatar from '@/assets/avatars/blake-peterson.jpg';
import mayaHassanAvatar from '@/assets/avatars/maya-hassan.jpg';

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
    bio: 'Strategic mastermind who excels at social manipulation and long-term planning. Always three steps ahead.',
    imageUrl: alexChenAvatar,
    traits: ['Strategic', 'Social'],
  },
  {
    name: 'Morgan Lee',
    age: 26,
    occupation: 'Personal Trainer',
    hometown: 'Miami, FL',
    bio: 'Physical powerhouse who dominates competitions. Forms genuine alliances based on loyalty.',
    imageUrl: morganLeeAvatar,
    traits: ['Competitive', 'Loyal'],
  },
  {
    name: 'Jordan Taylor',
    age: 31,
    occupation: 'Sales Representative',
    hometown: 'Chicago, IL',
    bio: 'Charismatic charmer who can talk anyone into anything. Will do whatever it takes to win.',
    imageUrl: jordanTaylorAvatar,
    traits: ['Social', 'Sneaky'],
  },
  {
    name: 'Casey Wilson',
    age: 24,
    occupation: 'Bartender',
    hometown: 'New Orleans, LA',
    bio: 'Life of the party with a surprisingly sharp strategic mind. Nobody suspects the fun one.',
    imageUrl: caseyWilsonAvatar,
    traits: ['Social', 'Strategic'],
  },
  {
    name: 'Riley Johnson',
    age: 29,
    occupation: 'Software Engineer',
    hometown: 'Seattle, WA',
    bio: 'Analytical genius who calculates every move. May struggle socially but never in puzzles.',
    imageUrl: rileyJohnsonAvatar,
    traits: ['Analytical', 'Strategic'],
  },
  {
    name: 'Jamie Roberts',
    age: 27,
    occupation: 'Nurse',
    hometown: 'Boston, MA',
    bio: 'Empathetic caregiver who everyone trusts. Not afraid to make bold moves when necessary.',
    imageUrl: jamieRobertsAvatar,
    traits: ['Emotional', 'Strategic'],
  },
  {
    name: 'Quinn Martinez',
    age: 25,
    occupation: 'Social Media Influencer',
    hometown: 'Los Angeles, CA',
    bio: 'Fame-seeking manipulator who plays for the cameras. Will create drama for entertainment.',
    imageUrl: quinnMartinezAvatar,
    traits: ['Confrontational', 'Social'],
  },
  {
    name: 'Avery Thompson',
    age: 32,
    occupation: 'Police Officer',
    hometown: 'Dallas, TX',
    bio: 'Strong-willed protector with unwavering loyalty. Once you have their trust, they never betray.',
    imageUrl: averyThompsonAvatar,
    traits: ['Loyal', 'Competitive'],
  },
  {
    name: 'Taylor Kim',
    age: 27,
    occupation: 'Fitness Instructor',
    hometown: 'Portland, OR',
    bio: 'Competitive and disciplined but has a short fuse. Never back down from a challenge.',
    imageUrl: taylorKimAvatar,
    traits: ['Competitive', 'Confrontational'],
  },
  {
    name: 'Sam Williams',
    age: 34,
    occupation: 'Restaurant Owner',
    hometown: 'Nashville, TN',
    bio: 'Natural born leader who builds alliances through genuine connections and strategic vision.',
    imageUrl: samWilliamsAvatar,
    traits: ['Strategic', 'Loyal'],
  },
  {
    name: 'Blake Peterson',
    age: 26,
    occupation: 'Architect',
    hometown: 'Denver, CO',
    bio: 'Quiet observer who strikes at the perfect moment. Sees everything but reveals nothing.',
    imageUrl: blakePetersonAvatar,
    traits: ['Analytical', 'Sneaky'],
  },
  {
    name: 'Maya Hassan',
    age: 30,
    occupation: 'Lawyer',
    hometown: 'New York, NY',
    bio: 'Sophisticated strategist with impeccable social skills. Every word is carefully chosen.',
    imageUrl: mayaHassanAvatar,
    traits: ['Strategic', 'Social'],
  },
];

export const personalityTraits: PersonalityTrait[] = [
  'Strategic', 'Social', 'Competitive', 'Loyal',
  'Sneaky', 'Confrontational', 'Emotional', 'Analytical'
];
