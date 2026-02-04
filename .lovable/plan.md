

# Plan: Autonomous NPC Social Actions and Enhanced Promise/Alliance System

## Overview

This plan adds two major features:
1. **Autonomous NPC Actions** - NPCs will perform social actions during the social phase (forming alliances, talking, making promises)
2. **Enhanced Tracking System** - Track positive/negative interactions between all houseguests with memory that influences decisions

---

## Part 1: Autonomous NPC Social Actions

### New File: `src/systems/ai/npc-social-behavior.ts`

Create a system that generates and executes NPC actions during social phases:

```text
+---------------------------+
|   NPC Social Behavior     |
+---------------------------+
| - generateNPCActions()    |
| - executeNPCActions()     |
| - evaluateAllianceDesire()|
| - selectTalkTarget()      |
| - considerPromise()       |
+---------------------------+
           |
           v
+---------------------------+
|  Action Types             |
+---------------------------+
| - Talk to houseguest      |
| - Form alliance           |
| - Make promise            |
| - Hold alliance meeting   |
| - Spread information      |
+---------------------------+
```

Key functions:
- **generateNPCActions(npc, game)**: Returns a list of actions an NPC wants to take based on their personality, relationships, and game state
- **executeNPCActions(game)**: Runs during social phase to have NPCs perform actions with visible feedback
- **evaluateAllianceDesire(npc, potentialAlly, game)**: Determines if an NPC wants to form an alliance based on:
  - Relationship score (minimum threshold of +25)
  - Shared threats (people they both dislike)
  - Alliance count (max 2-3 alliances per person)
  - Personality traits (Strategic NPCs seek alliances earlier)

### NPC Action Logic

```typescript
interface NPCAction {
  type: 'talk' | 'alliance_propose' | 'promise' | 'alliance_meeting' | 'spread_info';
  actor: Houseguest;
  target: Houseguest;
  reasoning: string;
  priority: number; // Higher = more important
}
```

**Action Selection Rules:**

| Trait | Preferred Actions |
|-------|-------------------|
| Strategic | Alliance proposals, Strategic talks |
| Loyal | Alliance meetings, Keep promises |
| Sneaky | Spread information, Manipulate |
| Social | Talk frequently, Build relationships |
| Competitive | Target threats, Power alliances |
| Paranoid | Avoid alliances, Gather information |

---

## Part 2: Interaction Tracking System

### New File: `src/systems/ai/interaction-tracker.ts`

Create a comprehensive system to track all interactions:

```typescript
interface TrackedInteraction {
  id: string;
  week: number;
  type: InteractionType;
  fromId: string;
  toId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number; // -100 to 100
  description: string;
  decaysAt?: number; // Week when impact starts fading
}

type InteractionType = 
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
  | 'attacked';
```

### Modify: `src/systems/ai/memory-manager.ts`

Upgrade memories to be interaction-based:

```typescript
interface StructuredMemory {
  id: string;
  week: number;
  type: InteractionType;
  importance: number; // 1-10
  involvedIds: string[];
  description: string;
  emotionalImpact: number; // -100 to 100
  decaysAt?: number;
}
```

**Memory Prioritization for Decisions:**
- Betrayals: Always relevant, never decay
- Alliance events: Relevant for voting decisions
- Promise events: Relevant for trust decisions
- Conversations: Minor weight, decay after 2 weeks

---

## Part 3: Enhanced Promise System with Alliances

### Modify: `src/systems/promise/promise-core.ts`

Add alliance-related promise types and NPC promise tracking:

```typescript
// New promise types
type PromiseType = 
  | 'safety'          // Won't nominate/vote against
  | 'vote'            // Will vote a certain way
  | 'final_2'         // Take to final 2
  | 'alliance_loyalty'// Loyalty to alliance
  | 'information'     // Share information
  | 'veto_use'        // Use veto on someone (NEW)
  | 'hoh_protection'; // If win HoH, won't target (NEW)
```

### New: NPC Promise Creation

NPCs will autonomously make promises when:
1. They need safety (on the block or feel threatened)
2. Building an alliance (mutual protection promises)
3. Strategic positioning (making deals with HoH)
4. Reciprocating (someone made a promise to them)

```typescript
function shouldNPCMakePromise(
  npc: Houseguest, 
  target: Houseguest, 
  game: BigBrotherGame
): { shouldPromise: boolean; type: PromiseType; reason: string } {
  // Check if NPC is in danger
  if (npc.isNominated) {
    return { shouldPromise: true, type: 'vote', reason: 'seeking safety while on block' };
  }
  
  // Check if target is HoH
  if (target.isHoH && !game.allianceSystem.areInSameAlliance(npc.id, target.id)) {
    return { shouldPromise: true, type: 'safety', reason: 'securing safety with HoH' };
  }
  
  // Check for alliance formation opportunity
  const relationship = game.relationshipSystem.getRelationship(npc.id, target.id);
  if (relationship > 40 && !game.allianceSystem.areInSameAlliance(npc.id, target.id)) {
    return { shouldPromise: true, type: 'alliance_loyalty', reason: 'building alliance foundation' };
  }
  
  return { shouldPromise: false, type: 'safety', reason: '' };
}
```

