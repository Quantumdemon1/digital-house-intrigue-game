

# New Avatar Animation System Design

## Lessons Learned from the Glitch

The previous system failed because:
1. **Bone cache contamination** - Multiple avatars shared bone references
2. **Race conditions** - Animation controllers initialized before clones were ready
3. **Complex layer blending** - Too many systems fighting for bone control
4. **Unsafe math** - Spring physics could produce NaN or extreme values

---

## New Architecture: Simplified & Isolated

### Core Principles

1. **Zero shared state** - Each avatar owns its animation data completely
2. **Single source of truth** - One system applies bones per frame, no blending conflicts
3. **Fail-safe math** - All calculations clamped and validated
4. **Progressive enhancement** - Start simple, add complexity only if stable

---

## Phase 1: Static Poses (Foundation)

### Pose Library

| Pose Name | Description | Use Case |
|-----------|-------------|----------|
| `neutral` | Arms slightly forward, relaxed | Default fallback |
| `relaxed` | Arms at sides, natural stance | Idle standing |
| `confident` | Chest out, hands on hips | HoH, competition winner |
| `defensive` | Arms crossed | Nominated, threatened |
| `open` | Palms up, welcoming | Friendly interaction |

### Implementation

```text
Apply pose ONCE during clone creation:
┌─────────────────────────────────────────┐
│ useMemo(() => {                         │
│   const clone = SkeletonUtils.clone()   │
│   applyStaticPose(clone, poseType)      │
│   return clone                          │
│ })                                      │
└─────────────────────────────────────────┘
No useFrame, no animation loop
```

---

## Phase 2: Breathing Animation (Micro-motion)

### Simple Sine-Based Breathing

Instead of complex spring physics, use a simple deterministic sine wave:

```text
Breathing only affects:
- Spine: subtle forward/back tilt (±0.02 radians)
- Chest: subtle expansion (±0.01 radians)

Formula:
breathOffset = sin(time * breathRate + phaseOffset) * amplitude

Each avatar gets unique phaseOffset from their ID
```

### Safety Features

- Amplitude hard-capped at 0.05 radians
- Delta time clamped between 0.001 and 0.1
- NaN check before applying any rotation

---

## Phase 3: Weight Shift (Idle Variation)

### Subtle Hip Sway

```text
Weight shift (slower than breathing):
- Hips: side-to-side tilt (±0.03 radians)
- Opposite shoulder compensation

Frequency: ~0.2 Hz (one cycle every 5 seconds)
```

---

## Phase 4: Blink System (Expression)

### Morph Target Animation

```text
Blink pattern:
- Random interval: 2-6 seconds
- Duration: 150ms
- Curve: Quick close (30%), hold (20%), slow open (50%)

Morphs affected:
- eyeBlinkLeft
- eyeBlinkRight
```

---

## Phase 5: Head Look-At (Optional)

### Simplified Look-At

```text
Instead of complex eye-lead behavior:
- Head rotates toward target (clamped ±45°)
- Smooth interpolation (lerp factor: 0.05)
- No neck/spine chain - head only
```

---

## Phase 6: Emotes (Triggered Animations)

### Emote Library

| Emote | Trigger | Duration | Bones Affected |
|-------|---------|----------|----------------|
| `wave` | Greeting | 2s | Right arm |
| `nod` | Agreement | 1s | Head |
| `shrug` | Confusion | 1.5s | Shoulders, arms |
| `celebrate` | Victory | 3s | Both arms |
| `facepalm` | Frustration | 2s | Right arm, head |
| `point` | Accusation | 1.5s | Right arm |
| `clap` | Applause | 2s | Both arms |
| `thumbsUp` | Approval | 1s | Right arm |

### Emote Implementation

```text
Emotes are keyframe-based, NOT physics-based:
┌────────────────────────────────────────────────────┐
│ Keyframe approach:                                 │
│ - Define start/peak/end poses                      │
│ - Interpolate between keyframes                    │
│ - Blend with base pose using weight (0-1)          │
│ - Return to base pose when complete                │
└────────────────────────────────────────────────────┘
```

---

## New File Structure

```text
src/components/avatar-3d/animation/
├── poses/
│   ├── PoseLibrary.ts        # Static pose definitions
│   └── applyPose.ts          # One-time pose application
├── micro/
│   ├── BreathingSystem.ts    # Sine-based breathing
│   └── WeightShift.ts        # Idle weight shift
├── expressions/
│   ├── BlinkSystem.ts        # Morph-based blinking
│   └── MoodExpressions.ts    # Smile, frown, etc.
├── emotes/
│   ├── EmoteLibrary.ts       # Keyframe definitions
│   ├── EmotePlayer.ts        # Plays emote sequences
│   └── emotes/
│       ├── wave.ts
│       ├── nod.ts
│       ├── shrug.ts
│       └── ...
├── lookAt/
│   └── SimpleLookAt.ts       # Head-only look-at
└── AvatarAnimator.ts         # Single entry point
```

---

## Single Controller Design

### `useAvatarAnimator` Hook

```text
interface AvatarAnimatorConfig {
  clone: THREE.Group | null;
  instanceId: string;
  
  // Optional features (default: false)
  enableBreathing?: boolean;
  enableBlinking?: boolean;
  enableLookAt?: boolean;
  
  // State
  basePose?: PoseType;
  mood?: MoodType;
  lookAtTarget?: THREE.Vector3 | null;
  
  // Emotes
  emoteToPlay?: EmoteType | null;
  onEmoteComplete?: () => void;
}
```

### Frame Update Order

```text
Each frame (if enabled):
1. Calculate breathing offset → add to spine
2. Calculate weight shift offset → add to hips
3. Calculate look-at rotation → set head
4. If emote playing → blend emote with above
5. Update blink morph targets

Single apply step - no conflicts
```

---

## Safety Guarantees

### Isolation

```text
Each avatar instance owns:
- Its own bone references (from its clone)
- Its own animation state object
- Its own phase offsets

No shared refs, no shared state
```

### Math Safety

```text
Before any bone.rotation.set():
- isFinite() check on all values
- Clamp to safe range (e.g., ±π for most bones)
- Skip frame if any value is NaN
```

### Graceful Degradation

```text
If any error occurs:
- Log warning (don't throw)
- Skip animation for that frame
- Avatar remains in last valid pose
```

---

## Implementation Phases

| Phase | Feature | Risk Level | Priority |
|-------|---------|------------|----------|
| 1 | Static poses only | Very Low | First |
| 2 | Breathing (sine) | Low | Second |
| 3 | Blinking (morphs) | Low | Third |
| 4 | Weight shift | Low | Fourth |
| 5 | Simple look-at | Medium | Fifth |
| 6 | Emotes | Medium | Sixth |

---

## Summary

The new system prioritizes:
1. **Simplicity** - No complex physics, just math
2. **Isolation** - Each avatar is completely independent
3. **Safety** - All calculations validated
4. **Modularity** - Enable features incrementally
5. **Debuggability** - Easy to disable any layer

