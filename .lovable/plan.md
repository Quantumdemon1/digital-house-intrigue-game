
# Walking Animation for Avatar Movement Between Floor Spots

## Overview

This plan adds a walking animation system that plays when the player avatar moves between floor spots in the 3D house view. Currently, when a player taps a floor spot, the avatar position changes instantly. This plan adds:

1. A new "walk" gesture animation with natural stepping motion
2. Smooth position interpolation from start to destination
3. Automatic rotation to face walking direction
4. Integration with the existing movement system in HouseScene

---

## Current Architecture

### How Movement Works Now

1. Player enters "move mode" via long-press
2. Floor spot markers appear (`FloorSpotMarker.tsx`)
3. Player taps a spot → `handleSpotSelect` is called
4. `playerSpotId` state updates immediately
5. A ripple effect appears at the destination
6. **Missing**: No position animation or walking gesture

### Animation System

The existing animation system uses a 5-layer priority architecture:
- **Layer 1**: Base Pose (relaxed, crossed-arms, etc.)
- **Layer 2**: Idle Procedural (breathing, weight shift)
- **Layer 3**: Look-At (head tracking)
- **Layer 4**: Reactive Expressions
- **Layer 5**: Gestures (wave, nod, clap, etc.)

The gesture system (`GestureLayer.ts`) already supports keyframe-based animations that play once and blend back to base pose.

---

## Implementation Approach

### Part 1: Create Walk Cycle Gesture

Add a new "walk" gesture to the gesture library with a basic walk cycle animation:

**File**: `src/components/avatar-3d/animation/layers/GestureLayer.ts`

```typescript
walk: {
  duration: 1.2,  // One full step cycle
  interruptible: false,
  blendOutDuration: 0.3,
  loop: true,  // NEW: Allow looping for continuous walking
  keyframes: [
    // Start pose (neutral stance)
    { time: 0, bones: { 
      LeftArm: { x: 0.1, y: -0.2, z: 1.3 },   // Arm back
      RightArm: { x: 0.1, y: 0.2, z: -1.3 },  // Arm forward
      Spine: { x: -0.05, y: 0, z: 0 },
      Head: { x: 0, y: 0, z: 0 },
    }},
    // Mid-stride
    { time: 0.5, bones: { 
      LeftArm: { x: 0.1, y: 0.2, z: 1.1 },    // Arm forward
      RightArm: { x: 0.1, y: -0.2, z: -1.1 }, // Arm back
      Spine: { x: -0.05, y: 0.02, z: 0 },
    }},
    // Back to start (for seamless loop)
    { time: 1.0, bones: { 
      LeftArm: { x: 0.1, y: -0.2, z: 1.3 },
      RightArm: { x: 0.1, y: 0.2, z: -1.3 },
      Spine: { x: -0.05, y: 0, z: 0 },
    }},
  ],
}
```

### Part 2: Add Walk Gesture Type

**File**: `src/components/avatar-3d/animation/types.ts`

```typescript
export type GestureType =
  // Original gestures
  | 'wave' | 'nod' | 'shrug' | 'clap' | 'point' | 'thumbsUp'
  // Social gestures
  | 'headShake' | 'celebrate' | 'thinkingPose'
  // Added gestures
  | 'facepalm' | 'crossArms' | 'handOnHip' | 'nervousFidget' | 'emphasize'
  // Conversational
  | 'listenNod' | 'dismiss' | 'welcome'
  // NEW: Movement
  | 'walk';
```

### Part 3: Create Movement Animation Hook

Create a new hook to manage the walking animation and position interpolation:

**File**: `src/components/avatar-3d/hooks/useAvatarMovement.ts` (new)

