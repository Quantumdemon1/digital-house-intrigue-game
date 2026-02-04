/**
 * @file data/preset-vrm-avatars.ts
 * @description Curated library of VRM anime-style avatars
 * VRM is a standardized 3D avatar format optimized for VR/metaverse use
 */

export interface VRMPresetAvatar {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  style: 'anime-male' | 'anime-female' | 'chibi' | 'fantasy' | 'modern';
  traits?: string[];
  description?: string;
  license?: 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'CC-BY-NC';
  author?: string;
  /** When true, the model file doesn't exist yet - prevents loading errors */
  isPlaceholder?: boolean;
}

/**
 * Curated preset VRM avatars
 * 
 * NOTE: These are placeholder entries. To populate with real avatars:
 * 1. Create avatars in VRoid Studio (free) or source from VRoid Hub (CC0 license)
 * 2. Export as VRM format
 * 3. Place in /public/avatars/vrm/
 * 4. Generate thumbnail images for each
 * 
 * VRM files are typically 5-15MB but load faster than RPM due to standardized format
 */
export const PRESET_VRM_AVATARS: VRMPresetAvatar[] = [
  {
    id: 'vrm-sakura',
    name: 'Sakura',
    url: '/avatars/vrm/sakura.vrm',
    thumbnail: '/avatars/thumbnails/sakura.webp',
    style: 'anime-female',
    traits: ['cheerful', 'outgoing'],
    description: 'Bright and energetic personality',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-haruto',
    name: 'Haruto',
    url: '/avatars/vrm/haruto.vrm',
    thumbnail: '/avatars/thumbnails/haruto.webp',
    style: 'anime-male',
    traits: ['strategic', 'calm'],
    description: 'Cool and collected strategist',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-yuki',
    name: 'Yuki',
    url: '/avatars/vrm/yuki.vrm',
    thumbnail: '/avatars/thumbnails/yuki.webp',
    style: 'anime-female',
    traits: ['mysterious', 'observant'],
    description: 'Quiet observer with hidden depths',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-ren',
    name: 'Ren',
    url: '/avatars/vrm/ren.vrm',
    thumbnail: '/avatars/thumbnails/ren.webp',
    style: 'anime-male',
    traits: ['competitive', 'honest'],
    description: 'Direct and competitive',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-miku',
    name: 'Miku',
    url: '/avatars/vrm/miku.vrm',
    thumbnail: '/avatars/thumbnails/miku.webp',
    style: 'fantasy',
    traits: ['creative', 'unpredictable'],
    description: 'Whimsical and creative spirit',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-kai',
    name: 'Kai',
    url: '/avatars/vrm/kai.vrm',
    thumbnail: '/avatars/thumbnails/kai.webp',
    style: 'modern',
    traits: ['social', 'charming'],
    description: 'Natural social butterfly',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-hana',
    name: 'Hana',
    url: '/avatars/vrm/hana.vrm',
    thumbnail: '/avatars/thumbnails/hana.webp',
    style: 'chibi',
    traits: ['cute', 'sneaky'],
    description: 'Don\'t underestimate the cute ones',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-takeshi',
    name: 'Takeshi',
    url: '/avatars/vrm/takeshi.vrm',
    thumbnail: '/avatars/thumbnails/takeshi.webp',
    style: 'anime-male',
    traits: ['athletic', 'loyal'],
    description: 'Loyal ally and fierce competitor',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-aoi',
    name: 'Aoi',
    url: '/avatars/vrm/aoi.vrm',
    thumbnail: '/avatars/thumbnails/aoi.webp',
    style: 'fantasy',
    traits: ['ethereal', 'wise'],
    description: 'Otherworldly wisdom',
    license: 'CC0',
    isPlaceholder: true
  },
  {
    id: 'vrm-sora',
    name: 'Sora',
    url: '/avatars/vrm/sora.vrm',
    thumbnail: '/avatars/thumbnails/sora.webp',
    style: 'modern',
    traits: ['confident', 'ambitious'],
    description: 'Eyes on the prize',
    license: 'CC0',
    isPlaceholder: true
  }
];

/**
 * Get preset by ID
 */
export const getVRMPresetById = (id: string): VRMPresetAvatar | undefined => {
  return PRESET_VRM_AVATARS.find(preset => preset.id === id);
};

/**
 * Get presets by style
 */
export const getVRMPresetsByStyle = (style: VRMPresetAvatar['style']): VRMPresetAvatar[] => {
  return PRESET_VRM_AVATARS.filter(preset => preset.style === style);
};

/**
 * Get presets by trait
 */
export const getVRMPresetsByTrait = (trait: string): VRMPresetAvatar[] => {
  return PRESET_VRM_AVATARS.filter(preset => 
    preset.traits?.some(t => t.toLowerCase().includes(trait.toLowerCase()))
  );
};

/**
 * Get random preset
 */
export const getRandomVRMPreset = (): VRMPresetAvatar => {
  return PRESET_VRM_AVATARS[Math.floor(Math.random() * PRESET_VRM_AVATARS.length)];
};

/**
 * Get URL for a VRM preset by ID
 */
export const getVRMPresetUrl = (presetId: string): string | undefined => {
  return getVRMPresetById(presetId)?.url;
};

export default PRESET_VRM_AVATARS;
