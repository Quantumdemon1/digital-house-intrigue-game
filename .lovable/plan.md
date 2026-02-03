
# Fix: PoV Players Not Being Displayed

## Problem Summary
The POV Competition screen shows all 6 player slots as "Not Selected" because the `povPlayers` array is empty in the reducer state.

## Root Cause
There's a disconnect between two sources of truth:

| Component | Data Source | Value |
|-----------|-------------|-------|
| `PovPlayerSelectionState.ts` | `this.game.povPlayers` (BigBrotherGame instance) | Gets populated with 6 player IDs |
| `POVCompetition/index.tsx` | `gameState.povPlayers` (Reducer state) | Always empty `[]` |

The `PovPlayerSelectionState.ts` sets players on the legacy game object (line 47):
```typescript
this.game.povPlayers = povPlayers.filter(Boolean);
```

But the `POVCompetition/index.tsx` reads from the reducer (line 23):
```typescript
const povPlayerIds = gameState.povPlayers || [];
```

**There's no `SET_POV_PLAYERS` reducer action to sync these two sources.**

---

## Solution

### Step 1: Add SET_POV_PLAYERS to Competition Reducer
**File:** `src/contexts/reducers/reducers/competition-reducer.ts`

Add a new case to handle setting PoV players:
```typescript
case 'SET_POV_PLAYERS': {
  if (!action.payload || !Array.isArray(action.payload)) {
    console.error('SET_POV_PLAYERS action missing payload:', action);
    return state;
  }
  
  return {
    ...state,
    povPlayers: action.payload,
  };
}
```

### Step 2: Dispatch SET_POV_PLAYERS from PovPlayerSelectionState
**File:** `src/game-states/PovPlayerSelectionState.ts`

After setting `this.game.povPlayers`, also dispatch to the reducer:
```typescript
// Set the PoV players on game object
this.game.povPlayers = povPlayers.filter(Boolean);

// ALSO sync to reducer state
if (this.controller && this.controller.dispatch) {
  this.controller.dispatch({
    type: 'SET_POV_PLAYERS',
    payload: this.game.povPlayers
  });
}
```

### Step 3: Add SET_POV_PLAYERS to Action Types
**File:** `src/contexts/types/game-context-types.ts`

Ensure the action type is defined (may already exist, need to verify).

### Step 4: Fallback in POVCompetition Component
**File:** `src/components/game-phases/POVCompetition/index.tsx`

As a safety net, if `gameState.povPlayers` is empty, auto-generate the player list using HoH, nominees, and 3 random houseguests:

```typescript
// Get the PoV players - with fallback generation if empty
const povPlayerIds = gameState.povPlayers || [];
const [generatedPlayers, setGeneratedPlayers] = useState<string[]>([]);

// Auto-generate PoV players if none set (fallback)
useEffect(() => {
  if (povPlayerIds.length === 0 && generatedPlayers.length === 0) {
    // Generate: HoH + nominees + 3 random
    const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
    const mandatory = [
      gameState.hohWinner?.id,
      ...(gameState.nominees?.map(n => n.id) || [])
    ].filter(Boolean);
    
    const eligible = activeHouseguests
      .filter(h => !mandatory.includes(h.id))
      .map(h => h.id);
    
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const needed = Math.min(6 - mandatory.length, shuffled.length);
    const final = [...mandatory, ...shuffled.slice(0, needed)];
    
    setGeneratedPlayers(final);
    
    // Dispatch to sync state
    dispatch({
      type: 'SET_POV_PLAYERS',
      payload: final
    });
  }
}, [povPlayerIds, gameState.hohWinner, gameState.nominees]);

const effectivePovPlayerIds = povPlayerIds.length > 0 ? povPlayerIds : generatedPlayers;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `competition-reducer.ts` | Add `SET_POV_PLAYERS` case |
| `PovPlayerSelectionState.ts` | Dispatch `SET_POV_PLAYERS` after setting players |
| `POVCompetition/index.tsx` | Add fallback generation if `povPlayers` is empty |

---

## Why This Approach

1. **Adds the missing reducer action** - The proper fix is to sync the game object with reducer state
2. **Fallback generation** - Ensures the game doesn't break even if state sync fails
3. **Minimal disruption** - Follows existing patterns from `SET_NOMINEES` and `SET_HOH`
4. **Future-proof** - All components can rely on `gameState.povPlayers` as the single source of truth
