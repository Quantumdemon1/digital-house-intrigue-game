
# Plan: Backyard/Pool Area, Event-Based Lighting, and Room Navigation

## Overview

This plan adds three major enhancements to the 3D Big Brother House:

1. **Backyard/Pool Area** - Outdoor competition space with pool, hot tub, and competition elements
2. **Event-Based Dynamic Lighting** - Room lights that change color based on game phase (eviction, competition, ceremony)
3. **Room Navigation UI** - Quick-jump buttons to fly the camera to specific rooms

---

## 1. Backyard/Pool Area

### Layout (extends north from main house)

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                              BACKYARD AREA                                │
│  ┌─────────────┐    ┌────────────────────────────┐    ┌──────────────┐  │
│  │             │    │                            │    │              │  │
│  │   HOT TUB   │    │         POOL               │    │  LOUNGERS    │  │
│  │    (o)      │    │        ~~~~                │    │   ═══        │  │
│  │             │    │        ~~~~                │    │   ═══        │  │
│  └─────────────┘    └────────────────────────────┘    │   ═══        │  │
│                                                        └──────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     COMPETITION PLATFORM                           │  │
│  │   [Podium 1]  [Podium 2]  [Podium 3]  [Podium 4]  [Podium 5]      │  │
│  │               [Podium 6]  [Podium 7]  [Podium 8]                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────┐                                      ┌──────────────┐  │
│  │   OUTDOOR   │      ⭐ HOST STAGE ⭐              │   OUTDOOR    │  │
│  │   SEATING   │       [Podium]                       │   GRILL      │  │
│  └─────────────┘                                      └──────────────┘  │
│                                                                           │
│                        [SLIDING GLASS DOORS]                              │
├───────────────────────────────────────────────────────────────────────────┤
│                           EXISTING HOUSE                                  │
```

### New Components to Create

| Component | Description |
|-----------|-------------|
| `SwimmingPool` | Rectangular pool with animated water shader, LED edge lighting |
| `HotTub` | Circular hot tub with bubbling water effect, wood surround |
| `PoolLounge` | Sun lounger with umbrella, towel |
| `CompetitionPlatform` | Raised stage with 8 competition podiums in semi-circle |
| `CompetitionPodium` | Individual podium with player name display, buzzer button |
| `HostStage` | Elevated hosting platform with BB logo backdrop |
| `OutdoorSeating` | Sectional outdoor sofa with cushions |
| `BBQGrill` | Stainless steel outdoor grill station |
| `PoolFence` | Glass safety barrier around pool area |
| `BackyardFloor` | Stone patio flooring with grass border |
| `SlidingGlassDoor` | Large glass doors connecting to interior |

### Water Effects

```typescript
// Animated water material using sine waves
const waterMaterial = useMemo(() => new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color('#3b82f6') },
    color2: { value: new THREE.Color('#0ea5e9') },
  },
  vertexShader: `
    varying vec2 vUv;
    uniform float time;
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.y += sin(pos.x * 2.0 + time) * 0.05;
      pos.y += sin(pos.z * 1.5 + time * 1.2) * 0.03;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float time;
    void main() {
      float wave = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
      vec3 color = mix(color1, color2, wave);
      gl_FragColor = vec4(color, 0.85);
    }
  `,
  transparent: true,
}), []);
```

---

## 2. Event-Based Dynamic Lighting System

### Lighting States

| Game Event | Primary Color | Accent Color | Mood |
|------------|---------------|--------------|------|
| `normal` | Warm white | Blue cove | Ambient |
| `hoh-competition` | Blue `#3b82f6` | Gold flashes | Competitive |
| `pov-competition` | Gold `#fbbf24` | White spots | Victorious |
| `nomination` | Red `#dc2626` | Black shadows | Tense |
| `eviction` | Deep red `#991b1b` | White spotlight | Dramatic |
| `ceremony` | Gold `#fbbf24` | Purple accents | Celebratory |
| `finale` | Gold + confetti | All colors | Epic |

### New Hook: `useEventLighting.ts`

