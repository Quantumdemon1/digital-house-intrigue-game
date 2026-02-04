/**
 * @file src/systems/deal-system.ts
 * @description Core deal management system for the Deals & Alliances feature
 * Enhanced with deep integration to relationship, alliance, and trust systems
 */

import { Deal, DealStatus, DealType, NPCProposal, DEAL_TYPE_INFO } from '../models/deal';
import type { BigBrotherGame } from '../models/game/BigBrotherGame';
import type { Houseguest } from '../models/houseguest';
import type { Logger } from '../utils/logger';
import { gameEventBus, GameEventBus } from './game-event-bus';

export class DealSystem {
  private logger: Logger;
  private game: BigBrotherGame | null = null;
  private eventBus: GameEventBus;

  constructor(logger: Logger) {
    this.logger = logger;
    this.eventBus = gameEventBus;
  }

  /**
   * Set the game instance
   */
  setGame(game: BigBrotherGame): void {
    this.game = game;
    if (!this.game.deals) {
      this.game.deals = [];
    }
    if (!this.game.pendingNPCProposals) {
      this.game.pendingNPCProposals = [];
    }
  }

  /**
   * Create a new deal between houseguests
   */
  createDeal(
    proposerId: string,
    recipientId: string,
    type: DealType,
    context?: Deal['context']
  ): Deal {
    if (!this.game) {
      throw new Error('Game not set in DealSystem');
    }

    const typeInfo = DEAL_TYPE_INFO[type];
    const proposer = this.game.getHouseguestById(proposerId);
    const recipient = this.game.getHouseguestById(recipientId);
    const target = context?.targetHouseguestId 
      ? this.game.getHouseguestById(context.targetHouseguestId) 
      : null;

    let description = typeInfo.description;
    if (target && type === 'target_agreement') {
      description = `Target ${target.name} if either wins HoH`;
    }

    const deal: Deal = {
      id: `deal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title: typeInfo.title,
      description,
      proposerId,
      recipientId,
      week: this.game.week,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trustImpact: typeInfo.defaultTrustImpact,
      context
    };

    // Set expiration for time-limited deals
    if (type === 'vote_together') {
      deal.expiresWeek = this.game.week;
    }

    this.game.deals.push(deal);

    this.logger.info(`Deal created: ${deal.title} between ${proposer?.name} and ${recipient?.name}`, {
      dealId: deal.id,
      type,
      context
    });

    // Apply relationship boost for making a deal
    if (this.game.relationshipSystem) {
      this.game.relationshipSystem.addRelationshipEvent(
        proposerId,
        recipientId,
        'deal_made',
        `Made a ${typeInfo.title} deal`,
        8,
        true
      );
    }

    // Track interaction for trust scoring
    const interactionTracker = (this.game as any)?.aiSystem?.interactionTracker;
    if (interactionTracker) {
      interactionTracker.trackInteraction(
        proposerId,
        recipientId,
        'deal_accepted',
        `Agreed to ${typeInfo.title}`,
        18
      );
    }

    // Emit event for other systems
    this.eventBus.emit({
      type: 'deal_accepted',
      timestamp: Date.now(),
      week: this.game.week,
      involvedIds: [proposerId, recipientId],
      data: { deal, dealType: type }
    });

    // Check for alliance formation opportunity
    this.checkAllianceFormationOpportunity(deal);

    return deal;
  }

  /**
   * Check if multiple deals between houseguests should trigger alliance invite
   */
  private checkAllianceFormationOpportunity(deal: Deal): void {
    if (!this.game || deal.type === 'alliance_invite') return;

    // Count active deals between these houseguests
    const activeDeals = this.getActiveDeals(deal.proposerId).filter(d =>
      d.recipientId === deal.recipientId || d.proposerId === deal.recipientId
    );

    // If 3+ active deals and not in alliance, could suggest upgrading
    if (activeDeals.length >= 3) {
      const alreadyAllied = this.game.allianceSystem?.areInSameAlliance(
        deal.proposerId, deal.recipientId
      );

      if (!alreadyAllied) {
        this.logger.info(`Alliance opportunity detected between ${deal.proposerId} and ${deal.recipientId}`);
        // Could auto-generate an alliance_invite proposal here
      }
    }
  }

  /**
   * Generate an NPC proposal for the player
   */
  createNPCProposal(
    npc: Houseguest,
    player: Houseguest,
    type: DealType,
    reasoning: string,
    context?: Deal['context']
  ): NPCProposal {
    if (!this.game) {
      throw new Error('Game not set in DealSystem');
    }

    const typeInfo = DEAL_TYPE_INFO[type];
    const target = context?.targetHouseguestId 
      ? this.game.getHouseguestById(context.targetHouseguestId) 
      : null;

    let description = typeInfo.description;
    if (target && type === 'target_agreement') {
      description = `Target ${target.name} if either wins HoH`;
    }

    const proposal: NPCProposal = {
      id: `proposal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fromNPCId: npc.id,
      fromNPCName: npc.name,
      toPlayerId: player.id,
      deal: {
        type,
        title: typeInfo.title,
        description,
        proposerId: npc.id,
        recipientId: player.id,
        week: this.game.week,
        trustImpact: typeInfo.defaultTrustImpact,
        context
      },
      reasoning,
      timestamp: Date.now(),
      response: 'pending'
    };

    this.game.pendingNPCProposals.push(proposal);
    this.logger.info(`NPC proposal created: ${npc.name} proposes ${typeInfo.title} to player`);

    return proposal;
  }

