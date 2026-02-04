/**
 * @file models/avatar-config.ts
 * @description 3D Avatar configuration types and generators for Sims-style characters
 */

import { PersonalityTrait } from './houseguest/types';

// Body configuration
export type BodyType = 'slim' | 'average' | 'athletic' | 'stocky';
export type HeightType = 'short' | 'average' | 'tall';

// Face configuration
export type HeadShape = 'round' | 'oval' | 'square' | 'heart';
export type EyeShape = 'round' | 'almond' | 'wide' | 'narrow';
export type NoseType = 'small' | 'medium' | 'large' | 'button';
export type MouthType = 'thin' | 'full' | 'wide' | 'small';

// Hair configuration
export type HairStyle = 'short' | 'medium' | 'long' | 'buzz' | 'ponytail' | 'bun' | 'curly' | 'bald';

// Clothing configuration
export type TopStyle = 'tshirt' | 'tanktop' | 'blazer' | 'hoodie' | 'dress';
export type BottomStyle = 'pants' | 'shorts' | 'skirt' | 'jeans';

// Avatar model source types
export type AvatarModelSource = 'preset-glb' | 'vrm' | 'ready-player-me' | 'custom-glb';

/**
 * Complete 3D avatar configuration
 */
export interface Avatar3DConfig {
  // Model source and URL (for GLB-based avatars)
  modelSource?: AvatarModelSource;
  modelUrl?: string;
  presetId?: string;          // For preset-glb/vrm selection
  thumbnailUrl?: string;      // Cached 2D fallback
  profilePhotoUrl?: string;   // Base64 data URL of captured face screenshot
  
  // Body shape
  bodyType: BodyType;
  height: HeightType;
  
  // Skin
  skinTone: string;
  
  // Face
  headShape: HeadShape;
  eyeShape: EyeShape;
  eyeColor: string;
  noseType: NoseType;
  mouthType: MouthType;
  
  // Hair
  hairStyle: HairStyle;
  hairColor: string;
  
  // Clothing
  topStyle: TopStyle;
  topColor: string;
  bottomStyle: BottomStyle;
  bottomColor: string;
}

// Default configuration
export const DEFAULT_AVATAR_CONFIG: Avatar3DConfig = {
  bodyType: 'average',
  height: 'average',
  skinTone: '#E8C4A0',
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
  bottomColor: '#1565C0'
};

// Seeded random function for consistent generation
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return () => {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };
}

function pickRandom<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

// Color palettes
export const SKIN_TONE_PALETTE = [
  '#FFECD2', '#FFD9B3', '#E8C4A0', '#D4A574', 
  '#C4956A', '#A67B5B', '#8B6914', '#6B4423',
  '#5D4037', '#4E342E', '#3E2723', '#2D1B15'
];

export const HAIR_COLOR_PALETTE = [
  '#1A1A1A', '#2C1810', '#3E2723', '#5D4037',
  '#6D4C41', '#8D6E63', '#A1887F', '#D7CCC8',
  '#FFE082', '#FF8F00', '#E65100', '#B71C1C',
  '#880E4F', '#4A148C', '#1A237E', '#006064'
];

export const CLOTHING_COLOR_PALETTE = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B', '#1A1A1A',
  '#FAFAFA', '#ECEFF1'
];

/**
 * Generate avatar config from archetype with optional seed
 */
export function generateAvatarConfig(archetype: string, seed?: string): Avatar3DConfig {
  const random = seededRandom(seed || archetype + Date.now());
  
  const bodyTypes: BodyType[] = ['slim', 'average', 'athletic', 'stocky'];
  const heights: HeightType[] = ['short', 'average', 'tall'];
  const headShapes: HeadShape[] = ['round', 'oval', 'square', 'heart'];
  const eyeShapes: EyeShape[] = ['round', 'almond', 'wide', 'narrow'];
  const noseTypes: NoseType[] = ['small', 'medium', 'large', 'button'];
  const mouthTypes: MouthType[] = ['thin', 'full', 'wide', 'small'];
  const hairStyles: HairStyle[] = ['short', 'medium', 'long', 'buzz', 'ponytail', 'bun', 'curly', 'bald'];
  const topStyles: TopStyle[] = ['tshirt', 'tanktop', 'blazer', 'hoodie', 'dress'];
  const bottomStyles: BottomStyle[] = ['pants', 'shorts', 'skirt', 'jeans'];

  // Archetype-based biases
  let bodyBias: BodyType[] = bodyTypes;
  let topBias: TopStyle[] = topStyles;
  
  switch (archetype) {
    case 'competitor':
      bodyBias = ['athletic', 'athletic', 'stocky'];
      topBias = ['tanktop', 'tshirt', 'hoodie'];
      break;
    case 'strategist':
      bodyBias = ['slim', 'average'];
      topBias = ['blazer', 'tshirt'];
      break;
    case 'socialite':
      bodyBias = ['slim', 'average'];
      topBias = ['dress', 'blazer', 'tshirt'];
      break;
    case 'wildcard':
      bodyBias = bodyTypes;
      topBias = topStyles;
      break;
    case 'underdog':
      bodyBias = ['slim', 'average'];
      topBias = ['hoodie', 'tshirt'];
      break;
  }

  return {
    bodyType: pickRandom(bodyBias, random),
    height: pickRandom(heights, random),
    skinTone: pickRandom(SKIN_TONE_PALETTE, random),
    headShape: pickRandom(headShapes, random),
    eyeShape: pickRandom(eyeShapes, random),
    eyeColor: pickRandom(['#5D4037', '#3E2723', '#1565C0', '#2E7D32', '#616161', '#F57F17'], random),
    noseType: pickRandom(noseTypes, random),
    mouthType: pickRandom(mouthTypes, random),
    hairStyle: pickRandom(hairStyles, random),
    hairColor: pickRandom(HAIR_COLOR_PALETTE.slice(0, 8), random),
    topStyle: pickRandom(topBias, random),
    topColor: pickRandom(CLOTHING_COLOR_PALETTE, random),
    bottomStyle: pickRandom(bottomStyles, random),
    bottomColor: pickRandom(CLOTHING_COLOR_PALETTE, random)
  };
}

/**
 * Convert personality traits to avatar appearance hints
 */
export function traitsToAvatarHints(traits: PersonalityTrait[]): Partial<Avatar3DConfig> {
  const hints: Partial<Avatar3DConfig> = {};
  
  if (traits.includes('Competitive') || traits.includes('Confrontational')) {
    hints.bodyType = 'athletic';
  }
  
  if (traits.includes('Strategic') || traits.includes('Analytical')) {
    hints.topStyle = 'blazer';
  }
  
  if (traits.includes('Social') || traits.includes('Charming')) {
    hints.topColor = '#E91E63'; // Vibrant pink
  }
  
  if (traits.includes('Sneaky') || traits.includes('Deceptive')) {
    hints.topColor = '#1A1A1A'; // Dark clothing
  }
  
  if (traits.includes('Introverted')) {
    hints.topStyle = 'hoodie';
    hints.topColor = '#607D8B'; // Muted blue-grey
  }
  
  return hints;
}

/**
 * Generate default config with random variations
 */
export function generateDefaultConfig(): Avatar3DConfig {
  return generateAvatarConfig('default', Math.random().toString());
}