```typescript
interface AvatarMovementState {
  isMoving: boolean;
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  currentPosition: [number, number, number];
  targetRotation: number;
  progress: number;
  startTime: number;
}

interface UseAvatarMovementConfig {
  enabled: boolean;
  movementSpeed?: number;  // Units per second (default: 2)
  onMoveComplete?: () => void;
}

export const useAvatarMovement = (config: UseAvatarMovementConfig) => {
  // Tracks movement state
  // Returns: { position, rotation, isMoving, walkGesture }
  
  // Calculate movement duration based on distance
  // Animate position over time
  // Return 'walk' gesture while moving
  // Smoothly rotate to face direction
}
```

### Part 4: Update HouseScene for Animated Movement

Modify HouseScene to track player position with animation:

**File**: `src/components/avatar-3d/HouseScene.tsx`

Key changes:
1. Add `playerPosition` state for animated position
2. Add `isPlayerMoving` state
3. Add `playerTargetPosition` for destination
4. Create movement animation in `useFrame`
5. Pass `walk` gesture to player's RPMAvatar while moving
6. Update character position to use animated position

```typescript
// New state in HouseScene
const [playerPosition, setPlayerPosition] = useState<[number, number, number] | null>(null);
const [playerTargetPosition, setPlayerTargetPosition] = useState<[number, number, number] | null>(null);
const [isPlayerMoving, setIsPlayerMoving] = useState(false);
const playerRotationRef = useRef<number>(0);

// Handle floor spot selection
const handleSpotSelect = useCallback((spotId: string, position: [number, number, number]) => {
  // Get current player position
  const currentPos = playerPosition ?? getDefaultPlayerPosition();
  
  // Start movement animation
  setPlayerTargetPosition(position);
  setIsPlayerMoving(true);
  setPlayerSpotId(spotId);
  setMoveMode(false);
  
  // Calculate rotation to face target
  const angle = Math.atan2(
    position[2] - currentPos[2],
    position[0] - currentPos[0]
  ) + Math.PI / 2;
  playerRotationRef.current = angle;
}, [playerPosition]);
```

### Part 5: Create Movement Animation Component

Create a component inside the Canvas that handles the frame-by-frame position interpolation:

**File**: `src/components/avatar-3d/PlayerMovementController.tsx` (new)

```typescript
interface PlayerMovementControllerProps {
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  isMoving: boolean;
  onPositionUpdate: (position: [number, number, number]) => void;
  onMoveComplete: () => void;
  speed?: number; // units per second
}

const PlayerMovementController: React.FC<PlayerMovementControllerProps> = ({
  startPosition,
  targetPosition,
  isMoving,
  onPositionUpdate,
  onMoveComplete,
  speed = 2,
}) => {
  const progress = useRef(0);
  const startPos = useRef(startPosition);
  
  useEffect(() => {
    if (isMoving) {
      startPos.current = startPosition;
      progress.current = 0;
    }
  }, [isMoving, startPosition]);
  
  useFrame((_, delta) => {
    if (!isMoving) return;
    
    // Calculate total distance
    const dx = targetPosition[0] - startPos.current[0];
    const dz = targetPosition[2] - startPos.current[2];
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // Calculate duration based on distance and speed
    const duration = distance / speed;
    
    // Advance progress
    progress.current = Math.min(progress.current + delta / duration, 1);
    
    // Ease the movement
    const eased = easeInOutQuad(progress.current);
    
    // Interpolate position
    const newPos: [number, number, number] = [
      startPos.current[0] + dx * eased,
      startPos.current[1],  // Keep Y constant
      startPos.current[2] + dz * eased,
    ];
    
    onPositionUpdate(newPos);
    
    // Check completion
    if (progress.current >= 1) {
      onMoveComplete();
    }
  });
  
  return null;
};
```

### Part 6: Update CharacterSpot for Dynamic Position

Modify CharacterSpot to accept an override position for the player:

**File**: `src/components/avatar-3d/HouseScene.tsx` (CharacterSpot component)