---

## Part 4: UI Integration

### Modify: `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx`

Add NPC activity feed to show what NPCs are doing:

```typescript
interface NPCActivityItem {
  npcName: string;
  action: string;
  targetName?: string;
  timestamp: number;
}

// Display component showing NPC activities
<NPCActivityFeed activities={npcActivities} />
```

### New Component: `src/components/game-phases/social-interaction/NPCActivityFeed.tsx`

Shows real-time NPC actions with AI thought bubbles:
- "[NPC Name] approached [Target] for a conversation"
- "[NPC Name] proposed an alliance with [Target]"
- "[NPC Name] made a promise to [Target]"

---

## Part 5: Alliance Improvements for Player

### Modify: `src/components/alliance/AllianceManager.tsx`

Add features:
1. **View Alliance Status**: See all active alliances and their stability
2. **Alliance Promises**: Auto-create loyalty promises when forming alliance
3. **Alliance Notifications**: Alert when NPC alliances form

### New: Alliance Promise Integration

When an alliance is formed:
1. All members automatically gain implicit `alliance_loyalty` promises
2. These promises affect voting decisions
3. Breaking alliance = breaking promise = major relationship penalty

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/systems/ai/npc-social-behavior.ts` | NPC autonomous action system |
| `src/systems/ai/interaction-tracker.ts` | Comprehensive interaction tracking |
| `src/components/game-phases/social-interaction/NPCActivityFeed.tsx` | UI for NPC activities |

## Files to Modify

| File | Changes |
|------|---------|
| `src/config.ts` | Add NPC social behavior timing constants |
| `src/systems/ai/memory-manager.ts` | Upgrade to structured memories |
| `src/systems/promise/promise-core.ts` | Add new promise types and NPC promise logic |
| `src/systems/alliance-system.ts` | Add autonomous alliance formation logic |
| `src/game-states/SocialInteractionState.ts` | Trigger NPC actions during social phase |
| `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx` | Display NPC activity feed |
| `src/systems/ai/npc-decision-engine.ts` | Factor in interaction history |
| `src/models/promise.ts` | Add new promise types |

---

## Technical Details

### Config Additions

```typescript
// NPC Social Behavior
NPC_ALLIANCE_MIN_RELATIONSHIP: 25,     // Min relationship to propose alliance
NPC_ALLIANCE_MAX_PER_PERSON: 3,        // Max alliances an NPC will join
NPC_PROMISE_THRESHOLD: 30,             // Relationship threshold for promises
NPC_ACTION_DELAY_MS: 1500,             // Delay between NPC actions for visibility
NPC_ACTIVITY_DISPLAY_TIME: 4000,       // How long to show NPC activity in feed
```

### NPC Action Execution Flow

```text
Social Phase Start
       |
       v
+-------------------+
| For each NPC:     |
| 1. Generate actions|
| 2. Prioritize     |
| 3. Execute top 2  |
+-------------------+
       |
       v
+-------------------+
| Show in UI:       |
| - Activity feed   |
| - AI thought      |
| - Relationship    |
|   impact toast    |
+-------------------+
       |
       v
+-------------------+
| Update State:     |
| - Relationships   |
| - Promises        |
| - Alliances       |
| - Interactions    |
+-------------------+
```

### NPC Alliance Formation Logic

```typescript
function evaluateAllianceProposal(npc: Houseguest, target: Houseguest, game): boolean {
  const factors = {
    relationship: game.relationshipSystem.getRelationship(npc.id, target.id),
    sharedThreats: countSharedThreats(npc, target, game),
    currentAlliances: game.allianceSystem.getAlliancesForHouseguest(npc.id).length,
    targetValue: calculateStrategicValue(npc, target, game),
    trustworthiness: calculateTrustworthiness(target, game), // Based on promise history
  };
  
  // Decision formula
  const score = 
    (factors.relationship * 0.3) +
    (factors.sharedThreats * 10) +
    (factors.targetValue * 0.2) +
    (factors.trustworthiness * 0.2) -
    (factors.currentAlliances * 15); // Penalty for having many alliances
  
  return score > 30;
}
```

---

## Expected Behavior After Implementation

### During Social Phase:
1. Player takes their actions (unchanged)
2. After each player action, NPCs perform 1-2 actions each
3. Activity feed shows what NPCs are doing in real-time
4. AI thought bubbles appear showing NPC reasoning
5. Notifications when alliances form or promises are made

### NPC Decision Making:
- NPCs consider past interactions when making decisions
- Positive history = more likely to work together
- Negative history = more likely to target each other
- Promise history affects trust and alliance decisions
- Betrayals are remembered and affect future votes

### Alliance Formation:
- NPCs will propose alliances to houseguests they like (relationship > 25)
- Strategic NPCs prioritize strong competitors as allies
- Loyal NPCs stay committed to existing alliances
- Alliance proposals can be rejected based on target's evaluation

### Promise Behavior:
- NPCs make promises when threatened or building relationships
- Promises create tracking obligations
- Broken promises spread through the house
- Promise history affects voting and alliance decisions

