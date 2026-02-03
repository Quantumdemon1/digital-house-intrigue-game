
# Fix: PoV Meeting Replacement Selection - No Eligible Houseguests

## Problem Summary

The "Select Replacement Nominee" screen shows no houseguests to select because `getEligibleReplacements()` returns an empty array.

## Root Cause

The `usePOVMeeting.ts` hook calls `getActiveHouseguests()` from the GameProvider:

```typescript
// usePOVMeeting.ts line 18
const activeHouseguests = getActiveHouseguests();
```

But `getActiveHouseguests()` in GameProvider uses the stale `game` object:

```typescript
// GameProvider.tsx lines 73-75
const getActiveHouseguests = useCallback(() => {
  return game?.getActiveHouseguests() || [];  // game.houseguests is EMPTY!
}, [game]);
```

Since `game.houseguests` is never populated with data from the reducer, it returns an empty array. This means `getEligibleReplacements()` has no houseguests to filter.

## Solution

Update `usePOVMeeting.ts` to use `gameState.houseguests` directly instead of `getActiveHouseguests()`.

### File: `src/components/game-phases/POVMeeting/hooks/usePOVMeeting.ts`

**Line 10** - Add `gameState` to destructuring (already there)

**Line 18** - Replace:
```typescript
const activeHouseguests = getActiveHouseguests();
```

With:
```typescript
// Get active houseguests directly from reducer state (avoids stale game object)
const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
```

**Line 10** - Remove `getActiveHouseguests` from imports since it's no longer needed:
```typescript
// BEFORE
const { gameState, getActiveHouseguests } = useGame();

// AFTER  
const { gameState } = useGame();
```

---

## Technical Details

| Location | Problem | Fix |
|----------|---------|-----|
| `usePOVMeeting.ts` line 18 | Uses `getActiveHouseguests()` from stale game object | Use `gameState.houseguests.filter(h => h.status === 'Active')` |

---

## Testing Verification

After implementation:
- HoH should see list of 4 eligible houseguests (7 total - HoH - PoV holder - remaining nominee)
- Clicking a houseguest should select them as replacement nominee
- Meeting should complete and advance to Eviction phase
