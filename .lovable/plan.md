
# Touch Gesture Controls for 3D House View

## Overview

This plan adds comprehensive touch gesture controls to the 3D House View, enabling mobile users to interact naturally with the scene through:
- **Two-finger pinch** to zoom in/out
- **Single-finger swipe** to rotate the camera
- **Tap to move avatar** from one spot to another (player character relocation)
- **Double-tap** to select/deselect characters

---

## Current State

The HouseScene currently uses `OrbitControls` from `@react-three/drei` which provides:
- Mouse drag to rotate (works partially on touch)
- Scroll wheel to zoom (doesn't work on touch)
- Click to select characters

**Missing:**
- Dedicated touch gesture handling for pinch-zoom
- Visual feedback for touch interactions
- Tap-to-move player avatar functionality
- Touch-optimized gesture sensitivity

---

## Implementation Approach

### Part 1: Touch Gesture Hook

Create a dedicated hook to handle all touch interactions with proper gesture recognition:

**New File: `src/components/avatar-3d/hooks/useTouchGestures.ts`**

```text
Touch Gesture Types:
┌─────────────────────────────────────────────┐
│ Single Touch                                │
│ - Tap (< 200ms) → Select character          │
│ - Double-tap → Deselect / Quick action      │
│ - Drag → Rotate camera (azimuth/polar)      │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Two-Finger Touch                            │
│ - Pinch in/out → Zoom camera                │
│ - Two-finger drag → Pan (if enabled)        │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Long Press (> 500ms)                        │
│ - On empty space → Enter "move mode"        │
│ - On character → Show context menu          │
└─────────────────────────────────────────────┘
```

### Part 2: Enhanced OrbitControls Configuration

Update OrbitControls settings to better handle touch:
- Enable touch gestures with proper sensitivity
- Configure pinch-to-zoom behavior
- Set rotation speed for touch vs mouse

### Part 3: Tap-to-Move Player Avatar

Implement the ability for players to relocate their avatar within the house:

```text
Move Flow:
1. Player long-presses on empty floor area
2. Floor spots highlight as valid destinations
3. Player taps desired destination
4. Avatar animates walking to new position
5. Position updates in scene state
```

### Part 4: Visual Touch Feedback

Add visual cues for touch interactions:
- Ripple effect on tap
- Highlight valid move destinations
- Gesture hints for new users

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/avatar-3d/hooks/useTouchGestures.ts` | Main touch gesture recognition hook |
| `src/components/avatar-3d/TouchFeedback.tsx` | Visual feedback components (ripples, highlights) |
| `src/components/avatar-3d/FloorSpotMarker.tsx` | Clickable floor positions for avatar movement |

## Files to Modify

| File | Changes |
|------|---------|
| `HouseScene.tsx` | Integrate touch gestures, add move mode state, floor markers |
| `CircularHouseScene.tsx` | Add same touch gesture support |
| `CharacterCarousel.tsx` | Already has swipe - add velocity-based momentum |

---

## Technical Implementation Details

### 1. Touch Gesture Hook

```typescript
// useTouchGestures.ts - Key interfaces
interface TouchGestureState {
  // Pinch zoom
  initialPinchDistance: number | null;
  currentZoom: number;
  
  // Rotation
  lastTouchX: number;
  lastTouchY: number;
  
  // Tap detection
  tapStartTime: number;
  tapStartPosition: { x: number; y: number };
  lastTapTime: number; // For double-tap detection
  
  // Long press
  longPressTimer: NodeJS.Timeout | null;
  isLongPress: boolean;
}

interface TouchGestureCallbacks {
  onPinchZoom: (delta: number) => void;
  onRotate: (deltaX: number, deltaY: number) => void;
  onTap: (position: { x: number; y: number }) => void;
  onDoubleTap: (position: { x: number; y: number }) => void;
  onLongPress: (position: { x: number; y: number }) => void;
  onLongPressEnd: () => void;
}
```

### 2. Pinch-to-Zoom Logic

```typescript
// Distance calculation for pinch gesture
const getPinchDistance = (touches: TouchList): number => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// Apply zoom with clamping
const handlePinchMove = (currentDistance: number, initialDistance: number) => {
  const scale = currentDistance / initialDistance;
  const zoomDelta = (scale - 1) * PINCH_SENSITIVITY;
  
  // Update camera distance
  camera.position.multiplyScalar(1 - zoomDelta * 0.1);
  
  // Clamp to min/max distance
  const dist = camera.position.length();
  if (dist < MIN_DISTANCE || dist > MAX_DISTANCE) {
    camera.position.normalize().multiplyScalar(
      Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, dist))
    );
  }
};
```

### 3. Tap-to-Move System

The player avatar can be moved to preset floor positions:

```typescript
// FloorSpotMarker.tsx
interface FloorSpot {
  id: string;
  position: [number, number, number];
  zone: 'living' | 'kitchen' | 'bedroom' | 'backyard';
  isOccupied: boolean;
}

