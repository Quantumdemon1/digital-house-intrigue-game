

# Plan: Slow Down NPC Decision Display Timing

## Problem

When NPC houseguests are shown making decisions (voting, thinking, etc.), the thoughts and decision displays move too quickly between them, making it hard for players to read and understand each character's reasoning.

## Root Causes

Multiple timing values throughout the codebase are set too low:

| File | Current Value | Issue |
|------|---------------|-------|
| `useVotingLogic.ts` line 114 | 300ms | AI votes transition to next voter almost instantly |
| `useAIProcessing.ts` lines 54-55 | 1000-2000ms | Nomination processing time is short |
| Various animation durations | 0.3s | Fade animations complete quickly |

## Solution

Create centralized timing constants in `config.ts` and update all NPC decision display timings to use longer, more readable intervals.

---

## Technical Changes

### 1. Add Timing Constants to Config (`src/config.ts`)

Add new constants for NPC decision display timings:

```typescript
// NPC Decision Display Timing (in milliseconds)
NPC_VOTE_DISPLAY_TIME: 2500,           // Time to show each NPC's vote decision
NPC_VOTE_TRANSITION_DELAY: 1500,       // Delay before moving to next voter
NPC_THOUGHT_DISPLAY_TIME: 3000,        // Time to show AI thought bubbles
NPC_DECISION_PROCESSING_MIN: 2000,     // Minimum AI decision "thinking" time
NPC_DECISION_PROCESSING_MAX: 4000,     // Maximum AI decision "thinking" time
NPC_NOMINATION_REVEAL_DELAY: 2500,     // Delay when revealing nomination decisions
```

### 2. Update Voting Logic (`src/components/game-phases/EvictionPhase/useVotingLogic.ts`)

Change the vote transition timeout from 300ms to use the config value:

**Before (line 110-114):**
```typescript
setTimeout(() => {
  setShowVote(false);
  setIsVoting(false);
  nextVoter();
}, 300); // Fast voting for AI players
```

**After:**
```typescript
setTimeout(() => {
  setShowVote(false);
  setIsVoting(false);
  nextVoter();
}, config.NPC_VOTE_DISPLAY_TIME); // Slower to let players read
```

Also update the player vote display time at line 132 from 1000ms to 2000ms.

### 3. Update AI Processing Timing (`src/components/game-phases/NominationPhase/hooks/ai-nomination/useAIProcessing.ts`)

Change processing time calculation from 1-2 seconds to 2-4 seconds:

**Before (lines 54-55):**
```typescript
const processingTime = 1000 + Math.random() * 1000;
```

**After:**
```typescript
const processingTime = config.NPC_DECISION_PROCESSING_MIN + 
  Math.random() * (config.NPC_DECISION_PROCESSING_MAX - config.NPC_DECISION_PROCESSING_MIN);
```

### 4. Update POV Fast Forward Timing (`src/components/game-phases/POVMeeting/hooks/ai-decision/useFastForward.ts`)

Add delays to AI decision reveals to make them readable.

### 5. Add Thought Display Duration to AI Thoughts Hook (`src/hooks/useAIThoughts.tsx`)

Add auto-removal of thoughts after the configured display time:

```typescript
const addThought = (houseguest: Houseguest, thought: string, type: 'thought' | 'decision' | 'strategy' = 'thought') => {
  setThoughts(prev => ({
    ...prev,
    [houseguest.id]: {
      houseguestId: houseguest.id,
      thought,
      timestamp: Date.now(),
      type
    }
  }));
  
  // Auto-remove thought after display time
  setTimeout(() => {
    removeThought(houseguest.id);
  }, config.NPC_THOUGHT_DISPLAY_TIME);
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/config.ts` | Add NPC timing constants |
| `src/components/game-phases/EvictionPhase/useVotingLogic.ts` | Increase vote transition delay from 300ms to 2500ms |
| `src/components/game-phases/NominationPhase/hooks/ai-nomination/useAIProcessing.ts` | Increase processing time range to 2-4 seconds |
| `src/hooks/useAIThoughts.tsx` | Add auto-removal timer with 3-second delay |
| `src/components/game-phases/POVMeeting/hooks/ai-decision/useFastForward.ts` | Add delay before AI decision completion |

---

## Expected Behavior After Fix

1. **Eviction Voting**: Each NPC's vote will be visible for 2.5 seconds before transitioning to the next voter
2. **AI Nominations**: The HoH's decision process will take 2-4 seconds to "think" before revealing
3. **AI Thoughts**: Thought bubbles will remain visible for 3 seconds before fading
4. **POV Decisions**: AI veto decisions will have time for players to see the reasoning

---

## Summary of Timing Changes

| Scenario | Before | After |
|----------|--------|-------|
| NPC vote to next voter | 300ms | 2500ms |
| Player vote display | 1000ms | 2000ms |
| AI nomination thinking | 1-2 sec | 2-4 sec |
| AI thought bubble display | Until replaced | 3 sec then auto-fade |

