
# Fix: PoV Meeting Veto Logic - savedNominee Not Being Set

## Problem Summary

When the Power of Veto holder uses the veto to save a nominee (when they themselves are NOT on the block), the `savedNominee` state never gets updated. This causes the veto meeting to fail because:
1. `handleSaveNominee` only updates the stage but doesn't set `savedNominee`
2. `completeVetoMeeting` receives `null` for the saved nominee
3. The veto action effectively does nothing

## Root Cause Analysis

In `src/components/game-phases/POVMeeting/hooks/useNomineeReplacement.ts`:

```typescript
// Line 103-113 - handleSaveNominee doesn't update savedNominee state!
const handleSaveNominee = useCallback((nominee: Houseguest) => {
  dispatch({
    type: 'PLAYER_ACTION',
    payload: {
      actionId: 'save_nominee',
      params: { nomineeId: nominee.id }
    }
  });
  
  setMeetingStage('selectReplacement');
  // MISSING: setSavedNominee(nominee) should be called here!
}, [dispatch, setMeetingStage]);
```

The `setSavedNominee` setter is only passed to `useVetoDecision` hook (for auto-saving when PoV holder is nominated), but `useNomineeReplacement` hook never receives it.

## Solution

Pass `setSavedNominee` to `useNomineeReplacement` and call it in `handleSaveNominee`.

---

## Technical Implementation

### File 1: `src/components/game-phases/POVMeeting/hooks/usePOVMeeting.ts`

Add `setSavedNominee` to the props passed to `useNomineeReplacement`:

**Lines 26-34** - Update the hook call to include `setSavedNominee`:

```typescript
const { 
  handleSaveNominee,
  handleSelectReplacement,
  completeVetoMeeting 
} = useNomineeReplacement({
  povHolder,
  nominees,
  hoh,
  savedNominee,
  meetingStage,
  setMeetingStage,
  setReplacementNominee,
  setSavedNominee  // ADD THIS
});
```

---

### File 2: `src/components/game-phases/POVMeeting/hooks/useNomineeReplacement.ts`

**Step A - Update interface (lines 5-13):**

Add `setSavedNominee` to the props interface:

```typescript
interface UseNomineeReplacementProps {
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  hoh: Houseguest | null;
  savedNominee: Houseguest | null;
  meetingStage: 'initial' | 'selectSaved' | 'selectReplacement' | 'complete';
  setMeetingStage: React.Dispatch<React.SetStateAction<'initial' | 'selectSaved' | 'selectReplacement' | 'complete'>>;
  setReplacementNominee: React.Dispatch<React.SetStateAction<Houseguest | null>>;
  setSavedNominee: React.Dispatch<React.SetStateAction<Houseguest | null>>;  // ADD THIS
}
```

**Step B - Update function destructuring (line 15-22):**

```typescript
export const useNomineeReplacement = ({
  povHolder,
  nominees,
  hoh,
  savedNominee,
  setMeetingStage,
  setReplacementNominee,
  setSavedNominee  // ADD THIS
}: UseNomineeReplacementProps) => {
```

**Step C - Update handleSaveNominee (lines 103-113):**

Call `setSavedNominee` before advancing the stage:

```typescript
const handleSaveNominee = useCallback((nominee: Houseguest) => {
  // SET THE SAVED NOMINEE STATE
  setSavedNominee(nominee);
  
  dispatch({
    type: 'PLAYER_ACTION',
    payload: {
      actionId: 'save_nominee',
      params: { nomineeId: nominee.id }
    }
  });
  
  setMeetingStage('selectReplacement');
}, [dispatch, setMeetingStage, setSavedNominee]);  // Add setSavedNominee to deps
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `usePOVMeeting.ts` | Pass `setSavedNominee` to `useNomineeReplacement` |
| `useNomineeReplacement.ts` | Add `setSavedNominee` to interface and call it in `handleSaveNominee` |

---

## Testing Checklist

After implementation:
- POV holder (not on block) uses veto
- POV holder selects a nominee to save
- `savedNominee` is correctly set
- HoH selects replacement nominee
- `completeVetoMeeting` receives correct `saved` and `replacement` values
- Nominees are correctly updated in state
- Game advances to Eviction phase with correct nominees
