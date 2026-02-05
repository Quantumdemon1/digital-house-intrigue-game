
# Mobile Optimization for House Views and Game Features

## Overview

This plan optimizes the 3D House View, game UI, and core features for mobile devices based on thorough codebase analysis. The focus areas include responsive layouts, touch interaction improvements, performance tuning for mobile GPUs, and UI/UX refinements.

---

## Current State Analysis

### Strengths Already in Place
- `useIsMobile()` hook exists and is used in key components
- Touch gesture system (`useTouchGestures.ts`) already handles pinch/swipe
- `RoomNavigatorCompact` provides a mobile-optimized room selector
- Responsive hints differentiate mobile vs desktop instructions
- `SocialNetworkDialog` has good mobile adaptations

### Areas Needing Improvement

| Component | Issue | Impact |
|-----------|-------|--------|
| `HouseViewDialog` | No mobile-specific layout adjustments | 3D scene cramped on small screens |
| `HouseScene` | Post-processing (Bloom, Vignette) runs on mobile | Performance drain |
| `CharacterCarousel` | Navigation hints assume keyboard | Confusing on mobile |
| `HouseViewPanel` | Fixed height doesn't adapt to mobile | Wasted screen space |
| `GameHeader` | Buttons cluster tightly on mobile | Tap targets too small |
| `GameSidebar` | Full sidebar shown on mobile in lg:flex-row | Takes 50% width on tablets |
| `CircularHouseScene` | Duplicate idle animation still runs | Performance waste |
| Touch controls | No visual touch zone hints | Users don't know gesture areas |

---

## Part 1: 3D House View Mobile Optimizations

### 1.1 Disable Post-Processing on Mobile

Post-processing effects (Bloom, Vignette) are GPU-intensive and unnecessary on small screens.

**File**: `src/components/avatar-3d/HouseScene.tsx`

```typescript
// Inside HouseScene component
const isMobile = useIsMobile();

// In Canvas render:
{!isMobile && (
  <EffectComposer>
    <Bloom intensity={0.4} ... />
    <Vignette ... />
  </EffectComposer>
)}
```

Same change for `CircularHouseScene.tsx`.

### 1.2 Reduce Shadow Map Resolution on Mobile

**File**: `HouseScene.tsx` - SceneContent

```typescript
<directionalLight 
  shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
  // ... rest of props
/>
```

### 1.3 Simplify Contact Shadows on Mobile

```typescript
<ContactShadows
  blur={isMobile ? 1.5 : 2}
  far={isMobile ? 10 : 15}
  resolution={isMobile ? 256 : 512}
/>
```

### 1.4 Hide Mini-Map on Mobile

The mini-map in `RoomNavigator` is too small to be useful on mobile.

**File**: `src/components/avatar-3d/RoomNavigator.tsx`

```typescript
// Only show mini-map on larger screens
{characterPositions.length > 0 && !isMobile && (
  <div className="mb-2 p-2 ...">
    {/* Mini-map content */}
  </div>
)}
```

### 1.5 Mobile-Optimized House View Dialog

**File**: `src/components/game-screen/HouseViewDialog.tsx`

Add safe area handling and fullscreen optimization:

```typescript
<motion.div
  className="fixed inset-0 z-50 bg-background safe-area-inset"
>
  {/* Close button - larger tap target on mobile */}
  <Button
    size={isMobile ? "lg" : "icon"}
    className={cn(
      "absolute z-50",
      isMobile 
        ? "top-2 right-2 h-12 w-12" 
        : "top-4 right-4"
    )}
  >
```

---

## Part 2: Character Carousel Mobile Improvements

### 2.1 Remove Keyboard Hints on Mobile

**File**: `src/components/avatar-3d/CharacterCarousel.tsx`

```typescript
{/* Navigation hint - hide keyboard hints on mobile */}
<div className={cn(
  "justify-center gap-8 py-2 text-xs text-white/50 border-b border-white/10",
  "hidden sm:flex"  // Hide entire keyboard hint section on mobile
)}>
  {/* keyboard hints */}
</div>

{/* Mobile swipe hint */}
<div className="flex sm:hidden justify-center py-1.5 text-xs text-white/40">
  Swipe to browse • Tap to select
</div>
```