  /**
   * Player responds to an NPC proposal
   */
  respondToProposal(proposalId: string, response: 'accepted' | 'declined'): Deal | null {
    if (!this.game) return null;

    const proposalIndex = this.game.pendingNPCProposals.findIndex(p => p.id === proposalId);
    if (proposalIndex === -1) return null;

    const proposal = this.game.pendingNPCProposals[proposalIndex];
    proposal.response = response;

    // Remove from pending
    this.game.pendingNPCProposals.splice(proposalIndex, 1);

    if (response === 'accepted') {
      // Create the actual deal
      const deal = this.createDeal(
        proposal.deal.proposerId,
        proposal.deal.recipientId,
        proposal.deal.type,
        proposal.deal.context
      );

      this.logger.info(`Player accepted deal from ${proposal.fromNPCName}: ${deal.title}`);
      return deal;
    } else {
      // Apply small relationship penalty for declining
      if (this.game.relationshipSystem) {
        this.game.relationshipSystem.addRelationshipEvent(
          proposal.fromNPCId,
          proposal.toPlayerId,
          'deal_declined',
          `Declined ${proposal.deal.title} offer`,
          -3,
          true
        );
      }
      this.logger.info(`Player declined deal from ${proposal.fromNPCName}`);
      return null;
    }
  }

