
# Fix: HOH Not Detected in Nomination Phase

## Root Cause Analysis

The issue is a **type mismatch** between how `hohWinner` is stored and how it's being accessed:

### How It's Stored (in reducer)
```typescript
// competition-reducer.ts line 31-33
return {
  ...state,
  hohWinner: newHohWinner,  // Full Houseguest OBJECT
  ...
};
```

### How It's Being Accessed (inconsistently across files)

| File | Code | Issue |
|------|------|-------|
| `NominationPhase.tsx` | `getHouseguestById(gameState.hohWinner.id)` | Looks up in stale `game` object |
| `GameSidebar.tsx` | `getHouseguestById(gameState.hohWinner)` | Passes object instead of ID |
| `GameStatusIndicator.tsx` | `getHouseguestById(gameState.hohWinner)` | Passes object instead of ID |
| `POVCompetition/index.tsx` | `getHouseguestById(gameState.hohWinner)` | Passes object instead of ID |

### Why `getHouseguestById` Fails
The `getHouseguestById` function looks in `game.houseguests` (the `BigBrotherGame` instance), which is initialized once and **never synced** with the reducer's `gameState.houseguests`. When a new HoH is set via dispatch, the game object's internal houseguest list doesn't get updated.

---

## Solution

Since `gameState.hohWinner` is already the full Houseguest object, we should use it directly instead of looking it up. For the most current data (in case houseguest properties change), we can look it up from `gameState.houseguests`.

### Files to Modify

#### 1. `src/components/game-phases/NominationPhase.tsx`
**Line 30** - Change:
```typescript
// BEFORE
const hoh = gameState?.hohWinner ? getHouseguestById(gameState.hohWinner.id) : null;

// AFTER  
const hoh = gameState.hohWinner 
  ? gameState.houseguests.find(h => h.id === gameState.hohWinner.id) || gameState.hohWinner
  : null;
```

**Line 33** - Also fix nominees which may have same issue:
```typescript
// BEFORE
const nominees = gameState?.nominees?.map(nomineeId => getHouseguestById(nomineeId.id)).filter(Boolean) || [];

// AFTER
const nominees = gameState?.nominees?.map(nominee => 
  gameState.houseguests.find(h => h.id === nominee.id) || nominee
).filter(Boolean) || [];
```

#### 2. `src/components/game-screen/GameSidebar.tsx`
**Line 17-18** - Fix to use gameState directly:
```typescript
// BEFORE
const hohHouseguest = gameState.hohWinner ? getHouseguestById(gameState.hohWinner) : null;
const povHouseguest = gameState.povWinner ? getHouseguestById(gameState.povWinner) : null;

// AFTER
const hohHouseguest = gameState.hohWinner 
  ? gameState.houseguests.find(h => h.id === gameState.hohWinner.id) || gameState.hohWinner
  : null;
const povHouseguest = gameState.povWinner 
  ? gameState.houseguests.find(h => h.id === gameState.povWinner.id) || gameState.povWinner
  : null;
```

#### 3. `src/components/game-screen/GameStatusIndicator.tsx`
**Lines 14-16** - Fix HoH lookup:
```typescript
// BEFORE
const getHoHName = () => {
  if (!gameState.hohWinner) return null;
  const hoh = getHouseguestById(gameState.hohWinner);
  return hoh?.name || null;
};

// AFTER
const getHoHName = () => {
  if (!gameState.hohWinner) return null;
  return gameState.hohWinner.name || null;
};
```

#### 4. `src/components/game-phases/POVCompetition/index.tsx`
**Line 32** - Fix HoH lookup:
```typescript
// BEFORE
const hoh = gameState.hohWinner ? getHouseguestById(gameState.hohWinner) : null;

// AFTER
const hoh = gameState.hohWinner 
  ? gameState.houseguests.find(h => h.id === gameState.hohWinner.id) || gameState.hohWinner
  : null;
```

---

## Why This Approach

1. **`gameState.hohWinner` is already the full Houseguest object** - No need to look it up
2. **Looking up in `gameState.houseguests`** ensures we get the most current version (in case properties like `competitionsWon` are updated elsewhere)
3. **Fallback to `gameState.hohWinner`** ensures we always have data even if lookup fails
4. **Avoids dependency on stale `game` object** - The `BigBrotherGame` instance is a legacy pattern that's not synced with reducer state

---

## Testing Verification

After implementation:
- [ ] Skip HOH competition - HoH name should display correctly in Nomination phase
- [ ] Play through HOH competition normally - HoH name should display correctly
- [ ] Sidebar should show current HoH and PoV holder correctly
- [ ] POV Competition should recognize the HoH
- [ ] Continue full game cycle to verify no regressions