```typescript
interface CharacterSpotProps {
  // ...existing props
  overridePosition?: [number, number, number];  // NEW
  overrideRotation?: [number, number, number];  // NEW
  movementGesture?: GestureType | null;         // NEW
}

const CharacterSpot: React.FC<CharacterSpotProps> = ({
  // ...existing
  overridePosition,
  overrideRotation,
  movementGesture,
}) => {
  // Use override position if provided, otherwise use prop
  const effectivePosition = overridePosition ?? position;
  const effectiveRotation = overrideRotation ?? rotation;
  
  // Combine movement gesture with player gesture
  const activeGesture = movementGesture ?? playerGesture;
  
  return (
    <group position={effectivePosition}>
      {/* ...rest of component */}
    </group>
  );
};
```

---

## Integration Flow

```text
User taps floor spot
      │
      ▼
handleSpotSelect(spotId, targetPosition)
      │
      ├── setPlayerTargetPosition(targetPosition)
      ├── setIsPlayerMoving(true)
      ├── Calculate facing direction
      └── Add ripple effect
      │
      ▼
PlayerMovementController (in Canvas)
      │
      ├── useFrame: Interpolate position each frame
      ├── Call onPositionUpdate with new position
      └── When complete: onMoveComplete()
      │
      ▼
CharacterSpot (for player)
      │
      ├── Uses overridePosition for animated position
      ├── Uses overrideRotation to face direction
      └── Passes 'walk' gesture to RPMAvatar while moving
      │
      ▼
RPMAvatar
      │
      └── AnimationController plays walk gesture
          └── Arms swing, body sways during walk
```

---

## Files Summary

### Create

| File | Purpose |
|------|---------|
| `src/components/avatar-3d/hooks/useAvatarMovement.ts` | Movement state management hook |
| `src/components/avatar-3d/PlayerMovementController.tsx` | Frame-by-frame position animation |

### Modify

| File | Changes |
|------|---------|
| `src/components/avatar-3d/animation/types.ts` | Add 'walk' to GestureType |
| `src/components/avatar-3d/animation/layers/GestureLayer.ts` | Add walk cycle animation keyframes |
| `src/components/avatar-3d/HouseScene.tsx` | Add movement state, integrate controller, pass to CharacterSpot |

---

## Walk Cycle Animation Details

The walk animation uses arm swing and subtle spine rotation to simulate walking:

| Keyframe | Time | Description |
|----------|------|-------------|
| 0 | 0.0 | Left arm back, right arm forward, neutral spine |
| 1 | 0.25 | Arms crossing, slight spine twist right |
| 2 | 0.5 | Left arm forward, right arm back |
| 3 | 0.75 | Arms crossing, slight spine twist left |
| 4 | 1.0 | Back to start (loops seamlessly) |

Since Ready Player Me avatars don't have leg bones exposed in the standard configuration, the walk uses upper body animation (arm swing) which is the most visible and natural cue for walking motion.

---

## Technical Considerations

### Gesture Looping

The current gesture system plays once and stops. For walking, we need continuous animation. Options:

1. **Loop flag**: Add `loop: true` to gesture definition, check in `updateGesture`
2. **Retrigger**: Re-trigger the walk gesture when it completes while still moving
3. **Duration scaling**: Match gesture duration to movement duration

Recommended: Option 2 (retrigger) - simplest, works with existing system.

### Smooth Rotation

When facing the walking direction:
- Calculate angle from start to target
- Smoothly interpolate current rotation to target rotation
- Apply as Y rotation on the character group

### Movement Speed

Default: 2 units/second
- Short distances (< 3 units): ~1.5 seconds
- Medium distances (3-8 units): ~3 seconds
- Long distances (> 8 units): ~4 seconds max

---

## Testing Checklist

- [ ] Tap floor spot triggers walk animation
- [ ] Avatar moves smoothly from start to destination
- [ ] Avatar rotates to face walking direction
- [ ] Walk animation loops during movement
- [ ] Walk animation stops when destination reached
- [ ] Returns to relaxed pose after walking
- [ ] Works on mobile (long press → tap spot)
- [ ] Works on desktop (click to move when in move mode)
- [ ] No jittering or physics instability during walk
- [ ] Camera follows player during movement (optional)
