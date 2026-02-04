
# Plan: Deals & Alliances System Redesign

## Overview

Redesign the current "Promises" feature into an interactive "Deals & Alliances" system that allows players and NPCs to propose strategic agreements, form partnerships, and build alliances. This system will feature:

1. **Interactive Proposals** - NPCs can propose deals to the player during social phases
2. **Deal Types** - Multiple deal types with specific conditions (targeting, veto use, voting blocks)
3. **Relationship-Based Acceptance** - NPCs accept/reject deals based on their relationship with the player
4. **Trust Building & Breaking** - Following through builds trust; breaking deals damages standing
5. **Partnership → Alliance Progression** - Simple deals can upgrade to partnerships and formal alliances

---

## Part 1: New Data Models

### New File: `src/models/deal.ts`

Create a comprehensive deal model that replaces the simpler promise system:

```typescript
export type DealStatus = 'proposed' | 'accepted' | 'active' | 'fulfilled' | 'broken' | 'declined' | 'expired';

export type DealType = 
  | 'target_agreement'      // Agree to target specific houseguest if win HoH
  | 'safety_agreement'      // Agree not to nominate each other
  | 'vote_together'         // Vote as a block this week
  | 'veto_use'              // Use veto on partner if they're on block
  | 'information_sharing'   // Share game intel with each other
  | 'final_two'             // Take each other to final 2
  | 'partnership'           // General working together
  | 'alliance_invite';      // Formal alliance formation

export interface Deal {
  id: string;
  type: DealType;
  title: string;
  description: string;
  proposerId: string;        // Who proposed
  recipientId: string;       // Who received proposal
  week: number;
  status: DealStatus;
  createdAt: number;
  updatedAt: number;
  expiresWeek?: number;      // Optional expiration
  trustImpact: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    targetHouseguestId?: string;  // For target agreements
    allianceId?: string;          // For alliance invites
    votingPreference?: string;    // For vote together deals
    upgradeFrom?: string;         // If upgraded from another deal
  };
}

export interface NPCProposal {
  id: string;
  fromNPC: string;           // NPC proposing
  toPlayer: boolean;         // Always true for proposals to player
  deal: Omit<Deal, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
  reasoning: string;         // Why NPC wants this deal
  timestamp: number;
  response?: 'accepted' | 'declined' | 'pending';
}
```

---

## Part 2: Deal Proposal Dialog (NPC → Player)

### New File: `src/components/deals/NPCProposalDialog.tsx`

A dialog that appears when an NPC proposes a deal to the player:

```
+--------------------------------------------------+
|  [NPC Avatar] Morgan wants to make a deal!       |
+--------------------------------------------------+
|                                                  |
|  "I think we should target Riley next week if    |
|   either of us wins HoH. They're getting too     |
|   powerful and we need to act now."              |
|                                                  |
|  +--------------------------------------------+  |
|  |  🎯 TARGET AGREEMENT                       |  |
|  |  Target: Riley Johnson                      |  |
|  |  Condition: When either wins HoH            |  |
|  |  Trust Impact: ⚠️ HIGH                      |  |
|  +--------------------------------------------+  |
|                                                  |
|  Your relationship: 💚 +45 (Friendly)           |
|                                                  |
|  [Decline]  [Counter-Propose]  [Accept Deal]    |
+--------------------------------------------------+
```

**Features:**
- Shows NPC's reasoning (AI-generated or fallback)
- Displays deal terms clearly
- Shows current relationship status
- Allows accept, decline, or counter-propose

---

## Part 3: Player Proposal Dialog (Player → NPC)

### Modify: `src/components/game-phases/social/MakePromiseDialog.tsx`

Rename and expand to `ProposeDealDialog.tsx`:

**New Deal Options:**
1. **Target Agreement** - "Let's target [dropdown] next week"
2. **Safety Pact** - "Promise not to nominate each other"
3. **Voting Block** - "Let's vote together this week"
4. **Veto Commitment** - "Use veto on me if I'm on the block"
5. **Information Sharing** - "Share all game intel with me"
6. **Final Two Deal** - "Take me to the final 2"
7. **Form Partnership** - "Work together moving forward"
8. **Propose Alliance** - "Form an official alliance" (opens alliance creator)

