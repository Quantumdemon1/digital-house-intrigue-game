
# Plan: Fix Game Event Log Not Tracking Key Events

## Problem Analysis

The Game Event Log is not tracking HoH wins, PoV wins, nominations, and evictions. After investigating the codebase, I found **two main issues**:

### Issue 1: GameEventLog reads from stale `game` object instead of `gameState`

```typescript
// Current (broken) in GameEventLog.tsx
const { game } = useGame();
const events = game.gameLog || [];  // Always empty - never synced!
```

The `game` object (BigBrotherGame instance) is initialized once and never updated. All LOG_EVENT dispatches update `gameState.gameLog` in the reducer, but `game.gameLog` stays empty.

### Issue 2: Missing LOG_EVENT dispatches in key phases

| Phase | LOG_EVENT Dispatch | Status |
|-------|-------------------|--------|
| HoH Competition | `useCompetitionResults.ts:60` | Works (but data goes to gameState, not game) |
| Nominations | `useNominationCeremony.ts` | MISSING - no LOG_EVENT dispatch |
| PoV Competition | `POVCompetition/index.tsx:116` | Works (but data goes to gameState) |
| PoV Meeting | `useNomineeReplacement.ts:75` | Works (but data goes to gameState) |
| Eviction | `eviction-utils.ts`, `eviction-reducer.ts` | MISSING - no LOG_EVENT dispatch |

---

## Solution

### Fix 1: Update GameEventLog.tsx to read from `gameState`

Change the component to use the reducer state instead of the stale game object:

```typescript
// Before
const { game } = useGame();
const events = game.gameLog || [];

// After
const { gameState } = useGame();
const events = gameState.gameLog || [];
```

### Fix 2: Add LOG_EVENT dispatch to Nomination phase

**File**: `src/components/game-phases/NominationPhase/hooks/useNominationCeremony.ts`

Add event logging when nominations are confirmed:

```typescript
import { useGame } from '@/contexts/GameContext';

export const useNominationCeremony = (hoh: Houseguest | null): UseNominationCeremonyReturn => {
  const { dispatch, gameState } = useGame();  // Add this
  // ... existing code ...
  
  const confirmNominations = useCallback(() => {
    // ... existing validation ...
    
    // Log the nomination event
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'Nomination',
        type: 'NOMINATION',
        description: `${hoh?.name} nominated ${nominees.map(n => n.name).join(' and ')} for eviction.`,
        involvedHouseguests: [hoh?.id, ...nominees.map(n => n.id)].filter(Boolean),
        metadata: { hohId: hoh?.id, nomineeIds: nominees.map(n => n.id) }
      }
    });
    
    // ... rest of existing code ...
  }, [nominees, toast, dispatch, gameState.week, hoh]);
```

### Fix 3: Add LOG_EVENT dispatch to Eviction phase

**File**: `src/utils/eviction-utils.ts`

Add event logging when a houseguest is evicted:

```typescript
export const handleHouseguestEviction = (
  dispatch: Dispatch<GameAction>,
  evictedHouseguest: Houseguest,
  isJuryEligible: boolean,
  week: number  // Add week parameter
) => {
  // Log the eviction event
  dispatch({
    type: 'LOG_EVENT',
    payload: {
      week: week,
      phase: 'Eviction',
      type: 'EVICTION',
      description: `${evictedHouseguest.name} was evicted from the Big Brother house${isJuryEligible ? ' and joined the jury' : ''}.`,
      involvedHouseguests: [evictedHouseguest.id],
      metadata: { toJury: isJuryEligible }
    }
  });
  
  // ... existing eviction dispatch logic ...
};
```

**File**: `src/components/game-phases/EvictionPhase/hooks/useEvictionCompletion.ts`

Update the call to pass the week:

```typescript
handleHouseguestEviction(
  dispatch, 
  evictedHouseguest, 
  gameState.week >= 5,
  gameState.week  // Pass week
);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/GameEventLog.tsx` | Use `gameState.gameLog` instead of `game.gameLog` |
| `src/components/game-phases/NominationPhase/hooks/useNominationCeremony.ts` | Add LOG_EVENT dispatch for nominations |
| `src/utils/eviction-utils.ts` | Add LOG_EVENT dispatch for evictions |
| `src/components/game-phases/EvictionPhase/hooks/useEvictionCompletion.ts` | Pass `gameState.week` to eviction utility |

---

## Event Types to Track

After implementation, the game log will record:

| Event | Description Example |
|-------|---------------------|
| HoH Win | "Alex won the Head of Household competition." |
| Nominations | "Alex nominated Jamie and Sam for eviction." |
| PoV Win | "Jordan won the Power of Veto competition (mental - Mental stat favored)." |
| Veto Used/Not Used | "Jordan used the Power of Veto on Sam." or "Jordan chose not to use the Power of Veto." |
| Replacement Nominee | "Alex nominated Casey as a replacement nominee." |
| Eviction | "Jamie was evicted from the Big Brother house and joined the jury." |

---

## Testing Checklist

After implementation:
- [ ] Start a new game and play through Week 1
- [ ] Click "Game History" button to view the Event Log tab
- [ ] Verify HoH competition win is logged
- [ ] Verify nominations are logged with both nominee names
- [ ] Verify PoV competition win is logged
- [ ] Verify veto decision is logged
- [ ] Verify eviction is logged with jury status
- [ ] Check that events appear in chronological order
