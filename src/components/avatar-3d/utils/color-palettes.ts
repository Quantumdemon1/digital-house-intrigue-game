/**
 * @file avatar-3d/utils/color-palettes.ts
 * @description Color palettes for Sims-style 3D avatars
 */

// Skin tone palette - diverse range
export const SKIN_TONES = {
  light: ['#FFECD2', '#FFD9B3', '#F5D0C5', '#E8C4A0'],
  medium: ['#D4A574', '#C4956A', '#B8860B', '#A67B5B'],
  dark: ['#8B6914', '#6B4423', '#5D4037', '#4E342E'],
  deep: ['#3E2723', '#2D1B15', '#1A1009', '#0D0805']
};

export const SKIN_TONE_ARRAY = [
  ...SKIN_TONES.light,
  ...SKIN_TONES.medium,
  ...SKIN_TONES.dark,
  ...SKIN_TONES.deep
];

// Natural hair colors
export const NATURAL_HAIR_COLORS = [
  '#1A1A1A', // Black
  '#2C1810', // Dark brown
  '#3E2723', // Brown
  '#5D4037', // Medium brown
  '#8D6E63', // Light brown
  '#D7CCC8', // Platinum/Grey
  '#FFE082', // Blonde
  '#FF8F00', // Strawberry
  '#B71C1C'  // Auburn
];

// Fantasy hair colors
export const FANTASY_HAIR_COLORS = [
  '#E91E63', // Hot pink
  '#9C27B0', // Purple
  '#3F51B5', // Indigo
  '#00BCD4', // Cyan
  '#4CAF50', // Green
  '#FF5722'  // Orange
];

export const ALL_HAIR_COLORS = [...NATURAL_HAIR_COLORS, ...FANTASY_HAIR_COLORS];

// Eye colors
export const EYE_COLORS = {
  brown: ['#5D4037', '#4E342E', '#3E2723', '#6D4C41'],
  blue: ['#1565C0', '#1976D2', '#42A5F5', '#64B5F6'],
  green: ['#2E7D32', '#388E3C', '#4CAF50', '#66BB6A'],
  grey: ['#616161', '#757575', '#9E9E9E', '#78909C'],
  amber: ['#F57F17', '#FFA000', '#FFB300', '#FFCA28'],
  hazel: ['#8D6E63', '#795548', '#6D4C41', '#A1887F']
};

export const EYE_COLOR_ARRAY = Object.values(EYE_COLORS).flat();

// Clothing colors by category
export const CLOTHING_COLORS = {
  warm: ['#F44336', '#E91E63', '#FF5722', '#FF9800', '#FFC107'],
  cool: ['#2196F3', '#03A9F4', '#00BCD4', '#3F51B5', '#673AB7'],
  earth: ['#795548', '#8D6E63', '#A1887F', '#4E342E', '#3E2723'],
  neutral: ['#9E9E9E', '#607D8B', '#455A64', '#37474F', '#263238'],
  vibrant: ['#E91E63', '#9C27B0', '#4CAF50', '#FFEB3B', '#00BCD4'],
  monochrome: ['#1A1A1A', '#424242', '#616161', '#FAFAFA', '#ECEFF1']
};

export const ALL_CLOTHING_COLORS = Object.values(CLOTHING_COLORS).flat();

// Status-based glow colors (used for effects)
export const STATUS_GLOW_COLORS = {
  hoh: '#FFD700',      // Gold
  nominee: '#EF4444',  // Red
  pov: '#FFD700',      // Gold
  safe: '#22C55E',     // Green
  evicted: '#6B7280',  // Grey
  player: '#22C55E'    // Green
};

// Mood-based accent colors
export const MOOD_COLORS = {
  Happy: '#FFD54F',
  Content: '#81C784',
  Neutral: '#90A4AE',
  Upset: '#7986CB',
  Angry: '#EF5350'
};

/**
 * Get a random color from a palette
 */
export function getRandomFromPalette(palette: string[]): string {
  return palette[Math.floor(Math.random() * palette.length)];
}

/**
 * Lighten a hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

/**
 * Darken a hex color
 */
export function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}
