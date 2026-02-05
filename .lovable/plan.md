
# Plan: Complete Avatar Enhancement System - Gestures, Expressions, Eye Tracking & Player Controls

## Overview

This plan implements a comprehensive avatar enhancement system for the House View, adding:
1. **Player Avatar Controls Panel** - UI to trigger gestures and select characters for socializing
2. **Gesture Animation System** - Waving, nodding, shrugging, clapping, pointing
3. **Mood-Reactive Expressions** - Curiosity, jealousy, surprise, admiration based on selection context
4. **Independent Eye Tracking** - Eyes follow targets separately from head rotation

---

## 1. Gesture Animation System

### New Hook: `useGestureAnimation.ts`

Creates a gesture system using bone keyframe animations:

| Gesture | Bones Involved | Duration | Trigger |
|---------|---------------|----------|---------|
| `wave` | RightArm, RightForeArm, RightHand | 1.5s | Player action / greeting |
| `nod` | Head, Neck | 0.8s | Agreement / acknowledgment |
| `shrug` | LeftArm, RightArm, Spine | 1.2s | Uncertainty |
| `clap` | Both Arms, Hands | 2.0s | Celebration |
| `point` | RightArm, RightForeArm, RightHand | 1.0s | Directing attention |
| `thumbsUp` | RightArm, RightHand | 1.2s | Approval |

**Keyframe Structure:**
```typescript
interface GestureKeyframe {
  time: number;  // 0-1 normalized progress
  bones: Record<string, { x: number; y: number; z: number }>;
}

const WAVE_GESTURE: GestureKeyframe[] = [
  { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 } } },  // Start
  { time: 0.2, bones: { RightArm: { x: -1.0, y: 0.3, z: -0.5 } } },  // Arm up
  { time: 0.35, bones: { RightHand: { x: 0, y: 0.5, z: 0 } } },  // Wave left
  { time: 0.5, bones: { RightHand: { x: 0, y: -0.5, z: 0 } } },  // Wave right
  // ... continue wave cycles
  { time: 1.0, bones: { /* return to idle */ } },
];
```

**Hook Interface:**
```typescript
const useGestureAnimation = (
  scene: THREE.Object3D | null,
  options: {
    enabled: boolean;
    onComplete?: () => void;
  }
) => {
  const playGesture = (gesture: GestureType) => { ... };
  const isPlaying = ref<boolean>;
  const currentGesture = ref<GestureType | null>;
  
  return { playGesture, isPlaying, currentGesture };
};
```

---

## 2. Mood-Reactive Expression System

### New Hook: `useReactiveExpressions.ts`

Applies facial expressions based on social context (who is selected):

| Context | Expression | Morph Targets |
|---------|-----------|---------------|
| Player selects ally | `admiration` | Soft smile, relaxed brows, slight head tilt |
| Player selects rival | `jealousy` | Narrowed eyes, slight frown, tense jaw |
| Player selects self | `confidence` | Raised chin, subtle smile, wide eyes |
| NPC selected (neutral) | `curiosity` | Raised brows, wide eyes, slight head turn |
| Nominee selected | `concern` | Furrowed brow, slight frown |
| HoH selected | `respect` | Neutral but attentive, direct gaze |

**Expression Morph Configurations:**
```typescript
const REACTIVE_EXPRESSIONS = {
  curiosity: {
    browInnerUp: 0.5,
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
    eyeWideLeft: 0.4,
    eyeWideRight: 0.4,
    mouthSmileLeft: 0.1,
    mouthSmileRight: 0.1,
  },
  jealousy: {
    browDownLeft: 0.4,
    browDownRight: 0.4,
    eyeSquintLeft: 0.5,
    eyeSquintRight: 0.5,
    mouthFrownLeft: 0.25,
    mouthFrownRight: 0.25,
    noseSneerLeft: 0.15,
    noseSneerRight: 0.15,
  },
  // ... more expressions
};
```

**Relationship Integration:**
- Query houseguest's relationship score with selected character
- High positive = admiration, high negative = jealousy
- Neutral = curiosity
- Transitions smoothly over 0.5s

---

## 3. Independent Eye Tracking System

### New Hook: `useEyeTracking.ts`

Uses RPM's eye blendshapes to make eyes follow targets independently:

**Available Eye Morph Targets (ARKit 52):**
- `eyeLookUpLeft`, `eyeLookUpRight` - Eyes look up
- `eyeLookDownLeft`, `eyeLookDownRight` - Eyes look down  
- `eyeLookInLeft`, `eyeLookInRight` - Eyes look inward (toward nose)
- `eyeLookOutLeft`, `eyeLookOutRight` - Eyes look outward

