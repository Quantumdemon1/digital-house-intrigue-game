
# Add Basic Arm Movements for Avatars

## Overview

Add simple, random arm gestures that NPCs perform autonomously during idle time in the House View. This creates more visual interest and makes characters feel alive without requiring complex AI behavior.

## Current State

- Avatars have static poses with subtle breathing/idle micro-movements
- Gestures (wave, thumbs up, shrug, etc.) exist but only trigger on player action
- No autonomous NPC movement or gestures

## Solution: Autonomous Idle Gestures

Add a lightweight system that randomly triggers small arm gestures on NPCs during idle time.

---

## Implementation Plan

### 1. Create Idle Gesture Trigger Hook

**New file**: `src/components/avatar-3d/hooks/useIdleGestures.ts`

A hook that:
- Takes character ID and whether they're the player
- Randomly selects from a subset of subtle gestures
- Triggers gestures at random intervals (every 5-15 seconds)
- Returns the current gesture to play

```typescript
const IDLE_GESTURES: GestureType[] = ['nod', 'shrug', 'thinkingPose', 'listenNod'];
const MIN_INTERVAL = 8000; // 8 seconds
const MAX_INTERVAL = 20000; // 20 seconds

export function useIdleGestures(characterId: string, isPlayer: boolean): GestureType | null
```

### 2. Add New Subtle Arm Gestures

**Modify**: `src/components/avatar-3d/animation/layers/GestureLayer.ts`

Add new subtle gestures designed for idle animation:
- `armFold`: Briefly crosses arms then returns
- `handCheck`: Looks at hand/nails briefly
- `shoulderRoll`: Subtle shoulder adjustment
- `armStretch`: Light arm stretch

These will be shorter (0.8-1.2s) and blend naturally with the idle pose.

### 3. Integrate into HouseCharacter

**Modify**: `src/components/avatar-3d/HouseCharacter.tsx`

- Import and use the `useIdleGestures` hook for non-player characters
- Pass the idle gesture to the animation controller alongside any player gesture

---

## Technical Details

### Gesture Selection Logic

```typescript
// Personality influences gesture frequency
const getGestureInterval = (traits: string[]) => {
  const isExtrovert = traits.includes('Social') || traits.includes('Charismatic');
  const baseMin = isExtrovert ? 6000 : 10000;
  const baseMax = isExtrovert ? 15000 : 25000;
  return baseMin + Math.random() * (baseMax - baseMin);
};
```

### Gesture Conflict Prevention

- If player triggers a gesture while NPC idle gesture is playing, player gesture takes priority
- NPCs don't start new gestures if they're in conversation (selected by player)

---

## New Files

| File | Purpose |
|------|---------|
| `src/components/avatar-3d/hooks/useIdleGestures.ts` | Hook for autonomous gesture triggering |

## Modified Files

| File | Change |
|------|--------|
| `GestureLayer.ts` | Add 3-4 new subtle arm gestures |
| `HouseCharacter.tsx` | Integrate idle gestures for NPCs |
| `types.ts` | Add new gesture types |

---

## Expected Result

- NPCs will occasionally perform subtle gestures while standing idle
- Creates more lively, dynamic feel in the House View
- Player gestures still work and take priority
- Performance impact minimal (one timer per character)
