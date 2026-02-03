
# Fix: Final Stages Game Logic for Big Brother USA Format

## Problem Summary

The game is broken at the final stages. Looking at the screenshot:
- Week 13 with only 2 houseguests left (Sam Williams and Blake Peterson)
- Blake is HoH, PoV holder, and has only nominated 1 person (Sam)
- The game shows "Cannot Continue - Two houseguests must be nominated first"

This is incorrect because with only 2 houseguests remaining, the game should already be in the Finale or Jury Questioning phase, not trying to run more normal weekly cycles.

---

## Root Causes Identified

### 1. Player-Action-Reducer Bypasses Final Stage Checks
The `player-action-reducer.ts` handles `advance_week` and `eviction_complete` actions by directly setting `phase: 'HoH'` without checking if we should transition to `FinalHoH` instead:

```typescript
// Lines 100-120 in player-action-reducer.ts
case 'eviction_complete':
case 'advance_week':
  return {
    ...state,
    week: state.week + 1,
    phase: 'HoH' as GamePhase,  // Always goes to HoH, ignoring houseguest count!
    ...
  };
```

### 2. HOH Competition Component Doesn't Check for Final 3
The HOH Competition component starts without verifying if there are only 3 houseguests left (which should trigger Final HoH instead).

### 3. Nomination Phase Doesn't Handle Edge Cases
When there are fewer than 3 non-HoH houseguests, the nomination phase still requires 2 nominees, which is impossible.

---

## Solution Overview

Add proper final stage detection at multiple checkpoints:

1. **Fix player-action-reducer** to check houseguest counts before advancing to HoH
2. **Add checks in HOH Competition** to redirect to FinalHoH when 3 or fewer houseguests remain
3. **Add checks in Nomination Phase** to redirect appropriately for edge cases
4. **Handle 2-houseguest scenario** by going directly to JuryQuestioning/Finale

---

## Technical Implementation

### File 1: `src/contexts/reducers/reducers/player-action-reducer.ts`

**Add final stage check to advance_week and eviction_complete actions:**

```typescript
case 'eviction_complete':
case 'advance_week': {
  // Count active houseguests AFTER eviction
  const activeCount = state.houseguests.filter(h => h.status === 'Active').length;
  
  // If 3 or fewer houseguests remain, go to Final HoH
  if (activeCount <= 3) {
    return {
      ...state,
      week: state.week + 1,
      phase: 'FinalHoH' as GamePhase,
      isFinalStage: true,
      nominees: [],
      evictionVotes: {}
    };
  }
  
  // If only 2 remain (shouldn't happen normally), go to Jury Questioning
  if (activeCount <= 2) {
    return {
      ...state,
      week: state.week + 1,
      phase: 'JuryQuestioning' as GamePhase,
      isFinalStage: true,
      nominees: [],
      evictionVotes: {}
    };
  }
  
  // Normal week advancement
  return {
    ...state,
    week: state.week + 1,
    phase: 'HoH' as GamePhase,
    nominees: [],
    evictionVotes: {}
  };
}
```

### File 2: `src/components/game-phases/HOHCompetition/index.tsx`

**Add early redirect check at component mount:**

```typescript
// After getting activeHouseguests in useCompetitionState
useEffect(() => {
  // Redirect to Final HoH if we have 3 or fewer houseguests
  if (activeHouseguests.length <= 3 && !gameState.isFinalStage) {
    logger?.info(`Only ${activeHouseguests.length} houseguests - redirecting to Final HoH`);
    dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
  }
}, [activeHouseguests.length, gameState.isFinalStage]);
```

### File 3: `src/components/game-phases/NominationPhase/index.tsx`

**Add redirect logic for final stages:**