### 2.2 Smaller Character Thumbnails on Mobile

```typescript
<div className={cn(
  'relative rounded-full overflow-hidden',
  'ring-2 transition-all duration-200',
  isMobile ? 'w-12 h-12' : 'w-16 h-16',  // Smaller on mobile
  // ...ring colors
)}>
```

### 2.3 Hide Scroll Buttons on Mobile

Touch scrolling is natural; buttons clutter the interface.

```typescript
{/* Left scroll button - hide on mobile */}
<button
  onClick={scrollLeft}
  className="absolute left-2 ... hidden sm:flex"
>

{/* Right scroll button - hide on mobile */}
<button
  onClick={scrollRight}
  className="absolute right-2 ... hidden sm:flex"
>
```

---

## Part 3: Game Screen Mobile Layout

### 3.1 Stack Sidebar Below Content on Mobile

**File**: `src/components/game-screen/GameScreen.tsx`

The current layout is `flex-col lg:flex-row` which is correct, but sidebar takes too much space on tablets.

```typescript
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
  {/* Main Game Area */}
  <motion.div className="lg:flex-1 min-w-0">
    {/* content */}
  </motion.div>
  
  {/* Sidebar - full width on mobile, fixed width on desktop */}
  <motion.div className="w-full lg:w-80 xl:w-96 shrink-0">
    {/* Make sidebar collapsible on mobile */}
    <CollapsibleSidebar />
  </motion.div>
</div>
```

### 3.2 Create Collapsible Mobile Sidebar

New component to wrap `GameSidebar` with expand/collapse on mobile:

**File**: `src/components/game-screen/CollapsibleMobileSidebar.tsx`

```typescript
const CollapsibleMobileSidebar = () => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isMobile) {
    return <GameSidebar />;
  }
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger className="w-full p-3 bg-card rounded-lg border flex items-center justify-between">
        <span className="font-semibold">Houseguests & Status</span>
        <ChevronDown className={cn("transition-transform", isExpanded && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <GameSidebar />
      </CollapsibleContent>
    </Collapsible>
  );
};
```

### 3.3 Compact Header on Mobile

**File**: `src/components/game-screen/GameHeader.tsx`

- Larger tap targets for House/Social buttons
- Stack elements vertically on very small screens

```typescript
{/* Action buttons - larger on mobile */}
<div className="flex items-center gap-1.5 sm:gap-2">
  {onShowHouseView && (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-1.5",
        "min-h-[44px] min-w-[44px]"  // iOS minimum tap target
      )}
    >
```

---

## Part 4: Social Interaction Phase Mobile Layout

### 4.1 HouseViewPanel Responsive Height

**File**: `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx`

```typescript
{showHouseView && (
  <div className={cn(
    "w-full",
    "h-[300px] sm:h-[400px] lg:h-[600px]",  // Shorter on mobile
    "lg:w-1/2 xl:w-3/5"
  )}>
    <HouseViewPanel ... />
  </div>
)}
```

### 4.2 Stack Layout on Mobile

```typescript
<div className={cn(
  "flex gap-4",
  showHouseView 
    ? "flex-col lg:flex-row"  // Always stack on mobile when house view is shown
    : "flex-col"
)}>
```

---

## Part 5: Touch Interaction Enhancements

### 5.1 Add Touch Zone Indicator

Visual hint showing where gestures work.

**File**: `src/components/avatar-3d/TouchZoneHint.tsx` (new)

```typescript
export const TouchZoneHint = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  
  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Center gesture zone */}
      <div className="absolute inset-8 border-2 border-dashed border-white/20 rounded-xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/40 text-xs">Drag to rotate</span>
        </div>
      </div>
    </motion.div>
  );
};
```

### 5.2 Improve Long-Press Feedback

Add haptic feedback (where supported) and visual indication.

```typescript
const handleLongPress = useCallback((pos) => {
  // Haptic feedback on supported devices
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  setMoveMode(true);
}, []);
```

