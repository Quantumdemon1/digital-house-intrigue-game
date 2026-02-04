/**
 * @file data/preset-glb-avatars.ts
 * @description Curated library of self-hosted Draco-compressed GLB avatars
 * These are pre-optimized for instant loading without external API calls
 */

export type GLBCategory = 'humanoid' | 'robot' | 'demo';

export interface GLBPresetAvatar {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  style: 'casual' | 'formal' | 'athletic' | 'fantasy' | 'professional';
  bodyType?: 'slim' | 'average' | 'athletic' | 'stocky';
  category?: GLBCategory;
  traits?: string[];
  description?: string;
  /** If true, this is a placeholder entry without actual assets */
  isPlaceholder?: boolean;
}

/**
 * Curated preset GLB avatars
 * All models are verified human/humanoid-proportioned characters from Three.js examples
 */
export const PRESET_GLB_AVATARS: GLBPresetAvatar[] = [
  {
    id: 'glb-elena',
    name: 'Elena',
    url: '/avatars/glb/elena.glb',
    style: 'casual',
    bodyType: 'slim',
    category: 'humanoid',
    traits: ['graceful', 'charming'],
    description: 'Stylized female with expressive animations',
    isPlaceholder: false
  },
  {
    id: 'glb-marcus',
    name: 'Marcus',
    url: '/avatars/glb/marcus.glb',
    style: 'formal',
    bodyType: 'athletic',
    category: 'humanoid',
    traits: ['confident', 'tactical'],
    description: 'Military tactical character',
    isPlaceholder: false
  },
  {
    id: 'glb-sophia',
    name: 'Sophia',
    url: '/avatars/glb/sophia.glb',
    style: 'athletic',
    bodyType: 'average',
    category: 'humanoid',
    traits: ['strategic', 'disciplined'],
    description: 'Space-suited explorer character',
    isPlaceholder: false
  },
  {
    id: 'glb-tyler',
    name: 'Tyler',
    url: '/avatars/glb/tyler.glb',
    style: 'casual',
    bodyType: 'average',
    category: 'humanoid',
    traits: ['competitive', 'tech-savvy'],
    description: 'Ready Player Me styled avatar',
    isPlaceholder: false
  },
  {
    id: 'glb-jamal',
    name: 'Jamal',
    url: '/avatars/glb/jamal.glb',
    style: 'casual',
    bodyType: 'slim',
    category: 'humanoid',
    traits: ['analytical', 'expressive'],
    description: 'Face-capture model with expressions',
    isPlaceholder: false
  },
  {
    id: 'glb-maya',
    name: 'Maya',
    url: '/avatars/glb/maya.glb',
    style: 'fantasy',
    bodyType: 'slim',
    category: 'humanoid',
    traits: ['creative', 'charming'],
    description: 'Stylized female with smooth animations',
    isPlaceholder: false
  },
  {
    id: 'glb-derek',
    name: 'Derek',
    url: '/avatars/glb/derek.glb',
    style: 'casual',
    bodyType: 'average',
    category: 'demo',
    traits: ['honest', 'reliable'],
    description: 'Classic humanoid with space-suit style',
    isPlaceholder: false
  },
  {
    id: 'glb-nadia',
    name: 'Nadia',
    url: '/avatars/glb/nadia.glb',
    style: 'athletic',
    bodyType: 'athletic',
    category: 'robot',
    traits: ['fast', 'determined'],
    description: 'Sleek robotic humanoid figure',
    isPlaceholder: false
  }
];

/**
 * Get preset by ID
 */
export const getGLBPresetById = (id: string): GLBPresetAvatar | undefined => {
  return PRESET_GLB_AVATARS.find(preset => preset.id === id);
};

/**
 * Get presets by style
 */
export const getGLBPresetsByStyle = (style: GLBPresetAvatar['style']): GLBPresetAvatar[] => {
  return PRESET_GLB_AVATARS.filter(preset => preset.style === style);
};

/**
 * Get presets by trait
 */
export const getGLBPresetsByTrait = (trait: string): GLBPresetAvatar[] => {
  return PRESET_GLB_AVATARS.filter(preset => 
    preset.traits?.some(t => t.toLowerCase().includes(trait.toLowerCase()))
  );
};

/**
 * Get presets by category
 */
export const getGLBPresetsByCategory = (category: GLBCategory): GLBPresetAvatar[] => {
  return PRESET_GLB_AVATARS.filter(preset => preset.category === category);
};

/**
 * Get random preset
 */
export const getRandomGLBPreset = (): GLBPresetAvatar => {
  return PRESET_GLB_AVATARS[Math.floor(Math.random() * PRESET_GLB_AVATARS.length)];
};

export default PRESET_GLB_AVATARS;
