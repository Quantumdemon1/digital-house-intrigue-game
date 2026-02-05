
# Complete Avatar Animation System Overhaul

## Overview

This plan redesigns the avatar physics, controls, poses, and animation system from the ground up to create more lifelike, expressive, and interactive 3D characters. The overhaul introduces physics-based secondary motion, a layered animation architecture, enhanced expressiveness, and intuitive player controls.

---

## Current System Analysis

The existing implementation consists of 10+ animation hooks with overlapping responsibilities:

| Hook | Purpose | Issues |
|------|---------|--------|
| `useIdlePose` | Basic arm/spine positioning | Duplicates `usePoseVariety` |
| `usePoseVariety` | Archetype-based poses | Only one pose type used |
| `useIdleAnimation` | Breathing/sway on group | Conflicts with bone-level animation |
| `useLookAt` | Head tracking | Limited smoothing, snappy transitions |
| `useEyeTracking` | Eye blendshapes | Works independently, could be unified |
| `useGestureAnimation` | Keyframe gestures | Rigid keyframes, no physics |
| `useReactiveExpressions` | Social context expressions | Limited expression variety |
| `useStatusAnimation` | Game status effects | Conflicts with other animations |
| `useMoodAnimation` | Mood-based body movement | Not integrated with main system |

**Problems:**
1. Animation hooks fight each other for control
2. No blending between animation layers
3. Rigid keyframe animations feel robotic
4. No physics-based secondary motion (hair, clothing, momentum)
5. Instantaneous pose switches instead of smooth transitions
6. No support for procedural animation variety

---

## New Architecture

### Layered Animation System

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Animation Controller                         │
│         (Orchestrates all layers, handles priorities)            │
├─────────────────────────────────────────────────────────────────┤
│ Layer 5: Gesture Overrides (wave, clap, point)                   │
│          Priority: Highest - Temporarily takes full control      │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4: Reactive/Status (HoH glow, nominee fidget)              │
│          Priority: High - Additive modifiers                     │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: Look-At (head, neck, eyes toward target)                │
│          Priority: Medium - Blends with base pose                │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Idle Procedural (breathing, weight shift, micro-moves)  │
│          Priority: Low - Continuous background animation         │
├─────────────────────────────────────────────────────────────────┤
│ Layer 1: Base Pose (relaxed standing, arms at sides)             │
│          Priority: Lowest - Foundation layer                     │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```text
src/components/avatar-3d/animation/
├── AnimationController.ts          # Master orchestrator
├── layers/
│   ├── BasePoseLayer.ts            # Foundation pose
│   ├── IdleProceduralLayer.ts      # Breathing, sway, micro-movements
│   ├── LookAtLayer.ts              # Head/eye tracking
│   ├── ReactiveLayer.ts            # Social/status reactions
│   └── GestureLayer.ts             # Triggered gestures
├── physics/
│   ├── SecondaryMotion.ts          # Spring physics for soft body parts
│   ├── MomentumSystem.ts           # Inertia and follow-through
│   └── CollisionAvoidance.ts       # Hands don't clip through body
├── expressions/
│   ├── FacialBlendSystem.ts        # Unified face control
│   ├── BlinkController.ts          # Natural blink patterns
│   └── EmotionMixer.ts             # Blend multiple emotions
├── procedural/
│   ├── BreathingCycle.ts           # Chest/shoulder breathing
│   ├── WeightShift.ts              # Hip sway, center of gravity
│   ├── MicroMovements.ts           # Subtle fidgeting, adjustments
│   └── NaturalVariation.ts         # Randomized timing offsets
└── gestures/
    ├── GestureLibrary.ts           # Expanded gesture definitions
    ├── ProceduralGestures.ts       # Physics-enhanced gestures
    └── InterruptibleGestures.ts    # Can be cancelled mid-animation
```

---

## Technical Implementation

### 1. Animation Controller Hook

**File: `src/components/avatar-3d/animation/useAnimationController.ts`**

A single hook that orchestrates all animation layers:

```typescript
interface AnimationControllerConfig {
  scene: THREE.Object3D;
  skinnedMeshes: THREE.SkinnedMesh[];
  
  // Layer configs
  basePose: PoseType;
  lookAtTarget: THREE.Vector3 | null;
  characterPosition: [number, number, number];
  characterRotationY: number;
  
  // State
  mood: MoodType;
  gameStatus: AvatarStatus;
  relationshipContext: RelationshipContext;
  
  // Gestures
  activeGesture: GestureType | null;
  onGestureComplete?: () => void;
  
  // Options
  enablePhysics: boolean;
  enableExpressions: boolean;
  qualityLevel: 'low' | 'medium' | 'high';
}

function useAnimationController(config: AnimationControllerConfig): AnimationState;
```

