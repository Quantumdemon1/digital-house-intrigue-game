
# Avatar T-Pose Glitch Analysis & Fix Plan

## Problem Summary

The avatars are displaying in a T-pose (arms extended horizontally) instead of the intended "relaxed" pose (arms naturally at sides). This is happening despite having a complete animation system in place.

---

## Root Cause Analysis

After deep analysis of the animation pipeline, I've identified **multiple issues** working together:

### Issue 1: Animation Controller Only Runs When `enabled` = true

In `RPMAvatar.tsx` line 173:
```typescript
enabled: isAnimated && applyIdlePose,
```

The animation controller won't run unless BOTH conditions are true. However, the controller initialization on lines 158-175 has a critical flaw:

**The initial pose is only applied inside a `useEffect` that depends on `[scene, enabled, basePose]`**, but if `enabled` starts as `false` or the effect runs before bones are found, the avatar remains in T-pose.

### Issue 2: Bones Not Found on First Render

The `findBones()` function in `boneUtils.ts` traverses the scene to find bones by name. However:
- Ready Player Me (RPM) models use a bone hierarchy that may not be immediately available after `SkeletonUtils.clone()`
- The bone cache may be empty when `useEffect` runs initially

### Issue 3: POSE_CONFIGS Z-Rotation is Correct but May Not Apply

Looking at `BasePoseLayer.ts`:
```typescript
relaxed: {
  LeftArm: { rotation: { x: 0.05, y: 0.1, z: 1.45 } },  // z: 1.45 radians ≈ 83°
  RightArm: { rotation: { x: 0.05, y: -0.1, z: -1.45 } },
  ...
}
```

The pose values are correct (Z rotation of ~83° puts arms at sides), but they may never be applied if:
1. The bone cache is empty
2. The controller is disabled
3. The effect runs before the scene is fully loaded

### Issue 4: Race Condition in useFrame

The `useFrame` callback (line 203) returns early if:
```typescript
if (!enabled || !stateRef.current.initialized || skinnedMeshes.length === 0) return;
```

If `initialized` is `false` (bones not found), animation never runs.

---

