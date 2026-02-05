

# Fix Persistent "Cannot read properties of undefined (reading 'lov')" Error

## Problem Summary

The application crashes with `TypeError: Cannot read properties of undefined (reading 'lov')` in the React Three Fiber reconciler's `applyProps` function. The error occurs deep within the rendering pipeline at `createInstance` -> `completeWork`.

---

## Root Cause Analysis

After extensive investigation, I've identified **multiple contributing factors** causing duplicate library instances:

### Issue 1: Unused Dependencies Bundling Their Own THREE Instances

The `package.json` contains packages that are never used but still get bundled:

| Package | In package.json | Actually Used |
|---------|-----------------|---------------|
| `@pixiv/three-vrm` | Yes | **No** (0 imports found) |
| `@react-three/postprocessing` | Yes | **No** (removed, only comments remain) |

Each of these packages bundles its own version of Three.js, creating duplicate instances even if never imported.

### Issue 2: Vite Deduplication Not Working Correctly

The current `vite.config.ts` has `force: true` which clears the cache on every restart, but doesn't solve the underlying issue:

```typescript
optimizeDeps: {
  include: [...],  // Including problematic packages
  force: true,     // Clearing cache but not fixing root cause
}
```

The problem is that `include` adds more packages to pre-bundle, but unused packages like `@pixiv/three-vrm` and `postprocessing` still create separate bundles.

### Issue 3: three-stdlib Import Pattern

The current code imports `SkeletonUtils` directly:
```typescript
import { SkeletonUtils } from 'three-stdlib';
```

However, `@react-three/drei`'s `Clone` component also imports from `three-stdlib`. Since the packages might be resolved from different node_modules paths, this can create duplicate instances.

### Issue 4: primitive object Reconciler Issue

When React Three Fiber's reconciler processes `<primitive object={clone} />`, it runs `applyProps` on the object. If there are duplicate THREE instances, the internal dispatcher references become undefined, causing the "reading 'lov'" error (where 'lov' is a minified property name).

---

## Solution

### Part 1: Remove Unused Dependencies

Remove `@pixiv/three-vrm` and `@react-three/postprocessing` from `package.json` since they are not used anywhere in the codebase. This eliminates the source of duplicate Three.js instances.

```json
// REMOVE these lines from package.json dependencies:
"@pixiv/three-vrm": "^3.4.5",
"@react-three/postprocessing": "^2.19.1",
```

### Part 2: Simplify Vite Configuration

Remove the unused packages from the dedupe/include lists and remove `force: true` which causes unnecessary rebuilds:

```typescript
// vite.config.ts - updated
export default defineConfig(({ mode }) => ({
  server: { host: "::", port: 8080 },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: [
      "react", 
      "react-dom", 
      "react/jsx-runtime", 
      "three", 
      "@react-three/fiber", 
      "@react-three/drei",
      "three-stdlib",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "three-stdlib",
    ],
  },
}));
```

### Part 3: Use drei's Clone Component Instead of SkeletonUtils

Replace the manual `SkeletonUtils.clone()` call with drei's `Clone` component, which:
- Uses the same bundled `three-stdlib` as other drei components
- Properly handles skinned meshes
- Avoids duplicate instance issues

```typescript
// RPMAvatar.tsx - BEFORE (current)
import { SkeletonUtils } from 'three-stdlib';
// ...
const clone = useMemo(() => {
  const cloned = SkeletonUtils.clone(scene);
  // Apply pose...
  return cloned;
}, [scene, applyIdlePose, poseType]);
// ...
return <primitive object={clone} />;

// RPMAvatar.tsx - AFTER (fixed)
import { Clone, useGLTF, useProgress } from '@react-three/drei';
// Remove SkeletonUtils import
// ...
// Use drei's Clone component directly - no manual cloning
return (
  <Clone 
    object={scene} 
    // Clone handles skinned meshes automatically
  />
);
```

### Part 4: Apply Bone Transformations After Clone Mounts

Since `Clone` creates the clone internally, we need to apply bone transformations differently. Create a wrapper component that applies transformations to the cloned object after it mounts:

```typescript
const PosedAvatar: React.FC<{
  scene: THREE.Object3D;
  poseType: PoseType;
  applyIdlePose: boolean;
}> = ({ scene, poseType, applyIdlePose }) => {
  const cloneRef = useRef<THREE.Group>(null);
  
  // Apply pose after clone mounts
  useLayoutEffect(() => {
    if (!cloneRef.current || !applyIdlePose) return;
    
    const poseConfig = POSE_CONFIGS[poseType];
    if (!poseConfig) return;
    
    cloneRef.current.traverse((child) => {
      if (child instanceof THREE.Bone) {
        const boneName = child.name.replace('mixamorig', '');
        const boneState = poseConfig[boneName] || poseConfig[child.name];
        if (boneState) {
          child.rotation.set(
            boneState.rotation.x,
            boneState.rotation.y,
            boneState.rotation.z
          );
        }
      }
    });
  }, [poseType, applyIdlePose]);
  
  return <Clone ref={cloneRef} object={scene} />;
};
```

### Part 5: Alternative - Keep SkeletonUtils But Use drei's Export

If we must use SkeletonUtils directly, import it through the path that drei uses to ensure the same instance:

```typescript
// Instead of:
import { SkeletonUtils } from 'three-stdlib';

// Use the same path drei uses internally:
import { SkeletonUtils } from 'three-stdlib';
// But ensure vite.config.ts properly dedupes three-stdlib
```

---

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `package.json` | Remove `@pixiv/three-vrm` and `@react-three/postprocessing` |
| `vite.config.ts` | Simplify dedupe/include lists, remove `force: true`, remove postprocessing entries |
| `src/components/avatar-3d/RPMAvatar.tsx` | Option A: Use `Clone` from drei instead of manual SkeletonUtils.clone(), OR Option B: Keep current approach but with cleaned dependencies |

### Why This Fixes the Error

1. **Removing unused dependencies** eliminates the source of duplicate THREE.js instances - fewer packages = fewer chances for duplication

2. **Simplified Vite config** ensures only the packages we actually use are pre-bundled together

3. **Using drei's Clone** (if chosen) ensures consistent internal imports since drei, fiber, and our code all use the same bundled three-stdlib

4. **Removing force: true** allows Vite to cache properly instead of rebuilding on every restart (which can cause race conditions)

---

## Expected Outcome

After implementation:
1. No more "Cannot read properties of undefined (reading 'lov')" error
2. Avatars load and render correctly
3. Pose transformations apply properly (arms down instead of T-pose)
4. Smaller bundle size from removed unused dependencies
5. Faster dev server startup without forced cache clearing

