
# Plan: Fix Relationships, Alliances, and Promises System

## Overview

The relationship system is broken due to a disconnect between where changes are dispatched and where they're read. Interactions show visual feedback (+5, +10, etc.) but the actual relationship values never persist because:

1. The wrong action type is dispatched
2. The UI reads from a stale legacy object instead of reducer state

This plan fixes all three systems (relationships, alliances, promises) to use consistent state management.

---

## Root Cause Analysis

### Problem 1: Interactions Dispatch Wrong Action
`EvictionInteractionDialog` dispatches:
```tsx
dispatch({ type: 'PLAYER_ACTION', payload: { actionId: 'update_relationship', ... } })
```
But `playerActionReducer` does NOT handle `update_relationship` - it just logs and returns unchanged state.

### Problem 2: InteractionResults Never Persists Changes
`InteractionResults` calls `addImpact()` for the visual popup but never dispatches `UPDATE_RELATIONSHIPS` to actually save the change.

### Problem 3: getRelationship() Reads from Legacy Object
```tsx
// GameProvider.tsx - reads from stale legacy system
const getRelationship = useCallback((guest1Id, guest2Id) => {
  return relationshipSystem?.getRelationship(guest1Id, guest2Id) || 0;
}, [relationshipSystem]);
```
This reads from the class-based `RelationshipSystem` which is never synced with reducer state.

### Problem 4: PromiseManager Uses Legacy Object
```tsx
// PromiseManager.tsx
const { game } = useGame();
// ...
game.promises.filter(p => p.status === 'pending')
```
Should use `gameState.promises` instead.

---

## Solution

### Fix 1: Update EvictionInteractionDialog to Dispatch Correct Action

**File**: `src/components/game-phases/EvictionPhase/EvictionInteractionDialog.tsx`

Replace `PLAYER_ACTION` with `UPDATE_RELATIONSHIPS`:
```tsx
dispatch({
  type: 'UPDATE_RELATIONSHIPS',
  payload: {
    guestId1: player.id,
    guestId2: houseguest.id,
    change: option.relationshipChange,
    note: `${player.name} interacted with ${houseguest.name}`
  }
});
```

### Fix 2: Update InteractionResults to Persist Changes

**File**: `src/components/game-phases/EvictionPhase/InteractionResults.tsx`

Add `dispatch` and actually persist the relationship change:
```tsx
const { gameState, dispatch } = useGame();

useEffect(() => {
  if (actualChange !== 0) {
    // Visual feedback
    addImpact(houseguest.id, houseguest.name, actualChange);
    
    // Persist to reducer state
    dispatch({
      type: 'UPDATE_RELATIONSHIPS',
      payload: {
        guestId1: player?.id,
        guestId2: houseguest.id,
        change: actualChange,
        note: succeeded 
          ? `${selectedOption.text} interaction succeeded`
          : `${selectedOption.text} interaction backfired`
      }
    });
  }
}, [...]); // Run once on mount
```

### Fix 3: Update getRelationship() to Read from Reducer State

**File**: `src/contexts/game/GameProvider.tsx`

Replace legacy system read with reducer state read:
```tsx
const getRelationship = useCallback((guest1Id: string, guest2Id: string) => {
  // Read from reducer state instead of legacy system
  const guestRelationships = gameState.relationships.get(guest1Id);
  if (!guestRelationships) return 0;
  
  const relationship = guestRelationships.get(guest2Id);
  return relationship?.score || 0;
}, [gameState.relationships]);
```

### Fix 4: Update PromiseManager to Use Reducer State

**File**: `src/components/promise/PromiseManager.tsx`

Replace `game.promises` with `gameState.promises`:
```tsx
const { gameState } = useGame();

useEffect(() => {
  if (!gameState?.promises) return;
  
  setActivePromises(
    gameState.promises.filter(p => p.status === 'pending' || p.status === 'active')
  );
  // ...
}, [gameState.promises]);
```

Also update houseguest lookups to use `gameState.houseguests.find()` instead of `game.getHouseguestById()`.

### Fix 5: Remove Double Dispatch in EvictionInteractionDialog

Currently `EvictionInteractionDialog` dispatches immediately when an option is selected, then `InteractionResults` shows the result. But with the stat-based success/failure system, the actual change should only be determined in `InteractionResults`.

**Solution**: Remove the relationship dispatch from `handleOptionSelected` in `EvictionInteractionDialog` and only dispatch from `InteractionResults` after success/failure is determined.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/game-phases/EvictionPhase/EvictionInteractionDialog.tsx` | Remove premature relationship dispatch, let InteractionResults handle it |
| `src/components/game-phases/EvictionPhase/InteractionResults.tsx` | Add `dispatch` call to persist relationship change with correct action type |
| `src/contexts/game/GameProvider.tsx` | Update `getRelationship()` to read from `gameState.relationships` instead of legacy system |
| `src/components/promise/PromiseManager.tsx` | Use `gameState.promises` and `gameState.houseguests.find()` instead of legacy `game` object |

---

## Expected Behavior After Fix

1. **Interactions persist**: When you talk to a houseguest during eviction, the relationship change (+5, -10, etc.) is saved to reducer state
2. **UI reflects changes**: `HouseguestCard`, `HouseguestDialog`, and sidebar show updated relationship scores
3. **Success/failure works**: The stat-based interaction success system properly applies positive or negative changes
4. **Promises display correctly**: Promise manager shows all promises from reducer state
5. **State consistency**: All components read from the same source of truth (`gameState`)

---

## Technical Flow After Fix

```text
User clicks interaction option
         |
         v
EvictionInteractionDialog shows InteractionResults
         |
         v
InteractionResults calculates success/failure based on Social stat
         |
         v
InteractionResults dispatches UPDATE_RELATIONSHIPS
         |
         v
relationshipReducer updates gameState.relationships
         |
         v
getRelationship() reads from gameState.relationships
         |
         v
HouseguestCard/Dialog shows updated score
```

---

## Backward Compatibility

The legacy `RelationshipSystem` class will continue to work for AI decisions and other systems that use it directly. We're adding reducer state as the source of truth for UI display without breaking existing functionality.