**NPC Response Logic:**
- Based on relationship score and NPC personality traits
- High relationship (50+) = likely accept
- Medium relationship (20-50) = may negotiate or decline
- Low relationship (<20) = likely decline with reason
- NPC traits affect acceptance (Loyal NPCs more likely to accept alliance deals)

---

## Part 4: Deal System Core Logic

### New File: `src/systems/deal-system.ts`

Replace/extend promise-system with deal-system:

```typescript
export class DealSystem {
  // Create new deal between houseguests
  createDeal(proposerId: string, recipientId: string, type: DealType, context?: object): Deal;
  
  // NPC proposes deal to player
  npcProposeDealToPlayer(npc: Houseguest, dealType: DealType, reasoning: string): NPCProposal;
  
  // Player responds to NPC proposal
  respondToProposal(proposalId: string, response: 'accept' | 'decline'): void;
  
  // Check if NPC would accept a deal from player
  evaluatePlayerDeal(npc: Houseguest, dealType: DealType, context?: object): {
    wouldAccept: boolean;
    acceptanceChance: number;
    reasoning: string;
  };
  
  // Evaluate deals based on game actions
  evaluateDealsForAction(actionType: string, params: any): void;
  
  // Get active deals for a houseguest
  getActiveDeals(houseguestId: string): Deal[];
  
  // Check if two houseguests have a specific deal type
  haveDeal(guest1Id: string, guest2Id: string, type?: DealType): boolean;
  
  // Upgrade a deal (e.g., partnership → alliance)
  upgradeDeal(dealId: string, newType: DealType): Deal;
}
```

**Deal Evaluation Logic:**
- Target Agreement: Fulfilled when HoH winner nominates target; Broken if they nominate partner
- Safety Pact: Broken if either nominates the other
- Vote Together: Evaluated at eviction
- Veto Commitment: Evaluated at PoV meeting
- Final Two: Evaluated at final selection

---

## Part 5: NPC Deal Generation

### Modify: `src/systems/ai/npc-social-behavior.ts`

Update to generate proposals directed at the player:

```typescript
/**
 * Generate NPC proposals for the player
 */
export function generateNPCPlayerProposals(
  npc: Houseguest,
  game: BigBrotherGame
): NPCProposal[] {
  const proposals: NPCProposal[] = [];
  const player = game.getActiveHouseguests().find(h => h.isPlayer);
  if (!player) return proposals;
  
  const relationship = game.relationshipSystem?.getRelationship(npc.id, player.id) ?? 0;
  
  // Only propose if relationship is decent
  if (relationship < 15) return proposals;
  
  // Check various conditions for proposals
  
  // If NPC is on the block - desperate for votes
  if (npc.isNominated) {
    proposals.push(createProposal(npc, 'vote_together', 
      `I need your vote to stay. In return, I'll have your back next week.`));
  }
  
  // If there's a common threat
  const commonThreat = findCommonThreat(npc, player, game);
  if (commonThreat && relationship > 30) {
    proposals.push(createProposal(npc, 'target_agreement',
      `${commonThreat.name} is getting too powerful. We should work together to get them out.`,
      { targetHouseguestId: commonThreat.id }));
  }
  
  // Alliance formation opportunity
  if (relationship > 45 && !game.allianceSystem?.areInSameAlliance(npc.id, player.id)) {
    proposals.push(createProposal(npc, 'partnership',
      `I think we work well together. Want to officially partner up?`));
  }
  
  // Late game final 2 deals
  const activeCount = game.getActiveHouseguests().length;
  if (relationship > 60 && activeCount <= 6) {
    proposals.push(createProposal(npc, 'final_two',
      `We're getting close to the end. I want you with me in the final 2.`));
  }
  
  return proposals;
}
```

---

## Part 6: Active Deals UI Panel

### New File: `src/components/deals/DealsPanel.tsx`

Replace the Promises button with a Deals & Alliances button:

```
+--------------------------------------------------+
|  DEALS & ALLIANCES                   [Filter ▾]  |
+--------------------------------------------------+
|                                                  |
|  ACTIVE DEALS (3)                               |
|  +--------------------------------------------+  |
|  | 🎯 Target Agreement with Morgan            |  |
|  | Target: Riley | Expires: Week 4            |  |
|  | Status: ✓ Active                           |  |
|  +--------------------------------------------+  |
|  | 🛡️ Safety Pact with Taylor                 |  |
|  | Neither nominates the other                |  |
|  | Status: ✓ Active                           |  |
|  +--------------------------------------------+  |
|                                                  |
|  PENDING PROPOSALS (1)                          |
|  +--------------------------------------------+  |
|  | ⏳ Casey wants to form a Voting Block      |  |
|  | [View Details]                             |  |
|  +--------------------------------------------+  |
|                                                  |
|  YOUR ALLIANCES (1)                             |
|  +--------------------------------------------+  |
|  | 👥 "The Core Four" (4 members)             |  |
|  | Stability: 85% | Founded Week 2            |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

