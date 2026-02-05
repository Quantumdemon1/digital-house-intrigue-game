
# Visual Enhancement for Ceremony and Competition Screens

## Problem

The ceremony and competition screens (Nomination, Eviction, etc.) display text placeholders instead of profile photos because they incorrectly pass `houseguest.imageUrl` (which is often empty) instead of `houseguest.avatarUrl` (which contains the captured profile photo).

The sidebar's "Current Power" section works correctly because it uses `imageUrl={houseguest.avatarUrl}`.

---

## Solution

Update all ceremony and competition components to consistently use `avatarUrl` when passing image data to `StatusAvatar`.

---

## Files to Update

| File | Current Issue | Fix |
|------|--------------|-----|
| `NominationCeremonyResult.tsx` | Uses `imageUrl={nominee.imageUrl}` | Change to `avatarUrl={nominee.avatarUrl}` |
| `KeyCeremony.tsx` | Uses `imageUrl={hoh.avatarUrl}` (correct) and `imageUrl={nominee.avatarUrl}` (correct) | Already correct, but verify consistency |
| `NominationPhase/index.tsx` | Complete stage shows initials only | Add `StatusAvatar` with `avatarUrl` |
| `EvictionResults.tsx` | Uses `imageUrl={houseguest.imageUrl}` | Change to `avatarUrl={houseguest.avatarUrl}` |
| `NomineeDisplay.tsx` | Uses `imageUrl={nominee.imageUrl}` | Change to `avatarUrl={nominee.avatarUrl}` |
| `HOHCompetition/CompetitionResults.tsx` | Uses `imageUrl={winner.avatarUrl}` | Verify correct |
| `NomineeSelector.tsx` | Check if using correct prop | Update if needed |

---

## Detailed Changes

### 1. NominationCeremonyResult.tsx (Lines 73-79)

Change:
```tsx
<StatusAvatar
  name={nominee.name}
  imageUrl={nominee.imageUrl}  // Wrong
  status="nominee"
  ...
/>
```

To:
```tsx
<StatusAvatar
  name={nominee.name}
  avatarUrl={nominee.avatarUrl}  // Correct
  status="nominee"
  ...
/>
```

### 2. EvictionResults.tsx (Multiple locations)

Update all `StatusAvatar` calls that use `imageUrl={houseguest.imageUrl}` to use `avatarUrl={houseguest.avatarUrl}`.

There are approximately 8 instances in this file.

### 3. NomineeDisplay.tsx (Lines 21-26)

Change `imageUrl={nominee.imageUrl}` to `avatarUrl={nominee.avatarUrl}`.

### 4. NominationPhase/index.tsx (Lines 261-268)

The "complete" stage shows initials in a circle. Replace with `StatusAvatar`:

```tsx
// Before - just initials
<div className="w-16 h-16 rounded-full bg-bb-red/20 border-2 border-bb-red flex items-center justify-center mb-2">
  <span className="text-2xl font-bold text-bb-red">
    {nominee.name.charAt(0)}
  </span>
</div>

// After - proper avatar
<StatusAvatar
  name={nominee.name}
  avatarUrl={nominee.avatarUrl}
  status="nominee"
  size="lg"
/>
```

---

## Summary

This is a prop naming consistency fix. The houseguest model stores the captured profile photo in `avatarUrl`, but some older ceremony components were looking for `imageUrl` which is typically empty.

After these changes, all ceremony screens will display proper profile photos matching the sidebar's "Current Power" section.
