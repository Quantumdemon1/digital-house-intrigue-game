
# Plan: Fix Skip-to-Next-Phase Eviction Bug

## Problem Summary

When clicking "Skip to next phase" repeatedly after being evicted (in spectator mode), the game breaks:
- Houseguests stop being evicted
- Active count gets stuck (e.g., at 6 despite weeks passing)
- Eviction screen shows no nominees

## Root Causes

### 1. No Eviction Guard
When `useFastForward` is called during Eviction phase with empty nominees, it still advances the week without evicting anyone.

### 2. Race Condition with Multiple Clicks
Rapid clicks cause multiple fast-forward dispatches before state updates propagate, leading to:
- Multiple `eviction_complete` or `advance_week` actions
- Week number incrementing without evictions occurring
- Nominees being cleared before eviction happens

### 3. Stale Closure Data
The `useCallback` in `useFastForward` captures `gameState.nominees` from render time. With rapid clicks, subsequent calls use stale data.

### 4. No Validation Before Week Advance
The `eviction_complete` and `advance_week` player actions don't verify that an eviction actually happened before advancing.

---

## Solution

### Part 1: Add Eviction Validation Guard

**Modify: `src/hooks/useFastForward.ts`**

Add validation to ensure eviction phase has nominees before processing, and add a longer cooldown:

```typescript
// If Eviction phase has no nominees, this is an invalid state - don't advance
if (gameState.phase === 'Eviction') {
  if (!gameState.nominees || gameState.nominees.length < 2) {
    logger?.warn("Fast-forward blocked: Eviction phase has no/insufficient nominees");
    setInternalProcessing(false);
    return; // Block the fast-forward entirely
  }
  
  // Proceed with eviction...
}
```

Also increase the processing lock timeout from 1500ms to 3000ms to prevent rapid clicks.

---

### Part 2: Add Eviction State Tracking

**Modify: `src/models/game-state.ts`**

Add a flag to track if eviction happened this week:

```typescript
export interface GameState {
  // ... existing properties
  evictionCompletedThisWeek?: boolean;
}
```

**Modify: `src/contexts/reducers/reducers/eviction-reducer.ts`**

Set the flag when eviction occurs:

```typescript
case 'EVICT_HOUSEGUEST': {
  // ... existing eviction logic
  
  return {
    ...state,
    // ... other updates
    evictionCompletedThisWeek: true, // Mark eviction as complete
  };
}
```

---

### Part 3: Validate Before Week Advance

**Modify: `src/contexts/reducers/reducers/player-action-reducer.ts`**

In the `eviction_complete` and `advance_week` cases, add validation:

```typescript
case 'eviction_complete':
case 'advance_week': {
  // Don't advance if we're in eviction phase but no eviction happened
  if (state.phase === 'Eviction' && !state.evictionCompletedThisWeek) {
    console.warn('Blocking week advance: No eviction completed');
    return state; // Don't advance
  }
  
  // Reset flag for next week
  return {
    ...state,
    week: state.week + 1,
    // ... other resets
    evictionCompletedThisWeek: false, // Reset for next week
  };
}
```

---

### Part 4: Reset Flag on Week Advance

**Modify: `src/contexts/reducers/reducers/game-progress-reducer.ts`**

In the `ADVANCE_WEEK` case, reset the eviction flag:

```typescript
case 'ADVANCE_WEEK':
  return {
    ...state,
    week: state.week + 1,
    // ... existing resets
    evictionCompletedThisWeek: false, // Ready for next week's eviction
  };
```

---

### Part 5: Add Processing Lock to SpectatorBanner Button

**Modify: `src/components/game-screen/SpectatorBanner.tsx`**

Disable the button while processing and add visual feedback:

```typescript
<Button 
  variant="secondary" 
  size="sm" 
  onClick={handleFastForward}
  disabled={isProcessing}
  className={cn(
    "bg-white/10 hover:bg-white/20 text-white border-white/20 shrink-0",
    isProcessing && "opacity-50 cursor-not-allowed"
  )}
>
  {isProcessing ? (
    <>
      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      <SkipForward className="h-4 w-4 mr-1" />
      Skip to Next Phase
    </>
  )}
</Button>
```

---

### Part 6: Fix Fast Forward to Use Fresh State Reference

**Modify: `src/hooks/useFastForward.ts`**

Use a ref to always get fresh state, avoiding stale closures:

```typescript
export function useFastForward() {
  const { dispatch, gameState, logger } = useGame();
  const gameStateRef = useRef(gameState);
  
  // Keep ref updated
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  const handleFastForward = useCallback(() => {
    const currentState = gameStateRef.current; // Always fresh
    
    // Use currentState instead of gameState in all logic
    if (currentState.phase === 'Eviction') {
      if (currentState.nominees && currentState.nominees.length > 0) {
        // ...
      }
    }
  }, [dispatch, fastForward, logger, internalProcessing]);
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useFastForward.ts` | Add validation, increase cooldown, use ref for fresh state |
| `src/models/game-state.ts` | Add `evictionCompletedThisWeek` tracking flag |
| `src/contexts/reducers/reducers/eviction-reducer.ts` | Set flag on eviction |
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Block week advance without eviction |
| `src/contexts/reducers/reducers/game-progress-reducer.ts` | Reset flag on week advance |
| `src/components/game-screen/SpectatorBanner.tsx` | Add visual loading state, ensure button is disabled while processing |

---

## Expected Behavior After Fix

1. **Single eviction per week guaranteed**: Week cannot advance until eviction flag is set
2. **No rapid-click exploitation**: Button disabled during processing, 3s cooldown
3. **No stale state issues**: Ref provides fresh state for fast-forward logic
4. **Clear user feedback**: Button shows "Processing..." when disabled
5. **Invalid state protection**: If somehow eviction phase has no nominees, fast-forward is blocked entirely

---

## Testing Checklist

- [ ] Play game until eviction in spectator mode
- [ ] Click "Skip to next phase" rapidly - verify only one week advances
- [ ] Verify houseguest count decreases by exactly 1 per week
- [ ] Verify nominees exist before each eviction ceremony
- [ ] Test through Final 4 → Final 3 → Final 2 transitions
