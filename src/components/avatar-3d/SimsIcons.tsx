/**
 * @file avatar-3d/SimsIcons.tsx
 * @description SVG silhouette icons for Sims-style avatar customization
 */

import React from 'react';

// Body Type Icons
export const SlimBodyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 48" className={className} fill="currentColor">
    <ellipse cx="16" cy="6" rx="5" ry="6" />
    <path d="M13 12 L13 28 L11 46 L14 46 L16 32 L18 46 L21 46 L19 28 L19 12 Z" />
    <path d="M10 14 L13 14 L13 22 L10 20 Z" />
    <path d="M22 14 L19 14 L19 22 L22 20 Z" />
  </svg>
);

export const AverageBodyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 48" className={className} fill="currentColor">
    <ellipse cx="16" cy="6" rx="5" ry="6" />
    <path d="M11 12 L11 28 L9 46 L13 46 L16 32 L19 46 L23 46 L21 28 L21 12 Z" />
    <path d="M8 14 L11 14 L11 22 L8 20 Z" />
    <path d="M24 14 L21 14 L21 22 L24 20 Z" />
  </svg>
);

export const AthleticBodyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 48" className={className} fill="currentColor">
    <ellipse cx="16" cy="6" rx="5" ry="6" />
    <path d="M10 12 L10 18 L12 28 L9 46 L14 46 L16 32 L18 46 L23 46 L20 28 L22 18 L22 12 Z" />
    <path d="M6 14 L10 14 L10 22 L6 18 Z" />
    <path d="M26 14 L22 14 L22 22 L26 18 Z" />
  </svg>
);

export const StockyBodyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 48" className={className} fill="currentColor">
    <ellipse cx="16" cy="6" rx="6" ry="6" />
    <path d="M8 12 L8 30 L7 46 L12 46 L16 32 L20 46 L25 46 L24 30 L24 12 Z" />
    <path d="M5 14 L8 14 L8 24 L5 20 Z" />
    <path d="M27 14 L24 14 L24 24 L27 20 Z" />
  </svg>
);

// Hair Style Icons
export const ShortHairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 18 C8 8, 24 8, 24 18 L24 16 C24 6, 8 6, 8 16 Z" />
  </svg>
);

export const MediumHairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M6 22 C6 8, 26 8, 26 22 L26 16 C26 4, 6 4, 6 16 Z" />
    <path d="M6 22 L6 26 L10 24 L10 22 Z" />
    <path d="M26 22 L26 26 L22 24 L22 22 Z" />
  </svg>
);

export const LongHairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M5 20 C5 6, 27 6, 27 20 L27 14 C27 2, 5 2, 5 14 Z" />
    <path d="M5 20 L5 30 L10 28 L10 20 Z" />
    <path d="M27 20 L27 30 L22 28 L22 20 Z" />
  </svg>
);

export const BuzzHairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M10 18 C10 12, 22 12, 22 18 L22 16 C22 10, 10 10, 10 16 Z" />
  </svg>
);

export const PonytailHairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 18 C8 8, 24 8, 24 18 L24 16 C24 6, 8 6, 8 16 Z" />
    <ellipse cx="24" cy="20" rx="4" ry="6" />
  </svg>
);

export const BunHairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 18 C8 8, 24 8, 24 18 L24 16 C24 6, 8 6, 8 16 Z" />
    <circle cx="16" cy="6" r="5" />
  </svg>
);

export const CurlyHairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M6 20 C4 10, 28 10, 26 20 C28 8, 4 8, 6 20 Z" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="26" cy="18" r="3" />
    <circle cx="10" cy="8" r="2" />
    <circle cx="22" cy="8" r="2" />
    <circle cx="16" cy="6" r="3" />
  </svg>
);

export const BaldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" opacity="0.3">
    <ellipse cx="16" cy="16" rx="10" ry="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
  </svg>
);

// Clothing Icons
export const TshirtIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 8 L4 12 L8 14 L8 28 L24 28 L24 14 L28 12 L24 8 L20 10 L12 10 L8 8 Z" />
  </svg>
);

export const TanktopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M10 8 L10 28 L22 28 L22 8 L18 10 L14 10 L10 8 Z" />
  </svg>
);

export const BlazerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M6 8 L2 12 L6 14 L6 28 L14 28 L16 12 L18 28 L26 28 L26 14 L30 12 L26 8 L20 10 L16 6 L12 10 L6 8 Z" />
  </svg>
);

export const HoodieIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 10 L4 14 L8 16 L8 28 L24 28 L24 16 L28 14 L24 10 L20 12 L16 8 L12 12 L8 10 Z" />
    <ellipse cx="16" cy="8" rx="4" ry="3" />
  </svg>
);

export const DressIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M12 6 L10 12 L6 28 L26 28 L22 12 L20 6 L16 8 L12 6 Z" />
  </svg>
);

export const PantsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 4 L8 12 L10 28 L15 28 L16 12 L17 28 L22 28 L24 12 L24 4 Z" />
  </svg>
);

export const ShortsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 4 L8 8 L10 18 L15 18 L16 10 L17 18 L22 18 L24 8 L24 4 Z" />
  </svg>
);

export const SkirtIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M10 4 L6 24 L26 24 L22 4 Z" />
  </svg>
);

export const JeansIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M8 4 L8 12 L10 28 L15 28 L16 12 L17 28 L22 28 L24 12 L24 4 Z" />
    <line x1="10" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    <line x1="18" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

// Face Feature Icons
export const RoundFaceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <circle cx="16" cy="16" r="12" />
  </svg>
);

export const OvalFaceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <ellipse cx="16" cy="16" rx="10" ry="14" />
  </svg>
);

export const SquareFaceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <rect x="4" y="4" width="24" height="26" rx="4" />
  </svg>
);

export const HeartFaceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M16 30 L4 14 C4 8, 10 4, 16 10 C22 4, 28 8, 28 14 L16 30 Z" />
  </svg>
);

// Plumbob (Sims Diamond) Icon
export const PlumbobIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 32" className={className} fill="currentColor">
    <path d="M12 0 L24 10 L12 32 L0 10 Z" />
    <path d="M12 0 L12 32" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <path d="M0 10 L24 10" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

// Dice Icon for Randomize
export const DiceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// Icon mapping for option selectors
export const BODY_TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  slim: SlimBodyIcon,
  average: AverageBodyIcon,
  athletic: AthleticBodyIcon,
  stocky: StockyBodyIcon
};

export const HAIR_STYLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  short: ShortHairIcon,
  medium: MediumHairIcon,
  long: LongHairIcon,
  buzz: BuzzHairIcon,
  ponytail: PonytailHairIcon,
  bun: BunHairIcon,
  curly: CurlyHairIcon,
  bald: BaldIcon
};

export const TOP_STYLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  tshirt: TshirtIcon,
  tanktop: TanktopIcon,
  blazer: BlazerIcon,
  hoodie: HoodieIcon,
  dress: DressIcon
};

export const BOTTOM_STYLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  pants: PantsIcon,
  shorts: ShortsIcon,
  skirt: SkirtIcon,
  jeans: JeansIcon
};

export const HEAD_SHAPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  round: RoundFaceIcon,
  oval: OvalFaceIcon,
  square: SquareFaceIcon,
  heart: HeartFaceIcon
};
