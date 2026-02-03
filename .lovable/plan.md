
# Fix HOH Competition Skip and Navigation Issues

## Problem Summary
When skipping the HOH competition, the game enters a broken state where:
- The houseguest gets the HoH badge (game state is updated)
- The screen shows "No HoH" in the Nomination phase header
- The player cannot navigate away or proceed with the game

## Root Cause Analysis
The issue is a race condition in `selectWinnerImmediately()` where:
1. `SET_HOH` dispatch happens
2. `SET_PHASE` dispatch happens immediately after (same synchronous block)
3. React batches these updates, but the Nomination component mounts before `hohWinner` is fully propagated

## Solution

### Fix 1: Add Delay Between State Updates
**File:** `src/components/game-phases/HOHCompetition/hooks/useCompetitionState.ts`

Modify `selectWinnerImmediately` to wait for `SET_HOH` to propagate before dispatching `SET_PHASE`:

```typescript
// Update HOH in game state DIRECTLY
dispatch({
  type: 'SET_HOH',
  payload: competitionWinner
});

// Wait for state to propagate before phase change
setTimeout(() => {
  dispatch({
    type: 'SET_PHASE',
    payload: 'Nomination'
  });
}, 100);
```

### Fix 2: Add Delay in Fast Forward Handler
**File:** `src/components/game-phases/HOHCompetition/index.tsx`

Same issue in the `handleFastForward` effect when competition is in progress:

```typescript
dispatch({
  type: 'SET_HOH',
  payload: competitionWinner
});

// Delay phase transition to ensure HoH is set
setTimeout(() => {
  dispatch({
    type: 'SET_PHASE',
    payload: 'Nomination'
  });
}, 100);
```

### Fix 3: Add Recovery Navigation in Nomination Phase
**File:** `src/components/game-phases/NominationPhase.tsx`

Add a fallback UI when HoH is missing that allows users to recover:

```tsx
{!hoh && (
  <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
    <p className="text-destructive font-medium">
      No Head of Household detected. This may be a timing issue.
    </p>
    <div className="mt-3 flex gap-2">
      <Button 
        variant="outline"
        onClick={() => dispatch({ type: 'SET_PHASE', payload: 'HoH' })}
      >
        Return to HoH Competition
      </Button>
    </div>
  </div>
)}
```

### Fix 4: Add Skip Button to Nomination Phase Header
**File:** `src/components/game-phases/NominationPhase.tsx`

Add a skip/fast-forward button in the header for consistency:

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => document.dispatchEvent(new Event('game:fastForward'))}
  className="text-white/70 hover:text-white"
>
  <SkipForward className="h-4 w-4 mr-1" />
  Skip
</Button>
```

### Fix 5: Validate HoH Before Showing Nomination Content
**File:** `src/components/game-phases/NominationPhase.tsx`

Early return with loading state if HoH is not yet available:

```tsx
// Add loading state while waiting for HoH
const [isLoading, setIsLoading] = useState(!gameState.hohWinner);

useEffect(() => {
  if (gameState.hohWinner) {
    setIsLoading(false);
  } else {
    // Give it a moment to load
    const timeout = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeout);
  }
}, [gameState.hohWinner]);

if (isLoading) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading Nomination Ceremony...</p>
      </CardContent>
    </Card>
  );
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `useCompetitionState.ts` | Add 100ms delay between SET_HOH and SET_PHASE dispatches |
| `HOHCompetition/index.tsx` | Add same delay in fast forward handler |
| `NominationPhase.tsx` | Add loading state, recovery UI when no HoH, skip button |

## Testing Verification

After implementation, verify:
- [ ] Skip button on HOH Competition Initial screen works correctly
- [ ] HoH name displays properly in Nomination phase after skip
- [ ] Skip button during competition in-progress works correctly
- [ ] If HoH is missing, recovery button allows return to HOH phase
- [ ] Normal game flow (no skip) still works correctly
