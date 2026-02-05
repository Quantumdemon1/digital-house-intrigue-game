
# Fix Pose Editor: Arms Out of Sync and Reset Issues

## Root Cause Analysis

The pose editor has a fundamental **coordinate system mismatch**:

| Component | What it stores | How it's applied |
|-----------|----------------|------------------|
| **PoseLibrary bones** | Offsets from T-pose | `bone.rotation += offset` (additive) |
| **liveBoneOverrides** | Absolute rotations | `bone.rotation.set(value)` (replacement) |

When you adjust a slider:
1. Editor sends pose definition values (small offsets like `0.35`)
2. Animator applies them as absolute rotations
3. Result: Avatar snaps to bizarre pose because T-pose base is lost

When you click Reset:
1. Editor resets to base pose offsets (e.g., `{x: 0.12, y: 0.05, z: 0.35}`)
2. Animator applies these as absolute rotations
3. Result: Wrong pose, not original

---

## Solution: Track Actual Bone Rotations in Editor

The fix requires the pose editor to work with **actual bone rotation values** rather than offsets:

### Option A: Calculate Absolute Rotations (Recommended)

```text
Actual bone rotation = T-pose base + pose offset + breathing + etc.

Editor should:
1. Capture initial bone rotations when opened
2. Apply slider changes as deltas to those values
3. Send absolute rotations to animator
```

### Implementation

**Phase 1: Capture Initial Bone State**

Add state to track the "before editing" bone rotations:

```typescript
// In PoseEditor
const [initialBoneState, setInitialBoneState] = useState<Record<string, BoneRotation> | null>(null);
```

When editor opens or pose changes, capture current bone state from avatar.

**Phase 2: Apply as Deltas**

When slider changes:
```typescript
const newRotation = {
  x: initialBoneState[boneName].x + sliderDelta.x,
  y: initialBoneState[boneName].y + sliderDelta.y,
  z: initialBoneState[boneName].z + sliderDelta.z,
};
```

**Phase 3: Fix Reset Behavior**

Reset should restore `initialBoneState`, not pose definition values.

---

## Alternative Solution: Fix at Animator Level

Instead of changing the editor, fix how `liveBoneOverrides` are applied:

```typescript
// In AvatarAnimator useFrame:
if (liveBoneOverrides) {
  for (const [boneName, rotation] of Object.entries(liveBoneOverrides)) {
    const bone = state.boneMap.get(boneName);
    const base = state.baseRotations.get(boneName);
    if (bone && rotation && base) {
      // Apply as OFFSETS, not absolute values
      bone.rotation.set(
        base.x + rotation.x,
        base.y + rotation.y,
        base.z + rotation.z
      );
    }
  }
}
```

This makes `liveBoneOverrides` work the same way as static poses - as offsets.

---

## Recommended Fix: Hybrid Approach

1. **Keep pose definitions as offsets** (current format, don't change)
2. **Change animator to apply liveBoneOverrides as offsets** (add to base, not replace)
3. **Fix PoseEditor state management** with functional updates

### Files to Modify

| File | Change |
|------|--------|
| `AvatarAnimator.ts` | Apply `liveBoneOverrides` as offsets (add to baseRotations) |
| `PoseEditor.tsx` | Use functional state updates, initialize from base pose correctly |

---

## Detailed Code Changes

### 1. AvatarAnimator.ts - Apply as Offsets

```typescript
// Line ~239-245, change from:
if (liveBoneOverrides) {
  for (const [boneName, rotation] of Object.entries(liveBoneOverrides)) {
    const bone = state.boneMap.get(boneName);
    if (bone && rotation) {
      bone.rotation.set(rotation.x, rotation.y, rotation.z);  // WRONG: absolute
    }
  }
}

// To:
if (liveBoneOverrides) {
  for (const [boneName, rotation] of Object.entries(liveBoneOverrides)) {
    const bone = state.boneMap.get(boneName);
    const base = state.baseRotations.get(boneName);
    if (bone && rotation && base) {
      // Apply as offset from base pose
      bone.rotation.set(
        base.x + rotation.x,
        base.y + rotation.y,
        base.z + rotation.z
      );
    }
  }
}
```

**Note**: This change should come AFTER `resetToBasePose()` in the frame loop, and override any breathing/weight shift applied to those bones.

### 2. PoseEditor.tsx - Fix State Updates

Use functional updates to avoid stale state issues (per the stack overflow hint):

```typescript
// handleReset - use functional update
const handleReset = useCallback(() => {
  const basePose = STATIC_POSES[currentPose];
  setBoneAdjustments(() => ({ ...basePose.bones }));  // Functional update
  onBoneAdjust?.({ ...basePose.bones });
  toast.info('Reset to default pose');
}, [currentPose, onBoneAdjust]);

// handlePoseChange - use functional update  
const handlePoseChange = useCallback((pose: StaticPoseType) => {
  onPoseChange(pose);
  const basePose = STATIC_POSES[pose];
  const overrides = getPoseOverrides()[pose];
  setBoneAdjustments(() => overrides ? { ...overrides } : { ...basePose.bones });
}, [onPoseChange]);
```

### 3. PoseEditor.tsx - Ensure onBoneAdjust Called on Pose Change

Currently `handlePoseChange` doesn't call `onBoneAdjust`, so changing poses doesn't update the avatar:

```typescript
const handlePoseChange = useCallback((pose: StaticPoseType) => {
  onPoseChange(pose);
  const basePose = STATIC_POSES[pose];
  const overrides = getPoseOverrides()[pose];
  const newBones = overrides ? { ...overrides } : { ...basePose.bones };
  setBoneAdjustments(() => newBones);
  onBoneAdjust?.(newBones);  // ADD THIS - notify animator
}, [onPoseChange, onBoneAdjust]);
```

---

## Expected Behavior After Fix

| Action | Before (Broken) | After (Fixed) |
|--------|-----------------|---------------|
| Open editor | Avatar unchanged | Avatar unchanged |
| Move slider | Arms wildly snap | Smooth incremental adjustment |
| Click Reset | Wrong position | Returns to original pose |
| Change base pose | Nothing happens | Avatar updates to new pose |
| Click Save | Saves wrong values | Saves correct offset values |
| Reload page | Overrides don't apply right | Overrides work correctly |

---

## Technical Summary

The core fix is changing `liveBoneOverrides` from **absolute rotations** to **offset rotations** in the animator, matching how static poses work. This ensures consistency across the entire pose system.