---

## Part 6: Performance Optimizations

### 6.1 Reduce Avatar Detail on Mobile

Pass a `quality` prop based on device.

**File**: `src/components/avatar-3d/RPMAvatar.tsx`

```typescript
// In HouseScene when rendering CharacterSpot
<RPMAvatar
  quality={isMobile ? 'low' : 'high'}
  // Lower quality reduces bone calculations and texture resolution
/>
```

### 6.2 Remove Redundant Idle Animation in CircularHouseScene

The `CircularHouseScene` still has the duplicate idle animation that was removed from `HouseScene`.

**File**: `src/components/avatar-3d/CircularHouseScene.tsx` (lines 108-116)

```typescript
// REMOVE this redundant useFrame animation:
useFrame(({ clock }) => {
  // ...duplicate breathing/sway animation
});

// The AnimationController handles this at bone level
```

### 6.3 Lazy Load 3D Components on Mobile

Already implemented for `HouseScene` in `HouseViewPanel`, but extend to other 3D uses.

---

## Part 7: Responsive UI Utilities

### 7.1 Add Safe Area Utilities

**File**: `src/index.css` or Tailwind config

```css
.safe-area-inset {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 7.2 Minimum Tap Target Sizes

Ensure all interactive elements meet 44x44px minimum on mobile.

---

## Implementation Order

### Phase 1: Performance Quick Wins
1. Disable post-processing on mobile (HouseScene, CircularHouseScene)
2. Reduce shadow/contact shadow quality on mobile
3. Remove duplicate idle animation in CircularHouseScene

### Phase 2: Layout Adjustments
4. Responsive HouseViewDialog with safe areas
5. HouseViewPanel responsive heights
6. SocialInteractionPhase stacked layout on mobile

### Phase 3: UI/UX Polish
7. CharacterCarousel mobile optimizations (swipe hints, smaller thumbnails)
8. Collapsible mobile sidebar
9. Larger tap targets in GameHeader

### Phase 4: Touch Enhancements
10. TouchZoneHint component
11. Haptic feedback for long-press
12. Visual move mode improvements

---

## Files Summary

### Create
| File | Purpose |
|------|---------|
| `src/components/game-screen/CollapsibleMobileSidebar.tsx` | Collapsible sidebar wrapper for mobile |
| `src/components/avatar-3d/TouchZoneHint.tsx` | Visual gesture zone indicator |

### Modify
| File | Changes |
|------|---------|
| `HouseScene.tsx` | Disable post-processing, reduce shadows on mobile |
| `CircularHouseScene.tsx` | Remove duplicate idle, disable post-processing |
| `HouseViewDialog.tsx` | Safe area handling, larger close button |
| `CharacterCarousel.tsx` | Mobile swipe hints, smaller thumbnails, hide scroll buttons |
| `RoomNavigator.tsx` | Hide mini-map on mobile |
| `SocialInteractionPhase.tsx` | Responsive heights and stacked layout |
| `GameScreen.tsx` | Use collapsible sidebar on mobile |
| `GameHeader.tsx` | Larger tap targets |
| `HouseViewPanel.tsx` | Responsive min-heights |

---

## Testing Checklist

### Performance
- [ ] 3D scene maintains 30+ fps on mid-range phones
- [ ] No visible lag when switching rooms
- [ ] Avatar animations remain smooth
- [ ] Memory usage stable during extended use

### Touch Interactions
- [ ] Pinch-to-zoom works smoothly
- [ ] Single-finger drag rotates camera
- [ ] Tap to select characters works reliably
- [ ] Long-press activates move mode
- [ ] Swipe works on character carousel

### Layout
- [ ] No horizontal scroll on any screen size
- [ ] All text remains readable
- [ ] Buttons have adequate tap targets (44x44px)
- [ ] Safe areas respected on notched devices
- [ ] Sidebar collapses properly on mobile

### Devices to Test
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (notch + dynamic island)
- [ ] Android mid-range (Pixel 6a or similar)
- [ ] iPad Mini (tablet portrait)
- [ ] iPad Pro (tablet landscape)