**Key Features:**
- Single entry point replaces 10+ hooks
- Properly layers and blends animations
- Respects priority system (gestures override idle, etc.)
- Performance-aware (can disable physics on low-end devices)

### 2. Physics-Based Secondary Motion

**File: `src/components/avatar-3d/animation/physics/SecondaryMotion.ts`**

Adds spring-based physics for natural follow-through:

```typescript
interface SpringConfig {
  stiffness: number;    // How fast it returns to rest (0.1-1.0)
  damping: number;      // How quickly oscillations decay (0.1-1.0)
  mass: number;         // Weight of the bone (affects momentum)
}

// Apply to bones that should have secondary motion
const SECONDARY_MOTION_BONES: Record<string, SpringConfig> = {
  'Head': { stiffness: 0.3, damping: 0.8, mass: 0.5 },
  'Spine2': { stiffness: 0.5, damping: 0.7, mass: 0.8 },
  'LeftHand': { stiffness: 0.2, damping: 0.6, mass: 0.3 },
  'RightHand': { stiffness: 0.2, damping: 0.6, mass: 0.3 },
};
```

**Effects:**
- Head continues moving slightly after look-at reaches target
- Arms swing with momentum during gestures
- Body sways follow through on weight shifts
- Natural overshoot and settle behavior

### 3. Enhanced Procedural Idle System

**File: `src/components/avatar-3d/animation/procedural/ProceduralIdleSystem.ts`**

Replace rigid sine-wave animations with organic, layered movement:

```typescript
interface IdleSystemConfig {
  // Breathing
  breathRate: number;           // Breaths per minute (12-20)
  breathDepth: number;          // How visible (0.5-1.0)
  breathVariation: number;      // Randomness (0-0.3)
  
  // Weight shifting
  shiftFrequency: number;       // How often (every 3-8 seconds)
  shiftMagnitude: number;       // How much (0.5-1.0)
  
  // Micro-movements
  microMovementScale: number;   // Subtle adjustments (0-1)
  blinkRate: number;            // Blinks per minute (15-20)
  
  // Character personality
  energyLevel: number;          // Affects all movement (0.5-1.5)
  nervousness: number;          // Adds fidgeting (0-1)
}
```

**Features:**
- **Breathing**: Chest expansion, shoulder rise, subtle head movement
- **Weight Shifting**: Periodic hip sway with follow-through
- **Micro-movements**: Finger twitches, small head adjustments, eye glances
- **Personality Variance**: Different characters have different idle styles

### 4. Smooth Pose Transitions

**File: `src/components/avatar-3d/animation/layers/BasePoseLayer.ts`**

Implement proper animation blending between poses:

```typescript
interface PoseTransition {
  fromPose: PoseConfig;
  toPose: PoseConfig;
  duration: number;           // Seconds (typically 0.5-1.5)
  easing: EasingFunction;     // cubic-bezier, spring, etc.
  startTime: number;
}

// Transition between any two poses smoothly
function transitionPose(
  from: PoseType,
  to: PoseType,
  duration: number = 0.8
): void;
```

### 5. Enhanced Look-At System

**File: `src/components/avatar-3d/animation/layers/LookAtLayer.ts`**

Improve the current look-at with:

```typescript
interface EnhancedLookAtConfig {
  target: THREE.Vector3 | null;
  
  // Speed control
  headTurnSpeed: number;        // Degrees per second (30-120)
  eyeLeadTime: number;          // Eyes arrive before head (0.1-0.3s)
  
  // Natural behavior
  breakAwayChance: number;      // Probability to look away briefly (0-0.1)
  breakAwayDuration: number;    // How long (0.3-1.0s)
  
  // Limits
  maxHeadYaw: number;           // Side-to-side limit (60-80 degrees)
  maxHeadPitch: number;         // Up-down limit (30-45 degrees)
  bodyTurnThreshold: number;    // When to rotate body (90+ degrees)
}
```

**Features:**
- Eyes lead head rotation (arrive 100-200ms earlier)
- Occasional "break away" glances for realism
- Smooth acceleration/deceleration curves
- Body rotation for extreme angles

### 6. Expanded Gesture Library

**File: `src/components/avatar-3d/animation/gestures/GestureLibrary.ts`**

Add more gestures with physics-based enhancements:

```typescript
type GestureType = 
  // Existing
  | 'wave' | 'nod' | 'shrug' | 'clap' | 'point' | 'thumbsUp'
  // New social gestures
  | 'headShake' | 'facepalm' | 'crossArms' | 'handOnHip'
  | 'celebrate' | 'thinkingPose' | 'nervousFidget'
  // Conversational
  | 'listenNod' | 'emphasize' | 'dismiss' | 'welcome'
  // Emotional
  | 'happy' | 'sad' | 'angry' | 'surprised' | 'confused';
```