  /**
   * Check if NPC would accept a deal from the player
   */
  evaluatePlayerDeal(
    npc: Houseguest,
    player: Houseguest,
    type: DealType,
    context?: Deal['context']
  ): { wouldAccept: boolean; acceptanceChance: number; reasoning: string } {
    if (!this.game) {
      return { wouldAccept: false, acceptanceChance: 0, reasoning: 'Game not initialized' };
    }

    const relationship = this.game.relationshipSystem?.getRelationship(npc.id, player.id) ?? 0;
    const trustScore = this.calculateTrustScore(player.id);
    
    // Base acceptance chance from relationship
    let acceptanceChance = 30 + (relationship * 0.5) + ((trustScore - 50) * 0.3);
    let reasoning = '';

    // Check player's reputation from broken deals
    const brokenDeals = this.game.deals?.filter(d => 
      d.status === 'broken' && 
      (d.proposerId === player.id || d.recipientId === player.id)
    ) || [];
    
    const reputationPenalty = brokenDeals.length * 15;
    acceptanceChance -= reputationPenalty;

    // Alliance synergy - alliance members more likely to accept
    const areAllied = this.game.allianceSystem?.areInSameAlliance(npc.id, player.id);
    if (areAllied) {
      acceptanceChance += 20;
      if (['safety_agreement', 'vote_together', 'final_two'].includes(type)) {
        acceptanceChance += 10; // Extra bonus for alliance-reinforcing deals
      }
    }

    // Check if target agreement would target an ally
    if (type === 'target_agreement' && context?.targetHouseguestId) {
      const targetIsAlly = this.game.allianceSystem?.areInSameAlliance(npc.id, context.targetHouseguestId);
      if (targetIsAlly) {
        acceptanceChance -= 40;
        reasoning = "I can't target someone from my own alliance.";
      }
      
      const npcRelToTarget = this.game.relationshipSystem?.getRelationship(npc.id, context.targetHouseguestId) ?? 0;
      if (npcRelToTarget < -20) {
        acceptanceChance += 20; // NPC dislikes the target too
      } else if (npcRelToTarget > 30) {
        acceptanceChance -= 30; // NPC likes the target
      }
    }

    // Trait modifiers
    const traitModifiers = this.getTraitDealModifiers(npc.traits, type);
    acceptanceChance += traitModifiers;

    // Situational modifiers
    if (type === 'safety_agreement' && npc.isNominated) {
      acceptanceChance += 25;
    }

    if (type === 'vote_together' && npc.isNominated) {
      acceptanceChance += 35;
    }

    if (type === 'final_two') {
      const activeCount = this.game.getActiveHouseguests().length;
      if (activeCount > 6) {
        acceptanceChance -= 20;
      } else if (relationship < 40) {
        acceptanceChance -= 25;
      }
    }

    if (type === 'partnership' && areAllied) {
      acceptanceChance += 15;
    }

    acceptanceChance = Math.max(5, Math.min(95, acceptanceChance));

    const wouldAccept = Math.random() * 100 < acceptanceChance;
    
    if (!reasoning) {
      if (wouldAccept) {
        if (relationship > 40) reasoning = `I think we can work well together.`;
        else if (npc.isNominated) reasoning = `I need all the help I can get right now.`;
        else if (areAllied) reasoning = `We're already working together, so this makes sense.`;
        else reasoning = `This could be beneficial for both of us.`;
      } else {
        if (reputationPenalty > 20) reasoning = `I've heard you've broken deals before. I can't trust that.`;
        else if (relationship < 20) reasoning = `I don't think I can trust you with that.`;
        else if (trustScore < 40) reasoning = `Your track record concerns me.`;
        else reasoning = `I'm not sure this is the right move for me.`;
      }
    }

    return { wouldAccept, acceptanceChance, reasoning };
  }

  /**
   * Counter-offer mapping - what alternatives to propose when declining
   */
  private static readonly COUNTER_OFFER_MAP: Partial<Record<DealType, DealType[]>> = {
    final_two: ['partnership', 'safety_agreement'],
    partnership: ['safety_agreement', 'information_sharing'],
    target_agreement: ['vote_together'],
    veto_use: ['safety_agreement'],
    alliance_invite: ['partnership', 'safety_agreement'],
    safety_agreement: ['information_sharing'],
  };

  /**
   * Generate a counter-offer when NPC would decline the original deal
   * Returns null if no counter-offer is appropriate
   */
  generateCounterOffer(
    npc: Houseguest,
    player: Houseguest,
    originalType: DealType,
    context?: Deal['context']
  ): { 
    counterType: DealType; 
    reasoning: string;
    acceptanceChance: number;
  } | null {
    if (!this.game) return null;

    // Get potential counter-offers for this deal type
    const alternatives = DealSystem.COUNTER_OFFER_MAP[originalType];
    if (!alternatives || alternatives.length === 0) return null;

    // Only offer counter 40% of the time when declining
    if (Math.random() > 0.4) return null;

    const relationship = this.game.relationshipSystem?.getRelationship(npc.id, player.id) ?? 0;

    // Try each alternative in order until we find one they'd accept
    for (const counterType of alternatives) {
      const evaluation = this.evaluatePlayerDeal(npc, player, counterType, context);
      
      // If they'd accept this alternative (or close to accepting)
      if (evaluation.acceptanceChance >= 40) {
        const counterReasonings = [
          `I'm not ready for ${DEAL_TYPE_INFO[originalType].title}, but how about ${DEAL_TYPE_INFO[counterType].title} instead?`,
          `That's too big of a commitment. Let's start with ${DEAL_TYPE_INFO[counterType].title} first.`,
          `I'd rather do ${DEAL_TYPE_INFO[counterType].title} for now. We can talk about more later.`,
        ];
        
        return {
          counterType,
          reasoning: counterReasonings[Math.floor(Math.random() * counterReasonings.length)],
          acceptanceChance: evaluation.acceptanceChance,
        };
      }
    }

    return null;
  }

