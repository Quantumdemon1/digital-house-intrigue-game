
# Player Avatar Movement and Actions Analysis

## Current Capabilities

### What the Player Avatar CAN Do (Technically)

| Feature | Implementation Status | Works? |
|---------|----------------------|--------|
| **Walking to spots** | `useAvatarMovement` hook + `PlayerMovementController` | ✅ Yes - but requires "move mode" |
| **Gestures** | `GestureLayer.ts` with 16+ gestures | ❌ Not exposed to player |
| **Idle animations** | Breathing, weight shift, blinking via `AvatarAnimator` | ✅ Yes |
| **Static poses** | 5 pose types (relaxed, confident, defensive, etc.) | ✅ Yes |

### Available Gestures in the System (Not Accessible to Player)

The `GestureLayer.ts` has these defined gestures:
- `wave` - Wave hand greeting
- `nod` - Head nod agreement
- `shrug` - Shoulder shrug
- `clap` - Applause
- `point` - Point forward
- `thumbsUp` - Thumbs up
- `headShake` - Disagree head shake
- `celebrate` - Victory celebration
- `thinkingPose` - Hand on chin thinking
- `welcome` - Open arms welcome
- `dismiss` - Dismissive wave
- `listenNod` - Attentive listening nods
- `walk` - Walking animation (used for movement)
- `armFold`, `shoulderRoll`, `armStretch`, `handCheck` - Idle NPC gestures

---

## Problems Identified

### 1. Player Arm Gestures Don't Work
**Root Cause**: The `RPMAvatar` component receives `gestureToPlay` prop but **does not pass it to the AnimationController**.

Looking at `RPMAvatar.tsx` (lines 116-143), the `RPMAvatarInner` component:
- Uses `useAvatarAnimator` which only handles micro-animations (breathing, blinking, weight shift)
- Does NOT use `useAnimationController` which handles gestures
- The `gestureToPlay` prop is accepted but never consumed

The NPC idle gestures work because they use `useIdleGestures` in `HouseScene.tsx`, but this hook was only added for NPCs, not for player gesture input.

### 2. No Action/Emote Menu for Player
There's a `CharacterQuickActions.tsx` but it's for clicking on OTHER characters (Chat, Ally, Info buttons). There's no equivalent for the PLAYER'S OWN avatar to trigger emotes.

### 3. Movement Requires Hidden Activation
- Long-press activates "move mode" 
- Floor spots only appear when move mode is active
- Not intuitive - users don't know they can move

---

## Solution: Player Action Menu + Fix Gesture System

### Phase 1: Fix Player Gesture Execution

**Problem**: `RPMAvatarInner` doesn't use the `AnimationController` that handles gestures.

**Fix**: In `HouseScene.tsx`, the `gestureToPlay` is passed to `RPMAvatar`, but `RPMAvatar` doesn't use the `AnimationController`. We need to either:

1. Add `useAnimationController` to `RPMAvatar` when `enableGestures=true`
2. OR extend `useAvatarAnimator` to support gestures

The second option is cleaner since `useAvatarAnimator` is already the unified hook.

### Phase 2: Create Player Emote Menu

Create a new `PlayerEmoteMenu.tsx` component that appears when the player selects their own avatar:

```text
┌─────────────────────────────────────┐
│     [Wave] [Clap] [ThumbsUp]        │
│     [Shrug] [Point] [Celebrate]     │
│                                     │
│     [Move] ← activates move mode    │
└─────────────────────────────────────┘
```

### Phase 3: Improve Movement UX

- Show a "Move" button in the player emote menu
- OR allow clicking floor directly when player is selected
- Add visible floor indicators for walkable areas

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/avatar-3d/animation/AvatarAnimator.ts` | Add gesture support to unified hook |
| `src/components/avatar-3d/RPMAvatar.tsx` | Pass gesture props to animator |
| `src/components/avatar-3d/PlayerEmoteMenu.tsx` | **NEW** - Emote selection UI |
| `src/components/avatar-3d/HouseScene.tsx` | Show PlayerEmoteMenu when player selected |

---

## Implementation Details

### 1. Add Gesture Support to AvatarAnimator

```typescript
// In AvatarAnimator.ts
export interface AvatarAnimatorConfig {
  // ...existing config
  gestureToPlay?: GestureType | null;
  onGestureComplete?: () => void;
}

// In useAvatarAnimator hook:
// - Import gesture layer functions
// - Track gesture state in stateRef
// - Update gesture in useFrame
// - Apply gesture bones with blending
```

### 2. Create PlayerEmoteMenu Component

```typescript
interface PlayerEmoteMenuProps {
  isVisible: boolean;
  onEmote: (gesture: GestureType) => void;
  onMove: () => void;
  className?: string;
}

const PLAYER_EMOTES = [
  { id: 'wave', icon: Hand, label: 'Wave' },
  { id: 'clap', icon: Sparkles, label: 'Clap' },
  { id: 'thumbsUp', icon: ThumbsUp, label: 'Like' },
  { id: 'shrug', icon: HelpCircle, label: 'Shrug' },
  { id: 'celebrate', icon: PartyPopper, label: 'Celebrate' },
  { id: 'point', icon: ArrowRight, label: 'Point' },
];
```

### 3. Integrate in HouseScene

When `selectedId === playerId`:
- Show `PlayerEmoteMenu` instead of `CharacterQuickActions`
- Handle emote selection by setting `playerGesture` state
- Show move button that activates `moveMode`

---

## Expected Result

1. **Player selects their avatar** → Emote menu appears with gesture buttons
2. **Player clicks emote** → Avatar performs the gesture with arm/body movement
3. **Player clicks Move** → Floor spots appear, player can tap to relocate
4. **Gestures complete** → Avatar returns to relaxed idle pose