**Tracking Logic:**
```typescript
const useEyeTracking = (
  skinnedMeshes: THREE.SkinnedMesh[],
  config: {
    targetPosition: THREE.Vector3 | null;
    characterPosition: [number, number, number];
    characterRotationY: number;
    maxAngle: number;  // ~30 degrees eye rotation limit
    enabled: boolean;
  }
) => {
  useFrame(() => {
    // Calculate direction to target
    const direction = target.clone().sub(eyePosition);
    
    // Convert to horizontal (left/right) and vertical (up/down) angles
    const horizontalAngle = Math.atan2(direction.x, direction.z) - charRotY;
    const verticalAngle = Math.atan2(direction.y, horizontalDist);
    
    // Map to morph target values (0-1)
    if (horizontalAngle > 0) {
      // Looking right: use eyeLookOutLeft + eyeLookInRight
      setMorph('eyeLookOutLeft', clamp(horizontalAngle / maxAngle, 0, 1));
      setMorph('eyeLookInRight', clamp(horizontalAngle / maxAngle, 0, 1));
    } else {
      // Looking left: use eyeLookInLeft + eyeLookOutRight
      setMorph('eyeLookInLeft', clamp(-horizontalAngle / maxAngle, 0, 1));
      setMorph('eyeLookOutRight', clamp(-horizontalAngle / maxAngle, 0, 1));
    }
    
    // Vertical tracking
    if (verticalAngle > 0) {
      setMorph('eyeLookUpLeft', clamp(verticalAngle / maxAngle, 0, 1));
      setMorph('eyeLookUpRight', clamp(verticalAngle / maxAngle, 0, 1));
    } else {
      setMorph('eyeLookDownLeft', clamp(-verticalAngle / maxAngle, 0, 1));
      setMorph('eyeLookDownRight', clamp(-verticalAngle / maxAngle, 0, 1));
    }
  });
};
```

**Features:**
- Eyes track faster than head (instant vs 0.05 lerp)
- Random micro-saccades for realism (tiny eye movements)
- Occasional "look away then back" patterns
- Blends with existing blink animation

---

## 4. Player Avatar Controls UI

### New Component: `AvatarControlPanel.tsx`

Floating panel that appears when player's avatar is selected in House View:

```text
┌────────────────────────────────────────────┐
│  ⭐ YOUR AVATAR CONTROLS                   │
├────────────────────────────────────────────┤
│  Gestures:                                 │
│  [👋 Wave] [👍 Thumbs Up] [🤷 Shrug]       │
│  [👏 Clap] [👉 Point]                      │
├────────────────────────────────────────────┤
│  Quick Actions:                            │
│  [Select Character to Socialize]           │
│  > Shows list of nearby houseguests        │
└────────────────────────────────────────────┘
```

**Features:**
- Appears as overlay when player avatar is clicked
- Gesture buttons with cooldown indicators
- Quick select for social interactions
- Compact mobile-friendly design
- Closes when clicking elsewhere

---

## 5. Files to Create

### `src/components/avatar-3d/hooks/useGestureAnimation.ts`

- Define gesture types and keyframe data
- Implement keyframe interpolation (lerp between keyframes)
- Track gesture state (playing, progress, current gesture)
- Blend back to pose when complete
- Export `playGesture` function

### `src/components/avatar-3d/hooks/useReactiveExpressions.ts`

- Define reactive expression morphs (curiosity, jealousy, etc.)
- Accept relationship data for selected character
- Calculate appropriate expression based on context
- Smooth morph target transitions
- Integrate with existing expression system

### `src/components/avatar-3d/hooks/useEyeTracking.ts`

- Find skinned meshes with eye morph targets
- Calculate eye direction from target
- Apply eye look morphs (up/down/left/right)
- Add micro-saccade behavior
- Respect existing blink animation

### `src/components/game-phases/social-interaction/AvatarControlPanel.tsx`

- Render gesture buttons with icons
- Handle gesture triggers via callback
- Quick character selection dropdown
- Responsive design for mobile
- Cooldown visualization

---

## 6. Files to Modify

### `src/components/avatar-3d/RPMAvatar.tsx`

**Add Props:**
```typescript
interface RPMAvatarProps {
  // ... existing props
  isPlayer?: boolean;
  enableGestures?: boolean;
  gestureToPlay?: GestureType | null;
  onGestureComplete?: () => void;
  enableEyeTracking?: boolean;
  enableReactiveExpressions?: boolean;
  relationshipToSelected?: number;  // -100 to 100
  selectedIsNominee?: boolean;
  selectedIsHoH?: boolean;
}
```

