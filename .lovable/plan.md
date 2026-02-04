

# Plan: Fix Player HoH Nomination Control

## Problem

When the player wins Head of Household, they are not given the opportunity to manually select nominees. Instead, the AI takes over and makes the nominations automatically.

## Root Cause

The AI nomination hook (`useAINomination`) runs its decision process **immediately on component mount** without waiting for the ceremony to be explicitly started. The condition check includes `!hoh.isPlayer`, but:

1. **Missing ceremony start check**: The `isNominating` flag is in the dependency array but is NOT checked in the condition
2. **Race condition potential**: The AI effect can run before the component has fully confirmed the HoH is the player
3. **No explicit player guard**: There's no early return in the hook for player-controlled HoH scenarios

The AI nomination effect at `useAINomination.ts` lines 52-66:
```typescript
useEffect(() => {
  if (
    hoh && 
    !hoh.isPlayer &&         // This check exists BUT...
    !ceremonyComplete && 
    !aiProcessed && 
    !processingRef.current
  ) {
    // AI runs IMMEDIATELY on mount if conditions met
    // isNominating is NOT checked here!
    processAIDecision();
  }
}, [hoh, isNominating, ...]);  // isNominating is a dependency but unused
```

## Solution

### Fix 1: Add `isNominating` Check to AI Hook

Modify the AI nomination effect to only run after the ceremony has been explicitly started:

```typescript
// useAINomination.ts
useEffect(() => {
  if (
    hoh && 
    !hoh.isPlayer && 
    isNominating &&           // ADD: Only after ceremony starts
    !ceremonyComplete && 
    !aiProcessed && 
    !processingRef.current
  ) {
    setAiProcessed(true);
    processAIDecision();
  }
  // ...cleanup
}, [hoh, isNominating, ceremonyComplete, aiProcessed, ...]);
```

### Fix 2: Add Early Return for Player HoH

Add an early return in the `useAINomination` hook when the player is HoH:

```typescript
// useAINomination.ts
export const useAINomination = ({ hoh, isNominating, ... }) => {
  // If player is HoH, don't set up any AI processing at all
  const isPlayerHoH = hoh?.isPlayer ?? false;
  
  useEffect(() => {
    // Skip ALL AI processing if player is HoH
    if (isPlayerHoH) return;
    
    if (hoh && isNominating && !ceremonyComplete && !aiProcessed && !processingRef.current) {
      setAiProcessed(true);
      processAIDecision();
    }
    // ...
  }, [isPlayerHoH, hoh, isNominating, ...]);
  
  // Return early with empty state if player is HoH
  if (isPlayerHoH) {
    return { 
      aiProcessed: false,
      showAIDecision: false,
      aiDecision: null,
      handleCloseAIDecision: () => {}
    };
  }
  // ...
};
```

### Fix 3: Ensure NominationPhase UI Logic

Verify the player-selection stage is correctly triggered in `NominationPhase/index.tsx`:

```typescript
// When starting ceremony for player HoH
const handleStartCeremony = useCallback(() => {
  startCeremony();
  if (isPlayerHoH) {
    setStage('player-selection');  // This exists but verify it runs
  }
  // AI nominations are handled by the hook ONLY for non-player HoH
}, [startCeremony, isPlayerHoH]);
```

The current code at line 53-58 already has this logic, but we need to ensure the AI hook doesn't interfere.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/NominationPhase/hooks/ai-nomination/useAINomination.ts` | Add `isNominating` check to effect condition; add early return for player HoH |
| `src/components/game-phases/NominationPhase/hooks/ai-nomination/useAIProcessing.ts` | Add player check guard at the start of `processAIDecision` |

## Technical Details

### useAINomination.ts Changes

```typescript
export const useAINomination = ({
  hoh,
  potentialNominees,
  isNominating,
  ceremonyComplete,
  confirmNominations,
  setNominees,
}: UseAINominationProps): UseAINominationReturn => {
  // Early detection of player HoH
  const isPlayerHoH = hoh?.isPlayer ?? false;
  
  const [aiProcessed, setAiProcessed] = useState(false);
  const [showAIDecision, setShowAIDecision] = useState(false);
  const [aiDecision, setAIDecision] = useState<AIDecision | null>(null);
  
  // ... hook initialization ...

  // AI nomination logic - ONLY for AI HoH after ceremony starts
  useEffect(() => {
    // Explicit guard: never run for player HoH
    if (isPlayerHoH) {
      return;
    }
    
    // Only process if ceremony has started and conditions are met
    if (
      hoh && 
      !hoh.isPlayer && 
      isNominating &&          // NEW: Must have started ceremony
      !ceremonyComplete && 
      !aiProcessed && 
      !processingRef.current
    ) {
      setAiProcessed(true);
      processAIDecision();
    }
    
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [isPlayerHoH, hoh, isNominating, ceremonyComplete, aiProcessed, ...]);

  return { aiProcessed, showAIDecision, aiDecision, handleCloseAIDecision };
};
```

### useAIProcessing.ts Changes

Add a guard at the start of `processAIDecision`:

```typescript
const processAIDecision = useCallback(async () => {
  // Guard: Never process for player HoH
  if (hoh?.isPlayer) {
    aiLogger.info("Skipping AI nomination - player is HoH");
    return;
  }
  
  // Existing logic...
  if (!hoh || !aiSystem || !game || processingRef.current) {
    return;
  }
  // ...
}, [hoh, ...]);
```

## Expected Behavior After Fix

1. Player wins HoH competition
2. Phase transitions to Nomination
3. NominationPhase mounts with `stage = 'pre-ceremony'`
4. Player sees "Start Nomination Ceremony" button
5. Player clicks button -> `isNominating = true`, `stage = 'player-selection'`
6. Player sees NomineeSelector grid to pick 2 nominees
7. Player confirms -> Key Ceremony animation plays
8. Nominations complete -> Continue to PoV

For AI HoH:
1. AI wins HoH competition
2. Phase transitions to Nomination
3. NominationPhase mounts
4. Spectator mode auto-starts ceremony after delay
5. `isNominating = true` triggers AI nomination hook
6. AI selects nominees with delay animation
7. Key Ceremony plays automatically
8. Continue to PoV

## Testing

After implementation, test the following scenarios:
1. Player wins HoH in Week 1 -> verify nomination selector appears
2. Player wins HoH after eviction -> verify selector still works
3. AI wins HoH -> verify AI makes nominations correctly
4. Fast-forward through player HoH nomination -> verify no AI interference
5. Spectator mode (player evicted) -> verify AI handles nominations

