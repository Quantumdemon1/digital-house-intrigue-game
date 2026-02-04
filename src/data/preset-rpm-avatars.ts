/**
 * @file data/preset-rpm-avatars.ts
 * @description Pre-generated Ready Player Me avatars for NPCs
 * These are pre-made with optimized URL parameters for fast loading
 */

import { optimizeRPMUrl } from '@/utils/rpm-avatar-optimizer';

export interface RPMPresetAvatar {
  id: string;
  name: string;
  /** Raw RPM model URL (will be optimized on use) */
  rawUrl: string;
  /** Pre-optimized URL for immediate use */
  url: string;
  thumbnail?: string;
  style: 'realistic' | 'stylized';
  traits?: string[];
  description?: string;
}

/**
 * Helper to create pre-optimized RPM avatar entry
 */
const createRPMPreset = (
  id: string,
  name: string,
  rawUrl: string,
  style: 'realistic' | 'stylized',
  traits: string[],
  description: string
): RPMPresetAvatar => ({
  id,
  name,
  rawUrl,
  url: optimizeRPMUrl(rawUrl, { quality: 'low', lod: 1 }),
  thumbnail: `/avatars/thumbnails/${id}.webp`,
  style,
  traits,
  description
});

/**
 * Pre-generated RPM avatars for NPCs
 * 
 * NOTE: These URLs are placeholders. To populate:
 * 1. Visit demo.readyplayer.me and create 20-30 diverse avatars
 * 2. Copy the GLB URLs and replace the placeholder URLs below
 * 3. Generate thumbnail images for each avatar
 * 
 * The URLs will be automatically optimized with quality/compression params
 */
export const PRESET_RPM_AVATARS: RPMPresetAvatar[] = [
  createRPMPreset(
    'rpm-alex',
    'Alex',
    'https://models.readyplayer.me/placeholder-alex.glb',
    'realistic',
    ['athletic', 'confident'],
    'Ready to compete'
  ),
  createRPMPreset(
    'rpm-jordan',
    'Jordan',
    'https://models.readyplayer.me/placeholder-jordan.glb',
    'realistic',
    ['strategic', 'analytical'],
    'Always thinking ahead'
  ),
  createRPMPreset(
    'rpm-sam',
    'Sam',
    'https://models.readyplayer.me/placeholder-sam.glb',
    'realistic',
    ['social', 'charming'],
    'Everyone\'s friend'
  ),
  createRPMPreset(
    'rpm-taylor',
    'Taylor',
    'https://models.readyplayer.me/placeholder-taylor.glb',
    'realistic',
    ['sneaky', 'observant'],
    'Watching from the shadows'
  ),
  createRPMPreset(
    'rpm-morgan',
    'Morgan',
    'https://models.readyplayer.me/placeholder-morgan.glb',
    'stylized',
    ['creative', 'unpredictable'],
    'Wild card'
  ),
  createRPMPreset(
    'rpm-casey',
    'Casey',
    'https://models.readyplayer.me/placeholder-casey.glb',
    'realistic',
    ['competitive', 'determined'],
    'Won\'t give up'
  ),
  createRPMPreset(
    'rpm-riley',
    'Riley',
    'https://models.readyplayer.me/placeholder-riley.glb',
    'realistic',
    ['loyal', 'honest'],
    'True to their word'
  ),
  createRPMPreset(
    'rpm-jamie',
    'Jamie',
    'https://models.readyplayer.me/placeholder-jamie.glb',
    'stylized',
    ['diplomatic', 'patient'],
    'The peacemaker'
  ),
  createRPMPreset(
    'rpm-avery',
    'Avery',
    'https://models.readyplayer.me/placeholder-avery.glb',
    'realistic',
    ['ambitious', 'focused'],
    'Eyes on the prize'
  ),
  createRPMPreset(
    'rpm-quinn',
    'Quinn',
    'https://models.readyplayer.me/placeholder-quinn.glb',
    'realistic',
    ['mysterious', 'adaptive'],
    'Hard to read'
  ),
  createRPMPreset(
    'rpm-drew',
    'Drew',
    'https://models.readyplayer.me/placeholder-drew.glb',
    'realistic',
    ['confrontational', 'brave'],
    'Speaks their mind'
  ),
  createRPMPreset(
    'rpm-blake',
    'Blake',
    'https://models.readyplayer.me/placeholder-blake.glb',
    'stylized',
    ['quirky', 'clever'],
    'Thinks outside the box'
  ),
  createRPMPreset(
    'rpm-cameron',
    'Cameron',
    'https://models.readyplayer.me/placeholder-cameron.glb',
    'realistic',
    ['charismatic', 'leader'],
    'Natural born leader'
  ),
  createRPMPreset(
    'rpm-phoenix',
    'Phoenix',
    'https://models.readyplayer.me/placeholder-phoenix.glb',
    'stylized',
    ['resilient', 'comeback'],
    'Rising from the ashes'
  ),
  createRPMPreset(
    'rpm-skyler',
    'Skyler',
    'https://models.readyplayer.me/placeholder-skyler.glb',
    'realistic',
    ['intuitive', 'perceptive'],
    'Reads people well'
  )
];

/**
 * Get preset by ID
 */
export const getRPMPresetById = (id: string): RPMPresetAvatar | undefined => {
  return PRESET_RPM_AVATARS.find(preset => preset.id === id);
};

/**
 * Get presets by style
 */
export const getRPMPresetsByStyle = (style: RPMPresetAvatar['style']): RPMPresetAvatar[] => {
  return PRESET_RPM_AVATARS.filter(preset => preset.style === style);
};

/**
 * Get presets by trait
 */
export const getRPMPresetsByTrait = (trait: string): RPMPresetAvatar[] => {
  return PRESET_RPM_AVATARS.filter(preset => 
    preset.traits?.some(t => t.toLowerCase().includes(trait.toLowerCase()))
  );
};

/**
 * Get random preset
 */
export const getRandomRPMPreset = (): RPMPresetAvatar => {
  return PRESET_RPM_AVATARS[Math.floor(Math.random() * PRESET_RPM_AVATARS.length)];
};

export default PRESET_RPM_AVATARS;