Manages global lighting state and animates transitions:

```typescript
interface EventLightingState {
  event: 'normal' | 'hoh' | 'pov' | 'nomination' | 'eviction' | 'ceremony' | 'finale';
  intensity: number;
  transitionProgress: number;
}

const useEventLighting = (gamePhase: GamePhase) => {
  const [lightingState, setLightingState] = useState<EventLightingState>({
    event: 'normal',
    intensity: 1,
    transitionProgress: 1,
  });
  
  // Map game phases to lighting events
  useEffect(() => {
    const phaseToEvent: Record<string, EventLightingState['event']> = {
      'HoH': 'hoh',
      'HOH Competition': 'hoh',
      'PoV': 'pov',
      'POV Competition': 'pov',
      'Nomination': 'nomination',
      'Eviction': 'eviction',
      'Finale': 'finale',
    };
    
    const event = phaseToEvent[gamePhase] || 'normal';
    setLightingState(prev => ({
      event,
      intensity: 1,
      transitionProgress: 0,  // Start transition
    }));
  }, [gamePhase]);
  
  return lightingState;
};
```

### New Component: `DynamicRoomLighting.tsx`

Applies lighting effects to each room based on event state:

```typescript
interface DynamicRoomLightingProps {
  event: 'normal' | 'hoh' | 'pov' | 'nomination' | 'eviction' | 'ceremony' | 'finale';
  roomPositions: {
    livingRoom: [number, number, number];
    hohSuite: [number, number, number];
    nomination: [number, number, number];
    // ...
  };
}

const DynamicRoomLighting: React.FC<DynamicRoomLightingProps> = ({ event, roomPositions }) => {
  const lightRefs = useRef<THREE.PointLight[]>([]);
  
  // Animate light colors and intensities
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    lightRefs.current.forEach((light, i) => {
      if (event === 'eviction') {
        // Pulsing red for eviction
        light.intensity = 0.5 + Math.sin(time * 2) * 0.3;
        light.color.set('#dc2626');
      } else if (event === 'hoh') {
        // Blue with gold flashes
        const flash = Math.sin(time * 8) > 0.9 ? 1 : 0;
        light.color.set(flash ? '#fbbf24' : '#3b82f6');
      }
      // ... other events
    });
  });
  
  return (
    <group>
      {/* Living room spotlight */}
      <spotLight ref={el => lightRefs.current[0] = el!} position={roomPositions.livingRoom} />
      {/* Nomination room dramatic light */}
      <spotLight ref={el => lightRefs.current[1] = el!} position={roomPositions.nomination} />
      {/* ... */}
    </group>
  );
};
```

### LED Strip Color Updates

Modify existing `LEDCoveLighting` to accept dynamic color:

```typescript
export const LEDCoveLighting: React.FC<{
  position: [number, number, number];
  width: number;
  depth: number;
  color?: string;
  eventColor?: string;  // NEW: Override color during events
  pulseSpeed?: number;  // NEW: Animation speed
}> = ({ position, width, depth, color = '#3b82f6', eventColor, pulseSpeed = 0.3 }) => {
  const activeColor = eventColor || color;
  // ... rest of component with animated color transitions
};
```

---

## 3. Room Navigation UI

### New Component: `RoomNavigator.tsx`

A floating UI panel with quick-jump buttons for each room:

```text
┌─────────────────────────────────────┐
│  🏠 ROOM NAVIGATION                 │
├─────────────────────────────────────┤
│  [👑 HOH Suite]     [🛏️ Bedrooms]   │
│  [🗣️ Diary Room]   [🍳 Kitchen]    │
│  [📺 Living Room]  [🎮 Game Room]  │
│  [⚠️ Nomination]   [🏊 Backyard]   │
└─────────────────────────────────────┘
```

### Room Camera Positions

