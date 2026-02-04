
# Plan: Consistent Avatar Components Across the Application

## Overview

This plan addresses avatar icon inconsistencies throughout the Big Brother game application. The goal is to ensure all houseguest avatars display consistently with proper support for custom images, status badges, and player indicators.

---

## Problem Analysis

### Current Issues Found

1. **Multiple Avatar Components with Overlapping Functionality:**
   - `HouseguestAvatar.tsx` - Basic component, no image support
   - `StatusAvatar.tsx` - Has image support via `imageUrl` prop
   - `EnhancedAvatar.tsx` - Feature-rich but no image support
   - `NetworkNode.tsx` - SVG-based, uses `avatarUrl`

2. **Inconsistent Property Naming:**
   - Houseguest model uses `avatarUrl`
   - StatusAvatar component expects `imageUrl`
   - Some components pass nothing for images

3. **Plain DIV Avatars in Some Components:**
   - `JuryVoting.tsx` uses gray divs with initials instead of avatar components
   - `SelectReplacementStage.tsx` uses gray divs with initials

4. **Missing Image Propagation:**
   - Many components use `StatusAvatar` but don't pass `imageUrl` or `avatarUrl`
   - Components like `CompetitionInitial.tsx` show avatars without images

---

## Part 1: Standardize Property Names

### Modify: `src/components/ui/status-avatar.tsx`

Update to accept both `imageUrl` and `avatarUrl` for backward compatibility:

```typescript
interface StatusAvatarProps {
  name: string;
  status?: AvatarStatus;
  size?: AvatarSize;
  showBadge?: boolean;
  className?: string;
  imageUrl?: string;    // Keep for backward compatibility
  avatarUrl?: string;   // Add support for model's property name
  isPlayer?: boolean;
  animated?: boolean;
}

// In component:
const actualImageUrl = imageUrl || avatarUrl;
```

---

## Part 2: Update Components to Pass Image URLs

### Files to Update (High Priority):

| File | Issue | Fix |
|------|-------|-----|
| `CompetitionInitial.tsx` | StatusAvatar without image | Pass `imageUrl={houseguest.avatarUrl}` |
| `CompetitionResults.tsx` | Winner avatar without image | Pass `imageUrl={winner.avatarUrl}` |
| `POVCompetition/InitialStage.tsx` | Missing image | Pass `imageUrl={player.avatarUrl}` |
| `NomineeSelector.tsx` | Missing image | Already passes `imageUrl` |
| `KeyCeremony.tsx` | Some avatars missing image | Add `imageUrl={houseguest.avatarUrl}` where missing |
| `EvictionResults.tsx` | Some avatars missing image | Verify all have `imageUrl` |
| `GameSidebar.tsx` | HoH/PoV/Nominee avatars | Pass `imageUrl={houseguest.avatarUrl}` |
| `HouseguestCardCompact.tsx` | Missing image | Pass `imageUrl={houseguest.avatarUrl}` |
| `HouseguestCard.tsx` | Missing image | Pass `imageUrl={houseguest.avatarUrl}` |

---

## Part 3: Replace Plain DIV Avatars

### Modify: `src/components/game-phases/FinalePhase/JuryVoting.tsx`

Replace gray div avatars with StatusAvatar:

**Lines 164-165 (finalists display):**
```tsx
// Before:
<div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-3">
  {finalist.name.charAt(0)}
</div>

// After:
<StatusAvatar
  name={finalist.name}
  imageUrl={finalist.avatarUrl}
  size="lg"
  isPlayer={finalist.isPlayer}
/>
```

**Lines 192-194 (juror list):**
```tsx
// Before:
<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
  {juror.name.charAt(0)}
</div>

// After:
<StatusAvatar
  name={juror.name}
  imageUrl={juror.avatarUrl}
  size="sm"
/>
```

### Modify: `src/components/game-phases/POVMeeting/stages/SelectReplacementStage.tsx`

