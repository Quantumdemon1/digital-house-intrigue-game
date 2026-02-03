
# Plan: Fix Skip Feature Including Eliminated Player in Final 2

## Problem Summary

When your character was eliminated and you used the "Skip to Next Phase" button, the game incorrectly placed your eliminated character in the Final 2. This happens because the FinalHoHPhase component reads houseguest data from a stale source that doesn't reflect your elimination.

## Root Cause

The game has two data sources that are out of sync:
- **Reducer state** (`gameState.houseguests`): Correctly updated when you're eliminated
- **Game object** (`game.houseguests`): Never updated after initialization

The `FinalHoHPhase` component uses `getActiveHouseguests()` which reads from the stale game object, returning your eliminated character as if they were still active.

## Solution

Replace all usages of `getActiveHouseguests()` in `FinalHoHPhase.tsx` with direct reads from `gameState.houseguests`, filtering for `status === 'Active'`.

---

## Technical Changes

### File: `src/components/game-phases/FinalHoHPhase.tsx`

**Change 1: Replace stale `finalThree` with reducer state**

```text
Before (line 41):
const finalThree = getActiveHouseguests();

After:
const finalThree = gameState.houseguests.filter(h => h.status === 'Active');
```

This ensures eliminated players are not included in the competition.

**Change 2: Update `getParticipants` function**

The `getParticipants` helper also uses `finalThree`, so the fix propagates automatically. However, we should add a safety check:

```typescript
// Get eligible participants for each part
const getParticipants = (part: 'part1' | 'part2' | 'part3'): Houseguest[] => {
  // Always filter for Active status to be extra safe
  const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
  
  switch (part) {
    case 'part1':
      return activeHouseguests;
    case 'part2':
      const part1Winner = partStatus.part1.winnerId;
      return activeHouseguests.filter(h => h.id !== part1Winner);
    case 'part3':
      const p1Winner = activeHouseguests.find(h => h.id === partStatus.part1.winnerId);
      const p2Winner = activeHouseguests.find(h => h.id === partStatus.part2.winnerId);
      return [p1Winner, p2Winner].filter(Boolean) as Houseguest[];
    default:
      return [];
  }
};
```

**Change 3: Update spectator auto-select finalist logic**

The AI selection logic (lines 103-115) uses `finalThree`. After fixing `finalThree`, this will automatically work correctly. But add a safety guard:

```typescript
// Spectator mode: auto-select finalist (AI decision)
useEffect(() => {
  if (!gameState.isSpectatorMode || currentPart !== 'selection' || !finalHoH) return;
  
  const timer = setTimeout(() => {
    // Filter again to ensure we only pick from truly active houseguests
    const activeOthers = gameState.houseguests.filter(
      h => h.status === 'Active' && h.id !== finalHoH.id
    );
    const selectedFinalist = activeOthers[Math.floor(Math.random() * activeOthers.length)];
    if (selectedFinalist) {
      chooseFinalist(selectedFinalist);
    }
  }, 3000);
  return () => clearTimeout(timer);
}, [gameState.isSpectatorMode, currentPart, finalHoH, gameState.houseguests]);
```

**Change 4: Validate finalist selection in `chooseFinalist`**

Add validation to prevent eliminated players from being selected:

```typescript
const chooseFinalist = (finalist: Houseguest) => {
  if (!finalHoH) return;
  
  // Validate that finalist is still active
  const activeFinalist = gameState.houseguests.find(
    h => h.id === finalist.id && h.status === 'Active'
  );
  if (!activeFinalist) {
    console.error('Attempted to select eliminated houseguest as finalist:', finalist.name);
    return;
  }
  
  // ... rest of the function
};
```

---

## Additional Safety: Update Fast-Forward Reducer

### File: `src/contexts/reducers/reducers/player-action-reducer.ts`

The fast-forward logic for FinalHoH (lines 73-137) already correctly filters by `status === 'Active'`. However, add extra validation:

```typescript
if (payload.params.currentPhase === 'FinalHoH') {
  const activeHouseguests = state.houseguests.filter(h => h.status === 'Active');
  
  // Validate we have exactly 3 active houseguests for Final HoH
  if (activeHouseguests.length < 2) {
    console.error('Not enough active houseguests for Final HoH:', activeHouseguests.length);
    // Skip to jury questioning if only 2 remain
    return {
      ...state,
      phase: 'JuryQuestioning' as GamePhase,
      isFinalStage: true
    };
  }
  
  // ... rest of the simulation
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/FinalHoHPhase.tsx` | Replace `getActiveHouseguests()` with `gameState.houseguests.filter(h => h.status === 'Active')` |
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Add validation for minimum active houseguests |

---

## Testing Checklist

After implementation:
- [ ] Start game, play until you get eliminated mid-game
- [ ] Verify you enter spectator mode with the purple banner
- [ ] Click "Skip to Next Phase" multiple times until reaching Final HoH
- [ ] Verify your eliminated character is NOT in the Final 3
- [ ] Verify the Final 2 only includes active houseguests
- [ ] Complete game through to winner announcement
