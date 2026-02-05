
# 3D House View: Performance Optimizations & UI/UX Improvements

## Current State Analysis

After thorough codebase review, I've identified several performance bottlenecks and UI/UX issues that can be addressed.

---

## Part 1: Performance Optimizations

### 1.1 Animation Frame Budget Management

**Issue**: Every character runs its own `useFrame` animation loop with full calculations regardless of visibility.

**Solution**: Implement frustum culling and distance-based LOD for animations.

| Location | Current | Optimization |
|----------|---------|--------------|
| `CharacterSpot` in HouseScene | Always runs full idle animation | Skip animation when off-screen |
| `AnimationController.ts` | Full layer updates every frame | Throttle based on distance from camera |
| `IdleProceduralLayer.ts` | Multi-octave noise calculations | Use simpler noise for distant characters |

**Files to modify:**
- `src/components/avatar-3d/HouseScene.tsx` - Add frustum culling check
- `src/components/avatar-3d/animation/AnimationController.ts` - Add distance-based throttling

### 1.2 Reduce Duplicate Idle Animations

**Issue**: `CharacterSpot` component has its own idle animation loop (lines 425-452) that runs IN ADDITION to the `AnimationController`'s idle layer.

**Current code in CharacterSpot:**
```typescript
useFrame(({ clock }) => {
  // Idle animation - staggered per character
  if (idleGroupRef.current) {
    // Breathing animation (subtle scale)
    const breath = Math.sin(time * 1.5 + phase) * 0.008;
    idleGroupRef.current.scale.set(1 + breath, 1, 1 + breath * 0.5);
    // Weight shift sway (subtle rotation)
    const sway = Math.sin(time * 0.5 + phase) * 0.012;
    idleGroupRef.current.rotation.z = sway;
  }
});
```

**Solution**: Remove this redundant animation since `IdleProceduralLayer.ts` already handles breathing and weight shift at the bone level.

### 1.3 Memoize Expensive Calculations

**Issue**: Several calculations happen every render instead of being memoized.

| Calculation | Location | Fix |
|-------------|----------|-----|
| Position map | `SceneContent` | Already memoized - good |
| Character positions | `getPosition` callback | Cache individual results |
| Relationship context | `RPMAvatar` | Already memoized - good |
| Room light colors | `DynamicRoomLighting` | Move THREE.Color creation outside useFrame |

### 1.4 Geometry and Material Instancing

**Issue**: Each room creates many similar mesh objects with duplicate materials.

**Solution**: Use instanced meshes for repeated elements.

**Files to modify:**
- `src/components/avatar-3d/HouseRooms.tsx` - Instance furniture legs, light fixtures
- `src/components/avatar-3d/BackyardArea.tsx` - Instance pool ladder rungs, lounger legs
- `src/components/avatar-3d/HouseFurnitureExpanded.tsx` - Share materials via context

### 1.5 Lazy Load Room Components

**Issue**: All rooms are loaded immediately even when not visible.

**Solution**: Only render rooms near the current camera position.

```typescript
// New hook: useVisibleRooms
const visibleRooms = useMemo(() => {
  const cameraPos = camera.position;
  return ROOMS.filter(room => 
    distance(cameraPos, room.center) < room.radius + VISIBILITY_MARGIN
  );
}, [camera.position]);
```

---

## Part 2: UI/UX Improvements

### 2.1 Loading State Improvements

**Issue**: When avatars fail to load or timeout, the user sees a wireframe capsule with no context.

**Solution**: Improve fallback states with informative UI.

**Changes:**
- Add "Tap to retry" on failed avatar loads
- Show character name on placeholder state
- Add subtle shimmer animation while loading

### 2.2 Room Navigator Enhancements

**Current State**: Room navigator is a basic button grid in top-left corner.

**Improvements:**
- Add a mini-map overview showing character positions
- Highlight the currently viewed room
- Add room icons with character counts
- Compact mode for mobile (already exists but not auto-activated)

**Files to modify:**
- `src/components/avatar-3d/RoomNavigator.tsx` - Add mini-map mode
- `src/components/avatar-3d/HouseScene.tsx` - Detect mobile and use compact navigator

### 2.3 Character Selection Feedback

**Current State**: Selected characters get a green ring and label, but interaction feels basic.

**Improvements:**
- Add subtle camera zoom toward selected character
- Show relationship status indicator (ally/enemy/neutral)
- Add quick action buttons (Chat, Ally, Info)
- Smooth transition when switching selections