const FLOOR_SPOTS: FloorSpot[] = [
  { id: 'living-1', position: [-3, 0, 1], zone: 'living', isOccupied: false },
  { id: 'living-2', position: [0, 0, 2], zone: 'living', isOccupied: false },
  // ... more spots
];
```

When move mode is active:
1. Show circular markers on available spots
2. Occupied spots shown in red (other characters)
3. Tapping a spot triggers avatar movement
4. Movement animates over ~1 second with walking gesture

### 4. OrbitControls Touch Settings

```typescript
<OrbitControls
  ref={controlsRef}
  // Existing settings...
  
  // Touch-specific settings
  touches={{
    ONE: THREE.TOUCH.ROTATE,  // Single finger rotates
    TWO: THREE.TOUCH.DOLLY_ROTATE, // Two fingers zoom + rotate
  }}
  rotateSpeed={0.5}  // Slower for touch precision
  zoomSpeed={0.8}
  
  // Enable touch
  enableTouch={true}
/>
```

### 5. Visual Feedback Components

```typescript
// TouchFeedback.tsx
const TapRipple: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[0, 0.5, 32]} />
    <meshBasicMaterial color="#22c55e" transparent opacity={0.5} />
  </mesh>
);

const MoveTargetIndicator: React.FC<{ active: boolean }> = ({ active }) => (
  // Pulsing circle showing where player will move
);
```

---

## Integration with HouseScene

### State Additions

```typescript
// New state in HouseScene
const [moveMode, setMoveMode] = useState(false);
const [playerPosition, setPlayerPosition] = useState<[number, number, number] | null>(null);
const [touchFeedback, setTouchFeedback] = useState<{
  type: 'tap' | 'longPress' | null;
  position: [number, number, number] | null;
}>({ type: null, position: null });
```

### Event Flow

```text
Touch Start
    ├── Single Touch
    │   ├── Start tap timer
    │   ├── Start long-press timer (500ms)
    │   └── Record start position
    │
    └── Two Touches
        ├── Cancel tap/long-press timers
        └── Record initial pinch distance

Touch Move
    ├── Single Touch (if moved > threshold)
    │   ├── Cancel tap detection
    │   └── Apply rotation delta
    │
    └── Two Touches
        └── Calculate pinch delta → apply zoom

Touch End
    ├── If tap (< 200ms, < 10px movement)
    │   ├── If moveMode → move avatar to floor position
    │   └── Else → raycast to select character
    │
    └── If long-press triggered
        └── If on floor → activate move mode
```

---

## Mobile-Specific Hints Update

Update the hint overlay for mobile:

```tsx
{/* Mobile hint */}
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden">
  <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/60 text-xs">
    Drag to rotate • Pinch to zoom • Tap to select • Hold to move
  </div>
</div>

{/* Desktop hint (existing) */}
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block">
  <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/60 text-sm">
    Drag to rotate • Scroll to zoom • Click to select
  </div>
</div>
```

---

## Implementation Order

### Phase 1: Core Touch Gestures
1. Create `useTouchGestures.ts` hook with pinch and rotation
2. Configure OrbitControls touch settings
3. Add mobile-specific hint text

### Phase 2: Enhanced Interactions
4. Add double-tap to deselect/zoom
5. Implement long-press detection
6. Create `TouchFeedback.tsx` for ripple effects

### Phase 3: Tap-to-Move
7. Create `FloorSpotMarker.tsx` component
8. Add move mode state to HouseScene
9. Implement avatar movement animation
10. Wire up floor spot selection

---

## Testing Checklist

### Gesture Recognition
- [ ] Single finger drag rotates camera smoothly
- [ ] Two-finger pinch zooms in/out with proper sensitivity
- [ ] Tap selects characters correctly
- [ ] Double-tap deselects or triggers action
- [ ] Long press activates move mode

### Avatar Movement
- [ ] Floor spots appear when move mode activates
- [ ] Occupied spots are marked differently
- [ ] Tapping spot moves player avatar
- [ ] Movement animation plays smoothly
- [ ] Position persists after move

### Visual Feedback
- [ ] Tap shows ripple effect
- [ ] Move targets pulse/glow
- [ ] Selected destination highlights
- [ ] Mobile hints are visible and correct

### Compatibility
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Doesn't interfere with desktop mouse controls
- [ ] Carousel swipe still works
