
# Fix: PoV Players Not Displaying - Use gameState.houseguests

## Problem Summary
The POV Competition screen shows empty player slots despite the fallback logic correctly generating player IDs. This happens because:

1. **Fallback logic generates correct IDs** - The `useEffect` successfully generates 6 player IDs (HoH + 2 nominees + 3 random)
2. **ID-to-Houseguest lookup fails** - `getHouseguestById(id)` returns `undefined` for all IDs
3. **Resulting array is empty** - `.filter(Boolean)` removes all the `undefined` values, leaving an empty `povPlayers` array

## Root Cause

The `getHouseguestById` function (from GameProvider) uses the `game` object:

```typescript
// GameProvider.tsx line 65-67
const getHouseguestById = useCallback((id: string) => {
  return game?.getHouseguestById(id);  // Looks in BigBrotherGame.houseguests
}, [game]);
```

But `BigBrotherGame` is initialized once and **never synced** with reducer state updates. When houseguests are added during setup, only `gameState.houseguests` is updated - not `game.houseguests`.

## Solution

Update `POVCompetition/index.tsx` to look up houseguests directly from `gameState.houseguests` instead of using `getHouseguestById()`:

### Change in POVCompetition/index.tsx

**Line 53-57** - Replace:
```typescript
// Use effective player IDs (from state or generated)
const effectivePovPlayerIds = povPlayerIds.length > 0 ? povPlayerIds : generatedPlayers;
const povPlayers = effectivePovPlayerIds
  .map(id => getHouseguestById(id))
  .filter(Boolean) as Houseguest[];
```

With:
```typescript
// Use effective player IDs (from state or generated)
const effectivePovPlayerIds = povPlayerIds.length > 0 ? povPlayerIds : generatedPlayers;
const povPlayers = effectivePovPlayerIds
  .map(id => gameState.houseguests.find(h => h.id === id))
  .filter(Boolean) as Houseguest[];
```

This follows the same fix pattern applied to other components (NominationPhase, GameSidebar, etc.).

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/POVCompetition/index.tsx` | Use `gameState.houseguests.find()` instead of `getHouseguestById()` |

## Why This Fix Works

1. **Uses the correct data source** - `gameState.houseguests` is the reducer state that's always up-to-date
2. **Follows established pattern** - Same fix already applied to NominationPhase, GameSidebar, etc.
3. **Minimal change** - Single line modification
4. **No race conditions** - Data is already available in the component's props

## Testing Verification

After implementation:
- [ ] POV Competition shows 6 players (HoH + 2 nominees + 3 random)
- [ ] Each player card shows correct role (HoH/Nominee/Random badges)
- [ ] "Start Competition" button is enabled
- [ ] Competition runs and selects a winner correctly
