
# Plan: Enhance NPC Behavior and Intelligence

## Current System Analysis

The game currently has foundational systems for NPC decision-making, but several areas can be significantly improved to make NPCs feel more intelligent and strategic.

### Existing Components
- **AI Integration System**: Uses Gemini API with fallback to relationship-based decisions
- **Fallback Generator**: Makes decisions based on relationship scores when AI fails
- **Memory Manager**: Stores basic memories for each houseguest
- **Mental State Tracking**: Mood and stress levels that affect decision-making
- **Personality Traits**: 17 traits that influence behavior
- **Relationship System**: Tracks relationships with decay, events, and group dynamics

### Current Limitations
1. **No autonomous NPC actions** during social phases - only player can interact
2. **Memory system is basic** - only 10 memories, simple text format
3. **Voting logic is simplistic** - only considers direct relationship scores
4. **No strategic threat assessment** - NPCs don't evaluate who is a competition threat
5. **Limited trait influence** - traits affect prompts but not fallback logic significantly
6. **NPCs don't form alliances autonomously**
7. **No betrayal detection or revenge mechanics** in decision-making
8. **Jury votes don't consider gameplay respect** - only relationships

---

## Proposed Enhancements

### Phase 1: Enhanced Decision Weighting System

Create a sophisticated scoring system that NPCs use for all major decisions.

**New File: `src/systems/ai/npc-decision-engine.ts`**

```typescript
interface DecisionFactors {
  relationship: number;        // -100 to 100
  threatLevel: number;         // 0 to 100 (competition threat)
  allianceLoyalty: number;     // 0 to 100
  reciprocity: number;         // -1 to 1
  recentEvents: number;        // -50 to 50 (recent positive/negative events)
  personalityBias: number;     // -20 to 20 based on traits
  strategicValue: number;      // 0 to 100 (how useful is this person)
  promiseObligations: number;  // -30 to 30 based on active promises
}
```

**Trait-Specific Decision Modifiers:**
- **Strategic**: Weighs threat level higher, less emotional decisions
- **Loyal**: Heavily weighs alliance membership and promises
- **Competitive**: Targets strong competitors
- **Emotional**: Weighs recent events and relationship more heavily
- **Sneaky**: Lower penalty for backstabbing, higher strategic value weight
- **Confrontational**: More likely to make bold moves against disliked players

---

### Phase 2: Threat Assessment System

**New File: `src/systems/ai/threat-assessment.ts`**

NPCs evaluate other houseguests as threats based on:
- Competition wins (HoH, PoV count)
- Social connections (average relationship score with house)
- Alliance memberships (number and size of alliances)
- Previous nominations/targets

```typescript
calculateThreatLevel(evaluator: Houseguest, target: Houseguest): number {
  let threat = 0;
  
  // Competition threat (0-40 points)
  threat += (target.competitionsWon.hoh * 8);
  threat += (target.competitionsWon.pov * 6);
  
  // Social threat - average relationship with house (0-30 points)
  const avgRelationship = getAverageRelationship(target.id);
  threat += Math.max(0, (avgRelationship + 50) * 0.3);
  
  // Alliance threat (0-20 points)
  const allianceCount = getAlliancesForHouseguest(target.id).length;
  threat += allianceCount * 7;
  
  // Stat-based potential threat (0-10 points)
  threat += (target.stats.competition / 10) * 5;
  threat += (target.stats.strategic / 10) * 5;
  
  return Math.min(100, threat);
}
```

---

### Phase 3: Enhanced Voting Logic

**File: `src/components/game-phases/EvictionPhase/useVotingLogic.ts`**

Replace simple relationship comparison with multi-factor decision:

```typescript
function calculateVoteScore(voter: Houseguest, nominee: Houseguest): number {
  let keepScore = 0;
  
  // Relationship factor (weight: 30%)
  keepScore += relationship * 0.3;
  
  // Alliance loyalty factor (weight: 25%)
  if (areInSameAlliance(voter.id, nominee.id)) {
    keepScore += 40;
  }
  
  // Threat level factor - want to evict threats (weight: 25%)
  const threat = calculateThreatLevel(voter, nominee);
  keepScore -= threat * 0.25;
  
  // Promise obligations (weight: 10%)
  const promises = getPromisesBetween(voter.id, nominee.id);
  promises.forEach(p => {
    if (p.type === 'safety' && p.status === 'pending') {
      keepScore += 30; // Strong incentive to honor safety promises
    }
  });
  
  // Personality modifier (weight: 10%)
  keepScore += getPersonalityVoteModifier(voter, nominee);
  
  return keepScore;
}
```

---

### Phase 4: Autonomous NPC Social Actions

**New File: `src/systems/ai/npc-social-behavior.ts`**

NPCs perform their own social actions during social phases:

```typescript
interface NPCAction {
  type: 'talk' | 'strategy' | 'alliance_propose' | 'alliance_meeting' | 'spread_info';
  targetId: string;
  reasoning: string;
}

function generateNPCActions(npc: Houseguest, game: BigBrotherGame): NPCAction[] {
  const actions: NPCAction[] = [];
  
  // Strengthen existing alliances
  const allies = getAllAlliesForHouseguest(npc.id);
  if (allies.length > 0) {
    const weakestAlly = findWeakestRelationshipAlly(npc, allies);
    actions.push({
      type: 'talk',
      targetId: weakestAlly.id,
      reasoning: `Maintaining alliance relationship`
    });
  }
  
  // Strategic: Consider forming new alliances
  if (npc.traits.includes('Strategic') && allies.length < 3) {
    const potentialAlly = findBestPotentialAlly(npc);
    if (potentialAlly && getRelationship(npc.id, potentialAlly.id) > 25) {
      actions.push({
        type: 'alliance_propose',
        targetId: potentialAlly.id,
        reasoning: `Strategic alliance opportunity`
      });
    }
  }
  
  // Sneaky: Spread information about enemies
  if (npc.traits.includes('Sneaky') || npc.traits.includes('Manipulative')) {
    const enemy = findWorstRelationship(npc);
    const friend = findBestRelationship(npc);
    if (enemy && friend) {
      actions.push({
        type: 'spread_info',
        targetId: friend.id,
        reasoning: `Turning ally against enemy`
      });
    }
  }
  
  return actions;
}
```

