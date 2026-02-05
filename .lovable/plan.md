

# Fix Pose Data Convention Mismatch

## Problem
The pose editor and `applyStaticPose` use **additive** rotations (`bone.rotation += value`), meaning values are small offsets on top of the RPM model's bind pose. But the document's JSON data uses **T-pose-relative absolute** rotations (T-pose = all zeros, values are total rotation from zero).

When you paste `RightForeArm z: -2.00` (waving), it gets added to the existing bone rotation instead of replacing it, producing incorrect results.

## Solution
Switch the entire pose system from additive to absolute rotations. This makes the system compatible with standard pose data from TalkingHead, KalidoKit, and other sources.

## Changes

### 1. `src/components/avatar-3d/animation/poses/applyPose.ts`
- Change `applyStaticPose` from additive (`bone.rotation.x += x`) to absolute (`bone.rotation.set(x, y, z)`)
- This makes it behave the same as `applyBoneRotations` (already absolute)

### 2. `src/components/avatar-3d/animation/poses/PoseLibrary.ts`
- Replace all five base pose definitions (neutral, relaxed, confident, defensive, open) with T-pose-relative values from the document
- Map existing poses to document equivalents:

| Current Pose | Document Equivalent |
|---|---|
| neutral | Relaxed idle standing (#2) |
| relaxed | Relaxed idle standing (#2) |
| confident | Confident / power pose (#13) |
| defensive | Arms crossed (#5) |
| open | Waving (#4) |

### 3. No changes needed to:
- `PoseEditor.tsx` - paste import already works correctly (merges into state, calls `onBoneAdjust` which uses `applyBoneRotations` with absolute `set()`)
- `RPMAvatar.tsx` - just passes pose type through
- `HouseScene.tsx` - just passes pose type through

## Technical Detail

```text
BEFORE (additive):
  bone.rotation.x += rotation.x    // offset on top of bind pose
  bone.rotation.y += rotation.y
  bone.rotation.z += rotation.z

AFTER (absolute):
  bone.rotation.set(rotation.x, rotation.y, rotation.z)   // direct T-pose-relative
```

## Risk Mitigation
- Any existing per-character overrides in localStorage were saved under the old additive convention and will look wrong after this change
- Plan: clear all localStorage overrides on migration (add a one-time version check) so users start fresh with the correct convention
- Add a `POSE_DATA_VERSION` constant; if the stored version doesn't match, clear overrides automatically

## Files to Modify

| File | Change |
|---|---|
| `applyPose.ts` | Switch from `+=` to `rotation.set()` |
| `PoseLibrary.ts` | Replace base poses with T-pose-relative values from document; add version migration |

