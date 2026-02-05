
# Plan: Fix Avatar Arm Poses in House View to Be Relaxed at Sides

## Problem Analysis

The avatars in the house view have their arms stuck in a T-pose or semi-T-pose position instead of being relaxed at their sides. Looking at the screenshot, all characters have their arms extended outward.

## Root Cause

The `usePoseVariety` hook in `src/components/avatar-3d/hooks/usePoseVariety.ts` applies poses to avatar skeletons, but the Z rotation values for arms are too low to bring them down to the sides:

**Current values for `relaxed` pose:**
```typescript
LeftArm: { x: 0.1, y: 0, z: 1.2 },      // Arms still partially horizontal
RightArm: { x: 0.1, y: 0, z: -1.2 },
```

**Comparison with `useIdlePose` (working correctly in other views):**
```typescript
LeftArm: { x: 0.05, y: 0.1, z: 1.45 },   // Arms properly at sides
RightArm: { x: 0.05, y: -0.1, z: -1.45 },
```

The difference of ~0.25 radians (~14 degrees) is significant - it leaves arms looking more like a T-pose. Ready Player Me avatars need Z rotations of approximately **1.45-1.5 radians** to bring arms fully down to the sides.

## Solution

Update all pose configurations in `usePoseVariety.ts` to use proper arm rotations that bring arms naturally to the sides:

| Pose | Bone | Current Z | Fixed Z |
|------|------|-----------|---------|
| relaxed | LeftArm | 1.2 | 1.45 |
| relaxed | RightArm | -1.2 | -1.45 |
| casual-lean | LeftArm | 1.3 | 1.45 |
| casual-lean | RightArm | -1.1 | -1.35 |

## File Change

### `src/components/avatar-3d/hooks/usePoseVariety.ts`

Update the `POSE_CONFIGS` object with corrected arm rotations:

```typescript
const POSE_CONFIGS: Record<PoseType, Record<string, BoneRotation>> = {
  relaxed: {
    LeftArm: { x: 0.05, y: 0.1, z: 1.45 },      // Arms relaxed at sides
    RightArm: { x: 0.05, y: -0.1, z: -1.45 },   // Arms relaxed at sides
    LeftForeArm: { x: 0, y: 0, z: 0.08 },       // Slight elbow bend
    RightForeArm: { x: 0, y: 0, z: -0.08 },     // Slight elbow bend
    LeftHand: { x: 0, y: 0, z: 0.05 },          // Relaxed wrist
    RightHand: { x: 0, y: 0, z: -0.05 },        // Relaxed wrist
    Spine: { x: -0.02, y: 0, z: 0 },
    Spine1: { x: -0.01, y: 0, z: 0 },
  },
  'casual-lean': {
    LeftArm: { x: 0.05, y: 0.1, z: 1.45 },      // Arms relaxed
    RightArm: { x: 0.05, y: -0.1, z: -1.35 },   // Slightly different for asymmetry
    LeftForeArm: { x: 0, y: 0, z: 0.1 },
    RightForeArm: { x: 0, y: 0, z: -0.1 },
    Hips: { x: 0, y: 0, z: 0.04 },
    Spine: { x: -0.01, y: 0.02, z: 0.02 },
    Spine1: { x: 0, y: 0.01, z: 0.01 },
  },
  // Other poses (crossed-arms, hands-on-hips, thinking) keep their 
  // specialized configurations as they intentionally position arms differently
};
```

### Changes by Pose Type

| Pose Type | Change Description |
|-----------|-------------------|
| `relaxed` | Increase arm Z rotation from 1.2 to 1.45 (matching useIdlePose) |
| `casual-lean` | Increase arm Z rotation from 1.3/1.1 to 1.45/1.35 |
| `crossed-arms` | Keep current values (arms are intentionally crossed in front) |
| `hands-on-hips` | Keep current values (arms bent to rest on hips) |
| `thinking` | Keep current values (one arm raised to chin) |

## Technical Details

### Ready Player Me Avatar Skeleton

RPM avatars use a standard humanoid skeleton where:
- Arms in T-pose have Z rotation = 0
- Arms fully down at sides need Z rotation ≈ 1.5 radians (≈86°)
- The rotation is relative to the parent bone (shoulder)

### Why 1.45 radians?

- Full 90° rotation = π/2 ≈ 1.57 radians would be arms perfectly straight down
- 1.45 radians ≈ 83° gives a natural, relaxed position with arms slightly away from body
- This matches the proven values in `useIdlePose.ts` that work correctly

## Expected Result

After this fix, avatars in the house view will have their arms naturally hanging at their sides in the relaxed and casual-lean poses, matching the circled reference in the screenshot (the detail panel view).
