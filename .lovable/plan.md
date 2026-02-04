
# Plan: Fix Competition Winner/Standings Mismatch Bug

## Problem Analysis

When you finished 1st in the Competition Standings as "Syhs", but "Alex Chen" was declared the winner, this is caused by a bug in how the standings are generated and displayed.

### Root Cause

In the `useCompetitionResults.ts` file, the `processResults()` function:
1. Generates positions using completely random sorting
2. Attempts to swap the winner to first place in the array
3. **Does NOT update the `position` property values after swapping**

The display component (`CompetitionResults.tsx`) sorts by `result.position` value, not by array index. So even though Alex Chen was moved to array index 0, Syhs still had `position: 1` and appears at the top of the standings.

### Code Flow Showing the Bug

```text
Step 1: Random positions generated
  positions = [
    { name: "Syhs", id: "...", position: 1 },      // Random got 1st
    { name: "Alex Chen", id: "...", position: 2 }, // Random got 2nd
    { name: "Blake", id: "...", position: 3 }
  ]

Step 2: Winner "Alex Chen" selected by stat-weighted random

Step 3: Swap winner to index 0 (but position values unchanged!)
  positions = [
    { name: "Alex Chen", id: "...", position: 2 }, // At index 0, but position is still 2!
    { name: "Syhs", id: "...", position: 1 },      // At index 1, but position is still 1!
    { name: "Blake", id: "...", position: 3 }
  ]

Step 4: Display sorts by position value
  Sorted display shows:
    1. Syhs (position: 1) - WRONG, should be 2nd
    2. Alex Chen (position: 2) - WRONG, should be 1st
    3. Blake (position: 3)
```

---

## Solution

Replace the random position generation with stat-based scoring (matching the pattern already used in `useCompetitionState.ts`'s `generateScoredResults` helper). This ensures:
1. Positions are based on actual stats (more realistic)
2. The winner is guaranteed to have position 1
3. The display matches who actually won

---

## Technical Changes

### File: `src/components/game-phases/HOHCompetition/hooks/useCompetitionResults.ts`

Replace the random position generation with stat-based scoring:

```typescript
const processResults = (
  competitionWinner: Houseguest,
  activeHouseguests: Houseguest[],
  competitionType?: CompetitionType // Add optional type parameter
) => {
  // ... existing guard code ...

  // Generate score-based results instead of random
  const scoredResults = activeHouseguests.map(guest => {
    let score = 1;
    const type = competitionType || 'mental'; // Default fallback
    
    switch (type) {
      case 'physical': score = guest.stats.physical; break;
      case 'mental': score = guest.stats.mental; break;
      case 'endurance': score = guest.stats.endurance; break;
      case 'social': score = guest.stats.social; break;
      case 'luck': score = guest.stats.luck + 5; break;
    }
    // Add randomness to make results more varied
    score *= (0.75 + Math.random() * 0.5);
    
    return { id: guest.id, name: guest.name, score };
  }).sort((a, b) => b.score - a.score);

  // Ensure the designated winner is at the top
  const winnerIdx = scoredResults.findIndex(r => r.id === competitionWinner.id);
  if (winnerIdx > 0) {
    [scoredResults[0], scoredResults[winnerIdx]] = [scoredResults[winnerIdx], scoredResults[0]];
  }

  // Convert to positions - winner guaranteed to have position: 1
  const positions = scoredResults.map((result, index) => ({
    name: result.name,
    id: result.id,
    position: index + 1
  }));

  // ... rest of existing code (dispatch SET_HOH, etc.) ...
  
  return positions;
};
```

### File: `src/components/game-phases/HOHCompetition/hooks/useCompetitionLogic.ts`

Pass the competition type to `processResults`:

```typescript
const simulateCompetition = useCallback((
  type: CompetitionType,
  activeHouseguests: Houseguest[],
  setIsCompeting: (value: boolean) => void,
  setResults: (results: any[]) => void,
  setWinner: (winner: Houseguest | null) => void
) => {
  // ... existing code ...
  
  // Pass competition type to processResults
  const positions = processResults(competitionWinner, activeHouseguests, type);
  
  // ... rest of existing code ...
}, [logger, processResults]);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/HOHCompetition/hooks/useCompetitionResults.ts` | Replace random position generation with stat-based scoring; ensure position values match array order |
| `src/components/game-phases/HOHCompetition/hooks/useCompetitionLogic.ts` | Pass competition type to processResults |

---

## Why This Fix Works

1. **Scores are calculated based on stats** - more realistic standings
2. **Winner is always swapped to index 0** - same as before
3. **Positions are assigned AFTER sorting** - `position: index + 1` means the array order determines position values
4. **Display sorting by position will now show correct order** - winner at position 1, displayed first

---

## Expected Result After Fix

When you compete and the system selects a winner:
- The winner will be displayed both as the main winner AND as #1 in standings
- Your standing position will accurately reflect your stat-based performance relative to others
- No more mismatch between "X Wins!" and "Competition Standings"
