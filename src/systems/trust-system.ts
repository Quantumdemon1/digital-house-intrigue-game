/**
 * @file src/systems/trust-system.ts
 * @description Unified trust calculation system that aggregates trust factors
 * from deals, interactions, alliances, and personality traits
 */

import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Houseguest } from '@/models/houseguest';

export interface TrustFactors {
  dealTrust: number;         // Based on deal history (0-100)
  interactionTrust: number;  // Based on interaction tracker (0-100)
  allianceTrust: number;     // Based on alliance loyalty (0-100)
  traitModifier: number;     // Based on personality traits (-20 to 20)
}

export interface TrustScore {
  score: number;             // Final trust score (0-100)
  reputation: string;        // Human-readable reputation label
  factors: TrustFactors;     // Individual factor breakdown
}

/**
 * Weight configuration for trust calculation
 */
const TRUST_WEIGHTS = {
  deals: 0.4,        // 40% - Deal fulfillment/breaking
  interactions: 0.3, // 30% - Interaction history
  alliance: 0.2,     // 20% - Alliance loyalty
  traits: 0.1        // 10% - Personality traits
};

/**
 * Unified Trust System that aggregates trust from multiple subsystems
 */
export class TrustSystem {
  private game: BigBrotherGame | null = null;

  /**
   * Set the game reference
   */
  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  /**
   * Calculate unified trust score for a houseguest
   * @param houseguestId The houseguest to evaluate
   * @param fromPerspectiveOf Optional: Calculate trust from another's perspective
   */
  calculateTrustScore(houseguestId: string, fromPerspectiveOf?: string): TrustScore {
    if (!this.game) {
      return {
        score: 50,
        reputation: 'Unknown',
        factors: { dealTrust: 50, interactionTrust: 50, allianceTrust: 50, traitModifier: 0 }
      };
    }

    // Calculate individual trust factors
    const dealTrust = this.calculateDealTrust(houseguestId);
    const interactionTrust = this.calculateInteractionTrust(houseguestId, fromPerspectiveOf);
    const allianceTrust = this.calculateAllianceTrust(houseguestId);
    const traitModifier = this.getTraitTrustModifier(houseguestId);

    // Calculate weighted score
    let score = 50; // Start neutral
    score += (dealTrust - 50) * TRUST_WEIGHTS.deals;
    score += (interactionTrust - 50) * TRUST_WEIGHTS.interactions;
    score += (allianceTrust - 50) * TRUST_WEIGHTS.alliance;
    score += traitModifier * TRUST_WEIGHTS.traits;

    // Clamp to valid range
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      reputation: this.getReputationLabel(score),
      factors: { dealTrust, interactionTrust, allianceTrust, traitModifier }
    };
  }

  /**
   * Calculate trust based on deal history
   */
  private calculateDealTrust(houseguestId: string): number {
    if (!this.game?.deals) return 50;

    let trustScore = 50;
    const deals = this.game.deals;

    deals.forEach(deal => {
      if (deal.proposerId !== houseguestId && deal.recipientId !== houseguestId) return;

      if (deal.status === 'fulfilled') {
        trustScore += deal.trustImpact === 'critical' ? 15 :
                      deal.trustImpact === 'high' ? 10 :
                      deal.trustImpact === 'medium' ? 5 : 3;
      } else if (deal.status === 'broken') {
        trustScore -= deal.trustImpact === 'critical' ? 30 :
                      deal.trustImpact === 'high' ? 20 :
                      deal.trustImpact === 'medium' ? 12 : 6;
      }
    });

    return Math.max(0, Math.min(100, trustScore));
  }

  /**
   * Calculate trust based on interaction history
   */
  private calculateInteractionTrust(houseguestId: string, fromPerspectiveOf?: string): number {
    // Use interaction tracker if available (accessed via aiSystem or directly)
    const interactionTracker = (this.game as any)?.aiSystem?.interactionTracker || 
                               (this.game as any)?.interactionTracker;
    
    if (interactionTracker && fromPerspectiveOf) {
      return interactionTracker.getTrustScore(fromPerspectiveOf, houseguestId);
    }

    // Fallback: use relationship events
    if (this.game?.relationshipSystem) {
      const events = this.game.relationshipSystem.getRelationshipEvents?.(
        houseguestId,
        fromPerspectiveOf || ''
      ) || [];

      let trustScore = 50;
      events.forEach((event: any) => {
        if (event.type === 'kept_promise' || event.type === 'deal_fulfilled') {
          trustScore += 10;
        } else if (event.type === 'betrayal' || event.type === 'deal_broken') {
          trustScore -= 15;
        } else if (event.impactScore > 0) {
          trustScore += Math.min(5, event.impactScore / 2);
        } else if (event.impactScore < 0) {
          trustScore += Math.max(-5, event.impactScore / 2);
        }
      });

      return Math.max(0, Math.min(100, trustScore));
    }

    return 50;
  }

  /**
   * Calculate trust based on alliance loyalty
   */
  private calculateAllianceTrust(houseguestId: string): number {
    if (!this.game?.allianceSystem) return 50;

    const alliances = this.game.allianceSystem.getAlliances?.() || [];
    let trustScore = 50;

    // Check if houseguest has ever betrayed an alliance
    const betrayedAlliances = alliances.filter((alliance: any) => 
      alliance.status === 'dissolved' && 
      alliance.dissolutionReason?.includes(houseguestId)
    );

    if (betrayedAlliances.length > 0) {
      trustScore -= 20 * betrayedAlliances.length;
    }

    // Check alliance stability contributions
    const currentAlliances = alliances.filter((alliance: any) =>
      alliance.members?.includes(houseguestId) && alliance.status === 'active'
    );

    if (currentAlliances.length > 0) {
      // Average stability of alliances they're in
      const avgStability = currentAlliances.reduce((sum: number, a: any) => 
        sum + (a.stability || 50), 0) / currentAlliances.length;
      
      trustScore += (avgStability - 50) * 0.3;
    }

    return Math.max(0, Math.min(100, trustScore));
  }

  /**
   * Get trait-based trust modifier
   */
  private getTraitTrustModifier(houseguestId: string): number {
    const houseguest = this.game?.getHouseguestById(houseguestId);
    if (!houseguest) return 0;

    let modifier = 0;
    const traits = houseguest.traits as string[];

    traits.forEach(trait => {
      switch (trait) {
        case 'Loyal':
          modifier += 15;
          break;
        case 'Sneaky':
          modifier -= 10;
          break;
        case 'Strategic':
          modifier -= 5; // Slightly less trustworthy due to game focus
          break;
        case 'Emotional':
          modifier += 5; // More genuine/predictable
          break;
        case 'Competitive':
          modifier -= 3;
          break;
        case 'Analytical':
          modifier -= 2;
          break;
        case 'Floater':
          modifier -= 5;
          break;
        case 'Confrontational':
          modifier += 3; // More direct/honest
          break;
      }
    });

    return Math.max(-20, Math.min(20, modifier));
  }

  /**
   * Get reputation label from score
   */
  getReputationLabel(score: number): string {
    if (score >= 85) return 'Highly Trustworthy';
    if (score >= 70) return 'Trustworthy';
    if (score >= 55) return 'Reliable';
    if (score >= 45) return 'Neutral';
    if (score >= 35) return 'Questionable';
    if (score >= 20) return 'Untrustworthy';
    return 'Notorious Backstabber';
  }

  /**
   * Get simple trust category
   */
  getTrustCategory(houseguestId: string): 'trustworthy' | 'neutral' | 'untrustworthy' {
    const { score } = this.calculateTrustScore(houseguestId);
    if (score >= 65) return 'trustworthy';
    if (score <= 35) return 'untrustworthy';
    return 'neutral';
  }

  /**
   * Compare trust between two houseguests
   */
  compareTrust(guest1Id: string, guest2Id: string): {
    guest1Trust: TrustScore;
    guest2Trust: TrustScore;
    moreTrustworthy: string;
  } {
    const guest1Trust = this.calculateTrustScore(guest1Id);
    const guest2Trust = this.calculateTrustScore(guest2Id);

    return {
      guest1Trust,
      guest2Trust,
      moreTrustworthy: guest1Trust.score >= guest2Trust.score ? guest1Id : guest2Id
    };
  }
}