  /**
   * Get trait-based modifiers for deal acceptance
   */
  private getTraitDealModifiers(traits: string[], dealType: DealType): number {
    let modifier = 0;

    traits.forEach(trait => {
      switch (trait) {
        case 'Strategic':
          if (['target_agreement', 'partnership'].includes(dealType)) modifier += 10;
          break;
        case 'Loyal':
          if (['safety_agreement', 'alliance_invite', 'final_two'].includes(dealType)) modifier += 20;
          if (dealType === 'target_agreement') modifier -= 10;
          break;
        case 'Sneaky':
          if (dealType === 'information_sharing') modifier += 15;
          modifier -= 5; // Generally less trustworthy
          break;
        case 'Competitive':
          if (dealType === 'target_agreement') modifier += 15;
          break;
        case 'Emotional':
          if (['final_two', 'partnership'].includes(dealType)) modifier += 25;
          break;
        case 'Paranoid':
          if (dealType === 'safety_agreement') modifier += 10;
          modifier -= 15; // Generally suspicious
          break;
      }
    });

    return modifier;
  }

  /**
   * Calculate trust score based on deal history
   */
  calculateTrustScore(houseguestId: string): number {
    if (!this.game?.deals) return 50;

    let trustScore = 50;

    this.game.deals.forEach(deal => {
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
   * Get trust reputation label
   */
  getTrustReputation(houseguestId: string): 'trustworthy' | 'neutral' | 'untrustworthy' {
    const score = this.calculateTrustScore(houseguestId);
    if (score >= 65) return 'trustworthy';
    if (score <= 35) return 'untrustworthy';
    return 'neutral';
  }

  /**
   * Get active deals for a houseguest
   */
  getActiveDeals(houseguestId: string): Deal[] {
    if (!this.game?.deals) return [];
    
    return this.game.deals.filter(d =>
      d.status === 'active' &&
      (d.proposerId === houseguestId || d.recipientId === houseguestId)
    );
  }

  /**
   * Get all deals for a houseguest
   */
  getDealsForHouseguest(houseguestId: string): Deal[] {
    if (!this.game?.deals) return [];
    
    return this.game.deals.filter(d =>
      d.proposerId === houseguestId || d.recipientId === houseguestId
    );
  }

  /**
   * Check if two houseguests have a specific deal type
   */
  haveDeal(guest1Id: string, guest2Id: string, type?: DealType): boolean {
    if (!this.game?.deals) return false;

    return this.game.deals.some(d =>
      d.status === 'active' &&
      ((d.proposerId === guest1Id && d.recipientId === guest2Id) ||
       (d.proposerId === guest2Id && d.recipientId === guest1Id)) &&
      (type === undefined || d.type === type)
    );
  }

  /**
   * Evaluate deals based on game actions
   */
  evaluateDealsForAction(actionType: string, params: any): void {
    if (!this.game?.deals || !this.game.relationshipSystem) return;

    const activeDeals = this.game.deals.filter(d => d.status === 'active');

    for (const deal of activeDeals) {
      const newStatus = this.evaluateDealStatus(deal, actionType, params);
      
      if (newStatus && newStatus !== deal.status) {
        deal.status = newStatus;
        deal.updatedAt = Date.now();
        this.applyDealOutcome(deal, newStatus);
      }
    }

    // Also check for expired deals
    this.checkExpiredDeals();
  }

  /**
   * Evaluate if a deal should change status based on an action
   */
  private evaluateDealStatus(deal: Deal, actionType: string, params: any): DealStatus | null {
    switch (actionType) {
      case 'NOMINATE':
        return this.evaluateNominationDeal(deal, params);
      case 'CAST_VOTE':
        return this.evaluateVoteDeal(deal, params);
      case 'VETO_DECISION':
        return this.evaluateVetoDeal(deal, params);
      case 'FINAL_SELECTION':
        return this.evaluateFinalTwoDeal(deal, params);
      default:
        return null;
    }
  }

  private evaluateNominationDeal(deal: Deal, params: { nominatorId: string; nomineeIds: string[] }): DealStatus | null {
    const { nominatorId, nomineeIds } = params;

    // Check target agreement
    if (deal.type === 'target_agreement' && deal.context?.targetHouseguestId) {
      if (deal.proposerId === nominatorId || deal.recipientId === nominatorId) {
        if (nomineeIds.includes(deal.context.targetHouseguestId)) {
          return 'fulfilled';
        }
        // If nominating the partner instead, it's broken
        const partnerId = deal.proposerId === nominatorId ? deal.recipientId : deal.proposerId;
        if (nomineeIds.includes(partnerId)) {
          return 'broken';
        }
      }
    }

    // Check safety agreement
    if (deal.type === 'safety_agreement') {
      if (deal.proposerId === nominatorId || deal.recipientId === nominatorId) {
        const partnerId = deal.proposerId === nominatorId ? deal.recipientId : deal.proposerId;
        if (nomineeIds.includes(partnerId)) {
          return 'broken';
        }
      }
    }

    return null;
  }

  private evaluateVoteDeal(deal: Deal, params: { voterId: string; voteFor: string }): DealStatus | null {
    if (deal.type !== 'vote_together') return null;
    
    // This would need to track both partners' votes to determine if they voted together
    // For now, we'll mark it as requiring both votes to evaluate
    return null;
  }

  private evaluateVetoDeal(deal: Deal, params: { povHolderId: string; savedId?: string; used: boolean }): DealStatus | null {
    if (deal.type !== 'veto_use') return null;

    const { povHolderId, savedId, used } = params;
    const partnerId = deal.proposerId === povHolderId ? deal.recipientId : deal.proposerId;

    // Check if partner was on block and veto holder is in this deal
    if (deal.proposerId === povHolderId || deal.recipientId === povHolderId) {
      if (used && savedId === partnerId) {
        return 'fulfilled';
      } else if (!used || savedId !== partnerId) {
        // Partner was on block but not saved
        const partner = this.game?.getHouseguestById(partnerId);
        if (partner?.isNominated) {
          return 'broken';
        }
      }
    }

    return null;
  }

  private evaluateFinalTwoDeal(deal: Deal, params: { selectorId: string; selectedId: string }): DealStatus | null {
    if (deal.type !== 'final_two') return null;

    const { selectorId, selectedId } = params;
    
    if (deal.proposerId === selectorId || deal.recipientId === selectorId) {
      const partnerId = deal.proposerId === selectorId ? deal.recipientId : deal.proposerId;
      if (selectedId === partnerId) {
        return 'fulfilled';
      } else {
        return 'broken';
      }
    }

    return null;
  }

  /**
   * Apply the outcome of a fulfilled or broken deal
   */
  private applyDealOutcome(deal: Deal, status: DealStatus): void {
    if (!this.game?.relationshipSystem) return;

    const proposer = this.game.getHouseguestById(deal.proposerId);
    const recipient = this.game.getHouseguestById(deal.recipientId);

    if (!proposer || !recipient) return;

    const impactMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3
    }[deal.trustImpact];

    // Get interaction tracker for trust scoring
    const interactionTracker = (this.game as any)?.aiSystem?.interactionTracker;

    if (status === 'fulfilled') {
      const boost = Math.round(8 * impactMultiplier);
      this.game.relationshipSystem.addRelationshipEvent(
        deal.proposerId,
        deal.recipientId,
        'deal_fulfilled',
        `${proposer.name} honored their ${deal.title} deal`,
        boost,
        false
      );

      // Track in interaction system for trust
      if (interactionTracker) {
        interactionTracker.trackInteraction(
          deal.proposerId,
          deal.recipientId,
          'deal_fulfilled',
          `Honored ${deal.title} deal`,
          Math.round(boost * 1.5)
        );
      }

      // Emit event
      this.eventBus.emit({
        type: 'deal_fulfilled',
        timestamp: Date.now(),
        week: this.game.week,
        involvedIds: [deal.proposerId, deal.recipientId],
        data: { deal, impactScore: boost }
      });

      // Update alliance stability if in same alliance
      this.updateAllianceStability(deal.proposerId, deal.recipientId, 3);

      this.logger.info(`Deal FULFILLED: ${deal.title} between ${proposer.name} and ${recipient.name}`);
    } else if (status === 'broken') {
      const penalty = Math.round(-15 * impactMultiplier);
      this.game.relationshipSystem.addRelationshipEvent(
        deal.proposerId,
        deal.recipientId,
        'deal_broken',
        `${proposer.name} broke their ${deal.title} deal`,
        penalty,
        false
      );

      // Track in interaction system - stronger negative impact
      if (interactionTracker) {
        interactionTracker.trackInteraction(
          deal.proposerId,
          deal.recipientId,
          'deal_broken',
          `Broke ${deal.title} deal`,
          Math.round(penalty * 2)
        );
      }

      // Emit event
      this.eventBus.emit({
        type: 'deal_broken',
        timestamp: Date.now(),
        week: this.game.week,
        involvedIds: [deal.proposerId, deal.recipientId],
        data: { deal, impactScore: penalty }
      });

      // Hurt alliance stability if in same alliance
      this.updateAllianceStability(deal.proposerId, deal.recipientId, -10);

      this.logger.info(`Deal BROKEN: ${deal.title} between ${proposer.name} and ${recipient.name}`);
      
      // Spread betrayal information
      this.spreadBetrayalInfo(deal);
    }
  }

  /**
   * Update alliance stability based on deal outcomes
   */
  private updateAllianceStability(guest1Id: string, guest2Id: string, change: number): void {
    if (!this.game?.allianceSystem) return;

    const areAllied = this.game.allianceSystem.areInSameAlliance(guest1Id, guest2Id);
    if (!areAllied) return;

    const alliances = this.game.allianceSystem.getAlliances?.() || [];
    for (const alliance of alliances) {
      const hasGuest1 = alliance.members?.some((m: any) => m.id === guest1Id || m === guest1Id);
      const hasGuest2 = alliance.members?.some((m: any) => m.id === guest2Id || m === guest2Id);
      
      if (hasGuest1 && hasGuest2 && alliance.stability !== undefined) {
        alliance.stability = Math.max(0, Math.min(100, alliance.stability + change));
      }
    }
  }

  /**
   * Spread information about a broken deal to other houseguests
   */
  private spreadBetrayalInfo(deal: Deal): void {
    if (!this.game) return;

    const activeGuests = this.game.getActiveHouseguests();
    const betrayer = this.game.getHouseguestById(deal.proposerId);
    const victim = this.game.getHouseguestById(deal.recipientId);

    if (!betrayer || !victim) return;

    // Some houseguests will learn about the betrayal
    activeGuests.forEach(guest => {
      if (guest.id === deal.proposerId || guest.id === deal.recipientId) return;

      // 40% chance to learn about betrayal
      if (Math.random() < 0.4) {
        const penalty = Math.floor(-5 - Math.random() * 10);
        this.game!.relationshipSystem?.addRelationshipEvent(
          guest.id,
          deal.proposerId,
          'heard_about_betrayal',
          `Learned that ${betrayer.name} broke a deal with ${victim.name}`,
          penalty,
          true
        );
      }
    });
  }

  /**
   * Check and expire time-limited deals
   */
  private checkExpiredDeals(): void {
    if (!this.game?.deals) return;

    this.game.deals.forEach(deal => {
      if (deal.status === 'active' && deal.expiresWeek !== undefined) {
        if (this.game!.week > deal.expiresWeek) {
          deal.status = 'expired';
          deal.updatedAt = Date.now();
        }
      }
    });
  }

  /**
   * Upgrade a deal to a stronger type
   */
  upgradeDeal(dealId: string, newType: DealType): Deal | null {
    if (!this.game?.deals) return null;

    const deal = this.game.deals.find(d => d.id === dealId);
    if (!deal || deal.status !== 'active') return null;

    const newTypeInfo = DEAL_TYPE_INFO[newType];
    
    // Create a new deal with upgraded type
    const upgradedDeal = this.createDeal(
      deal.proposerId,
      deal.recipientId,
      newType,
      { ...deal.context, upgradeFrom: deal.id }
    );

    // Mark old deal as expired (upgraded)
    deal.status = 'expired';
    deal.updatedAt = Date.now();

    return upgradedDeal;
  }

  /**
   * Get pending NPC proposals for the player
   */
  getPendingProposals(): NPCProposal[] {
    return this.game?.pendingNPCProposals?.filter(p => p.response === 'pending') || [];
  }
}
