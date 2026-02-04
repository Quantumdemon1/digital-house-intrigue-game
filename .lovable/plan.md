
# Plan: Deep Integration of Social, Deals & Relationship Systems

## Overview

Connect the Deal System, Relationship System, Alliance System, and NPC Social Behavior into a unified gameplay experience where all systems reinforce each other. This creates a more dynamic and realistic simulation where deals affect relationships, relationships influence deal acceptance, alliances strengthen deals, and NPC behavior is driven by all these factors.

---

## Part 1: Unified Event System

### Problem
Currently, there are multiple overlapping tracking systems:
- `InteractionTracker` tracks interactions with sentiment/impact
- `RelationshipEvents` tracks relationship changes
- `DealSystem` tracks deal outcomes
- These don't communicate well with each other

### Solution: Create a Central Event Bus

Create a unified event system that all subsystems subscribe to:

**New File: `src/systems/game-event-bus.ts`**

```typescript
export type GameEventType =
  // Deal events
  | 'deal_proposed' | 'deal_accepted' | 'deal_declined' 
  | 'deal_fulfilled' | 'deal_broken' | 'deal_expired'
  // Relationship events  
  | 'relationship_changed' | 'trust_changed'
  // Alliance events
  | 'alliance_formed' | 'alliance_broken' | 'member_added' | 'member_removed'
  // Game action events
  | 'nomination_made' | 'veto_used' | 'vote_cast' | 'eviction'
  // Social events
  | 'conversation' | 'promise_made' | 'promise_kept' | 'promise_broken';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  week: number;
  involvedIds: string[];
  data: Record<string, any>;
}

export class GameEventBus {
  private listeners: Map<GameEventType, ((event: GameEvent) => void)[]>;
  
  emit(event: GameEvent): void;
  subscribe(type: GameEventType, callback: (event: GameEvent) => void): () => void;
  subscribeAll(callback: (event: GameEvent) => void): () => void;
}
```

---

## Part 2: Connect Deal Outcomes to Relationship System

### Current Gap
When deals are fulfilled or broken, the relationship impact is applied but not deeply integrated with the trust system.

### Enhancement: Multi-Layer Trust Impact

**Modify: `src/systems/deal-system.ts`**

Add deeper relationship integration:

```typescript
private applyDealOutcome(deal: Deal, status: DealStatus): void {
  // ... existing relationship event code ...
  
  // NEW: Also update interaction tracker for trust scoring
  if (this.game.interactionTracker) {
    if (status === 'fulfilled') {
      this.game.interactionTracker.trackInteraction(
        deal.proposerId,
        deal.recipientId,
        'promise_kept',  // Add new type for deals
        `Honored ${deal.title} deal`,
        boost * 1.5  // Deals have stronger trust impact than promises
      );
    } else if (status === 'broken') {
      this.game.interactionTracker.trackInteraction(
        deal.proposerId,
        deal.recipientId,
        'promise_broken',
        `Broke ${deal.title} deal`,
        penalty * 2  // Breaking deals has severe trust impact
      );
    }
  }
  
  // NEW: Emit event for other systems
  this.eventBus?.emit({
    type: status === 'fulfilled' ? 'deal_fulfilled' : 'deal_broken',
    timestamp: Date.now(),
    week: this.game.week,
    involvedIds: [deal.proposerId, deal.recipientId],
    data: { deal, impactScore: status === 'fulfilled' ? boost : penalty }
  });
}
```

---

## Part 3: Alliance-Deal Synergy

### Current Gap
Alliances and deals operate independently. Being in an alliance should affect deal dynamics.

### Enhancement: Alliance-Aware Deal Evaluation

**Modify: `src/systems/deal-system.ts` - `evaluatePlayerDeal` method**

```typescript
// Add alliance-based modifiers
evaluatePlayerDeal(npc: Houseguest, player: Houseguest, type: DealType, context?: Deal['context']): EvaluationResult {
  // ... existing code ...
  
  // NEW: Alliance synergy
  const areAllied = this.game.allianceSystem?.areInSameAlliance(npc.id, player.id);
  
  if (areAllied) {
    acceptanceChance += 20; // Alliance members more likely to accept deals
    
    // Additional bonus for alliance-reinforcing deals
    if (['safety_agreement', 'vote_together', 'final_two'].includes(type)) {
      acceptanceChance += 10;
    }
  }
  
  // NEW: Check if deal would strengthen or weaken alliance
  if (type === 'target_agreement' && context?.targetHouseguestId) {
    const targetIsAlly = this.game.allianceSystem?.areInSameAlliance(npc.id, context.targetHouseguestId);
    if (targetIsAlly) {
      acceptanceChance -= 40; // Won't target their own ally
      reasoning = "I can't target someone from my own alliance.";
    }
  }
  
  // ... rest of existing logic ...
}
```

