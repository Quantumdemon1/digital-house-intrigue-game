
# Fix Avatar Stacking Issue After Clone Component Migration

## Problem Summary

After switching from manual `SkeletonUtils.clone()` to drei's `<Clone />` component, all avatars are now stacked on top of each other at the center instead of being positioned around the circle.

---

## Root Cause

The drei `<Clone />` component handles object positioning differently than `<primitive object={...}>`:

1. `Clone` uses `createSpread()` to extract and re-apply properties from the scene root
2. This creates a React element (e.g., `<group>`) with extracted props, rather than directly mounting the THREE.Object3D
3. The position inheritance through the parent `<group position={position}>` may not propagate correctly to the cloned hierarchy

The previous approach using `<primitive object={clone} />` directly mounted the cloned Object3D into the scene graph, respecting parent group transforms.

---

## Solution

Revert to the `<primitive>` approach but import `SkeletonUtils` through a path that ensures library deduplication:

### File: `src/components/avatar-3d/RPMAvatar.tsx`

1. **Remove** the `PosedClone` component wrapper
2. **Restore** manual `SkeletonUtils.clone()` in a `useMemo`
3. **Apply** bone transformations directly on the cloned scene using `useLayoutEffect`
4. **Render** using `<primitive object={clone} />` instead of `<Clone />`

```text
Key changes:
┌────────────────────────────────────────────────────────────┐
│ // Import SkeletonUtils from three-stdlib (already in     │
│ // vite.config.ts dedupe list)                            │
│ import { SkeletonUtils } from 'three-stdlib';             │
│                                                           │
│ // Clone scene with pose applied                          │
│ const clone = useMemo(() => {                             │
│   const cloned = SkeletonUtils.clone(scene);              │
│   // Apply base pose immediately                          │
│   if (applyIdlePose) {                                    │
│     applyPoseToBones(cloned, poseType);                   │
│   }                                                       │
│   return cloned;                                          │
│ }, [scene, applyIdlePose, poseType]);                     │
│                                                           │
│ // Render with primitive (respects parent transforms)     │
│ return (                                                  │
│   <group position={effectivePosition} scale={scale}>      │
│     <primitive object={clone} ref={cloneRef} />           │
│   </group>                                                │
│ );                                                        │
└────────────────────────────────────────────────────────────┘
```

### Why This Works

- `<primitive object={...}>` directly mounts the Object3D, so it inherits parent group transforms correctly
- `SkeletonUtils.clone()` creates a unique copy with its own skeleton, preventing cross-avatar interference
- The `three-stdlib` import is deduplicated via `vite.config.ts`, preventing the original "lov" error

---

## Technical Summary

| File | Change |
|------|--------|
| `src/components/avatar-3d/RPMAvatar.tsx` | Replace `<Clone>` with `<primitive>` and restore manual `SkeletonUtils.clone()` |

---

## Expected Outcome

1. Avatars will be correctly positioned in a circle around the floor
2. Each avatar maintains its own skeleton for independent animation
3. No duplicate THREE.js instance errors
4. Poses apply correctly (relaxed stance with arms down)
