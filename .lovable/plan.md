
# Plan: Create Big Brother House 3D Environment Scene

## Overview

Build an immersive 3D "Big Brother House" environment where all 12 character avatars are displayed together in a living room scene, similar to the Survivor character selector reference. The scene will serve as an enhanced character selection experience and potential in-game location.

## Design Approach

Since there's no public domain GLB model of a Big Brother house readily available, we'll create a stylized procedural environment using React Three Fiber primitives and drei helpers:

1. **Living Room Floor/Stage** - A circular or rectangular platform with wood/carpet texture
2. **Background Environment** - Using drei's `Environment` preset (apartment/lobby) for realistic lighting and reflections
3. **Decorative Elements** - Procedural furniture (couches, coffee table, plants) using simple Three.js geometries
4. **Character Positions** - Circular arrangement of all 12 NPCs around the room

## Technical Architecture

```text
HouseScene (new component)
├── Canvas (React Three Fiber)
│   ├── Environment (preset="apartment" for interior lighting)
│   ├── OrbitControls (camera manipulation)
│   ├── Floor (circular platform with gradient)
│   ├── Furniture (procedural decorations)
│   ├── CharacterGroup
│   │   └── RPMAvatar × 12 (positioned in circle)
│   └── Lighting (ambient + directional)
└── UI Overlay
    ├── Character Carousel (bottom, like Survivor reference)
    └── Selected Character Panel
```

## File Changes

### 1. Create `src/components/avatar-3d/HouseScene.tsx`

New component that renders the Big Brother house environment with all characters:

- **Floor**: Circular platform with gradient material (simulating stage/living room)
- **Environment**: Use drei's `Environment` with `preset="apartment"` or `preset="lobby"` for interior lighting
- **Character Positions**: Calculate circular positions for 12 characters
- **Camera Controls**: OrbitControls with limits for viewing the scene
- **Selection Highlight**: Glow effect on selected character

Key code structure:
```typescript
// Character circular positions
const CHAR_POSITIONS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const radius = 4;
  return [
    Math.sin(angle) * radius,
    0,
    Math.cos(angle) * radius
  ] as [number, number, number];
});

// Scene component
export const HouseScene: React.FC<HouseSceneProps> = ({
  characters,
  selectedId,
  onSelect
}) => {
  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
      <Environment preset="apartment" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      
      {/* Floor platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#2a2a35" />
      </mesh>
      
      {/* Characters in circle */}
      {characters.map((char, i) => (
        <group 
          key={char.id} 
          position={CHAR_POSITIONS[i]}
          rotation={[0, -CHAR_POSITIONS[i].angle, 0]}
          onClick={() => onSelect(char.id)}
        >
          <RPMAvatar
            modelSrc={char.avatarUrl}
            context="game"
            scale={1}
          />
          {selectedId === char.id && <SelectionRing />}
        </group>
      ))}
      
      <OrbitControls 
        enablePan={false}
        minDistance={8}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
};
```

### 2. Create `src/components/avatar-3d/HouseFurniture.tsx`

Procedural furniture components using Three.js primitives:

- **Couch**: Box geometries with rounded appearance
- **CoffeeTable**: Simple cylindrical table
- **Plants**: Cone/sphere combinations
- **Lighting fixtures**: Emissive spheres for visual interest

```typescript
// Simplified procedural couch
export const Couch: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[2, 0.6, 0.8]} />
      <meshStandardMaterial color="#4a3a2a" />
    </mesh>
    <mesh position={[0, 0.7, -0.3]}>
      <boxGeometry args={[2, 0.5, 0.3]} />
      <meshStandardMaterial color="#5a4a3a" />
    </mesh>
  </group>
);
```

### 3. Update `src/components/game-setup/AvatarSelector.tsx`

Add a toggle to switch between grid view and 3D house view:

- Add "View in House" button that toggles to HouseScene
- Pass characters and selection state to HouseScene
- Maintain selection sync between views

### 4. Create `src/components/avatar-3d/CharacterCarousel.tsx`

Bottom UI overlay similar to the Survivor reference:

- Horizontal scrollable row of character portraits
- Ornate frames matching existing CharacterFrame style
- Keyboard/controller navigation hints (LB/RB for tribes equivalent)
- Click to select and focus camera on character

### 5. Update `src/components/avatar-3d/index.ts`

Export new components:
```typescript
export { HouseScene } from './HouseScene';
export { HouseFurniture, Couch, CoffeeTable, Plant } from './HouseFurniture';
export { CharacterCarousel } from './CharacterCarousel';
```

## Visual Design Details

### Floor/Stage
- Circular platform (radius 6 units) with dark wood/slate gradient
- Subtle grid pattern or concentric rings
- Soft shadow receiving

### Character Arrangement
- 12 characters in a circle, facing center
- Slight spacing to prevent overlap
- Characters stand in T-pose or idle stance
- Selected character has glow ring and slight elevation

### Lighting
- HDRI environment preset "apartment" or "lobby" for realistic interior reflections
- Key directional light from above-front
- Fill ambient light for softer shadows
- Optional point lights simulating room fixtures

### Camera
- Default bird's-eye perspective (similar to reference)
- OrbitControls for user exploration
- Smooth transitions when selecting characters
- FOV around 45-50 degrees for dramatic perspective

## UI Overlay (HTML/React)

### Bottom Carousel
- Horizontal strip of character thumbnails
- Current selection highlighted with border
- Name plates below each portrait
- Scroll arrows for navigation
- Styled to match existing gold/amber theme

### Info Panel
- When character selected, show detail card (existing CharacterDetailPanel)
- Position: right side overlay or top-right corner

## Performance Considerations

1. **LOD for Avatars**: Use `context="game"` which loads lower-poly versions
2. **Lazy Loading**: Only load visible characters, use Suspense boundaries
3. **Frame Limiter**: Consider `frameloop="demand"` for static scenes
4. **Shadow Optimization**: Limit shadow casting to key lights only

## Future Enhancements (Not in scope but prepared for)

- Add actual 3D room model when suitable CC0 GLB is found (Quaternius packs, Sketchfab)
- Animate characters with idle animations
- Add room sections (kitchen, bedroom, diary room) for game phases
- Implement character walking animations when selected
