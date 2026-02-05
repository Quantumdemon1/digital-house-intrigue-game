
# Fix Avatar Glitching When Positioned in Circle

## Problem Summary

When avatars were stacked at position (0,0,0), they didn't glitch. Once correctly positioned around the circle, they began glitching. This is a crucial clue pointing to a **shared resource conflict**.

---

## Root Cause Analysis

### The Core Issue: `useGLTF` Returns a Shared Cached Scene

When multiple `RPMAvatar` components load the same model URL:

```typescript
const { scene } = useGLTF(optimizedUrl);  // Returns CACHED scene
```

The `useGLTF` hook from drei returns the **same cached scene object** for identical URLs. This means:

1. Avatar A and Avatar B with the same model URL get the **same `scene` reference**
2. Even though we call `SkeletonUtils.clone(scene)`, the original scene object is shared
3. The `applyPoseToBones()` function inside `useMemo` may be running on different frames for different components

### Why Stacking "Fixed" It

When all avatars were at (0,0,0), they were:
- Visually overlapping, so any bone conflicts weren't visible
- Possibly being culled or not rendered correctly

### Why Positioning Breaks It

When positioned correctly:
- Each avatar's animation controller runs independently
- Multiple `useFrame` callbacks are modifying bones simultaneously
- The `phaseOffset` creates different timing, but they're fighting over shared skeleton references

### The Animation Controller Conflict

Looking at `AnimationController.ts`:

```typescript
useFrame(({ clock }) => {
  // Each avatar's controller runs this independently
  applyBoneMap(state.boneCache, physicsFilteredBones, 1);
});
```

The `boneCache` contains actual `THREE.Bone` references. If multiple controllers are caching bones from clones that somehow share the same skeleton (due to improper cloning or useGLTF caching issues), they'll fight.

---

## Solution

### Part 1: Ensure Scene Clone is Truly Independent

The issue is that `SkeletonUtils.clone()` may not be cloning deeply enough, or the bone cache is capturing references before cloning completes.

**File: `src/components/avatar-3d/RPMAvatar.tsx`**

Add a unique key/instance identifier to force proper isolation:

```typescript
// Generate a unique instance ID for this component
const instanceId = useRef(Math.random().toString(36).substr(2, 9));

// Clone the scene - ensure it's fully independent
const clone = useMemo(() => {
  const cloned = SkeletonUtils.clone(scene) as THREE.Group;
  
  // Mark this clone with a unique instance ID
  cloned.userData.instanceId = instanceId.current;
  
  // Apply base pose to the cloned skeleton (not the original)
  if (applyIdlePose) {
    applyPoseToBones(cloned, poseType);
  }
  
  return cloned;
}, [scene, applyIdlePose, poseType]);
```

### Part 2: Ensure Bone Cache References Clone, Not Original

**File: `src/components/avatar-3d/RPMAvatar.tsx`**

The animation controller must receive the clone reference, not anything that could point to the original cached scene:

```typescript
// Pass the actual clone to animation controller
useAnimationController({
  scene: applyIdlePose && clone ? clone : null,  // Use clone directly, not cloneRef.current
  skinnedMeshes,
  // ... rest of config
});
```

Currently the code passes `cloneRef.current` which is set asynchronously:

```typescript
scene: applyIdlePose && cloneRef.current ? cloneRef.current : null,
```

This creates a timing issue where the ref might not be set yet.

### Part 3: Fix Bone Cache Initialization in AnimationController

**File: `src/components/avatar-3d/animation/AnimationController.ts`**

Add scene identity verification to prevent cross-avatar bone cache contamination:

```typescript
// Track which scene this controller is bound to
const sceneIdRef = useRef<string | null>(null);

useEffect(() => {
  if (!scene || !enabled) {
    stateRef.current.initialized = false;
    retryCountRef.current = 0;
    return;
  }
  
  // Get scene identity (from userData or generate one)
  const sceneId = (scene.userData?.instanceId as string) || scene.uuid;
  
  // If scene changed, reset everything
  if (sceneIdRef.current !== sceneId) {
    stateRef.current = {
      poseTransition: createPoseTransition(basePose),
      lookAt: createLookAtState(),
      gesture: createGestureState(),
      reactive: createReactiveState(),
      blink: createBlinkState(0),
      secondaryMotion: createSecondaryMotionState(),
      lastTime: 0,
      boneCache: new Map(),
      initialized: false,
    };
    sceneIdRef.current = sceneId;
    retryCountRef.current = 0;
  }
  
  // ... rest of bone discovery
}, [scene, enabled, basePose]);
```

### Part 4: Validate Clone Independence with Skeleton Check

Add a safeguard to verify the skeleton is unique:

```typescript
const clone = useMemo(() => {
  const cloned = SkeletonUtils.clone(scene) as THREE.Group;
  
  // Verify skeleton independence - each clone should have unique skeleton
  let skeleton: THREE.Skeleton | null = null;
  cloned.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.skeleton) {
      if (skeleton && skeleton !== child.skeleton) {
        console.warn('[RPMAvatar] Multiple skeletons in clone');
      }
      skeleton = child.skeleton;
    }
  });
  
  // Mark with unique ID
  cloned.userData.instanceId = Math.random().toString(36).substr(2, 9);
  
  if (applyIdlePose) {
    applyPoseToBones(cloned, poseType);
  }
  
  return cloned;
}, [scene, applyIdlePose, poseType]);
```

---

## Technical Summary

| File | Change |
|------|--------|
| `src/components/avatar-3d/RPMAvatar.tsx` | 1. Add unique instance ID to each clone<br>2. Pass clone directly to animation controller (not ref)<br>3. Verify skeleton independence |
| `src/components/avatar-3d/animation/AnimationController.ts` | 1. Track scene identity to detect changes<br>2. Reset all state when scene changes<br>3. Prevent bone cache contamination |

---

## Why This Fixes the Glitch

1. **Unique Instance IDs** ensure each clone is tracked separately
2. **Direct clone reference** eliminates async timing issues with refs
3. **Scene identity tracking** in AnimationController prevents one avatar's controller from accidentally manipulating another avatar's bones
4. **Full state reset on scene change** prevents stale bone references from causing conflicts

---

## Expected Outcome

After implementation:
- Each avatar will have a fully independent skeleton
- Animation controllers will only manipulate their own avatar's bones
- Avatars will display correctly in their circular positions with proper idle animations
- No glitching, jittering, or cross-avatar bone interference