```typescript
const ROOM_CAMERA_POSITIONS: Record<string, {
  camera: [number, number, number];
  target: [number, number, number];
  label: string;
  icon: string;
}> = {
  overview: {
    camera: [0, 18, 25],
    target: [0, 0.5, 0],
    label: 'Overview',
    icon: '🏠',
  },
  hohSuite: {
    camera: [14, 5, -6],
    target: [10, 0.5, -10],
    label: 'HOH Suite',
    icon: '👑',
  },
  diaryRoom: {
    camera: [-10, 3, -3],
    target: [-14, 1, -3],
    label: 'Diary Room',
    icon: '🗣️',
  },
  kitchen: {
    camera: [8, 4, 6],
    target: [12, 0.5, 0],
    label: 'Kitchen',
    icon: '🍳',
  },
  livingRoom: {
    camera: [0, 6, 10],
    target: [0, 0.5, 0],
    label: 'Living Room',
    icon: '📺',
  },
  gameRoom: {
    camera: [16, 4, 12],
    target: [12, 0.5, 9],
    label: 'Game Room',
    icon: '🎮',
  },
  nomination: {
    camera: [0, 5, 16],
    target: [0, 0.5, 11],
    label: 'Nomination',
    icon: '⚠️',
  },
  bedrooms: {
    camera: [-6, 5, -6],
    target: [-5, 0.5, -10],
    label: 'Bedrooms',
    icon: '🛏️',
  },
  backyard: {
    camera: [0, 12, -28],
    target: [0, 0, -22],
    label: 'Backyard',
    icon: '🏊',
  },
};
```

### Camera Fly-To Enhancement

Update `CameraController` to support room navigation:

```typescript
const CameraController: React.FC<{ 
  focusPosition: [number, number, number] | null;
  roomTarget: { camera: [number, number, number]; target: [number, number, number] } | null;
  defaultPosition: [number, number, number];
  controlsRef: React.RefObject<any>;
}> = ({ focusPosition, roomTarget, defaultPosition, controlsRef }) => {
  // Priority: roomTarget > focusPosition > defaultPosition
  // Animate to room camera position when roomTarget changes
  useEffect(() => {
    if (roomTarget) {
      // Fly to room
      targetCameraPos.current.set(...roomTarget.camera);
      targetLookAt.current.set(...roomTarget.target);
      startAnimation();
    }
  }, [roomTarget]);
};
```

---

## Files to Create

### `src/components/avatar-3d/BackyardArea.tsx`

Contains all backyard components:
- `BackyardFloor` - Stone patio with grass border
- `SwimmingPool` - Animated water pool with LED edge
- `HotTub` - Circular hot tub with bubbles
- `PoolLounge` - Lounger with umbrella
- `CompetitionPlatform` - Stage with podiums
- `CompetitionPodium` - Individual contestant podium
- `HostStage` - Julie Chen hosting platform
- `OutdoorSeating` - Patio furniture
- `BBQGrill` - Outdoor kitchen
- `Backyard` (main export) - Composite of all elements

### `src/components/avatar-3d/hooks/useEventLighting.ts`

Hook that:
- Takes current `gamePhase` as input
- Maps phases to lighting event types
- Returns current color scheme and animation state
- Handles transitions between states

### `src/components/avatar-3d/DynamicRoomLighting.tsx`

Component that:
- Renders point/spot lights at room positions
- Animates light colors based on event type
- Applies pulsing/flashing effects for drama
- Includes ambient light modulation

### `src/components/avatar-3d/RoomNavigator.tsx`

UI component that:
- Renders floating room navigation panel
- Maps room buttons to camera positions
- Calls `onNavigate(roomId)` callback
- Shows current room highlight
- Mobile-responsive grid layout

---

## Files to Modify

### `src/components/avatar-3d/HouseFurnitureExpanded.tsx`

Add new exports for backyard use:
- `SlidingGlassDoor` - Large glass door component
- `OutdoorUmbrella` - Pool umbrella
- `PlantPot` - Decorative outdoor plants

### `src/components/avatar-3d/HouseScene.tsx`

**Add imports:**
```typescript
import { Backyard } from './BackyardArea';
import DynamicRoomLighting from './DynamicRoomLighting';
import RoomNavigator from './RoomNavigator';
import { useEventLighting } from './hooks/useEventLighting';
```

