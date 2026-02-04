
# Fix: Final HoH Eviction Not Processing

## Problem Summary

When the Final HoH chooses their Final 2 partner, the third houseguest should be evicted to the jury. But as shown in your screenshots, Riley Johnson remained as "Active (1)" instead of being moved to Jury after Casey Wilson selected Blake Peterson.

## Root Cause

The eviction dispatch in `FinalHoHPhase.tsx` uses the wrong payload format:

**Current (broken) code:**
```typescript
dispatch({
  type: 'EVICT_HOUSEGUEST',
  payload: { evictedId: evicted.id, toJury: true }
});
```

**Expected by reducer:**
```typescript
const { evicted, toJury } = action.payload;  // 'evicted' = full houseguest object
```

Since the payload uses `evictedId` instead of `evicted`, the reducer destructures `evicted` as `undefined` and silently returns without updating the houseguest status.

---

## Solution

Fix the dispatch in `FinalHoHPhase.tsx` to pass the full houseguest object instead of just the ID:

```typescript
dispatch({
  type: 'EVICT_HOUSEGUEST',
  payload: { evicted: evicted, toJury: true }  // Pass full object
});
```

Additionally, update the jury members array properly by pushing the evicted ID.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/FinalHoHPhase.tsx` | Fix eviction dispatch payload from `{ evictedId: evicted.id }` to `{ evicted: evicted }` |

---

## Technical Changes

### FinalHoHPhase.tsx (lines 364-369)

**Before:**
```typescript
if (evicted) {
  dispatch({
    type: 'EVICT_HOUSEGUEST',
    payload: { evictedId: evicted.id, toJury: true }
  });
```

**After:**
```typescript
if (evicted) {
  dispatch({
    type: 'EVICT_HOUSEGUEST',
    payload: { evicted: evicted, toJury: true }
  });
```

---

## Expected Behavior After Fix

1. Final HoH (Casey Wilson) selects Blake Peterson as Final 2 partner
2. Riley Johnson is passed to `EVICT_HOUSEGUEST` as full object
3. Reducer updates Riley's status from `Active` to `Jury`
4. Sidebar shows:
   - **Active (2)**: Casey Wilson, Blake Peterson (or "Finalists (2)")
   - **Jury**: Riley Johnson (plus previous jury members)
5. Game transitions to Jury Questioning with correct Final 2

---

## Testing Steps

After the fix:
1. Start or load a game at Final 3
2. Complete all three parts of Final HoH
3. As the Final HoH, select one houseguest for Final 2
4. Verify the third houseguest moves to Jury (not stuck as Active)
5. Verify game transitions to Jury Questioning phase
