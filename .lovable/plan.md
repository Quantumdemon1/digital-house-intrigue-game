
# Plan: Fix Player HoH Nomination Selection

## Problem

When your player character wins the HoH competition, you cannot make your own nominations - the game treats you as an AI instead of showing the nomination selection UI.

## Root Cause

The NominationPhase component uses `getHouseguestById()` to look up the HoH, which delegates to the **legacy `game` object**. This legacy object's houseguest list is never synced with reducer state updates, so the `isPlayer` property is stale or missing.

```tsx
// Current broken code in NominationPhase/index.tsx
const hohId = gameState?.hohWinner?.id;
const hoh = hohId ? getHouseguestById(hohId) : null;  // <-- Uses stale legacy game object
const isPlayerHoH = hoh?.isPlayer ?? false;  // <-- Always false because legacy data missing isPlayer
```

When `isPlayerHoH` is incorrectly `false`, the component skips the `'player-selection'` stage and lets the AI nomination hook take over.

---

## Solution

Change the HoH lookup to use `gameState.houseguests.find()` directly instead of the legacy `getHouseguestById()` helper. This ensures we get the current houseguest data with the correct `isPlayer` property.

---

## Technical Changes

### File: `src/components/game-phases/NominationPhase/index.tsx`

**Before (broken):**
```tsx
const hohId = gameState?.hohWinner?.id;
const hoh = hohId ? getHouseguestById(hohId) : null;
```

**After (fixed):**
```tsx
// Look up HoH directly from reducer state to ensure isPlayer is accurate
const hohId = typeof gameState?.hohWinner === 'string' 
  ? gameState.hohWinner 
  : gameState?.hohWinner?.id;
  
const hoh = hohId 
  ? gameState.houseguests.find(h => h.id === hohId) || null
  : null;
```

This change:
1. Handles both cases where `hohWinner` might be a string ID or a full Houseguest object
2. Looks up the houseguest from `gameState.houseguests` which is always current
3. Ensures `isPlayer` is correctly read, enabling the player selection UI

---

## Expected Behavior After Fix

1. Player wins HoH competition
2. Phase advances to Nomination
3. Player sees "Start Nomination Ceremony" button
4. After clicking, player enters **player-selection** stage with the NomineeSelector grid
5. Player selects 2 houseguests and confirms
6. Key Ceremony plays showing safe houseguests
7. Nominations complete

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/NominationPhase/index.tsx` | Update HoH lookup to use `gameState.houseguests.find()` instead of `getHouseguestById()` |

This is a minimal, targeted fix that addresses the root cause without requiring broader refactoring.