**Lines 103-105:**
```tsx
// Before:
<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
  {houseguest.name.charAt(0)}
</div>

// After:
<StatusAvatar
  name={houseguest.name}
  imageUrl={houseguest.avatarUrl}
  size="sm"
/>
```

---

## Part 4: Consistent "YOU" Badge Styling

### Standardize Across All Avatar Components

The "YOU" badge should be:
- **Color:** `bg-bb-green` (green, indicating player)
- **Position:** Bottom center of avatar
- **Style:** Small rounded pill with white text

Ensure consistency in:
- `StatusAvatar.tsx` - Line 180-188
- `EnhancedAvatar.tsx` - Lines 221-228
- `NetworkNode.tsx` - Lines 233-258
- `AvatarPreview.tsx` - Lines 149-157

Current `StatusAvatar` uses `bg-bb-green` - this is correct.
`NetworkNode` uses `bg-bb-blue` - should change to green for consistency.

### Modify: `src/components/social-network/NetworkNode.tsx`

```tsx
// Line 244: Change from bb-blue to bb-green
<rect
  x={position.x - 16}
  y={position.y - sizeConfig.node / 2 - 18}
  width={32}
  height={14}
  rx={7}
  fill="hsl(var(--bb-green))"  // Changed from bb-blue
/>
```

---

## Part 5: Update EnhancedAvatar to Support Images

### Modify: `src/components/houseguest/EnhancedAvatar.tsx`

Add image support to match StatusAvatar:

```typescript
interface EnhancedAvatarProps {
  houseguest: Houseguest;
  size?: AvatarSize;
  status?: AvatarStatus;
  showMood?: boolean;
  showStatus?: boolean;
  showBadge?: boolean;
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}

// In the render, use houseguest.avatarUrl:
{houseguest.avatarUrl ? (
  <img 
    src={houseguest.avatarUrl} 
    alt={houseguest.name}
    className="absolute inset-0 w-full h-full object-cover"
  />
) : (
  <>
    {/* Gradient background */}
    <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
    {/* ... existing gradient content ... */}
  </>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/status-avatar.tsx` | Add `avatarUrl` prop alias |
| `src/components/houseguest/EnhancedAvatar.tsx` | Add image support |
| `src/components/houseguest/HouseguestCardCompact.tsx` | Pass `imageUrl` |
| `src/components/houseguest/HouseguestCard.tsx` | Pass `imageUrl` |
| `src/components/game-screen/GameSidebar.tsx` | Pass `imageUrl` to all StatusAvatars |
| `src/components/game-phases/HOHCompetition/CompetitionInitial.tsx` | Pass `imageUrl` |
| `src/components/game-phases/HOHCompetition/CompetitionResults.tsx` | Pass `imageUrl` |
| `src/components/game-phases/POVCompetition/InitialStage.tsx` | Pass `imageUrl` |
| `src/components/game-phases/FinalePhase/JuryVoting.tsx` | Replace gray divs with StatusAvatar |
| `src/components/game-phases/POVMeeting/stages/SelectReplacementStage.tsx` | Replace gray div with StatusAvatar |
| `src/components/game-phases/NominationPhase/KeyCeremony.tsx` | Add missing `imageUrl` props |
| `src/components/game-phases/EvictionPhase/VoterDisplay.tsx` | Already passes imageUrl |
| `src/components/social-network/NetworkNode.tsx` | Change "YOU" badge to green |

---

## Summary of Changes

1. **StatusAvatar** gets `avatarUrl` prop alias for consistency with model
2. **EnhancedAvatar** gets image support using `houseguest.avatarUrl`
3. **15+ components** updated to pass `imageUrl={houseguest.avatarUrl}`
4. **2 components** with plain gray divs replaced with proper StatusAvatar
5. **NetworkNode** "YOU" badge color changed from blue to green for consistency
6. All player avatars will consistently show:
   - Custom uploaded/generated images when available
   - Trait-based gradient fallback when no image
   - Green "YOU" badge at bottom center
   - Appropriate status badges (HoH/PoV/Nominee) when applicable