### Enhancement: Deal-Based Alliance Formation

**Modify: `src/systems/deal-system.ts`**

Add automatic alliance suggestions when partnerships accumulate:

```typescript
private checkAllianceFormationOpportunity(deal: Deal): void {
  if (deal.type !== 'partnership') return;
  
  // Count active deals between these houseguests
  const activeDeals = this.getActiveDeals(deal.proposerId).filter(d =>
    d.recipientId === deal.recipientId || d.proposerId === deal.recipientId
  );
  
  // If 3+ active deals and not in alliance, suggest upgrading to alliance
  if (activeDeals.length >= 3) {
    const alreadyAllied = this.game?.allianceSystem?.areInSameAlliance(
      deal.proposerId, deal.recipientId
    );
    
    if (!alreadyAllied) {
      // Create an alliance_invite proposal
      this.createDeal(
        deal.proposerId,
        deal.recipientId,
        'alliance_invite',
        { upgradeFrom: deal.id }
      );
    }
  }
}
```

---

## Part 4: Enhanced NPC Deal Intelligence

### Current Gap
NPC deal proposals are somewhat random. They should consider existing deals, alliance memberships, and trust history.

### Enhancement: Context-Aware NPC Proposals

**Modify: `src/systems/ai/npc-deal-proposals.ts`**

```typescript
function generateNPCProposals(
  npc: Houseguest,
  player: Houseguest,
  game: BigBrotherGame
): NPCProposal[] {
  const proposals: NPCProposal[] = [];
  const relationship = game.relationshipSystem?.getRelationship(npc.id, player.id) ?? 0;
  
  // NEW: Get trust score from deal history
  const trustScore = game.dealSystem?.calculateTrustScore(player.id) ?? 50;
  
  // NEW: Get existing deals between them
  const existingDeals = game.deals?.filter(d =>
    d.status === 'active' &&
    ((d.proposerId === npc.id && d.recipientId === player.id) ||
     (d.proposerId === player.id && d.recipientId === npc.id))
  ) || [];
  
  // NEW: Check if player has broken deals with others (reputation)
  const brokenDeals = game.deals?.filter(d => 
    d.status === 'broken' && 
    (d.proposerId === player.id || d.recipientId === player.id)
  ) || [];
  
  // Adjust willingness based on reputation
  const reputationPenalty = brokenDeals.length * 15;
  const adjustedRelationship = relationship - reputationPenalty;
  
  if (adjustedRelationship < 10) return proposals; // Won't deal with untrustworthy players
  
  // NEW: Upgrade existing partnership to alliance
  const hasPartnership = existingDeals.some(d => d.type === 'partnership');
  const hasSafetyPact = existingDeals.some(d => d.type === 'safety_agreement');
  
  if (hasPartnership && hasSafetyPact && adjustedRelationship > 40) {
    const alreadyAllied = game.allianceSystem?.areInSameAlliance(npc.id, player.id);
    if (!alreadyAllied) {
      proposals.push(createProposal(
        npc, player, 'alliance_invite',
        `We've been working well together. I think it's time to make it official.`,
        game
      ));
    }
  }
  
  // ... rest of existing proposal logic ...
}
```

---

## Part 5: Relationship-Driven Deal Triggers

### Current Gap
Relationships change but don't trigger deal opportunities automatically.

### Enhancement: Relationship Milestone Triggers

**New Function in `src/systems/ai/npc-deal-proposals.ts`**

