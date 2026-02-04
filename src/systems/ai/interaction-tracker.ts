
/**
 * @file src/systems/ai/interaction-tracker.ts
 * @description Comprehensive interaction tracking system for houseguests
 */

import type { Logger } from '@/utils/logger';
import { config } from '@/config';

export type InteractionType =
  | 'conversation'
  | 'strategic_discussion'
  | 'promise_made'
  | 'promise_kept'
  | 'promise_broken'
  | 'nominated'
  | 'saved_with_veto'
  | 'voted_against'
  | 'voted_for'
  | 'alliance_formed'
  | 'alliance_betrayed'
  | 'rumor_spread'
  | 'defended'
  | 'attacked'
  | 'helped'
  | 'ignored'
  // Deal-related interaction types
  | 'deal_proposed'
  | 'deal_accepted'
  | 'deal_fulfilled'
  | 'deal_broken';

export type InteractionSentiment = 'positive' | 'negative' | 'neutral';

export interface TrackedInteraction {
  id: string;
  week: number;
  type: InteractionType;
  fromId: string;
  toId: string;
  sentiment: InteractionSentiment;
  impact: number; // -100 to 100
  description: string;
  decaysAt?: number; // Week when impact starts fading
  neverDecays?: boolean; // For betrayals and major events
}

export interface InteractionSummary {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalImpact: number;
  recentImpact: number; // Last 2 weeks
  mostSignificantEvent: TrackedInteraction | null;
}

/**
 * Get the default sentiment and impact for an interaction type
 */
export function getInteractionDefaults(type: InteractionType): { sentiment: InteractionSentiment; impact: number; decays: boolean } {
  switch (type) {
    case 'conversation':
      return { sentiment: 'positive', impact: 5, decays: true };
    case 'strategic_discussion':
      return { sentiment: 'positive', impact: 10, decays: true };
    case 'promise_made':
      return { sentiment: 'positive', impact: 15, decays: false };
    case 'promise_kept':
      return { sentiment: 'positive', impact: 25, decays: false };
    case 'promise_broken':
      return { sentiment: 'negative', impact: -40, decays: false };
    case 'nominated':
      return { sentiment: 'negative', impact: -25, decays: false };
    case 'saved_with_veto':
      return { sentiment: 'positive', impact: 40, decays: false };
    case 'voted_against':
      return { sentiment: 'negative', impact: -20, decays: false };
    case 'voted_for':
      return { sentiment: 'positive', impact: 15, decays: true };
    case 'alliance_formed':
      return { sentiment: 'positive', impact: 30, decays: false };
    case 'alliance_betrayed':
      return { sentiment: 'negative', impact: -50, decays: false };
    case 'rumor_spread':
      return { sentiment: 'negative', impact: -15, decays: true };
    case 'defended':
      return { sentiment: 'positive', impact: 20, decays: true };
    case 'attacked':
      return { sentiment: 'negative', impact: -20, decays: true };
    case 'helped':
      return { sentiment: 'positive', impact: 15, decays: true };
    case 'ignored':
      return { sentiment: 'negative', impact: -5, decays: true };
    // Deal-related interactions - stronger impact than promises
    case 'deal_proposed':
      return { sentiment: 'positive', impact: 8, decays: true };
    case 'deal_accepted':
      return { sentiment: 'positive', impact: 18, decays: false };
    case 'deal_fulfilled':
      return { sentiment: 'positive', impact: 35, decays: false };
    case 'deal_broken':
      return { sentiment: 'negative', impact: -50, decays: false };
    default:
      return { sentiment: 'neutral', impact: 0, decays: true };
  }
}

/**
 * System for tracking all interactions between houseguests
 */
export class InteractionTracker {
  private interactions: TrackedInteraction[] = [];
  private logger: Logger;
  private currentWeek: number = 1;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Set the current game week
   */
  setCurrentWeek(week: number): void {
    this.currentWeek = week;
  }

  /**
   * Track a new interaction between houseguests
   */
  trackInteraction(
    fromId: string,
    toId: string,
    type: InteractionType,
    description: string,
    customImpact?: number
  ): TrackedInteraction {
    const defaults = getInteractionDefaults(type);
    const impact = customImpact ?? defaults.impact;

    const interaction: TrackedInteraction = {
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      week: this.currentWeek,
      type,
      fromId,
      toId,
      sentiment: impact > 0 ? 'positive' : impact < 0 ? 'negative' : 'neutral',
      impact,
      description,
      decaysAt: defaults.decays ? this.currentWeek + config.MEMORY_RETENTION_WEEKS : undefined,
      neverDecays: !defaults.decays
    };

    this.interactions.push(interaction);
    this.logger.debug(`Tracked interaction: ${type} from ${fromId} to ${toId} (impact: ${impact})`);

    return interaction;
  }

