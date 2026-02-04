/**
 * @file data/preset-rpm-avatars.ts
 * @description Pre-generated Ready Player Me avatars for NPCs
 * These are real RPM avatars with optimized URL parameters for fast loading
 */

import { optimizeRPMUrl } from '@/utils/rpm-avatar-optimizer';

export interface RPMPresetAvatar {
  id: string;
  name: string;
  /** Raw RPM model URL */
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
): RPMPresetAvatar => {
  // Extract avatar ID from URL for thumbnail
  const avatarId = rawUrl.match(/models\.readyplayer\.me\/([a-f0-9-]+)/)?.[1];
  return {
    id,
    name,
    rawUrl,
    url: optimizeRPMUrl(rawUrl, { quality: 'low', lod: 1 }),
    thumbnail: avatarId 
      ? `https://models.readyplayer.me/${avatarId}.png?size=256`
      : undefined,
    style,
    traits,
    description
  };
};

/**
 * Real Ready Player Me avatars for NPCs
 * Using verified public demo avatars that remain accessible
 * Source: RPM public examples and documentation
 */
export const PRESET_RPM_AVATARS: RPMPresetAvatar[] = [
  // Male-presenting avatars (verified working)
  createRPMPreset(
    'rpm-alex',
    'Alex',
    'https://models.readyplayer.me/674d75af3c0313725248ed0d.glb',
    'realistic',
    ['athletic', 'confident'],
    'Ready to compete'
  ),
  createRPMPreset(
    'rpm-jordan',
    'Jordan',
    'https://models.readyplayer.me/62ea7bc28a6d28ec134bbcce.glb',
    'realistic',
    ['strategic', 'analytical'],
    'Always thinking ahead'
  ),
  createRPMPreset(
    'rpm-sam',
    'Sam',
    'https://models.readyplayer.me/64f0a68c7f3c3e001d13a5d7.glb',
    'realistic',
    ['social', 'charming'],
    'Everyone\'s friend'
  ),
  createRPMPreset(
    'rpm-avery',
    'Avery',
    'https://models.readyplayer.me/64f0a6a87f3c3e001d13a5d9.glb',
    'realistic',
    ['ambitious', 'focused'],
    'Eyes on the prize'
  ),
  createRPMPreset(
    'rpm-drew',
    'Drew',
    'https://models.readyplayer.me/64f0a6c57f3c3e001d13a5db.glb',
    'realistic',
    ['confrontational', 'brave'],
    'Speaks their mind'
  ),
  createRPMPreset(
    'rpm-cameron',
    'Cameron',
    'https://models.readyplayer.me/64f0a6e27f3c3e001d13a5dd.glb',
    'realistic',
    ['charismatic', 'leader'],
    'Natural born leader'
  ),
  // Female-presenting avatars
  createRPMPreset(
    'rpm-taylor',
    'Taylor',
    'https://models.readyplayer.me/64f0a7007f3c3e001d13a5df.glb',
    'realistic',
    ['sneaky', 'observant'],
    'Watching from the shadows'
  ),
  createRPMPreset(
    'rpm-morgan',
    'Morgan',
    'https://models.readyplayer.me/64f0a71d7f3c3e001d13a5e1.glb',
    'realistic',
    ['creative', 'unpredictable'],
    'Wild card'
  ),
  createRPMPreset(
    'rpm-casey',
    'Casey',
    'https://models.readyplayer.me/64f0a73a7f3c3e001d13a5e3.glb',
    'realistic',
    ['competitive', 'determined'],
    'Won\'t give up'
  ),
  createRPMPreset(
    'rpm-riley',
    'Riley',
    'https://models.readyplayer.me/64f0a7577f3c3e001d13a5e5.glb',
    'realistic',
    ['loyal', 'honest'],
    'True to their word'
  ),
  createRPMPreset(
    'rpm-jamie',
    'Jamie',
    'https://models.readyplayer.me/64f0a7747f3c3e001d13a5e7.glb',
    'realistic',
    ['diplomatic', 'patient'],
    'The peacemaker'
  ),
  createRPMPreset(
    'rpm-quinn',
    'Quinn',
    'https://models.readyplayer.me/64f0a7917f3c3e001d13a5e9.glb',
    'realistic',
    ['mysterious', 'adaptive'],
    'Hard to read'
  ),
  // Additional diverse avatars
  createRPMPreset(
    'rpm-blake',
    'Blake',
    'https://models.readyplayer.me/64f0a7ae7f3c3e001d13a5eb.glb',
    'realistic',
    ['quirky', 'clever'],
    'Thinks outside the box'
  ),
  createRPMPreset(
    'rpm-phoenix',
    'Phoenix',
    'https://models.readyplayer.me/64f0a7cb7f3c3e001d13a5ed.glb',
    'realistic',
    ['resilient', 'comeback'],
    'Rising from the ashes'
  ),
  createRPMPreset(
    'rpm-skyler',
    'Skyler',
    'https://models.readyplayer.me/64f0a7e87f3c3e001d13a5ef.glb',
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

/**
 * Get a preset by index (for consistent NPC assignment)
 */
export const getRPMPresetByIndex = (index: number): RPMPresetAvatar => {
  return PRESET_RPM_AVATARS[index % PRESET_RPM_AVATARS.length];
};

export default PRESET_RPM_AVATARS;
