
# Plan: Fix Final 4 Flow

## Problem Summary

The game incorrectly skips from Final 4 directly to Final 3 HoH. At Final 4, the game should run a **normal week** with special voting rules, not immediately transition to the Final HoH competition. The issues are:

1. Game transitions to `FinalHoH` when 4 houseguests remain instead of running a normal week
2. At Final 4, only 1 person (non-HoH, non-nominee) should vote to evict
3. The evicted person should join the jury
4. Final 3 HoH should only trigger when exactly 3 houseguests remain

## Correct Big Brother Final 4 Flow

```text
FINAL 4 WEEK (4 active houseguests):
  HoH Competition (4 compete) → 1 becomes HoH
       ↓
  Nominations → HoH picks 2 nominees (1 person off the block)
       ↓
  PoV Player Selection → All 4 play (standard Final 4)
       ↓
  PoV Competition → Winner gets veto
       ↓
  PoV Meeting → Special rules:
    - If off-block person wins: keep noms same OR use veto (puts themselves on block)
    - If HoH or nominee wins: normal veto rules
       ↓
  Eviction → ONLY the 1 non-HoH, non-nominee votes
       ↓
  Evicted → Joins jury (now 7-9 jurors)

FINAL 3 (3 active houseguests):
  Final HoH Part 1 (Endurance) → All 3 compete
       ↓
  Final HoH Part 2 (Skill) → 2 losers compete
       ↓
  Final HoH Part 3 (Q&A) → Part 1 + Part 2 winners compete
       ↓
  Final HoH → Evicts 1 of the other 2 → Joins jury
       ↓
  FINAL 2 → Proceed to Jury Questioning
```

---

## Technical Changes

### 1. Fix Phase Detection Logic

**Files**: 
- `src/contexts/reducers/reducers/player-action-reducer.ts`
- `src/contexts/reducers/reducers/game-progress-reducer.ts`
- `src/components/game-phases/HOHCompetition/index.tsx`

**Change**: Trigger `FinalHoH` only when exactly 3 houseguests remain, not when "3 or fewer" remain.

**Current (broken):**
```typescript
if (activeCount <= 3) {
  // Go to FinalHoH
}
```

**Fixed:**
```typescript
if (activeCount === 3) {
  // Go to FinalHoH
}
if (activeCount === 2) {
  // Go to JuryQuestioning (shouldn't happen normally)
}
```

### 2. Add Final 4 Detection Flag

**File**: `src/models/game-state.ts`

Add a new flag to track when we're at Final 4:
```typescript
isFinal4: boolean; // True when 4 houseguests remain - affects voting rules
```

### 3. Handle Final 4 Voting Rules

**File**: `src/components/game-phases/EvictionPhase/useEvictionPhase.ts`

Add special voting logic for Final 4:
```typescript
const isFinal4 = activeHouseguests.length === 4;

// At Final 4, only 1 person votes (non-HoH, non-nominee)
const nonNominees = isFinal4
  ? activeHouseguests.filter(
      guest => !nominees.some(n => n.id === guest.id) && !guest.isHoH
    )
  : activeHouseguests.filter(
      guest => !nominees.some(n => n.id === guest.id) && !guest.isHoH
    );
```

The current logic already does this correctly, but we need to display messaging about Final 4 rules.

### 4. Add Final 4 UI Messaging

**File**: `src/components/game-phases/EvictionPhase.tsx`

Add special UI for Final 4 eviction:
```typescript
if (isFinal4) {
  return (
    <div className="text-center">
      <h3>Final 4 Eviction</h3>
      <p>Only {soleVoter.name} can vote to evict.</p>
      {/* Show nominees */}
      {/* Single voter casts deciding vote */}
    </div>
  );
}
```

### 5. Fix PoV Meeting at Final 4

**File**: `src/components/game-phases/POVMeeting/hooks/usePOVMeeting.ts`