```typescript
export function checkRelationshipMilestones(
  houseguestId: string,
  otherId: string,
  oldScore: number,
  newScore: number,
  game: BigBrotherGame
): NPCProposal | null {
  // Only for NPC -> Player direction
  const npc = game.getHouseguestById(houseguestId);
  const other = game.getHouseguestById(otherId);
  if (!npc || !other || other.isPlayer === false) return null;
  
  // Crossed friendship threshold (25+)
  if (oldScore < 25 && newScore >= 25) {
    return createProposal(
      npc, other, 'information_sharing',
      `I feel like I can trust you now. Let's share what we hear.`,
      game
    );
  }
  
  // Crossed close friend threshold (50+)
  if (oldScore < 50 && newScore >= 50) {
    return createProposal(
      npc, other, 'safety_agreement',
      `You've become one of my closest people here. Let's protect each other.`,
      game
    );
  }
  
  // Crossed ally threshold (75+)
  if (oldScore < 75 && newScore >= 75) {
    return createProposal(
      npc, other, 'partnership',
      `I trust you completely. We should ride this out together.`,
      game
    );
  }
  
  return null;
}
```

**Integration Point: `src/systems/relationship/events.ts`**

Call milestone check when relationship updates:

```typescript
addRelationshipEvent(...): void {
  const oldScore = relationship.score;
  // ... update score ...
  const newScore = relationship.score;
  
  // Check for milestone-triggered proposals
  const milestone = checkRelationshipMilestones(
    guestId1, guestId2, oldScore, newScore, this.game
  );
  
  if (milestone) {
    this.game?.pendingNPCProposals?.push(milestone);
  }
}
```

---

## Part 6: Trust System Unification

### Current Gap
Trust is calculated in multiple places:
- `DealSystem.calculateTrustScore()` - based on deals
- `InteractionTracker.getTrustScore()` - based on interactions

### Enhancement: Unified Trust Calculation

**New File: `src/systems/trust-system.ts`**

```typescript
export class TrustSystem {
  calculateTrustScore(houseguestId: string, fromPerspectiveOf?: string): TrustScore {
    let score = 50; // Neutral baseline
    
    // Factor 1: Deal history (40% weight)
    const dealTrust = this.calculateDealTrust(houseguestId);
    score += (dealTrust - 50) * 0.4;
    
    // Factor 2: Interaction history (30% weight)
    const interactionTrust = this.calculateInteractionTrust(houseguestId, fromPerspectiveOf);
    score += (interactionTrust - 50) * 0.3;
    
    // Factor 3: Alliance loyalty (20% weight)
    const allianceTrust = this.calculateAllianceTrust(houseguestId);
    score += (allianceTrust - 50) * 0.2;
    
    // Factor 4: Trait-based modifier (10% weight)
    const traitModifier = this.getTraitTrustModifier(houseguestId);
    score += traitModifier * 0.1;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      reputation: this.getReputationLabel(score),
      factors: { dealTrust, interactionTrust, allianceTrust, traitModifier }
    };
  }
  
  getReputationLabel(score: number): string {
    if (score >= 80) return 'Highly Trustworthy';
    if (score >= 65) return 'Trustworthy';
    if (score >= 50) return 'Neutral';
    if (score >= 35) return 'Questionable';
    if (score >= 20) return 'Untrustworthy';
    return 'Notorious Backstabber';
  }
}
```

---

## Part 7: NPC Decision Engine Integration

### Current Gap
`npc-decision-engine.ts` calculates `promiseObligations` but doesn't factor in deals.

### Enhancement: Deal-Aware Decision Making

**Modify: `src/systems/ai/npc-decision-engine.ts`**

Update `calculatePromiseObligations` to include deals:

```typescript
export function calculateDealObligations(
  evaluatorId: string,
  targetId: string,
  game: BigBrotherGame
): number {
  let obligationScore = 0;
  
  // Check promises (legacy)
  const promises = game.promises || [];
  // ... existing promise logic ...
  
  // NEW: Check deals
  const deals = game.deals || [];
  
  deals.forEach(deal => {
    const evaluatorInDeal = deal.proposerId === evaluatorId || deal.recipientId === evaluatorId;
    const targetInDeal = deal.proposerId === targetId || deal.recipientId === targetId;
    
    if (!evaluatorInDeal || !targetInDeal) return;
    
    if (deal.status === 'active') {
      // Active deals create obligations based on type
      switch (deal.type) {
        case 'safety_agreement':
          obligationScore += 35; // Strong obligation not to nominate
          break;
        case 'vote_together':
          obligationScore += 25; // Should vote the same
          break;
        case 'target_agreement':
          if (deal.context?.targetHouseguestId) {
            // Slight negative toward target
            // But positive toward deal partner
            obligationScore += 15;
          }
          break;
        case 'final_two':
          obligationScore += 50; // Very strong late-game obligation
          break;
        case 'partnership':
          obligationScore += 20;
          break;
        case 'veto_use':
          obligationScore += 40; // Strong veto commitment
          break;
        default:
          obligationScore += 10;
      }
    } else if (deal.status === 'broken') {
      // Broken deals reduce obligation (betrayal)
      if (deal.proposerId === targetId) {
        obligationScore -= 30; // They betrayed us
      }
    }
  });
  
  return Math.max(-50, Math.min(50, obligationScore));
}
```

Rename `promiseObligations` to `dealObligations` in `DecisionFactors` interface.

---

## Part 8: Visual Feedback for System Connections

### Enhancement: Show Deal/Relationship Connections in UI

**Modify: `src/components/deals/DealCard.tsx`**

Add relationship indicator:

```tsx
// Show current relationship with deal partner
const relationship = game.relationshipSystem?.getRelationship(playerId, partnerId) ?? 0;
const trustScore = game.dealSystem?.calculateTrustScore(partnerId) ?? 50;

<div className="flex items-center gap-2 text-xs text-muted-foreground">
  <span className={cn(
    "flex items-center gap-1",
    relationship > 30 ? "text-green-500" : relationship < 0 ? "text-red-500" : ""
  )}>
    <Heart className="h-3 w-3" />
    {relationship > 0 ? '+' : ''}{relationship}
  </span>
  <span className="flex items-center gap-1">
    <Shield className="h-3 w-3" />
    Trust: {trustScore}%
  </span>