**Files to modify:**
- `src/components/avatar-3d/HouseScene.tsx` - Enhance CharacterSpot selection
- Add new component: `CharacterQuickActions.tsx`

### 2.4 Mobile Touch Controls

**Current State**: Only mouse/orbit controls work; no touch-specific gestures.

**Improvements:**
- Two-finger pinch to zoom
- Swipe left/right to cycle characters
- Tap and hold for context menu
- Add visible touch hints

**Files to modify:**
- `src/components/avatar-3d/HouseScene.tsx` - Add touch event handlers

### 2.5 Character Carousel Improvements

**Current State**: Bottom carousel is functional but could be more informative.

**Improvements:**
- Show relationship icon next to each character
- Add "status ring" color (green=ally, red=enemy, gold=HoH)
- Keyboard navigation hints are shown but not obvious
- Add swipe gesture support

**Files to modify:**
- `src/components/avatar-3d/CharacterCarousel.tsx`

### 2.6 Accessibility Improvements

**Missing:**
- Screen reader labels for 3D scene elements
- Keyboard focus indicators
- Reduced motion mode (pause all animations)
- High contrast selection indicators

---

## Part 3: Error Handling Improvements

### 3.1 Strengthen Global Error Suppression

**Current**: App.tsx has an unhandledrejection listener but it could be more robust.

**Improvements:**
- Add specific error types for better logging
- Track failed avatar URLs to avoid retry loops
- Add error recovery with exponential backoff

### 3.2 Add Network-Aware Quality

**Current**: `rpm-avatar-optimizer.ts` has `getNetworkAwareQuality()` but it's not widely used.

**Solution**: Automatically downgrade quality on slow connections.

---

## Implementation Priority

### Phase 1: Quick Performance Wins
1. Remove duplicate idle animation in CharacterSpot
2. Add frustum culling to pause off-screen character animations
3. Memoize room calculations

### Phase 2: UI/UX Polish
4. Improve loading/error states with retry button
5. Enhance character selection feedback
6. Add mobile touch gesture support

### Phase 3: Advanced Optimizations
7. Implement geometry instancing for furniture
8. Add room-based lazy loading
9. Create mini-map navigator

---

## Technical Details

### Frustum Culling Implementation

```typescript
// In CharacterSpot component
const groupRef = useRef<THREE.Group>(null);
const [isVisible, setIsVisible] = useState(true);

useFrame(({ camera }) => {
  if (groupRef.current) {
    // Check if character is in camera frustum
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);
    
    const sphere = new THREE.Sphere(
      groupRef.current.position,
      1.5 // Character bounding radius
    );
    
    setIsVisible(frustum.containsPoint(groupRef.current.position));
  }
});

// Only run animations when visible
if (isVisible) {
  // ... animation code
}
```

### Quick Action Buttons Concept

```typescript
// New component for character selection overlay
const CharacterQuickActions: React.FC<{
  characterId: string;
  position: [number, number, number];
  onAction: (action: 'chat' | 'ally' | 'info') => void;
}> = ({ characterId, position, onAction }) => (
  <Html position={[position[0], position[1] + 2.5, position[2]]}>
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => onAction('chat')}>
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('ally')}>
        <Users className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('info')}>
        <Info className="h-4 w-4" />
      </Button>
    </div>
  </Html>
);
```

---

## Files Summary

### Create
| File | Purpose |
|------|---------|
| `src/components/avatar-3d/CharacterQuickActions.tsx` | Quick action overlay for selected character |
| `src/components/avatar-3d/hooks/useFrustumCulling.ts` | Frustum culling hook for performance |
| `src/components/avatar-3d/MiniMap.tsx` | Mini-map overlay component |

### Modify
| File | Changes |
|------|---------|
| `HouseScene.tsx` | Remove duplicate idle, add culling, enhance selection |
| `CharacterCarousel.tsx` | Add relationship indicators, swipe gestures |
| `RoomNavigator.tsx` | Add mini-map mode, auto-compact on mobile |
| `RPMAvatar.tsx` | Improve error states, add retry functionality |
| `AnimationController.ts` | Add distance-based quality throttling |

---

## Testing Checklist

### Performance
- [ ] Frame rate stays above 30fps with 12 characters
- [ ] Off-screen characters don't consume CPU
- [ ] Memory usage stays stable over time
- [ ] Avatar loading errors don't crash the scene

### UI/UX
- [ ] Character selection feels responsive
- [ ] Mobile touch gestures work smoothly
- [ ] Room navigation is intuitive
- [ ] Loading states are informative
- [ ] Keyboard navigation works throughout
