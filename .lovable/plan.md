
# Fix Avatar Glitching & Add CSS-Based Visual Effects

## Problem Summary

1. **Avatars stuck in T-pose**: The 3D avatars are displaying with arms extended horizontally (T-pose) instead of the intended "relaxed" pose with arms down at their sides.

2. **Missing visual effects**: Bloom and vignette post-processing effects were removed due to a `@react-three/postprocessing` version incompatibility, leaving the scene looking flat.

---

## Root Cause Analysis

### T-Pose Issue

The T-pose problem is caused by multiple potential issues working together:

1. **Missing `three-stdlib` explicit dependency**: The `SkeletonUtils` import comes from `three-stdlib`, which is only a transitive dependency of `@react-three/drei`. Without it as a direct dependency, Vite might be bundling duplicate instances.

2. **Animation controller initialization race condition**: The `useAnimationController` hook depends on the scene being ready, but the `initialized` flag may not be setting correctly when bones are found.

3. **Vite cache not cleared**: After updating `vite.config.ts`, the old cached bundles may still contain the duplicate library instances.

### Missing Visual Effects

The bloom and vignette effects were provided by `@react-three/postprocessing`, which caused runtime crashes due to version conflicts with the Three.js rendering pipeline.

---

## Solution

### Part 1: Fix Avatar T-Pose

#### A. Add explicit `three-stdlib` dependency

Add `three-stdlib` as a direct dependency to ensure proper deduplication.

#### B. Update Vite configuration

Ensure `three-stdlib` is properly included in both `dedupe` and `optimizeDeps.include`, and add a force flag to rebuild the optimization cache.

```text
vite.config.ts changes:
┌────────────────────────────────────────────────────────────┐
│ optimizeDeps: {                                            │
│   include: [...existing, "three-stdlib"],                  │
│   force: true  // Force rebuild of deps cache              │
│ }                                                          │
└────────────────────────────────────────────────────────────┘
```

#### C. Fix animation initialization

Add a safety check and force initial pose application even before the animation loop starts. This ensures avatars are positioned correctly immediately after loading.

```text
AnimationController.ts changes:
┌────────────────────────────────────────────────────────────┐
│ // Apply initial pose immediately when bones are found    │
│ useEffect(() => {                                          │
│   if (scene && boneCache.size > 0) {                       │
│     const initialBones = POSE_CONFIGS[basePose];           │
│     applyBoneMap(boneCache, initialBones, 1);              │
│   }                                                        │
│ }, [scene, basePose]);                                     │
└────────────────────────────────────────────────────────────┘
```

### Part 2: Add CSS-Based Visual Effects

Since `@react-three/postprocessing` is incompatible, we'll implement bloom and vignette using CSS effects that layer on top of the Canvas.

#### A. Create a reusable CSS effects overlay component

```text
New file: src/components/avatar-3d/SceneEffectsOverlay.tsx
┌────────────────────────────────────────────────────────────┐
│ <div className="scene-effects-overlay">                    │
│   <div className="vignette-effect" />                      │
│   <div className="bloom-glow" />                           │
│ </div>                                                     │
│                                                            │
│ CSS (pointer-events: none to allow interaction):           │
│ - Vignette: radial-gradient transparent → black at edges   │
│ - Bloom: subtle brightness/contrast filter                 │
│ - Backdrop blur for soft glow effect on highlights         │
└────────────────────────────────────────────────────────────┘
```

#### B. Apply effects overlay to CircularHouseScene and HouseScene

Wrap the Canvas with the new overlay component:

```text
CircularHouseScene.tsx / HouseScene.tsx:
┌────────────────────────────────────────────────────────────┐
│ <div className="relative w-full h-full">                   │
│   <Canvas ... />                                           │
│   <SceneEffectsOverlay enableBloom={!isMobile} />          │
│ </div>                                                     │
└────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `package.json` | Add `three-stdlib` as direct dependency |
| `vite.config.ts` | Add `force: true` to optimizeDeps |
| `src/components/avatar-3d/animation/AnimationController.ts` | Apply initial pose immediately on bone discovery |
| `src/components/avatar-3d/SceneEffectsOverlay.tsx` | New component for CSS bloom/vignette |
| `src/components/avatar-3d/CircularHouseScene.tsx` | Add SceneEffectsOverlay |
| `src/components/avatar-3d/HouseScene.tsx` | Add SceneEffectsOverlay |

### CSS Effects Specification

**Vignette Effect:**
- Uses `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)`
- Positioned absolutely over the canvas
- `pointer-events: none` to allow interactions through

**Bloom Simulation:**
- Uses CSS `filter: brightness(1.05) contrast(1.02)`
- Optional subtle `backdrop-filter: blur(0.5px)` for glow on bright areas
- Disabled on mobile for performance

### Expected Result

After implementation:
1. **Avatars will display in relaxed pose** with arms naturally at their sides, not T-pose
2. **Subtle vignette** darkening around edges gives cinematic feel
3. **Soft bloom glow** enhances lighting without the runtime errors
4. **Mobile-friendly** - effects are disabled or reduced on mobile devices
