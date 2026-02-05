
# Visual Enhancement: Add Profile Photos to Ceremony Screens

## Problem Analysis

Three ceremony/competition screens currently display text placeholders (initials like "MH") instead of profile photos:

1. **Pre-ceremony HOH display** (`NominationContent.tsx`) - Shows HOH name but no avatar
2. **Nominations Complete** (`NominationPhase/index.tsx`) - Nominees cards show icons but no photos
3. **PoV Competition Results** (`POVCompetition/CompetitionResults.tsx`) - Shows "MH" initials instead of winner's photo

The root cause is that `StatusAvatar` is being called without the `avatarUrl` prop in some components, causing it to fall back to initials.

---

## Changes Required

### 1. Add HOH Avatar to Pre-Ceremony Screen

**File**: `src/components/game-phases/NominationPhase/components/NominationContent.tsx`

Add a `StatusAvatar` showing the HOH with their profile photo above the ceremony title:

- Import `StatusAvatar` component
- Add HOH avatar with `status="hoh"` and `avatarUrl={hoh.avatarUrl}`
- Position it prominently at the top

### 2. Add Profile Photos to PoV Competition Results

**File**: `src/components/game-phases/POVCompetition/CompetitionResults.tsx`

The `StatusAvatar` is already being used but missing the `avatarUrl` prop:

```tsx
// Current (line 31-36):
<StatusAvatar 
  name={winner.name}
  status="pov"
  size="xl"
  ...
/>

// Fixed:
<StatusAvatar 
  name={winner.name}
  avatarUrl={winner.avatarUrl}  // ADD THIS
  status="pov"
  size="xl"
  ...
/>
```

### 3. Enhance Nominee Cards in Complete Stage

**File**: `src/components/game-phases/NominationPhase/index.tsx`

The `StatusAvatar` is already being used correctly (lines 264-269), but could use larger size. This was already fixed in the previous update.

---

## Summary of Changes

| File | Change |
|------|--------|
| `NominationContent.tsx` | Add HOH avatar display with crown status |
| `POVCompetition/CompetitionResults.tsx` | Add `avatarUrl={winner.avatarUrl}` prop |

---

## Technical Notes

The `StatusAvatar` component properly handles the `avatarUrl` prop (line 149 combines `imageUrl || avatarUrl`), so simply passing the correct prop will display the profile photo.
