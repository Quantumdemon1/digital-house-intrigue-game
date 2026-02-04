
# Plan: Fix Final 4 Glitch Between HoH and Final HoH

## Problem Diagnosis

The game is oscillating between `HoH` and `FinalHoH` phases at Final 4 due to inconsistent houseguest counting:

1. **`HOHCompetition` counts 3 participants** (4 active minus outgoing HoH = 3) and redirects to `FinalHoH`
2. **`FinalHoHPhase` counts 4 active houseguests** (doesn't exclude outgoing HoH) and redirects back to `HoH`
3. This creates an infinite redirect loop

```text
HOHCompetition (activeHouseguests = 3 excluding HoH)
       │
       ▼ "length === 3 → redirect to FinalHoH"
       │
FinalHoHPhase (finalThree.length = 4 total active)
       │
       ▼ "length > 3 → redirect back to HoH"
       │
HOHCompetition (loop repeats)
```

## Root Cause

The `useCompetitionState` hook excludes the outgoing HoH from `activeHouseguests`:

```typescript
// useCompetitionState.ts line 52-59
const activeHouseguests = useMemo(() => {
  const active = gameState.houseguests.filter(h => h.status === 'Active');
  const outgoingHohId = gameState.hohWinner?.id;
  return outgoingHohId 
    ? active.filter(h => h.id !== outgoingHohId)  // ← Excludes 1 houseguest
    : active;
}, [gameState.houseguests, gameState.hohWinner]);
```

This is correct for determining competition participants, but **incorrect for detecting Final 4 vs Final 3**.

---

## Solution

Use **two separate counts**:
1. **Participants count** (excluding outgoing HoH) - for competition mechanics
2. **Total active count** (all active) - for phase detection logic

### Changes Required

### 1. Fix `HOHCompetition/index.tsx` - Use total active count for phase detection

```typescript
// Add a separate count that includes ALL active houseguests
const totalActiveCount = gameState.houseguests.filter(h => h.status === 'Active').length;

// Change the redirect check from:
if (activeHouseguests.length === 3 && !gameState.isFinalStage) {
  
// To:
if (totalActiveCount === 3 && !gameState.isFinalStage) {
```

### 2. Fix `NominationPhase/index.tsx` - Change `<=` to `<` for 3 houseguests

Current logic redirects when `length <= 3`, but Final 4 nomination (with 4 houseguests) should work normally. The check should only redirect when there are fewer than 3 active houseguests (edge case protection).

```typescript
// Change from:
if (activeHouseguests.length <= 3 && !gameState.isFinalStage) {
  dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
}

// To:
if (activeHouseguests.length === 3 && !gameState.isFinalStage) {
  dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
} else if (activeHouseguests.length < 3) {
  dispatch({ type: 'SET_PHASE', payload: 'JuryQuestioning' });
}
```

### 3. Fix `POVCompetition/index.tsx` and `POVMeeting/index.tsx` - Same pattern

Both files have the same `<= 3` condition that could cause issues. Update them to only redirect when exactly 3 houseguests remain.

### 4. Ensure `hohWinner` is properly cleared on week advance

Check if `ADVANCE_WEEK` action properly clears `hohWinner` to `null`, so the outgoing HoH exclusion doesn't affect the next week's count.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/HOHCompetition/index.tsx` | Add separate `totalActiveCount` for phase detection; keep `activeHouseguests` for competition participants |
| `src/components/game-phases/NominationPhase/index.tsx` | Change `<= 3` to `=== 3` for FinalHoH redirect |
| `src/components/game-phases/POVCompetition/index.tsx` | Change `<= 3` to `=== 3` for FinalHoH redirect |
| `src/components/game-phases/POVMeeting/index.tsx` | Change `<= 3` to `=== 3` for FinalHoH redirect |
| `src/contexts/reducers/reducers/game-progress-reducer.ts` | Verify `ADVANCE_WEEK` properly resets `hohWinner` to null |

---

## Technical Details

### HOHCompetition/index.tsx Changes

```typescript
// Line 12 - Add direct count from gameState
const totalActiveCount = gameState.houseguests.filter(h => h.status === 'Active').length;

// Line 33-40 - Update the phase detection
useEffect(() => {
  // Use totalActiveCount (not participants count) for phase detection
  if (totalActiveCount === 3 && !gameState.isFinalStage) {
    logger?.info(`Exactly 3 houseguests total - redirecting to Final HoH`);
    dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
  }
}, [totalActiveCount, gameState.isFinalStage, dispatch, logger]);
```

### NominationPhase/index.tsx Changes

```typescript
// Line 108-111 - Update redirect logic
useEffect(() => {
  const activeCount = activeHouseguests.length;
  
  if (activeCount <= 2) {
    dispatch({ type: 'SET_PHASE', payload: 'JuryQuestioning' });
  } else if (activeCount === 3 && !gameState.isFinalStage) {
    dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
  }
  // 4+ houseguests = normal nomination week (including Final 4)
}, [gameState.houseguests, gameState.isFinalStage, dispatch]);
```

### POVCompetition/index.tsx and POVMeeting/index.tsx Changes

Same pattern - use `=== 3` instead of `<= 3`:

```typescript
if (activeHouseguests.length === 3 && !gameState.isFinalStage) {
  dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
} else if (activeHouseguests.length < 3) {
  dispatch({ type: 'SET_PHASE', payload: 'JuryQuestioning' });
}
```

---

## Expected Behavior After Fix

| Scenario | Active Count | Expected Phase |
|----------|-------------|----------------|
| Final 4 week | 4 | Normal HoH → Nom → PoV → Meeting → Eviction |
| After Final 4 eviction | 3 | FinalHoH (3-part competition) |
| After Final 3 eviction | 2 | JuryQuestioning |

The game will no longer oscillate between phases at Final 4 because:
- Phase detection uses **total active count** (includes outgoing HoH)
- Competition mechanics use **participant count** (excludes outgoing HoH)
- These two counts are now properly separated

---

## Summary

The fix involves a simple separation of concerns:
1. **Competition participants** = Active houseguests minus outgoing HoH (for who competes)
2. **Phase detection** = All active houseguests (for which phase to run)

This ensures Final 4 (4 houseguests) runs a normal week, and only when exactly 3 remain does the game transition to FinalHoH.