  /**
   * Get all interactions between two specific houseguests
   */
  getInteractionsBetween(guest1Id: string, guest2Id: string): TrackedInteraction[] {
    return this.interactions.filter(i =>
      (i.fromId === guest1Id && i.toId === guest2Id) ||
      (i.fromId === guest2Id && i.toId === guest1Id)
    );
  }

  /**
   * Get all interactions involving a specific houseguest
   */
  getInteractionsFor(houseguestId: string): TrackedInteraction[] {
    return this.interactions.filter(i =>
      i.fromId === houseguestId || i.toId === houseguestId
    );
  }

  /**
   * Get summary of interactions between two houseguests
   */
  getInteractionSummary(fromId: string, toId: string): InteractionSummary {
    const interactions = this.getInteractionsBetween(fromId, toId);
    
    // Filter for interactions FROM the perspective houseguest's POV
    // (i.e., things the target did TO the perspective houseguest)
    const relevantInteractions = interactions.filter(i => i.toId === fromId);

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let totalImpact = 0;
    let recentImpact = 0;
    let mostSignificantEvent: TrackedInteraction | null = null;

    relevantInteractions.forEach(interaction => {
      // Apply decay
      const effectiveImpact = this.calculateEffectiveImpact(interaction);
      totalImpact += effectiveImpact;

      // Count by sentiment
      if (interaction.sentiment === 'positive') positiveCount++;
      else if (interaction.sentiment === 'negative') negativeCount++;
      else neutralCount++;

      // Recent impact (last 2 weeks)
      if (this.currentWeek - interaction.week <= 2) {
        recentImpact += effectiveImpact;
      }

      // Track most significant event
      if (!mostSignificantEvent || Math.abs(effectiveImpact) > Math.abs(this.calculateEffectiveImpact(mostSignificantEvent))) {
        mostSignificantEvent = interaction;
      }
    });

    return {
      positiveCount,
      negativeCount,
      neutralCount,
      totalImpact,
      recentImpact,
      mostSignificantEvent
    };
  }

  /**
   * Calculate the effective impact of an interaction after decay
   */
  private calculateEffectiveImpact(interaction: TrackedInteraction): number {
    if (interaction.neverDecays) {
      return interaction.impact;
    }

    if (!interaction.decaysAt || this.currentWeek < interaction.decaysAt) {
      return interaction.impact;
    }

    // Apply decay
    const weeksPastDecay = this.currentWeek - interaction.decaysAt;
    const decayMultiplier = Math.pow(1 - config.RELATIONSHIP_DECAY_RATE, weeksPastDecay);
    return interaction.impact * decayMultiplier;
  }

  /**
   * Get the trust score between two houseguests based on interactions
   */
  getTrustScore(fromId: string, toId: string): number {
    const summary = this.getInteractionSummary(fromId, toId);
    
    // Base trust on interaction history
    let trustScore = 50; // Neutral starting point
    
    // Add total impact (capped)
    trustScore += Math.max(-40, Math.min(40, summary.totalImpact / 2));
    
    // Bonus for recent positive interactions
    if (summary.recentImpact > 0) {
      trustScore += Math.min(10, summary.recentImpact / 3);
    }
    
    // Penalty for recent negative interactions
    if (summary.recentImpact < 0) {
      trustScore += Math.max(-15, summary.recentImpact / 2);
    }
    
    // Major penalty for betrayals
    const betrayals = this.interactions.filter(i =>
      i.toId === fromId && 
      i.fromId === toId && 
      ['promise_broken', 'alliance_betrayed'].includes(i.type)
    );
    
    if (betrayals.length > 0) {
      trustScore -= 20 * betrayals.length;
    }
    
    return Math.max(0, Math.min(100, trustScore));
  }

  /**
   * Get all interactions of a specific type
   */
  getInteractionsByType(type: InteractionType): TrackedInteraction[] {
    return this.interactions.filter(i => i.type === type);
  }

  /**
   * Clear interactions (for game reset)
   */
  clearInteractions(): void {
    this.interactions = [];
  }

  /**
   * Serialize for save game
   */
  serialize(): TrackedInteraction[] {
    return [...this.interactions];
  }

  /**
   * Deserialize from save game
   */
  deserialize(data: TrackedInteraction[]): void {
    if (Array.isArray(data)) {
      this.interactions = data;
    }
  }
}