</div>
```

---

## Part 9: Add New Event Types

### Modify: `src/models/relationship-event.ts`

Add deal-related event types:

```typescript
export type RelationshipEventType = 
  // ... existing types ...
  | 'deal_made'
  | 'deal_fulfilled'
  | 'deal_broken'
  | 'deal_declined';
```

### Modify: `src/systems/ai/interaction-tracker.ts`

Add deal-related interaction types:

```typescript
export type InteractionType =
  // ... existing types ...
  | 'deal_proposed'
  | 'deal_accepted'
  | 'deal_fulfilled'
  | 'deal_broken';

export function getInteractionDefaults(type: InteractionType) {
  switch (type) {
    // ... existing cases ...
    case 'deal_proposed':
      return { sentiment: 'positive', impact: 8, decays: true };
    case 'deal_accepted':
      return { sentiment: 'positive', impact: 15, decays: false };
    case 'deal_fulfilled':
      return { sentiment: 'positive', impact: 30, decays: false };
    case 'deal_broken':
      return { sentiment: 'negative', impact: -45, decays: false };
  }
}
```

---

## Part 10: Weekly System Integration

### Enhancement: End-of-Week Processing

**New Function: `src/systems/deal-system.ts`**

```typescript
processWeekEnd(): void {
  if (!this.game) return;
  
  // 1. Evaluate all vote_together deals from this week's eviction
  this.evaluateVotingDeals();
  
  // 2. Check for expired deals
  this.checkExpiredDeals();
  
  // 3. Update alliance stability based on deal fulfillment
  this.updateAllianceFromDeals();
  
  // 4. Spread information about broken deals
  this.processReputationSpread();
}

private updateAllianceFromDeals(): void {
  const fulfilledDeals = this.game.deals.filter(d => 
    d.status === 'fulfilled' && d.updatedAt > Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  
  // Fulfilled deals between alliance members boost stability
  for (const deal of fulfilledDeals) {
    const areAllied = this.game.allianceSystem?.areInSameAlliance(
      deal.proposerId, deal.recipientId
    );
    
    if (areAllied) {
      // Find the alliance and boost stability
      const alliances = this.game.allianceSystem?.getAlliancesForHouseguest(deal.proposerId) || [];
      for (const alliance of alliances) {
        if (alliance.members.some(m => m.id === deal.recipientId)) {
          alliance.stability = Math.min(100, alliance.stability + 3);
        }
      }
    }
  }
}
```

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/systems/game-event-bus.ts` | Central event coordination |
| `src/systems/trust-system.ts` | Unified trust calculation |

### Modified Files
| File | Changes |
|------|---------|
| `src/systems/deal-system.ts` | Alliance integration, event emission, enhanced outcomes |
| `src/systems/ai/npc-deal-proposals.ts` | Trust-aware proposals, relationship milestones, deal upgrades |
| `src/systems/ai/npc-decision-engine.ts` | Deal obligations in decision factors |
| `src/systems/ai/interaction-tracker.ts` | New deal-related interaction types |
| `src/systems/relationship/events.ts` | Milestone triggers, new event types |
| `src/models/relationship-event.ts` | Deal event types |
| `src/components/deals/DealCard.tsx` | Show relationship/trust indicators |
| `src/models/game/BigBrotherGame.ts` | Add event bus and trust system |

---

## Integration Flow Diagram

```text
Player/NPC Action
       |
       v
+----------------+
|  Event Bus     |  <-- Central coordination
+-------+--------+
        |
        +-------+-------+-------+
        |       |       |       |
        v       v       v       v
   +------+ +------+ +------+ +------+
   |Deal  | |Rela- | |Alli- | |Inter-|
   |System| |tion- | |ance  | |action|
   |      | |ship  | |System| |Track |
   +--+---+ +--+---+ +--+---+ +--+---+
      |        |        |        |
      +--------+--------+--------+
               |
               v
      +----------------+
      | Trust System   | <-- Unified scoring
      +----------------+
               |
               v
      +----------------+
      | NPC Decision   | <-- Informed choices
      | Engine         |
      +----------------+
```

---

## Expected Behavior Changes

1. **NPCs won't propose deals to players with bad reputations**
2. **Breaking a deal with an alliance member hurts alliance stability**
3. **Multiple fulfilled deals between two houseguests can trigger alliance invites**
4. **Relationship milestones (25/50/75) trigger appropriate deal proposals**
5. **Trust score is unified across all systems**
6. **NPC decisions weight deal obligations appropriately**
7. **Deal outcomes immediately affect interaction tracker for trust calculation**
8. **End-of-week processing evaluates all pending deal conditions**