## Proposed Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Current Flow (Broken)                        │
├─────────────────────────────────────────────────────────────────┤
│ 1. Scene loads → clone created                                  │
│ 2. useEffect runs → findBones() called                          │
│ 3. Bones may not exist yet → boneCache empty                    │
│ 4. initialized = false → useFrame skips animation               │
│ 5. Avatar shows T-pose (model's default)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Fixed Flow (Proposed)                        │
├─────────────────────────────────────────────────────────────────┤
│ 1. Scene loads → clone created                                  │
│ 2. useLayoutEffect runs BEFORE paint → findBones() with retry   │
│ 3. If bones found → apply pose IMMEDIATELY (sync)               │
│ 4. useFrame continues with animation updates                    │
│ 5. Avatar shows relaxed pose from first frame                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Part 1: Fix Immediate Pose Application

**File: `src/components/avatar-3d/RPMAvatar.tsx`**

Apply the base pose directly on the cloned scene before passing to animation controller:

```typescript
// After cloning scene, immediately apply base pose to prevent T-pose
useLayoutEffect(() => {
  if (!clone || !applyIdlePose) return;
  
  // Find and cache bones immediately
  const bones = findBones(clone, ALL_BONE_NAMES);
  
  // Apply base pose synchronously before first render
  if (bones.size > 0) {
    const baseBoneConfig = POSE_CONFIGS[poseType];
    applyBoneMap(bones, baseBoneConfig, 1);
  }
}, [clone, applyIdlePose, poseType]);
```

### Part 2: Add Bone Discovery Retry Logic

**File: `src/components/avatar-3d/animation/AnimationController.ts`**

Add a retry mechanism for bone discovery:

```typescript
// Add retry counter to ensure bones are found
const retryCount = useRef(0);
const MAX_RETRIES = 10;

useEffect(() => {
  if (!scene || !enabled) {
    stateRef.current.initialized = false;
    return;
  }
  
  const attemptBoneDiscovery = () => {
    stateRef.current.boneCache = findBones(scene, ALL_BONE_NAMES);
    
    if (stateRef.current.boneCache.size === 0 && retryCount.current < MAX_RETRIES) {
      retryCount.current++;
      requestAnimationFrame(attemptBoneDiscovery);
      return;
    }
    
    stateRef.current.initialized = stateRef.current.boneCache.size > 0;
    
    // Apply initial pose immediately
    if (stateRef.current.initialized) {
      const initialBones = POSE_CONFIGS[basePose];
      if (initialBones) {
        applyBoneMapDirect(stateRef.current.boneCache, initialBones, 1);
      }
    }
  };
  
  attemptBoneDiscovery();
}, [scene, enabled, basePose]);
```

### Part 3: Verify Bone Names Match RPM Models

**File: `src/components/avatar-3d/animation/AnimationController.ts`**

RPM models may use slightly different bone naming. Update the bone name list to include variants:

```typescript
const ALL_BONE_NAMES = [
  // Standard names
  'Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
  'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand',
  'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
  // RPM variant names (some models use mixamo naming)
  'mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2',
  'mixamorigNeck', 'mixamorigHead',
  'mixamorigLeftShoulder', 'mixamorigLeftArm', 'mixamorigLeftForeArm', 'mixamorigLeftHand',
  'mixamorigRightShoulder', 'mixamorigRightArm', 'mixamorigRightForeArm', 'mixamorigRightHand',
];
```

And update `findBones` to normalize bone names.

### Part 4: Force Immediate Bone Rotation on Clone

**File: `src/components/avatar-3d/RPMAvatar.tsx`**

The most robust fix - apply pose directly to the cloned skeleton before render:

```typescript
const clone = useMemo(() => {
  const cloned = SkeletonUtils.clone(scene);
  
  // Immediately apply base pose to prevent any T-pose flash
  if (applyIdlePose) {
    cloned.traverse((child) => {
      if (child instanceof THREE.Bone) {
        const poseConfig = POSE_CONFIGS[poseType];
        const boneState = poseConfig?.[child.name];
        if (boneState) {
          child.rotation.set(
            boneState.rotation.x,
            boneState.rotation.y,
            boneState.rotation.z
          );
        }
      }
    });
  }
  
  return cloned;
}, [scene, applyIdlePose, poseType]);
```

---

## Additional Improvements (Optional Enhancements)

### Improvement A: Debug Logging for Bone Discovery

Add temporary console logging to diagnose bone finding issues:

```typescript
const discoveredBones: string[] = [];
scene.traverse((child) => {
  if (child instanceof THREE.Bone) {
    discoveredBones.push(child.name);
  }
});
console.log('[Avatar Debug] Found bones:', discoveredBones);
```

### Improvement B: Fallback Pose Application in useFrame

As a safety net, apply the base pose in the first frame if not already applied:

```typescript
// In useFrame callback
const firstFrameApplied = useRef(false);
if (!firstFrameApplied.current && state.boneCache.size > 0) {
  applyBoneMap(state.boneCache, POSE_CONFIGS[basePose], 1);
  firstFrameApplied.current = true;
}
```

---

## Technical Summary

| File | Change Description |
|------|-------------------|
| `src/components/avatar-3d/RPMAvatar.tsx` | Apply base pose directly on clone creation |
| `src/components/avatar-3d/animation/AnimationController.ts` | Add bone discovery retry logic and first-frame pose application |
| `src/components/avatar-3d/animation/utils/boneUtils.ts` | (Optional) Add bone name normalization for RPM variants |

---

## Expected Outcome

After implementation:
1. Avatars will display in the correct "relaxed" pose from the very first rendered frame
2. No T-pose flicker even on slow network/device
3. Animation system continues to work for breathing, weight shift, and micro-movements
4. Robust fallback ensures pose is always applied
