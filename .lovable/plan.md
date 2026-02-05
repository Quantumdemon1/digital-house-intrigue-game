

# Strip Avatars to Basic State for Troubleshooting

## Goal

Remove all animation logic from the avatars to isolate the root cause of the glitching issue. This will help determine if the problem is:
- In the cloning/rendering pipeline
- In the animation system
- In how multiple avatars share resources

---

## Changes to `src/components/avatar-3d/RPMAvatar.tsx`

### What We'll Disable

| Feature | Current State | After Change |
|---------|---------------|--------------|
| `useAnimationController` hook | Active | **Disabled** (not called) |
| `applyPoseToBones()` in useMemo | Active | **Disabled** |
| `instanceId` tracking | Active | Keep (harmless) |
| Skinned mesh traversal | Active | Keep (harmless) |
| Relationship context | Active | **Disabled** |

### Simplified Component

The component will become a simple "load GLB, clone it, render it":

```text
┌─────────────────────────────────────────────────────────────┐
│ RPMAvatar (Stripped Down)                                   │
├─────────────────────────────────────────────────────────────┤
│ 1. useGLTF(optimizedUrl)  → Load cached scene               │
│ 2. SkeletonUtils.clone()  → Create unique copy              │
│ 3. <primitive object={clone} /> → Render as-is              │
│                                                             │
│ NO pose application                                         │
│ NO animation controller                                     │
│ NO bone manipulation                                        │
│ NO morph targets                                            │
└─────────────────────────────────────────────────────────────┘
```

### Expected Avatar Appearance

- Avatars will display in **T-pose** (default GLB pose)
- No idle breathing/swaying
- No look-at behavior
- No reactive expressions
- No gestures

---

## Technical Implementation

### Changes to `RPMAvatar.tsx`

1. **Remove animation controller call** - Comment out or remove the `useAnimationController` hook entirely

2. **Remove pose application in clone** - Remove the `applyIdlePose` logic from `useMemo`

3. **Remove unused imports** - Clean up imports for animation types

4. **Simplify clone logic**:
```typescript
const clone = useMemo(() => {
  const cloned = SkeletonUtils.clone(scene) as THREE.Group;
  cloned.userData.instanceId = instanceId.current;
  // NO pose application - render in default T-pose
  return cloned;
}, [scene]);
```

5. **Remove skinned mesh traversal** - Not needed without animations

6. **Keep the basic render**:
```typescript
return (
  <group ref={group} position={effectivePosition} scale={scale}>
    <primitive object={clone} />
  </group>
);
```

---

## Diagnostic Outcome

### If Avatars Still Glitch
- Problem is in the **cloning/primitive rendering** pipeline
- May indicate Three.js version conflicts or `useGLTF` caching issues
- Next step: Test with single avatar only

### If Avatars Are Stable (in T-pose)
- Problem is in the **animation system**
- Re-enable animations one layer at a time to find the culprit:
  1. Base pose only (no useFrame)
  2. Add idle breathing
  3. Add look-at
  4. Add reactive expressions
  5. Add secondary motion

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/avatar-3d/RPMAvatar.tsx` | Strip to minimal: remove animation controller, pose application, and related logic |

