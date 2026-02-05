

# Refine Avatar Gesture and Emote System

## Issues Identified

### 1. AvatarAnimator.ts - Gesture System Issues

| Problem | Impact | Cause |
|---------|--------|-------|
| **Gesture weight not used for blending in** | Abrupt start, gestures "pop" on | Only blend-out uses easing, blend-in has no ramp |
| **No validation on gestureToPlay changes** | Gestures can stack/overlap incorrectly | Missing debounce or "busy" check |
| **Base rotations captured once** | If pose changes, gestures blend to wrong target | `baseRotations` set during init, never updated |
| **onGestureComplete callback timing** | Fires during blend-out, not after | Callback in wrong location in update cycle |

### 2. RPMAvatar.tsx - Minor Issues

| Problem | Impact |
|---------|--------|
| Unused props in interface | Confusion - `enableGestures` prop does nothing |
| Missing gesture busy state | Can't tell if gesture is playing externally |

### 3. PlayerEmoteMenu.tsx - UX Issues

| Problem | Impact |
|---------|--------|
| **No visual feedback for active gesture** | User doesn't know gesture is playing |
| **Buttons don't disable during gesture** | User can spam multiple gestures |
| **Menu title at bottom** | Awkward - should be at top like header |
| **Missing close/cancel button** | No way to dismiss menu without selecting something |
| **Icons don't visually match gestures** | HelpCircle for Shrug is confusing |

### 4. HouseScene.tsx - Integration Issues

| Problem | Impact |
|---------|--------|
| **No isGesturePlaying state** | Can't disable emote buttons while playing |
| **Menu position blocks camera** | Bottom-center can obstruct view of avatar |
| **Deselection clears gesture mid-play** | Clicking away interrupts gesture abruptly |

---

## Refinement Plan

### Phase 1: Fix Gesture Blending in AvatarAnimator.ts

**Problem**: Gestures start abruptly without blend-in weight ramping.

**Solution**: Add blend-in phase to match blend-out:

```typescript
// Add to GestureDefinition (in GestureLayer.ts)
blendInDuration: number;  // e.g., 0.15 seconds

// In updateGesture:
// Calculate blend-in weight
if (elapsed < definition.blendInDuration) {
  weight *= easeInOutQuad(elapsed / definition.blendInDuration);
}
```

**Also fix**: Move `onGestureComplete` callback to fire AFTER blend-out completes (currently fires during).

### Phase 2: Add Busy State and Improve Callback

**In AvatarAnimator**:
- Return `isGesturePlaying` from hook for external use
- Add proper gesture completion callback that fires at the right time

**Change hook signature**:
```typescript
export function useAvatarAnimator(config: AvatarAnimatorConfig): {
  isGesturePlaying: boolean;
}
```

### Phase 3: Enhance PlayerEmoteMenu.tsx

**Improvements**:
1. Add `isPlaying` prop to disable buttons during gesture
2. Move title to top as header
3. Add visual highlight on active/playing gesture
4. Add subtle "X" close button in corner
5. Improve icon choices for clarity

**New Props**:
```typescript
interface PlayerEmoteMenuProps {
  isVisible: boolean;
  isPlaying?: boolean;        // New: disable buttons during gesture
  currentGesture?: GestureType | null;  // New: highlight active
  onEmote: (gesture: GestureType) => void;
  onMove: () => void;
  onClose?: () => void;       // New: close button callback
}
```

**Better Icons**:
- Shrug: `Shoulder` → just use `HelpCircle` but style differently, or custom shrug emoji
- Celebrate: `PartyPopper` is good
- Consider using emoji fallbacks: 👋 🎉 👍 🤷 🎊 👆

### Phase 4: Update HouseScene.tsx Integration

**Add gesture state tracking**:
```typescript
const [isGesturePlaying, setIsGesturePlaying] = useState(false);

const handlePlayerEmote = useCallback((gesture: GestureType) => {
  setPlayerEmoteGesture(gesture);
  setIsGesturePlaying(true);  // Mark as playing
}, []);

const handlePlayerEmoteComplete = useCallback(() => {
  setPlayerEmoteGesture(null);
  setIsGesturePlaying(false);  // Clear playing state
  onGestureComplete?.();
}, [onGestureComplete]);
```

**Pass to menu**:
```tsx
<PlayerEmoteMenu
  isVisible={isPlayerSelected && !moveMode}
  isPlaying={isGesturePlaying}
  currentGesture={playerEmoteGesture}
  onEmote={handlePlayerEmote}
  onMove={handleMoveButtonClick}
  onClose={() => onSelect('')}  // Deselect to close
/>
```

### Phase 5: Improve Gesture Keyframes (GestureLayer.ts)

**Add `blendInDuration` to all gestures**:
- Quick gestures (nod, headShake): 0.1s
- Medium gestures (wave, thumbsUp): 0.15s  
- Expressive gestures (celebrate, welcome): 0.2s

---

## Files to Modify

| File | Changes |
|------|---------|
| `GestureLayer.ts` | Add `blendInDuration` to GestureDefinition, update all gestures |
| `AvatarAnimator.ts` | Add blend-in weight calculation, fix callback timing, return isGesturePlaying |
| `RPMAvatar.tsx` | Clean up unused props, expose gesture state if needed |
| `PlayerEmoteMenu.tsx` | Add isPlaying/currentGesture props, move title, add close button, disable during play |
| `HouseScene.tsx` | Track isGesturePlaying state, pass to menu, handle close |

---

## Visual Improvements Summary

### Before (Current)
- Gestures pop on abruptly
- Buttons always clickable, spammable
- Menu has title at bottom
- No visual feedback for active gesture
- No way to close menu

### After (Refined)
- Smooth blend-in over 0.1-0.2s
- Buttons disabled + grayed out during gesture
- Title at top: "Your Actions"
- Active button highlighted with ring/glow
- X button in corner to dismiss

---

## Technical Notes

### Blend-in Implementation Detail

In `GestureLayer.ts`, modify `updateGesture`:

```typescript
// Current: only blend-out
if (state.blendingOut) {
  weight = 1 - easeInOutQuad(blendOutProgress);
}

// Add: blend-in
if (!state.blendingOut && elapsed < definition.blendInDuration) {
  const blendInProgress = elapsed / definition.blendInDuration;
  weight = easeInOutQuad(blendInProgress);
}
```

### Callback Timing Fix

Move `onComplete?.()` from blend-out check to full completion:

```typescript
// Instead of calling during blend-out progress check,
// call only when blendOutProgress >= 1 (gesture fully done)
```

