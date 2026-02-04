/**
 * @file src/models/relationship-tier.ts
 * @description Relationship tier definitions and thresholds for milestone tracking
 */

export type RelationshipTier = 
  | 'enemy'
  | 'rival'
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close_friend'
  | 'ally';

export interface TierInfo {
  tier: RelationshipTier;
  minScore: number;
  maxScore: number;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const RELATIONSHIP_TIERS: TierInfo[] = [
  { tier: 'enemy', minScore: -100, maxScore: -50, label: 'Enemy', icon: '💀', color: 'text-red-700', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  { tier: 'rival', minScore: -49, maxScore: -20, label: 'Rival', icon: '⚔️', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  { tier: 'stranger', minScore: -19, maxScore: 24, label: 'Stranger', icon: '👤', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  { tier: 'acquaintance', minScore: 25, maxScore: 49, label: 'Acquaintance', icon: '🤝', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { tier: 'friend', minScore: 50, maxScore: 74, label: 'Friend', icon: '😊', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { tier: 'close_friend', minScore: 75, maxScore: 89, label: 'Close Friend', icon: '💚', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { tier: 'ally', minScore: 90, maxScore: 100, label: 'Ally', icon: '⭐', color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
];

// Milestone thresholds (crossing these triggers celebrations)
export const MILESTONE_THRESHOLDS = [25, 50, 75] as const;
export type MilestoneThreshold = typeof MILESTONE_THRESHOLDS[number];

export interface MilestoneInfo {
  threshold: MilestoneThreshold;
  fromTier: RelationshipTier;
  toTier: RelationshipTier;
  celebrationType: 'toast' | 'celebration' | 'confetti';
  message: string;
  unlockedDeals: string[];
}

export const MILESTONE_INFO: Record<MilestoneThreshold, MilestoneInfo> = {
  25: {
    threshold: 25,
    fromTier: 'stranger',
    toTier: 'acquaintance',
    celebrationType: 'toast',
    message: 'You are now Acquaintances!',
    unlockedDeals: ['information_sharing'],
  },
  50: {
    threshold: 50,
    fromTier: 'acquaintance',
    toTier: 'friend',
    celebrationType: 'celebration',
    message: 'You are now Friends!',
    unlockedDeals: ['safety_agreement', 'vote_together'],
  },
  75: {
    threshold: 75,
    fromTier: 'friend',
    toTier: 'close_friend',
    celebrationType: 'confetti',
    message: 'You are now Close Friends!',
    unlockedDeals: ['partnership', 'final_two', 'alliance_invite'],
  },
};

/**
 * Get the tier for a relationship score
 */
export function getTierForScore(score: number): TierInfo {
  const clampedScore = Math.max(-100, Math.min(100, score));
  
  for (const tier of RELATIONSHIP_TIERS) {
    if (clampedScore >= tier.minScore && clampedScore <= tier.maxScore) {
      return tier;
    }
  }
  
  // Fallback to stranger
  return RELATIONSHIP_TIERS.find(t => t.tier === 'stranger')!;
}

/**
 * Check if a score change crosses a milestone threshold
 */
export function checkMilestoneCrossing(
  oldScore: number,
  newScore: number
): MilestoneThreshold | null {
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (oldScore < threshold && newScore >= threshold) {
      return threshold;
    }
  }
  return null;
}

/**
 * Get milestone info for a threshold
 */
export function getMilestoneInfo(threshold: MilestoneThreshold): MilestoneInfo {
  return MILESTONE_INFO[threshold];
}
