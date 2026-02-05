
# Fix Mobile Avatar Customizer Scrolling Issue

## Problem Summary

On mobile, users cannot scroll up to view the full avatar in the customizer dialog. The screenshot shows only the avatar's legs/pants are visible, and touch gestures are captured by the 3D controls instead of allowing page scroll.

## Root Causes

### 1. Touch Event Interception
The `OrbitControls` component in the 3D canvas captures touch events for rotation, which prevents the parent dialog from receiving scroll events on mobile.

### 2. Drag Motion on Avatar Container
The `motion.div` wrapper has `drag="x"` which also captures touch interactions.

### 3. Content Layout Not Mobile-Optimized
The `AvatarCustomizer` stacks vertically on mobile with:
- 3D preview (224px height on mobile)
- Zoom controls
- Rotation buttons
- "Open Full Editor" button
- Profile photo section
- RPM Creator panel (450px fixed height iframe)
- Continue button

Total content exceeds the viewport, but touch events are blocked.

## Solution

### Part 1: Disable 3D Rotation on Mobile for Customizer

The `OrbitControls` in `AvatarLoader` should be disabled on mobile when in the customizer context, allowing touch events to pass through for scrolling.

**File: `src/components/avatar-3d/AvatarLoader.tsx`**
- Add `enableRotation` prop (default `true`)
- Pass `false` from customizer on mobile
- Disable `OrbitControls` touch when scrolling should take priority

### Part 2: Mobile-Optimized Layout for AvatarCustomizer

Restructure the customizer layout for mobile to:
1. Make the avatar preview smaller on mobile (160px instead of 224px)
2. Reduce the RPM iframe height on mobile (350px instead of 450px)
3. Remove the `drag` functionality on mobile for the avatar container
4. Add proper scrollable container with `touch-action: pan-y` CSS

**File: `src/components/avatar-3d/AvatarCustomizer.tsx`**
- Detect mobile with media query hook
- Reduce avatar preview dimensions on mobile
- Remove drag-to-rotate on mobile (use buttons only)
- Add CSS to ensure touch scrolling works

### Part 3: Reduce RPM Panel Height on Mobile

**File: `src/components/avatar-3d/RPMAvatarCreatorPanel.tsx`**
- Use responsive height class: `h-[350px] lg:h-[450px]`

### Part 4: Add Touch-Friendly CSS

**File: `src/index.css`**
- Add `touch-action: pan-y` to customizer wrapper on mobile
- Ensure scroll containers work properly with touch

## Technical Changes

### File 1: `src/components/avatar-3d/AvatarLoader.tsx`

Add a new prop to control OrbitControls behavior:

```typescript
interface AvatarLoaderProps {
  // ... existing props
  /** Allow orbit rotation controls (disable on mobile customizer for scrolling) */
  enableOrbitControls?: boolean;
}

// In RPMAvatarCanvas:
<OrbitControls 
  enabled={enableOrbitControls !== false}  // Disable when prop is false
  enableZoom={false} 
  enablePan={false}
  // ...
/>
```

### File 2: `src/components/avatar-3d/AvatarCustomizer.tsx`

Add mobile detection and layout adjustments:

```typescript
// Add mobile detection
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Smaller avatar on mobile
<motion.div 
  className={cn(
    "relative rounded-2xl overflow-hidden",
    isMobile ? "w-40 h-40" : "w-56 h-56 lg:w-72 lg:h-72",
    // Remove cursor-grab on mobile
    !isMobile && (isDragging ? "cursor-grabbing" : "cursor-grab")
  )}
  // Disable drag on mobile
  drag={isMobile ? false : "x"}
  // ...
>
  {hasValidAvatar ? (
    <AvatarLoader
      // ...
      enableOrbitControls={!isMobile}  // Disable rotation on mobile
    />
  ) : /* ... */}
</motion.div>

// Hide rotation buttons on mobile (use zoom only)
{!isMobile && (
  <div className="flex items-center gap-3 mt-2">
    {/* rotation buttons */}
  </div>
)}
```

### File 3: `src/components/avatar-3d/RPMAvatarCreatorPanel.tsx`

Use responsive height:

```typescript
<div 
  ref={creatorContainerRef}
  className="relative w-full h-[350px] lg:h-[450px] rounded-xl overflow-hidden border border-border bg-muted/30"
>
```

### File 4: `src/components/game-setup/AvatarPreview.tsx`

Update DialogContent for mobile:

```typescript
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain">
```

### File 5: `src/index.css`

Add touch-friendly scrolling:

```css
/* Mobile customizer scrolling fix */
@media (max-width: 768px) {
  .sims-cas-background {
    touch-action: pan-y;
  }
}
```

## Visual Comparison

| Element | Before (Mobile) | After (Mobile) |
|---------|-----------------|----------------|
| Avatar preview | 224x224px | 160x160px |
| RPM iframe | 450px height | 350px height |
| Drag-to-rotate | Active (blocks scroll) | Disabled |
| OrbitControls | Active (blocks scroll) | Disabled |
| Total content height | ~900px+ | ~650px |
| Touch scrolling | Blocked | Working |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/avatar-3d/AvatarLoader.tsx` | Add `enableOrbitControls` prop |
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Mobile layout, disable drag/orbit on mobile |
| `src/components/avatar-3d/RPMAvatarCreatorPanel.tsx` | Responsive iframe height |
| `src/components/game-setup/AvatarPreview.tsx` | Add `overscroll-contain` class |
| `src/index.css` | Add `touch-action: pan-y` for mobile |

## Expected Result

After these changes:
- Users can scroll up/down freely in the avatar customizer on mobile
- The avatar preview will be smaller but still visible
- Rotation will use the button controls instead of drag on mobile
- The RPM creator iframe will be more appropriately sized for mobile
- Overall content height will fit better in the viewport
