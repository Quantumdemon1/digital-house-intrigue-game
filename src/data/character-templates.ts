import { PersonalityTrait } from '@/models/houseguest';
import { Avatar3DConfig } from '@/models/avatar-config';
import { PRESET_RPM_AVATARS, getRPMPresetByIndex } from './preset-rpm-avatars';

// Import generated avatars (2D fallback)
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

export type Archetype = 'strategist' | 'competitor' | 'socialite' | 'wildcard' | 'underdog';

export interface CharacterTemplate {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  bio: string;
  imageUrl: string;
  traits: PersonalityTrait[];
  archetype: Archetype;
  tagline: string;
  avatar3DConfig: Avatar3DConfig;
}

export const archetypeInfo: Record<Archetype, { label: string; color: string; description: string }> = {
  strategist: {
    label: 'Strategist',
    color: 'from-blue-500 to-purple-600',
    description: 'Calculating and always planning ahead'
  },
  competitor: {
    label: 'Competitor',
    color: 'from-red-500 to-orange-500',
    description: 'Physical threat who wins competitions'
  },
  socialite: {
    label: 'Socialite',
    color: 'from-pink-400 to-rose-500',
    description: 'Charms everyone and builds alliances'
  },
  wildcard: {
    label: 'Wildcard',
    color: 'from-purple-500 to-fuchsia-500',
    description: 'Unpredictable and makes big moves'
  },
  underdog: {
    label: 'Underdog',
    color: 'from-teal-400 to-cyan-500',
    description: 'Quiet threat who flies under the radar'
  }
};

// Helper to create avatar config with RPM model
const createRPMAvatarConfig = (index: number, legacyConfig: Partial<Avatar3DConfig>): Avatar3DConfig => {
  const preset = getRPMPresetByIndex(index);
  return {
    ...legacyConfig,
    modelSource: 'ready-player-me',
    modelUrl: preset.url,
    thumbnailUrl: preset.thumbnail,
    profilePhotoUrl: preset.thumbnail, // Use thumbnail as profile photo
  } as Avatar3DConfig;
};

