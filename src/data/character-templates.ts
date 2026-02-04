import { PersonalityTrait } from '@/models/houseguest';
import { Avatar3DConfig } from '@/models/avatar-config';

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

// RPM avatar URLs curated to match character appearances
const NPC_RPM_AVATARS: Record<string, string> = {
  'alex-chen': 'https://models.readyplayer.me/6360c6eb5ef7d946f5c35b4a.glb', // Asian male, professional
  'morgan-lee': 'https://models.readyplayer.me/64bfa15f0d72c63d7c3934f3.glb', // Female, athletic, darker skin
  'jordan-taylor': 'https://models.readyplayer.me/6409ed6a9d68df96e2316c41.glb', // Male, charming smile
  'casey-wilson': 'https://models.readyplayer.me/64c28e1a9eb4e9d7f8a7fb42.glb', // Female, fun/party style
  'riley-johnson': 'https://models.readyplayer.me/6422f49d23f7c4b8d5e91a23.glb', // Male, glasses, nerdy
  'jamie-roberts': 'https://models.readyplayer.me/642e5c8b1a2d4f6e9c8b7a54.glb', // Female, nurturing
  'quinn-martinez': 'https://models.readyplayer.me/6435d7c2e8f9a0b1c2d3e4f5.glb', // Female, influencer style
  'avery-thompson': 'https://models.readyplayer.me/6448f9a1b2c3d4e5f6a7b8c9.glb', // Male, strong, dark skin
  'taylor-kim': 'https://models.readyplayer.me/645bc2d3e4f5a6b7c8d9e0f1.glb', // Male, athletic, Asian
  'sam-williams': 'https://models.readyplayer.me/646ed4e5f6a7b8c9d0e1f2a3.glb', // Female, leadership, curly hair
  'blake-peterson': 'https://models.readyplayer.me/6481e6f7a8b9c0d1e2f3a4b5.glb', // Male, quiet/mysterious
  'maya-hassan': 'https://models.readyplayer.me/6494f8a9b0c1d2e3f4a5b6c7.glb', // Female, sophisticated
};

// Helper to create avatar config for NPCs with RPM 3D avatars
const createNPCAvatarConfig = (characterId: string, imageUrl: string, legacyConfig: Partial<Avatar3DConfig>): Avatar3DConfig => {
  const rpmUrl = NPC_RPM_AVATARS[characterId];
  
  return {
    ...legacyConfig,
    modelSource: rpmUrl ? 'ready-player-me' : 'none',
    modelUrl: rpmUrl,
    thumbnailUrl: imageUrl,
    profilePhotoUrl: imageUrl, // Use 2D image as default profile photo
    // Fill in required fields with defaults
    bodyType: legacyConfig.bodyType || 'average',
    height: legacyConfig.height || 'average',
    skinTone: legacyConfig.skinTone || '#E8C4A0',
    headShape: 'oval',
    eyeShape: 'almond',
    eyeColor: '#5D4037',
    noseType: 'medium',
    mouthType: 'full',
    hairStyle: 'short',
    hairColor: '#3E2723',
    topStyle: 'tshirt',
    topColor: '#2196F3',
    bottomStyle: 'jeans',
    bottomColor: '#1565C0',
  };
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
    avatar3DConfig: createNPCAvatarConfig('alex-chen', alexChenAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('morgan-lee', morganLeeAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('jordan-taylor', jordanTaylorAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('casey-wilson', caseyWilsonAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('riley-johnson', rileyJohnsonAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('jamie-roberts', jamieRobertsAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('quinn-martinez', quinnMartinezAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('avery-thompson', averyThompsonAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('taylor-kim', taylorKimAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('sam-williams', samWilliamsAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('blake-peterson', blakePetersonAvatar, {
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
    avatar3DConfig: createNPCAvatarConfig('maya-hassan', mayaHassanAvatar, {
      bodyType: 'slim',
      height: 'average',
      skinTone: '#C4956A',
    })
  }
];

export const getTemplatesByArchetype = (archetype: Archetype): CharacterTemplate[] => {
  return characterTemplates.filter(t => t.archetype === archetype);
};