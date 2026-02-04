

# Plan: Enhance Big Brother House Scene with Furniture, Camera Animation & Idle Characters

## Overview

This plan adds three major enhancements to the House Scene:
1. **New Furniture** - TV entertainment center, kitchen area, and diary room door
2. **Camera Fly-To Animation** - Smooth camera transition when selecting a character
3. **Idle Character Animations** - Subtle breathing/sway for lifelike avatars

---

## 1. New Furniture Components

### Components to Add (`HouseFurniture.tsx`)

| Component | Description | Position |
|-----------|-------------|----------|
| `TVStand` | Large flat-screen TV on entertainment unit | Back of room (z = -9) |
| `KitchenArea` | Counter with cabinets, bar stools | Side area (x = 9) |
| `DiaryRoomDoor` | Iconic red door with "DIARY ROOM" sign | Opposite side (x = -9) |
| `BarStool` | Reusable stool for kitchen | Near kitchen counter |
| `WallPanel` | Curved background wall segments | Around perimeter |

### Visual Design

```text
               ┌─────────────────────────┐
               │          TV             │
               │     ▭▭▭▭▭▭▭▭▭▭▭         │
               └─────────────────────────┘
                          ↑
    ┌─────┐                              ┌─────────┐
    │DIARY│     ○  ○  ○                  │ KITCHEN │
    │ROOM │        ○     ○               │  ▭▭▭▭   │
    │ 🚪  │   ○          ○    ◯ ◯ ◯      │ ◯ ◯ ◯   │
    └─────┘      ○  ○  ○                 └─────────┘
              Characters in Circle
```

### Implementation Details

**TVStand Component:**
- Box geometry for entertainment unit base
- Plane geometry for screen with emissive glow effect
- BB logo/eye displayed on screen
- Subtle screen flicker animation

**KitchenArea Component:**
- L-shaped counter using box geometries
- Upper cabinets with metallic handles
- 3 bar stools arranged in front
- Overhead pendant lights

**DiaryRoomDoor Component:**
- Tall box geometry painted red
- "DIARY ROOM" text using HTML overlay or 3D text
- Glowing doorframe accent
- Animated "on-air" light indicator

---

## 2. Camera Fly-To Animation

### Current Behavior
- Camera uses OrbitControls with static position
- CameraController exists but doesn't animate smoothly

### Enhanced Behavior
When a character is selected:
1. Calculate target camera position (behind and above character, looking at them)
2. Smoothly interpolate camera position over ~1 second
3. Adjust OrbitControls target to focus on selected character
4. When deselected, smoothly return to overview position

### Technical Approach

**New `useCameraFlyTo` Hook:**
```typescript
const useCameraFlyTo = (
  targetPosition: THREE.Vector3 | null,
  targetLookAt: THREE.Vector3 | null,
  duration: number = 1
) => {
  const { camera } = useThree();
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const progress = useRef(0);
  const isAnimating = useRef(false);
  
  useFrame((_, delta) => {
    if (!isAnimating.current || !targetPosition) return;
    
    progress.current = Math.min(progress.current + delta / duration, 1);
    const t = easeInOutCubic(progress.current);
    
    camera.position.lerpVectors(startPos.current, targetPosition, t);
    // Update orbit controls target similarly
  });
};
```

**Camera Target Calculation:**
```typescript
const getCharacterCameraTarget = (charPosition: [number, number, number]) => {
  // Position camera 3 units behind, 2 units above, looking at character
  const offset = new THREE.Vector3(
    charPosition[0] * 0.3,  // Move towards center
    2,                       // Elevate camera
    charPosition[2] * 0.3 + 4  // Behind character
  );
  return offset;
};
```

---

## 3. Idle Character Animations

### Current State
- RPMAvatar has subtle head movement and blink animation
- HouseScene CharacterSpot only animates Y position on hover/select

### Enhanced Idle Animations

Apply the existing `useIdleAnimation` hook to characters in the scene:

**CharacterSpot Updates:**
1. Wrap RPMAvatar in an animated group
2. Apply breathing animation (subtle scale oscillation)
3. Apply weight-shift sway (rotation.z oscillation)
4. Stagger animation phases per character to avoid synchronized movement

**Animation Parameters (per character):**
```typescript
{
  breathingSpeed: 1.2 + (index * 0.1),  // Staggered
  breathingIntensity: 0.006,
  swaySpeed: 0.4 + (index * 0.05),      // Staggered
  swayIntensity: 0.01
}
```

### Implementation in CharacterSpot

```typescript
const CharacterSpot: React.FC<...> = ({ ..., index }) => {
  const idleGroupRef = useRef<THREE.Group>(null);
  
  // Staggered idle animation
  useFrame(({ clock }) => {
    if (!idleGroupRef.current) return;
    const time = clock.elapsedTime;
    const phase = index * 0.5; // Offset per character
    
    // Breathing
    const breath = Math.sin(time * 1.5 + phase) * 0.005;
    idleGroupRef.current.scale.set(1 + breath, 1, 1 + breath * 0.5);
    
    // Weight shift
    idleGroupRef.current.rotation.z = Math.sin(time * 0.5 + phase) * 0.015;
  });
  
  return (
    <group ref={idleGroupRef}>
      <RPMAvatar ... />
    </group>
  );
};
```

---

## Files to Modify

### 1. `src/components/avatar-3d/HouseFurniture.tsx`

Add new components:
- `TVStand` - TV with entertainment center
- `KitchenArea` - Counter, cabinets, bar stools
- `DiaryRoomDoor` - Iconic red door with sign
- `BarStool` - Reusable bar stool component
- `WallPanel` - Curved wall segment for backdrop

### 2. `src/components/avatar-3d/HouseScene.tsx`

Updates:
- Add new furniture to SceneContent
- Create `useCameraFlyTo` hook for smooth transitions
- Modify CharacterSpot to include idle animations with phase offset
- Pass character index to CharacterSpot for staggered animations
- Update CameraController to handle fly-to logic
- Add refs to OrbitControls for programmatic target updates

### 3. `src/components/avatar-3d/index.ts`

Export new furniture components:
```typescript
export { 
  HouseFloor, Couch, CoffeeTable, Plant, LightFixture,
  TVStand, KitchenArea, DiaryRoomDoor, BarStool, WallPanel 
} from './HouseFurniture';
```

---

## Technical Details

### Camera Animation Math

**Easing Function:**
```typescript
const easeInOutCubic = (t: number): number => {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
```

**OrbitControls Integration:**
- Store ref to OrbitControls
- Temporarily disable user input during animation
- Update `controls.target` alongside camera position
- Re-enable input after animation completes

### Performance Considerations

1. **Furniture LOD**: Keep furniture simple (low poly primitives)
2. **Animation Throttling**: Idle animations use minimal calculations
3. **Camera Transitions**: Only animate when selection changes
4. **Staggered Updates**: Distribute animation phases to reduce frame spikes

---

## Expected Result

After implementation:
- The scene includes a TV area, kitchen counter with stools, and the iconic Diary Room door
- Characters subtly breathe and sway, creating a lifelike idle state
- Clicking a character smoothly flies the camera to focus on them
- Clicking away returns to the overview perspective

