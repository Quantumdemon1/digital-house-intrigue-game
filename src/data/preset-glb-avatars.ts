/**
 * @file data/preset-glb-avatars.ts
 * @description Curated library of self-hosted Draco-compressed GLB avatars
 * These are pre-optimized for instant loading without external API calls
 */

export type GLBCategory = 'humanoid' | 'robot' | 'creature' | 'demo';

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
 * 
 * NOTE: These are placeholder entries. To populate with real avatars:
 * 1. Download CC0/free-use GLB characters from Mixamo, Sketchfab, etc.
 * 2. Optimize using gltf-pipeline with Draco compression
 * 3. Place in /public/avatars/glb/
 * 4. Generate thumbnail images for each
 */
export const PRESET_GLB_AVATARS: GLBPresetAvatar[] = [
  {
    id: 'glb-marcus',
    name: 'Marcus',
    url: '/avatars/glb/marcus.glb',
    style: 'casual',
    bodyType: 'slim',
    category: 'demo',
    traits: ['confident', 'agile'],
    description: 'Rigged figure with humanoid proportions',
    isPlaceholder: false
  },
  {
    id: 'glb-elena',
    name: 'Elena',
    url: '/avatars/glb/elena.glb',
    style: 'casual',
    bodyType: 'slim',
    category: 'humanoid',
    traits: ['graceful', 'charming'],
    description: 'Expressive character with smooth animations',
    isPlaceholder: false
  },
  {
    id: 'glb-tyler',
    name: 'Tyler',
    url: '/avatars/glb/tyler.glb',
    style: 'athletic',
    bodyType: 'athletic',
    category: 'robot',
    traits: ['competitive', 'tech-savvy'],
    description: 'Robot-style character ready for action',
    isPlaceholder: false
  },
  {
    id: 'glb-sophia',
    name: 'Sophia',
    url: '/avatars/glb/sophia.glb',
    style: 'formal',
    bodyType: 'athletic',
    category: 'humanoid',
    traits: ['strategic', 'disciplined'],
    description: 'Military-inspired tactical character',
    isPlaceholder: false
  },
  {
    id: 'glb-jamal',
    name: 'Jamal',
    url: '/avatars/glb/jamal.glb',
    style: 'casual',
    bodyType: 'slim',
    category: 'demo',
    traits: ['analytical', 'calm'],
    description: 'Simple rigged humanoid with clean lines',
    isPlaceholder: false
  },
  {
    id: 'glb-maya',
    name: 'Maya',
    url: '/avatars/glb/maya.glb',
    style: 'fantasy',
    bodyType: 'average',
    category: 'robot',
    traits: ['creative', 'expressive'],
    description: 'Expressive robot with emotional animations',
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
    id: 'glb-luna',
    name: 'Luna',
    url: '/avatars/glb/luna.glb',
    style: 'fantasy',
    bodyType: 'slim',
    category: 'creature',
    traits: ['quick', 'clever'],
    description: 'Playful fox character with smooth motion',
    isPlaceholder: false
  },
  {
    id: 'glb-carlos',
    name: 'Carlos',
    url: '/avatars/glb/carlos.glb',
    style: 'professional',
    bodyType: 'average',
    category: 'humanoid',
    traits: ['diplomatic', 'patient'],
    description: 'The mediator',
    isPlaceholder: true
  },
  {
    id: 'glb-zara',
    name: 'Zara',
    url: '/avatars/glb/zara.glb',
    style: 'athletic',
    bodyType: 'athletic',
    category: 'creature',
    traits: ['fast', 'determined'],
    description: 'Galloping horse with dynamic animations',
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
 * Get random preset
 */
export const getRandomGLBPreset = (): GLBPresetAvatar => {
  return PRESET_GLB_AVATARS[Math.floor(Math.random() * PRESET_GLB_AVATARS.length)];
};

export default PRESET_GLB_AVATARS;