---

## Part 7: Trust & Reputation System

### Modify: `src/systems/ai/npc-decision-engine.ts`

Add trust score tracking based on deal history:

```typescript
/**
 * Calculate trust reputation based on deal history
 */
export function calculateDealTrust(
  houseguestId: string,
  game: BigBrotherGame
): { trustScore: number; reputation: 'trustworthy' | 'neutral' | 'untrustworthy' } {
  const deals = game.deals || [];
  let trustScore = 50; // Start neutral
  
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
  
  trustScore = Math.max(0, Math.min(100, trustScore));
  
  return {
    trustScore,
    reputation: trustScore >= 65 ? 'trustworthy' : 
                trustScore <= 35 ? 'untrustworthy' : 'neutral'
  };
}
```

NPCs will use this trust score when deciding whether to accept deals from the player.

---

## Part 8: NPC Proposal Queue in Social Phase

### Modify: `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx`

Add NPC proposal handling:

```typescript
// New state for NPC proposals
const [pendingProposals, setPendingProposals] = useState<NPCProposal[]>([]);
const [currentProposal, setCurrentProposal] = useState<NPCProposal | null>(null);

// Generate NPC proposals at start of social phase
useEffect(() => {
  if (game?.currentState?.constructor.name === 'SocialInteractionState') {
    const proposals = generateAllNPCProposals(game);
    setPendingProposals(proposals);
    
    // Show first proposal after a delay
    if (proposals.length > 0) {
      setTimeout(() => {
        setCurrentProposal(proposals[0]);
      }, 2000);
    }
  }
}, [game?.currentState]);

// Render proposal dialog when there's a pending proposal
{currentProposal && (
  <NPCProposalDialog
    proposal={currentProposal}
    onRespond={handleProposalResponse}
    onClose={() => handleNextProposal()}
  />
)}
```

---

## Part 9: Deal Evaluation Integration

### Modify: `src/contexts/reducers/game-reducer.ts`

Add deal evaluation hooks to game actions:

```typescript
case 'NOMINATE':
  // Evaluate deals when nomination happens
  if (game.dealSystem) {
    game.dealSystem.evaluateDealsForAction('NOMINATE', {
      nominatorId: action.payload.hohId,
      nomineeIds: action.payload.nomineeIds
    });
  }
  break;

case 'CAST_VOTE':
  // Evaluate vote-related deals
  if (game.dealSystem) {
    game.dealSystem.evaluateDealsForAction('CAST_VOTE', {
      voterId: action.payload.voterId,
      voteFor: action.payload.voteFor
    });
  }
  break;

case 'VETO_DECISION':
  // Evaluate veto-related deals
  if (game.dealSystem) {
    game.dealSystem.evaluateDealsForAction('VETO_DECISION', {
      povHolderId: action.payload.povHolderId,
      savedId: action.payload.savedId,
      used: action.payload.used
    });
  }
  break;
```

---

## Part 10: Game State Updates

### Modify: `src/models/game-state.ts`

Add deals to game state:

