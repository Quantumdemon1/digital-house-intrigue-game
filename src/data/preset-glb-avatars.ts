/**
 * @file data/preset-glb-avatars.ts
 * @description Curated library of self-hosted Draco-compressed GLB avatars
 * These are pre-optimized for instant loading without external API calls
 */

export interface GLBPresetAvatar {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  style: 'casual' | 'formal' | 'athletic' | 'fantasy' | 'professional';
  bodyType?: 'slim' | 'average' | 'athletic' | 'stocky';
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
    thumbnail: '/avatars/thumbnails/marcus.webp',
    style: 'casual',
    bodyType: 'slim',
    traits: ['confident', 'agile'],
    description: 'Rigged figure with humanoid proportions',
    isPlaceholder: false
  },
  {
    id: 'glb-elena',
    name: 'Elena',
    url: '/avatars/glb/elena.glb',
    thumbnail: '/avatars/thumbnails/elena.webp',
    style: 'casual',
    bodyType: 'slim',
    traits: ['graceful', 'charming'],
    description: 'Expressive character with smooth animations',
    isPlaceholder: false
  },
  {
    id: 'glb-tyler',
    name: 'Tyler',
    url: '/avatars/glb/tyler.glb',
    thumbnail: '/avatars/thumbnails/tyler.webp',
    style: 'athletic',
    bodyType: 'athletic',
    traits: ['competitive', 'tech-savvy'],
    description: 'Robot-style character ready for action',
    isPlaceholder: false
  },
  {
    id: 'glb-sophia',
    name: 'Sophia',
    url: '/avatars/glb/sophia.glb',
    thumbnail: '/avatars/thumbnails/sophia.webp',
    style: 'formal',
    bodyType: 'athletic',
    traits: ['strategic', 'disciplined'],
    description: 'Military-inspired tactical character',
    isPlaceholder: false
  },
  {
    id: 'glb-jamal',
    name: 'Jamal',
    url: '/avatars/glb/jamal.glb',
    thumbnail: '/avatars/thumbnails/jamal.webp',
    style: 'casual',
    bodyType: 'slim',
    traits: ['analytical', 'calm'],
    description: 'Simple rigged humanoid with clean lines',
    isPlaceholder: false
  },
  {
    id: 'glb-maya',
    name: 'Maya',
    url: '/avatars/glb/maya.glb',
    thumbnail: '/avatars/thumbnails/maya.webp',
    style: 'fantasy',
    bodyType: 'average',
    traits: ['creative', 'expressive'],
    description: 'Expressive robot with emotional animations',
    isPlaceholder: false
  },
  {
    id: 'glb-derek',
    name: 'Derek',
    url: '/avatars/glb/derek.glb',
    thumbnail: '/avatars/thumbnails/derek.webp',
    style: 'casual',
    bodyType: 'average',
    traits: ['honest', 'reliable'],
    description: 'Classic humanoid with space-suit style',
    isPlaceholder: false
  },
  {
    id: 'glb-luna',
    name: 'Luna',
    url: '/avatars/glb/luna.glb',
    thumbnail: '/avatars/thumbnails/luna.webp',
    style: 'fantasy',
    bodyType: 'slim',
    traits: ['quick', 'clever'],
    description: 'Playful fox character with smooth motion',
    isPlaceholder: false
  },
  {
    id: 'glb-carlos',
    name: 'Carlos',
    url: '/avatars/glb/carlos.glb',
    thumbnail: '/avatars/thumbnails/carlos.webp',
    style: 'professional',
    bodyType: 'average',
    traits: ['diplomatic', 'patient'],
    description: 'The mediator',
    isPlaceholder: true
  },
  {
    id: 'glb-zara',
    name: 'Zara',
    url: '/avatars/glb/zara.glb',
    thumbnail: '/avatars/thumbnails/zara.webp',
    style: 'athletic',
    bodyType: 'athletic',
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