**Integrate Hooks:**
```typescript
// Gesture system (player only)
const { playGesture, isPlaying } = useGestureAnimation(clone, {
  enabled: enableGestures && isPlayer,
  onComplete: onGestureComplete,
});

// Trigger gesture when prop changes
useEffect(() => {
  if (gestureToPlay) playGesture(gestureToPlay);
}, [gestureToPlay]);

// Eye tracking
useEyeTracking(skinnedMeshes, {
  targetPosition: lookAtTarget,
  characterPosition: worldPosition,
  characterRotationY: worldRotationY,
  enabled: enableEyeTracking,
});

// Reactive expressions
useReactiveExpressions(skinnedMeshes, {
  relationshipScore: relationshipToSelected,
  isNominee: selectedIsNominee,
  isHoH: selectedIsHoH,
  enabled: enableReactiveExpressions,
});
```

### `src/components/avatar-3d/HouseScene.tsx`

**Add Player Detection:**
- Accept `playerId` prop to identify player's avatar
- Pass `isPlayer` prop to CharacterSpot for player's avatar

**Add Gesture State:**
```typescript
const [playerGesture, setPlayerGesture] = useState<GestureType | null>(null);
const [gestureInProgress, setGestureInProgress] = useState(false);
```

**Add Relationship Data:**
- Query relationship between each character and selected character
- Pass to RPMAvatar for reactive expressions

### `src/components/game-phases/social-interaction/HouseViewPanel.tsx`

**Add Avatar Control Integration:**
```typescript
// Add gesture callback
const handleGesture = (gesture: GestureType) => {
  setPlayerGesture(gesture);
};

// Add quick action callback
const handleQuickSocialize = (targetId: string) => {
  onSelect(targetId);
  // Optional: trigger social action dialog
};
```

**Pass Relationship Data:**
- Map houseguest relationships for reactive expressions
- Pass player identification to HouseScene

### `src/components/avatar-3d/hooks/index.ts`

Export new hooks:
```typescript
export { useGestureAnimation, type GestureType } from './useGestureAnimation';
export { useReactiveExpressions } from './useReactiveExpressions';
export { useEyeTracking } from './useEyeTracking';
```

---

## 7. Technical Implementation Details

### Gesture Keyframe Interpolation

```typescript
const interpolateKeyframes = (
  keyframes: GestureKeyframe[],
  progress: number  // 0-1
): Record<string, BoneRotation> => {
  // Find surrounding keyframes
  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].time && progress < keyframes[i + 1].time) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }
  
  // Interpolate between keyframes
  const segmentProgress = (progress - prev.time) / (next.time - prev.time);
  const eased = easeInOutQuad(segmentProgress);
  
  const result: Record<string, BoneRotation> = {};
  for (const boneName of Object.keys(prev.bones)) {
    result[boneName] = {
      x: THREE.MathUtils.lerp(prev.bones[boneName].x, next.bones[boneName]?.x ?? prev.bones[boneName].x, eased),
      y: THREE.MathUtils.lerp(prev.bones[boneName].y, next.bones[boneName]?.y ?? prev.bones[boneName].y, eased),
      z: THREE.MathUtils.lerp(prev.bones[boneName].z, next.bones[boneName]?.z ?? prev.bones[boneName].z, eased),
    };
  }
  
  return result;
};
```

### Eye Micro-Saccade Pattern

```typescript
// Add subtle random eye movements for realism
const addMicroSaccade = (time: number): { x: number; y: number } => {
  // Random saccade every 2-4 seconds
  const saccadeFreq = 0.3;  // Slow base frequency
  const saccadeNoise = noise2D(time * saccadeFreq, 0);
  
  return {
    x: saccadeNoise * 0.05,  // Tiny horizontal jitter
    y: noise2D(time * saccadeFreq, 1) * 0.03,  // Tiny vertical jitter
  };
};
```

### Expression Priority System

When multiple expression triggers overlap:
1. **Gestures** - Override all expressions during gesture playback
2. **Reactive** - Take priority during active selection
3. **Mood** - Base expression when no interaction
4. **Idle** - Subtle micro-expressions when completely idle

---

## 8. Component Hierarchy Update

```text
HouseViewPanel
├── AvatarControlPanel (new - player controls overlay)
│   ├── GestureButtons
│   └── QuickSocializeMenu
└── HouseScene
    └── CharacterSpot
        └── RPMAvatar
            ├── useGestureAnimation (new)
            ├── useReactiveExpressions (new)
            ├── useEyeTracking (new)
            ├── usePoseVariety (existing)
            └── useLookAt (existing)
```

---

## 9. Expected Results

After implementation:
- Player can trigger gestures (wave, nod, shrug) from control panel
- All characters show reactive expressions when others are selected
- Eyes independently track the selected character or camera
- Smooth transitions between expressions and gestures
- Gestures blend naturally back into idle poses
- Mobile-friendly control panel
- Performance optimized (bone operations are cheap)