**Gesture Features:**
- Interruptible (can cancel mid-gesture)
- Blendable (can layer multiple)
- Physics-enhanced (momentum, follow-through)
- Contextual (different intensities based on mood)

### 7. Unified Facial Expression System

**File: `src/components/avatar-3d/animation/expressions/FacialBlendSystem.ts`**

Consolidate all facial animation:

```typescript
interface FacialState {
  // Base emotion (0-1 intensity)
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    disgusted: number;
    fearful: number;
    neutral: number;
  };
  
  // Modifiers
  blinkState: number;           // 0=open, 1=closed
  eyeTarget: { x: number, y: number };
  mouthOpen: number;            // For speech/reactions
  
  // Micro-expressions
  browQuirk: number;            // Raised eyebrow
  lipPress: number;             // Tight lips
  noseScrunch: number;
}
```

**Features:**
- Blend multiple emotions simultaneously
- Smooth transitions between expressions
- Micro-expressions for subtle reactions
- Synchronized with gestures

---

## Implementation Phases

### Phase 1: Core Architecture (Foundation)
1. Create `AnimationController` hook
2. Implement animation layer system with priority blending
3. Refactor `BasePoseLayer` with smooth transitions
4. Consolidate bone manipulation into single system

### Phase 2: Procedural Idle System
1. Implement `ProceduralIdleSystem` with breathing, weight shift
2. Add micro-movement layer
3. Create personality-based variation system
4. Optimize for performance

### Phase 3: Physics Integration
1. Add `SecondaryMotion` spring physics
2. Implement momentum/follow-through for gestures
3. Add subtle physics to idle animations
4. Create collision avoidance for hands

### Phase 4: Enhanced Look-At
1. Upgrade look-at with eye-lead behavior
2. Add break-away glances
3. Implement body rotation for extreme angles
4. Smooth acceleration curves

### Phase 5: Gesture System Upgrade
1. Expand gesture library (12+ new gestures)
2. Make gestures interruptible
3. Add physics enhancement to gestures
4. Implement gesture blending

### Phase 6: Expression Unification
1. Create `FacialBlendSystem`
2. Merge reactive expressions and mood animations
3. Add micro-expression support
4. Synchronize with gesture system

---

## Performance Considerations

| Feature | CPU Cost | Can Disable |
|---------|----------|-------------|
| Base pose | Minimal | No |
| Breathing cycle | Low | No |
| Weight shifting | Low | Yes |
| Micro-movements | Medium | Yes |
| Physics springs | Medium-High | Yes |
| Eye tracking | Low | Yes |
| Head look-at | Low | No |
| Expressions | Medium | Yes |
| Gestures | High (when active) | N/A |

**Quality Presets:**
- **Low**: Base pose + breathing + look-at only
- **Medium**: + weight shift + expressions
- **High**: Full system with physics

---

## Files to Create

1. `src/components/avatar-3d/animation/AnimationController.ts`
2. `src/components/avatar-3d/animation/layers/BasePoseLayer.ts`
3. `src/components/avatar-3d/animation/layers/IdleProceduralLayer.ts`
4. `src/components/avatar-3d/animation/layers/LookAtLayer.ts`
5. `src/components/avatar-3d/animation/layers/ReactiveLayer.ts`
6. `src/components/avatar-3d/animation/layers/GestureLayer.ts`
7. `src/components/avatar-3d/animation/physics/SecondaryMotion.ts`
8. `src/components/avatar-3d/animation/procedural/ProceduralIdleSystem.ts`
9. `src/components/avatar-3d/animation/expressions/FacialBlendSystem.ts`
10. `src/components/avatar-3d/animation/gestures/GestureLibrary.ts`

## Files to Modify

1. `src/components/avatar-3d/RPMAvatar.tsx` - Use new AnimationController
2. `src/components/avatar-3d/CircularHouseScene.tsx` - Update character props
3. `src/components/avatar-3d/HouseScene.tsx` - Update character props

## Files to Deprecate (Keep for Reference)

1. `src/components/avatar-3d/hooks/useIdlePose.ts`
2. `src/components/avatar-3d/hooks/useIdleAnimation.ts`
3. `src/components/avatar-3d/hooks/useMoodAnimation.ts`
4. `src/components/avatar-3d/hooks/useStatusAnimation.ts`

---

## Expected Results

After implementation:
- Avatars feel alive with organic, physics-based movement
- Smooth transitions between all animation states
- No more animation conflicts or fighting
- 20+ available gestures with natural motion
- Expressive faces that react to social context
- Configurable quality for performance optimization
- Single unified API for all avatar animation