export const characterTemplates: CharacterTemplate[] = [
  {
    id: 'alex-chen',
    name: 'Alex Chen',
    age: 28,
    occupation: 'Marketing Executive',
    hometown: 'San Francisco, CA',
    bio: 'Strategic mastermind who excels at social manipulation and long-term planning. Always three steps ahead.',
    imageUrl: alexChenAvatar,
    traits: ['Strategic', 'Social'],
    archetype: 'strategist',
    tagline: 'The Mastermind',
    avatar3DConfig: createRPMAvatarConfig(0, {
      bodyType: 'slim',
      height: 'average',
      skinTone: '#E8C4A0',
    })
  },
  {
    id: 'morgan-lee',
    name: 'Morgan Lee',
    age: 26,
    occupation: 'Personal Trainer',
    hometown: 'Miami, FL',
    bio: 'Physical powerhouse who dominates competitions. Forms genuine alliances based on loyalty.',
    imageUrl: morganLeeAvatar,
    traits: ['Competitive', 'Loyal'],
    archetype: 'competitor',
    tagline: 'The Athlete',
    avatar3DConfig: createRPMAvatarConfig(1, {
      bodyType: 'athletic',
      height: 'tall',
      skinTone: '#C4956A',
    })
  },
  {
    id: 'jordan-taylor',
    name: 'Jordan Taylor',
    age: 31,
    occupation: 'Sales Representative',
    hometown: 'Chicago, IL',
    bio: 'Charismatic charmer who can talk anyone into anything. Will do whatever it takes to win.',
    imageUrl: jordanTaylorAvatar,
    traits: ['Social', 'Sneaky'],
    archetype: 'socialite',
    tagline: 'The Charmer',
    avatar3DConfig: createRPMAvatarConfig(2, {
      bodyType: 'average',
      height: 'average',
      skinTone: '#D4A574',
    })
  },
  {
    id: 'casey-wilson',
    name: 'Casey Wilson',
    age: 24,
    occupation: 'Bartender',
    hometown: 'New Orleans, LA',
    bio: 'Life of the party with a surprisingly sharp strategic mind. Nobody suspects the fun one.',
    imageUrl: caseyWilsonAvatar,
    traits: ['Social', 'Strategic'],
    archetype: 'wildcard',
    tagline: 'The Party Animal',
    avatar3DConfig: createRPMAvatarConfig(3, {
      bodyType: 'average',
      height: 'short',
      skinTone: '#FFD9B3',
    })
  },
  {
    id: 'riley-johnson',
    name: 'Riley Johnson',
    age: 29,
    occupation: 'Software Engineer',
    hometown: 'Seattle, WA',
    bio: 'Analytical genius who calculates every move. May struggle socially but never in puzzles.',
    imageUrl: rileyJohnsonAvatar,
    traits: ['Analytical', 'Strategic'],
    archetype: 'underdog',
    tagline: 'The Brainiac',
    avatar3DConfig: createRPMAvatarConfig(4, {
      bodyType: 'slim',
      height: 'average',
      skinTone: '#FFECD2',
    })
  },
  {
    id: 'jamie-roberts',
    name: 'Jamie Roberts',
    age: 27,
    occupation: 'Nurse',
    hometown: 'Boston, MA',
    bio: 'Empathetic caregiver who everyone trusts. Not afraid to make bold moves when necessary.',
    imageUrl: jamieRobertsAvatar,
    traits: ['Emotional', 'Strategic'],
    archetype: 'socialite',
    tagline: 'The Caregiver',
    avatar3DConfig: createRPMAvatarConfig(5, {
      bodyType: 'average',
      height: 'average',
      skinTone: '#E8C4A0',
    })
  },
  {
    id: 'quinn-martinez',
    name: 'Quinn Martinez',
    age: 25,
    occupation: 'Social Media Influencer',
    hometown: 'Los Angeles, CA',
    bio: 'Fame-seeking manipulator who plays for the cameras. Will create drama for entertainment.',
    imageUrl: quinnMartinezAvatar,
    traits: ['Confrontational', 'Social'],
    archetype: 'wildcard',
    tagline: 'The Influencer',
    avatar3DConfig: createRPMAvatarConfig(6, {
      bodyType: 'slim',
      height: 'tall',
      skinTone: '#D4A574',
    })
  },
  {
    id: 'avery-thompson',
    name: 'Avery Thompson',
    age: 32,
    occupation: 'Police Officer',
    hometown: 'Dallas, TX',
    bio: 'Strong-willed protector with unwavering loyalty. Once you have their trust, they never betray.',
    imageUrl: averyThompsonAvatar,
    traits: ['Loyal', 'Competitive'],
    archetype: 'competitor',
    tagline: 'The Protector',
    avatar3DConfig: createRPMAvatarConfig(7, {
      bodyType: 'stocky',
      height: 'tall',
      skinTone: '#6B4423',
    })
  },
  {
    id: 'taylor-kim',
    name: 'Taylor Kim',
    age: 27,
    occupation: 'Fitness Instructor',
    hometown: 'Portland, OR',
    bio: 'Competitive and disciplined but has a short fuse. Never back down from a challenge.',
    imageUrl: taylorKimAvatar,
    traits: ['Competitive', 'Confrontational'],
    archetype: 'competitor',
    tagline: 'The Firebrand',
    avatar3DConfig: createRPMAvatarConfig(8, {
      bodyType: 'athletic',
      height: 'average',
      skinTone: '#E8C4A0',
    })
  },
  {
    id: 'sam-williams',
    name: 'Sam Williams',
    age: 34,
    occupation: 'Restaurant Owner',
    hometown: 'Nashville, TN',
    bio: 'Natural born leader who builds alliances through genuine connections and strategic vision.',
    imageUrl: samWilliamsAvatar,
    traits: ['Strategic', 'Loyal'],
    archetype: 'strategist',
    tagline: 'The Leader',
    avatar3DConfig: createRPMAvatarConfig(9, {
      bodyType: 'stocky',
      height: 'average',
      skinTone: '#A67B5B',
    })
  },
  {
    id: 'blake-peterson',
    name: 'Blake Peterson',
    age: 26,
    occupation: 'Architect',
    hometown: 'Denver, CO',
    bio: 'Quiet observer who strikes at the perfect moment. Sees everything but reveals nothing.',
    imageUrl: blakePetersonAvatar,
    traits: ['Analytical', 'Sneaky'],
    archetype: 'underdog',
    tagline: 'The Shadow',
    avatar3DConfig: createRPMAvatarConfig(10, {
      bodyType: 'slim',
      height: 'tall',
      skinTone: '#FFD9B3',
    })
  },
  {
    id: 'maya-hassan',
    name: 'Maya Hassan',
    age: 30,
    occupation: 'Lawyer',
    hometown: 'New York, NY',
    bio: 'Sophisticated strategist with impeccable social skills. Every word is carefully chosen.',
    imageUrl: mayaHassanAvatar,
    traits: ['Strategic', 'Social'],
    archetype: 'strategist',
    tagline: 'The Diplomat',
    avatar3DConfig: createRPMAvatarConfig(11, {
      bodyType: 'slim',
      height: 'average',
      skinTone: '#C4956A',
    })
  }
];

export const getTemplatesByArchetype = (archetype: Archetype): CharacterTemplate[] => {
  return characterTemplates.filter(t => t.archetype === archetype);
};