```typescript
export interface GameState {
  // ... existing fields
  deals?: Deal[];
  pendingNPCProposals?: NPCProposal[];
  promises?: Promise[]; // Keep for backward compatibility during migration
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/models/deal.ts` | Deal and NPCProposal type definitions |
| `src/systems/deal-system.ts` | Core deal management logic |
| `src/components/deals/NPCProposalDialog.tsx` | Dialog for NPC proposals to player |
| `src/components/deals/ProposeDealDialog.tsx` | Dialog for player proposing deals |
| `src/components/deals/DealsPanel.tsx` | Main deals overview panel |
| `src/components/deals/DealCard.tsx` | Individual deal display |
| `src/components/deals/index.ts` | Exports |

## Files to Modify

| File | Changes |
|------|---------|
| `src/models/game-state.ts` | Add deals and proposals to state |
| `src/contexts/reducers/game-reducer.ts` | Add deal evaluation hooks |
| `src/systems/ai/npc-social-behavior.ts` | Add NPC proposal generation for player |
| `src/systems/ai/npc-decision-engine.ts` | Add trust score calculations |
| `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx` | Handle NPC proposals |
| `src/components/game-screen/GameHeader.tsx` | Replace Promises with Deals button |
| `src/game-states/SocialInteractionState.ts` | Add propose_deal action |

---

## Deal Types Summary

| Deal Type | Trigger Condition | Fulfilled When | Broken When |
|-----------|------------------|----------------|-------------|
| Target Agreement | Either wins HoH | Target is nominated | Partner is nominated instead |
| Safety Pact | Either wins HoH | Neither nominates other | Either nominates the other |
| Vote Together | Eviction vote | Both vote the same | Vote differently |
| Veto Commitment | PoV Meeting | Veto used on partner | Veto not used when promised |
| Information Sharing | Any info learned | Info is shared | Info is withheld/leaked |
| Final Two | Final selection | Partner taken to F2 | Partner not selected |
| Partnership | Ongoing | Alliance formed | Betrayal occurs |
| Alliance Invite | Alliance creation | Alliance formed | Declined/Alliance breaks |

---

## NPC Personality Influence on Deals

| Trait | Deal Preferences | Acceptance Modifier |
|-------|-----------------|---------------------|
| Strategic | Target agreements, partnerships | +10% for tactical deals |
| Loyal | Safety pacts, alliances | +20% for loyalty deals, -20% for betrayal requests |
| Sneaky | Information sharing, short-term deals | +15% for info deals, may break deals more often |
| Competitive | Target agreements on comp threats | +15% for targeting strong players |
| Emotional | Final two, partnerships | +25% for relationship-based deals |
| Paranoid | Safety pacts | +10% for safety, -15% for trusting new allies |

---

## User Flow Example

```text
Social Phase begins
    |
    v
NPC evaluates player relationship
    |
    +---> Relationship > 30 + NPC sees strategic opportunity
    |         |
    |         v
    |     [NPC Proposal Dialog appears]
    |     "Morgan wants to target Riley together"
    |         |
    |         +---> Player accepts
    |         |         |
    |         |         v
    |         |     Deal created (status: active)
    |         |     Relationship boost (+8)
    |         |     
    |         +---> Player declines
    |                   |
    |                   v
    |               Small relationship penalty (-3)
    |
    +---> Player can also initiate deals
              |
              v
          [Propose Deal button on houseguest]
              |
              v
          [ProposeDealDialog opens]
          Select deal type + target
              |
              v
          NPC evaluates based on:
          - Relationship score
          - Personality traits  
          - Trust history
          - Strategic value
              |
              +---> NPC accepts (relationship + traits favorable)
              |         |
              |         v
              |     Deal created, relationship boost
              |
              +---> NPC declines (low trust/relationship)
                        |
                        v
                    "I don't think I can trust you with that"
```

---

## Technical Notes

### Backward Compatibility
- Keep `promises` field in GameState during transition
- Migrate existing promises to deals on load
- Eventually deprecate promise system

### Performance
- NPC proposals generated at phase start, not continuously
- Maximum 2-3 proposals per social phase to prevent overwhelm
- Deal evaluations are event-driven, not polling

### Trust Persistence
- Trust scores persist across weeks
- Breaking high-impact deals has lasting effects
- Other houseguests can learn about broken deals (same as current promise betrayal spread)