---

### Phase 5: Enhanced Memory System

**File: `src/systems/ai/memory-manager.ts`**

Upgrade memories to be more structured and impactful:

```typescript
interface StructuredMemory {
  id: string;
  week: number;
  type: 'betrayal' | 'alliance' | 'competition' | 'vote' | 'promise' | 'social';
  importance: number; // 1-10
  involvedIds: string[];
  description: string;
  emotionalImpact: number; // -100 to 100
  decaysAt?: number; // Week when this memory fades
}

// Memory prioritization for decisions
function getRelevantMemories(houseguestId: string, decisionType: string): StructuredMemory[] {
  const allMemories = memories.get(houseguestId) || [];
  
  // Filter by relevance to decision type
  return allMemories
    .filter(m => {
      // Betrayal memories always relevant for trust decisions
      if (m.type === 'betrayal') return true;
      // Alliance memories relevant for voting
      if (decisionType === 'eviction_vote' && m.type === 'alliance') return true;
      // Promise memories for nominations
      if (decisionType === 'nomination' && m.type === 'promise') return true;
      return m.importance >= 7;
    })
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 8); // Top 8 most relevant memories
}
```

---

### Phase 6: Jury Vote Intelligence

**File: `src/systems/ai/prompts/game-decision-prompts.ts`**

Improve jury voting to consider gameplay respect:

```typescript
function calculateJuryVoteFactors(juror: Houseguest, finalist: Houseguest): number {
  let score = 0;
  
  // Personal relationship (30% weight)
  score += getRelationship(juror.id, finalist.id) * 0.3;
  
  // Gameplay respect (40% weight)
  const gameplayRespect = calculateGameplayRespect(juror, finalist);
  score += gameplayRespect * 0.4;
  
  // How they were evicted (30% weight)
  const evictionBitterness = getEvictionBitterness(juror, finalist);
  score -= evictionBitterness * 0.3;
  
  return score;
}

function calculateGameplayRespect(juror: Houseguest, finalist: Houseguest): number {
  let respect = 0;
  
  // Competition performance
  respect += finalist.competitionsWon.hoh * 5;
  respect += finalist.competitionsWon.pov * 4;
  
  // Big moves (nominations, veto uses that changed game)
  respect += countBigMoves(finalist) * 8;
  
  // Survived nominations (resilience)
  respect += finalist.nominations.times * 3;
  
  // Social game (avoided being targeted)
  const weeksActive = /* calculate */;
  const targetRate = finalist.nominations.times / weeksActive;
  respect += (1 - targetRate) * 20;
  
  return Math.min(100, respect);
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/systems/ai/npc-decision-engine.ts` | Create | Core NPC decision weighting system |
| `src/systems/ai/threat-assessment.ts` | Create | Competition and social threat evaluation |
| `src/systems/ai/npc-social-behavior.ts` | Create | Autonomous NPC social actions |
| `src/systems/ai/memory-manager.ts` | Modify | Upgrade to structured memories |
| `src/systems/ai/fallback-generator.ts` | Modify | Use new decision engine for fallbacks |
| `src/components/game-phases/EvictionPhase/useVotingLogic.ts` | Modify | Multi-factor voting decisions |
| `src/systems/ai/prompts/game-decision-prompts.ts` | Modify | Enhanced jury vote logic |
| `src/config.ts` | Modify | Add NPC behavior tuning constants |

---

## Implementation Priority

1. **High Priority** - Decision Engine + Enhanced Voting (immediate gameplay improvement)
2. **High Priority** - Threat Assessment (makes nominations and votes smarter)
3. **Medium Priority** - Enhanced Memory System (improves context for decisions)
4. **Medium Priority** - Jury Vote Intelligence (better finale experience)
5. **Lower Priority** - Autonomous NPC Social Actions (adds passive gameplay depth)

---

## Technical Considerations

### Config Additions
```typescript
// NPC Behavior settings
NPC_THREAT_WEIGHT: 0.25,          // How much threat level affects decisions
NPC_LOYALTY_WEIGHT: 0.25,         // How much alliance loyalty matters
NPC_RELATIONSHIP_WEIGHT: 0.3,     // Base relationship importance
NPC_PROMISE_WEIGHT: 0.1,          // Promise obligation weight
NPC_PERSONALITY_WEIGHT: 0.1,      // Personality bias weight

// Autonomous actions
NPC_AUTONOMOUS_ACTIONS_ENABLED: true,
NPC_ACTIONS_PER_SOCIAL_PHASE: 2,  // How many actions each NPC takes
```

### Performance
- All calculations are synchronous and lightweight
- Memory queries are O(n) where n = memory count per houseguest
- Threat assessments can be cached per week

---

## Expected Outcomes

After implementation:
- NPCs will target competition threats, not just disliked houseguests
- Alliance members will vote together unless there's a compelling reason not to
- Jury votes will respect strong gameplay, not just friendships
- NPCs will form and maintain alliances strategically
- Betrayals will have lasting consequences through memory system
- Different personality types will make noticeably different decisions
