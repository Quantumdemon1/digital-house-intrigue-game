
# Why Setup Screen Poses Don't Match Game Poses

## Root Cause Analysis

After investigating the code, I found that **both poses now have identical coordinates** after your recent updates. However, there are two potential issues:

### Issue 1: Browser/Model Caching

The avatar clone is created with `useMemo` that depends on the pose **type string**, not the actual coordinates:

```typescript
const clone = useMemo(() => {
  const cloned = SkeletonUtils.clone(scene);
  applyStaticPose(cloned, staticPose);  // staticPose = 'relaxed'
  return cloned;
}, [scene, applyIdlePose, staticPose]);  // Only re-runs if staticPose STRING changes
```

Since the pose type is still `'relaxed'`, React won't re-create the clone even though the coordinates changed.

**Fix**: Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R on Mac)

### Issue 2: Different Default Poses Used

| Location | Pose Used |
|----------|-----------|
| Setup Screen (AvatarLoader) | `'relaxed'` (default when no poseType passed) |
| In-Game (HouseScene) | `'relaxed'` (from ARCHETYPE_POSES) |
| Pose Editor | `'relaxed'` (default state) |

Both use `relaxed`, which you've already updated to match `neutral`. They **should** be identical now.

---

## Verification

Current `neutral` and `relaxed` poses in PoseLibrary.ts are **exactly the same**:

| Bone | neutral | relaxed |
|------|---------|---------|
| LeftShoulder | `{x: 0.61, y: 0.18, z: -0.02}` | `{x: 0.61, y: 0.18, z: -0.02}` |
| RightArm | `{x: 0.12, y: 0.21, z: -0.35}` | `{x: 0.12, y: 0.21, z: -0.35}` |
| RightForeArm | `{x: 0.12, y: -0.33, z: 0.44}` | `{x: 0.12, y: -0.33, z: 0.44}` |
| ... | (all identical) | (all identical) |

---

## Recommended Actions

1. **Immediate**: Hard refresh the browser to clear cached React state and re-apply the updated coordinates

2. **Optional Consistency Change**: Update the default pose to `'neutral'` everywhere for clarity (currently defaults to `'relaxed'`)

### Files to Modify (Optional)

If you want everything to explicitly use `neutral`:

| File | Change |
|------|--------|
| `RPMAvatar.tsx` | Change `mapToStaticPose` default from `'relaxed'` to `'neutral'` |
| `applyPose.ts` | Change default param from `'relaxed'` to `'neutral'` |
| `HouseScene.tsx` | Change `ARCHETYPE_POSES` values from `'relaxed'` to `'neutral'` |
| `HouseScene.tsx` | Change `editorPoseType` default state from `'relaxed'` to `'neutral'` |

This is purely a naming/clarity change since both poses have identical coordinates.

---

## Summary

The coordinates are already synchronized. Try a hard refresh first. If poses still don't match, I can update all defaults to use `'neutral'` for consistency.