```typescript
// Early in the component, add check
useEffect(() => {
  const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
  
  // If 3 or fewer houseguests, shouldn't be in Nomination - redirect to Final HoH
  if (activeHouseguests.length <= 3 && !gameState.isFinalStage) {
    dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
  }
  
  // If only 2 houseguests, go to Jury Questioning
  if (activeHouseguests.length <= 2) {
    dispatch({ type: 'SET_PHASE', payload: 'JuryQuestioning' });
  }
}, [gameState.houseguests, gameState.isFinalStage]);
```

### File 4: `src/contexts/reducers/reducers/game-progress-reducer.ts`

**Improve SET_PHASE to handle edge cases:**

Add check at the start of SET_PHASE:
```typescript
case 'SET_PHASE':
  const activeHouseguestsCount = state.houseguests.filter(h => h.status === 'Active').length;
  
  // Override: If only 2 houseguests remain and we're not already at finale, go to Jury Questioning
  if (activeHouseguestsCount <= 2 && !['JuryQuestioning', 'Jury Questioning', 'Finale', 'GameOver'].includes(action.payload as string)) {
    return {
      ...state,
      phase: 'JuryQuestioning' as GamePhase,
      isFinalStage: true
    };
  }
  
  // Override: If 3 houseguests and not already in final stages, go to FinalHoH
  if (activeHouseguestsCount === 3 && !state.isFinalStage) {
    const normalizedPhase = normalizePhase(action.payload as string);
    if (['hoh', 'nomination', 'pov', 'povmeeting'].includes(normalizedPhase)) {
      return {
        ...state,
        phase: 'FinalHoH' as GamePhase,
        isFinalStage: true
      };
    }
  }
  
  // ... existing logic continues
```

### File 5: `src/components/game-phases/POVCompetition/index.tsx`

**Add the same safeguard:**

```typescript
useEffect(() => {
  const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
  
  if (activeHouseguests.length <= 3 && !gameState.isFinalStage) {
    dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
  }
}, [gameState.houseguests, gameState.isFinalStage]);
```

### File 6: `src/components/game-phases/POVMeeting/index.tsx`

**Add the same safeguard:**

```typescript
useEffect(() => {
  const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
  
  if (activeHouseguests.length <= 3 && !gameState.isFinalStage) {
    dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
  }
}, [gameState.houseguests, gameState.isFinalStage]);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Add houseguest count check before advancing to HoH |
| `src/contexts/reducers/reducers/game-progress-reducer.ts` | Add override logic for 2-3 houseguest edge cases |
| `src/components/game-phases/HOHCompetition/index.tsx` | Add redirect to FinalHoH when 3 or fewer houseguests |
| `src/components/game-phases/NominationPhase/index.tsx` | Add redirect to FinalHoH when 3 or fewer houseguests |
| `src/components/game-phases/POVCompetition/index.tsx` | Add redirect to FinalHoH when 3 or fewer houseguests |
| `src/components/game-phases/POVMeeting/index.tsx` | Add redirect to FinalHoH when 3 or fewer houseguests |

---

## Big Brother USA Final Stages Flow

```text
Final 4 (Week starts with 4 active):
    HoH → Nominations → PoV Selection → PoV → PoV Meeting → Eviction
    → 3 houseguests remain

Final 3 (Week starts with 3 active):
    Final HoH Part 1 (all 3 compete) → Part 2 (2 losers compete) → Part 3 (2 winners compete)
    → Final HoH winner evicts 1 person → 2 houseguests remain

Final 2 (2 remaining):
    Jury Questioning → Finale (jury votes) → Winner Announced → GameOver
```

---

## Testing Checklist

After implementation:
- [ ] When 4 houseguests remain at week start, normal weekly cycle runs
- [ ] When eviction brings count to 3, next phase is FinalHoH (not regular HoH)
- [ ] If somehow at 2 houseguests during normal phases, redirects to JuryQuestioning
- [ ] Final HoH 3-part competition runs correctly with 3 houseguests
- [ ] Final HoH winner can evict one of the other 2 houseguests
- [ ] After Final HoH eviction, transitions to JuryQuestioning
- [ ] Jury votes and winner is determined correctly