**Add props:**
```typescript
interface HouseSceneProps {
  // ... existing props
  gamePhase?: string;  // For event lighting
  onRoomNavigate?: (roomId: string) => void;
}
```

**Add to SceneContent:**
```tsx
// Event-based lighting
const lightingEvent = useEventLighting(gamePhase);

// Room navigation state
const [targetRoom, setTargetRoom] = useState<string | null>(null);

// In JSX:
<Backyard position={[0, 0, -22]} />
<DynamicRoomLighting event={lightingEvent.event} />
```

**Update CameraController:**
```tsx
<CameraController 
  focusPosition={selectedPosition || null}
  roomTarget={targetRoom ? ROOM_CAMERA_POSITIONS[targetRoom] : null}
  defaultPosition={[0, 18, 25]}
  controlsRef={controlsRef}
/>
```

### `src/components/avatar-3d/HouseRooms.tsx`

**Add LED color prop:**
Update each room component to accept optional `eventColor` prop:
```typescript
export const LivingRoom: React.FC<RoomProps & { eventColor?: string }> = ({ position, eventColor }) => {
  return (
    <group position={position}>
      <LEDCoveLighting eventColor={eventColor} ... />
    </group>
  );
};
```

### `src/components/game-screen/HouseViewDialog.tsx`

**Add game phase and navigation:**
```typescript
const HouseViewDialog: React.FC<HouseViewDialogProps> = ({ open, onOpenChange }) => {
  const { gameState } = useGame();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  return (
    <motion.div>
      {/* 3D House Scene with new props */}
      <HouseScene
        characters={activeCharacters}
        selectedId={selectedId}
        onSelect={setSelectedId}
        gamePhase={gameState.phase}
        onRoomNavigate={setSelectedRoom}
      />
      
      {/* Room Navigator overlay */}
      <div className="absolute top-20 left-4 z-10">
        <RoomNavigator 
          currentRoom={selectedRoom}
          onNavigate={setSelectedRoom}
        />
      </div>
    </motion.div>
  );
};
```

### `src/components/avatar-3d/hooks/index.ts`

Export new hooks:
```typescript
export { useEventLighting, type LightingEvent } from './useEventLighting';
```

### `src/components/avatar-3d/index.ts`

Export new components:
```typescript
export { Backyard } from './BackyardArea';
export { default as DynamicRoomLighting } from './DynamicRoomLighting';
export { default as RoomNavigator } from './RoomNavigator';
```

---

## Technical Details

### Backyard Position

The backyard extends from the back wall of the house at z = -14 outward:
- Backyard area: z = -15 to z = -35 (20m deep)
- Pool centered at [0, 0, -22]
- Competition platform at [0, 0, -30]

### Lighting Transition Animation

```typescript
// Smooth color interpolation over 1 second
const colorTransition = (from: string, to: string, progress: number): string => {
  const fromColor = new THREE.Color(from);
  const toColor = new THREE.Color(to);
  const result = fromColor.lerp(toColor, easeInOutCubic(progress));
  return `#${result.getHexString()}`;
};
```

### Mobile-Responsive Room Navigator

```typescript
// Collapse to icon-only on small screens
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
  {rooms.map(room => (
    <Button key={room.id} variant="ghost" onClick={() => onNavigate(room.id)}>
      <span className="text-lg">{room.icon}</span>
      <span className="hidden sm:inline ml-2">{room.label}</span>
    </Button>
  ))}
</div>
```

---

## Expected Results

After implementation:
- Full backyard area with pool, hot tub, and competition stage
- Animated water effects in pool and hot tub
- 8 competition podiums for houseguest challenges
- Host stage for eviction ceremonies
- Room lights automatically change color based on game phase
- Red pulsing lights during eviction
- Blue/gold lights during competitions
- Quick-jump room navigation buttons in House View
- Smooth camera fly-to animations when navigating rooms
- Mobile-friendly navigation panel
