
# Fix HoH Competition Skip/Fast-Forward Winner Selection

## Problem Analysis
When using the Skip button during the HoH competition, no winner is being chosen or the winner selection ignores houseguest stats. The current implementation uses plain `Math.random()` instead of the stat-weighted scoring system.

**Root Causes:**
1. `selectWinnerImmediately` in `useCompetitionState.ts` uses simple random selection instead of `selectRandomWinner`
2. The fast-forward handler in `HOHCompetition/index.tsx` also bypasses the weighted scoring
3. Results positions are randomized instead of being calculated from actual scores

---

## Implementation Plan

### Step 1: Update `useCompetitionState.ts` - Use Weighted Winner Selection

**File:** `src/components/game-phases/HOHCompetition/hooks/useCompetitionState.ts`

**Changes:**
- Import `selectRandomWinner` from the utils file
- Replace plain random selection with the weighted `selectRandomWinner` function
- Generate results based on actual scoring rather than random positions

```typescript
// Before (line 105):
const randomWinner = activeHouseguests[Math.floor(Math.random() * activeHouseguests.length)];

// After:
const competitionWinner = selectRandomWinner(activeHouseguests, type);
```

### Step 2: Update Fast Forward Handler in `index.tsx`

**File:** `src/components/game-phases/HOHCompetition/index.tsx`

**Changes:**
- Import `selectRandomWinner` utility
- Replace plain random selection in the fast-forward handler with weighted selection
- Generate score-based results for proper placement display

```typescript
// Before (line 56):
const randomWinner = activeHouseguests[Math.floor(Math.random() * activeHouseguests.length)];

// After:
const randomWinner = selectRandomWinner(activeHouseguests, randomType);
```

### Step 3: Improve Results Generation with Score-Based Positions

**File:** `src/components/game-phases/HOHCompetition/hooks/useCompetitionState.ts`

**Changes:**
- Calculate actual scores for each houseguest based on competition type
- Sort results by score to get proper placements
- Ensure winner is always first

```typescript
// Generate scored results instead of random positions
const scoredResults = activeHouseguests.map(guest => {
  let score = 1;
  switch (type) {
    case 'physical': score = guest.stats.physical; break;
    case 'mental': score = guest.stats.mental; break;
    case 'endurance': score = guest.stats.endurance; break;
    case 'social': score = guest.stats.social; break;
    case 'luck': score = guest.stats.luck + 5; break;
  }
  score *= (0.75 + Math.random() * 0.5); // Add randomness
  return { id: guest.id, name: guest.name, score };
}).sort((a, b) => b.score - a.score);

// Winner should be at top
const winnerIdx = scoredResults.findIndex(r => r.id === competitionWinner.id);
if (winnerIdx > 0) {
  [scoredResults[0], scoredResults[winnerIdx]] = 
    [scoredResults[winnerIdx], scoredResults[0]];
}

const placeholderResults = scoredResults.map((result, index) => ({
  name: result.name,
  id: result.id,
  position: index + 1
}));
```

### Step 4: Apply Same Fix to Fast Forward Handler

**File:** `src/components/game-phases/HOHCompetition/index.tsx`

Apply the same score-based results generation in the `handleFastForward` function for consistency.

---

## Technical Details

### Files to Modify
1. `src/components/game-phases/HOHCompetition/hooks/useCompetitionState.ts`
2. `src/components/game-phases/HOHCompetition/index.tsx`

### Key Functions
- `selectRandomWinner(houseguests, competitionType)` - Uses weighted random based on relevant stat:
  - `physical`: 1.5x physical stat weight
  - `mental`: 1.5x mental stat weight  
  - `endurance`: 1.5x endurance stat weight
  - `social`: 1.5x social stat weight
  - `luck`: luck stat + 5 (equalizer)
  - All weights multiplied by random factor (75-125%)

### Expected Behavior After Fix
1. Skip button properly selects a winner using stat-weighted scoring
2. Winner is recorded in game state via `SET_HOH` dispatch
3. Game transitions to Nomination phase with the new HoH
4. Competition results show proper placements based on scores