Add special rule for when the off-block person wins veto at Final 4:
```typescript
const getEligibleReplacements = () => {
  const isFinal4 = activeHouseguests.length === 4;
  
  // At Final 4, if the off-block person wins veto and uses it,
  // they put themselves on the block
  if (isFinal4 && povHolder && !nominees.some(n => n.id === povHolder.id) && !povHolder.isHoH) {
    // The only replacement option is themselves
    return [povHolder];
  }
  
  // Normal rules
  return activeHouseguests.filter(houseguest => 
    !houseguest.isHoH && 
    !houseguest.isNominated && 
    houseguest.id !== savedNominee?.id &&
    !houseguest.isPovHolder
  );
};
```

### 6. Fix Final 3 HoH Logic

**File**: `src/components/game-phases/FinalHoHPhase.tsx`

The current logic correctly handles Final 3, but we need to ensure it only triggers with exactly 3 houseguests. Add a guard:
```typescript
// Redirect if not exactly 3 active houseguests
useEffect(() => {
  if (finalThree.length !== 3) {
    if (finalThree.length > 3) {
      dispatch({ type: 'SET_PHASE', payload: 'HoH' }); // Go back to normal week
    } else if (finalThree.length === 2) {
      dispatch({ type: 'SET_PHASE', payload: 'JuryQuestioning' });
    }
  }
}, [finalThree.length]);
```

### 7. Fix Final 3 Eviction (HoH Choice)

**File**: `src/components/game-phases/EvictionPhase.tsx`

The current `isFinal3` check is correct, but we need to ensure the evicted houseguest is properly added to jury:
```typescript
const handleFinal3Eviction = (evicted: Houseguest) => {
  dispatch({
    type: 'EVICT_HOUSEGUEST',
    payload: { evicted, toJury: true }
  });
  // Then proceed to JuryQuestioning
};
```

Wait, looking at the code, the Final 3 decision is in `FinalHoHPhase.tsx` (the HoH chooses who to take to Final 2), not in `EvictionPhase.tsx`. The current code in `chooseFinalist()` correctly handles this.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Change `<= 3` to `=== 3` for FinalHoH detection; add `=== 4` handling |
| `src/contexts/reducers/reducers/game-progress-reducer.ts` | Change `<= 3` to `=== 3` for FinalHoH detection |
| `src/components/game-phases/HOHCompetition/index.tsx` | Change `<= 3` to `=== 3` for redirect check |
| `src/components/game-phases/EvictionPhase/useEvictionPhase.ts` | Add `isFinal4` flag and pass to component |
| `src/components/game-phases/EvictionPhase.tsx` | Add Final 4 UI messaging for single-voter scenario |
| `src/components/game-phases/POVMeeting/hooks/usePOVMeeting.ts` | Add Final 4 veto replacement logic |
| `src/components/game-phases/FinalHoHPhase.tsx` | Add guard for exactly 3 houseguests |
| `src/models/game-state.ts` | (Optional) Add `isFinal4` flag if needed for state tracking |

---

## Expected Behavior After Fix

1. **Final 4**: Normal week runs (HoH → Nom → PoV → Meeting → Eviction)
2. **Final 4 Voting**: Only 1 person (non-HoH, non-nominee) votes
3. **Final 4 Veto**: If off-block person wins and uses veto, they go on the block
4. **Final 4 Eviction**: Evicted person joins jury correctly
5. **Final 3 HoH**: Only triggers when exactly 3 houseguests remain
6. **Final 3 Decision**: HoH picks from 2 other houseguests (not 3)
7. **Jury**: All evicted houseguests after jury starts are added to jury
8. **Final 2**: Two finalists proceed to Jury Questioning

---

## Summary of Phase Transitions

| Active Count | Next Phase |
|--------------|------------|
| 5+ | Normal HoH competition |
| 4 | Normal HoH competition (Final 4 week) |
| 3 | Final HoH (3-part competition) |
| 2 | Jury Questioning (should only happen from Final HoH) |
