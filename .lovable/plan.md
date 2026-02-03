
# Plan: Complete Final Stages Implementation

## Current State Analysis

The final stages are mostly implemented but have several gaps and issues that need to be addressed:

### What's Working
- **FinalHoHPhase.tsx**: 3-part competition UI with participant tracking and selection
- **JuryQuestioningPhase.tsx**: Question-answer flow with skip functionality
- **FinalePhase.tsx**: Speeches, voting, and vote reveal stages
- **GameOverPhase.tsx**: Winner display and game summary
- **Spectator Mode**: Auto-advance for evicted players in most phases

### Issues Found

1. **Missing state updates for final actions**: The `set_final_two` and `set_winner` player actions are dispatched but not handled in the reducer - the `finalTwo` and winner data isn't being saved to state

2. **Missing spectator mode in final phases**: FinalHoHPhase, JuryQuestioningPhase, and FinalePhase don't have auto-advance logic for spectator mode

3. **Missing `isWinner` property update**: The `END_GAME` reducer sets `status: 'Winner'` but the GameOverPhase looks for `hg.isWinner` property instead

4. **No auto-advance from FinalHoH selection**: When AI is Final HoH, they need to automatically select a finalist

5. **juryMembers state mismatch**: Some code expects array of IDs, other code expects array of Houseguest objects

---

## Implementation Plan

### 1. Fix Player Action Reducer for Final Stage Actions
**File**: `src/contexts/reducers/reducers/player-action-reducer.ts`

Add handlers for:
- `set_final_two`: Update `finalTwo` array in state
- `set_winner`: Update winner houseguest with `isWinner: true` and call END_GAME

```typescript
case 'set_final_two':
  if (payload.params.finalist1Id && payload.params.finalist2Id) {
    const finalist1 = state.houseguests.find(h => h.id === payload.params.finalist1Id);
    const finalist2 = state.houseguests.find(h => h.id === payload.params.finalist2Id);
    if (finalist1 && finalist2) {
      return {
        ...state,
        finalTwo: [finalist1, finalist2]
      };
    }
  }
  break;

case 'set_winner':
  if (payload.params.winnerId) {
    const winner = state.houseguests.find(h => h.id === payload.params.winnerId);
    const runnerUp = state.finalTwo.find(h => h.id !== payload.params.winnerId);
    if (winner && runnerUp) {
      // Update houseguests with winner status
      const updatedHouseguests = state.houseguests.map(h => {
        if (h.id === winner.id) {
          return { ...h, status: 'Winner', isWinner: true };
        }
        if (h.id === runnerUp.id) {
          return { ...h, status: 'Runner-Up' };
        }
        return h;
      });
      return {
        ...state,
        houseguests: updatedHouseguests,
        winner: { ...winner, status: 'Winner', isWinner: true },
        runnerUp: { ...runnerUp, status: 'Runner-Up' },
        phase: 'GameOver'
      };
    }
  }
  break;
```

---

### 2. Add Spectator Mode to FinalHoHPhase
**File**: `src/components/game-phases/FinalHoHPhase.tsx`

Add auto-advance logic when in spectator mode:
- Auto-start each competition part after 2 seconds
- Auto-continue to next part after results
- Auto-select finalist (AI chooses based on relationships)

```typescript
// Auto-start competition in spectator mode
useEffect(() => {
  if (!gameState.isSpectatorMode) return;
  
  if (currentPart !== 'selection' && !isCompeting && !showResults && !partStatus[currentPartKey].completed) {
    const timer = setTimeout(() => {
      startCompetition(currentPartKey);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [gameState.isSpectatorMode, currentPart, isCompeting, showResults, partStatus]);

// Auto-continue after results in spectator mode
useEffect(() => {
  if (!gameState.isSpectatorMode || !showResults) return;
  
  const timer = setTimeout(() => {
    continueToNextPart();
  }, 3000);
  return () => clearTimeout(timer);
}, [gameState.isSpectatorMode, showResults]);

// Auto-select finalist in spectator mode (AI decision)
useEffect(() => {
  if (!gameState.isSpectatorMode || currentPart !== 'selection' || !finalHoH) return;
  
  const timer = setTimeout(() => {
    // AI chooses based on relationships - pick who they have better relationship with
    const otherFinalists = finalThree.filter(h => h.id !== finalHoH.id);
    // Simple random selection for now (could use relationship system)
    const selectedFinalist = otherFinalists[Math.floor(Math.random() * otherFinalists.length)];
    if (selectedFinalist) {
      chooseFinalist(selectedFinalist);
    }
  }, 3000);
  return () => clearTimeout(timer);
}, [gameState.isSpectatorMode, currentPart, finalHoH]);
```

---

### 3. Add Spectator Mode to JuryQuestioningPhase
**File**: `src/components/game-phases/JuryQuestioningPhase.tsx`

Add auto-advance for spectator mode:

```typescript
// Auto-start questioning in spectator mode
useEffect(() => {
  if (!gameState.isSpectatorMode || questionsComplete || isAsking) return;
  
  const timer = setTimeout(() => {
    if (currentJurorIndex === 0) {
      startQuestioning();
    }
  }, 2000);
  return () => clearTimeout(timer);
}, [gameState.isSpectatorMode, questionsComplete, isAsking, currentJurorIndex]);

// Auto-continue after each juror in spectator mode  
useEffect(() => {
  if (!gameState.isSpectatorMode || isAsking || questionsComplete) return;
  if (currentJurorIndex > 0 && currentJurorIndex < jurors.length) {
    const timer = setTimeout(() => {
      startQuestioning();
    }, 1500);
    return () => clearTimeout(timer);
  }
}, [gameState.isSpectatorMode, currentJurorIndex, isAsking, questionsComplete]);

// Auto-continue to finale in spectator mode
useEffect(() => {
  if (!gameState.isSpectatorMode || !questionsComplete) return;
  
  const timer = setTimeout(() => {
    continueToFinale();
  }, 2000);
  return () => clearTimeout(timer);
}, [gameState.isSpectatorMode, questionsComplete]);
```

---

### 4. Add Spectator Mode to FinalePhase
**File**: `src/components/game-phases/FinalePhase.tsx`

Add auto-advance through finale stages:

```typescript
// Auto-advance through stages in spectator mode
useEffect(() => {
  if (!gameState.isSpectatorMode) return;
  
  if (stage === 'intro') {
    const timer = setTimeout(() => {
      handleProceedToSpeeches();
    }, 3000);
    return () => clearTimeout(timer);
  }
  
  if (stage === 'speeches') {
    // Skip speeches but let FinalSpeeches component handle it
    const timer = setTimeout(() => {
      handleSkipToVoting();
    }, 2000);
    return () => clearTimeout(timer);
  }
  
  if (stage === 'complete' && winner) {
    const timer = setTimeout(() => {
      handleContinueToGameOver();
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [gameState.isSpectatorMode, stage, winner]);
```

Note: During voting stage, spectator player still gets to cast their jury vote.

---

### 5. Fix GameOverPhase Winner Detection
**File**: `src/components/game-phases/GameOverPhase.tsx`

Update to check both `isWinner` property and `status === 'Winner'`:

```typescript
const winner = gameState.houseguests.find(hg => hg.isWinner || hg.status === 'Winner');
```

---

### 6. Add Missing FinalHoH Part Winner Actions in Player Action Reducer
**File**: `src/contexts/reducers/reducers/player-action-reducer.ts`

Handle the competition part winner actions:

```typescript
case 'select_part1_winner':
case 'select_part2_winner':
case 'select_part3_winner':
  if (payload.params.winnerId) {
    const partKey = payload.actionId.replace('select_', '').replace('_winner', '') as 'part1' | 'part2' | 'part3';
    const updatedFinalHoHWinners = {
      ...state.finalHoHWinners,
      [partKey]: payload.params.winnerId
    };
    
    // If part3, also set HOH winner
    const updates: Partial<GameState> = {
      finalHoHWinners: updatedFinalHoHWinners
    };
    
    if (partKey === 'part3') {
      const winner = state.houseguests.find(h => h.id === payload.params.winnerId);
      if (winner) {
        updates.hohWinner = winner;
        updates.houseguests = state.houseguests.map(h => ({
          ...h,
          isHoH: h.id === payload.params.winnerId
        }));
      }
    }
    
    return { ...state, ...updates };
  }
  break;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Add handlers for `set_final_two`, `set_winner`, and part winner actions |
| `src/components/game-phases/FinalHoHPhase.tsx` | Add spectator mode auto-advance for all stages |
| `src/components/game-phases/JuryQuestioningPhase.tsx` | Add spectator mode auto-advance |
| `src/components/game-phases/FinalePhase.tsx` | Add spectator mode auto-advance (respecting player jury vote) |
| `src/components/game-phases/GameOverPhase.tsx` | Fix winner detection to check both properties |

---

## Testing Flow

After implementation, the complete final stages should flow as:

```
Final 4 Week:
  Normal HoH → Nominations → PoV → Eviction
      ↓
3 houseguests remain → isFinalStage = true
      ↓
FinalHoH Phase:
  Part 1 (Endurance) - all 3 compete
      ↓
  Part 2 (Skill) - 2 losers compete
      ↓
  Part 3 (Questions) - 2 winners compete → Final HoH crowned
      ↓
  Final HoH selects finalist → 3rd place evicted to jury
      ↓
Jury Questioning:
  Each juror asks questions → finalists answer
      ↓
Finale:
  Final speeches → Jury votes → Dramatic reveal → Winner crowned
      ↓
GameOver:
  Winner display → Stats → Recap → New Game option
```

### Spectator Mode Flow

If player is evicted:
- SpectatorBanner appears with skip button
- All phases auto-advance after brief delays
- Player still casts jury vote during Finale
- Player can skip to next phase at any time
