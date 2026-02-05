
# Plan: Point Avatar Hands Toward the Ground in House View

## Problem

In the current house view, avatar hands are pointing outward instead of down toward the ground. This is because the hand bone rotations only have minimal Z-rotation values, which leaves the palms and fingers following the direction of the forearms.

## Root Cause

Current hand configuration in the `relaxed` pose:
```typescript
LeftHand: { x: 0, y: 0, z: 0.05 },    // Hands pointing outward
RightHand: { x: 0, y: 0, z: -0.05 }, // Hands pointing outward
```

The X-rotation is 0, meaning the hands maintain the same orientation as the forearms. To point hands downward (fingertips toward the ground), we need to add negative X-rotation to bend the wrists.

## Solution

Update hand bone rotations in both `usePoseVariety.ts` (for house scenes) and `useIdlePose.ts` (for avatar previews) to include X-rotation that points hands toward the ground.

## File Changes

### 1. `src/components/avatar-3d/hooks/usePoseVariety.ts`

Update hand rotations in the `relaxed` and `casual-lean` poses:

| Bone | Current Rotation | New Rotation |
|------|------------------|--------------|
| LeftHand | `{ x: 0, y: 0, z: 0.05 }` | `{ x: -0.3, y: 0, z: 0.05 }` |
| RightHand | `{ x: 0, y: 0, z: -0.05 }` | `{ x: -0.3, y: 0, z: -0.05 }` |

The `-0.3` radians (~17 degrees) X-rotation tilts the hands so fingertips point toward the ground naturally.

### 2. `src/components/avatar-3d/hooks/useIdlePose.ts`

Apply the same hand rotation update for consistency:

```typescript
LeftHand: { x: -0.3, y: 0, z: 0.05 },   // Hands pointing down
RightHand: { x: -0.3, y: 0, z: -0.05 }, // Hands pointing down
```

## Technical Details

### RPM Avatar Hand Bone Orientation

In Ready Player Me avatars:
- Hand bones are children of forearm bones
- X-rotation rotates the hand around the wrist axis (flexion/extension)
- Negative X-rotation bends the wrist so fingertips point more toward the ground
- A value of `-0.3` radians provides a natural, relaxed hand position without looking forced

### Visual Result

Before: Hands parallel to forearms, fingertips pointing outward from body
After: Hands tilted at wrist, fingertips pointing toward the floor

## Expected Result

After this change, all avatars in the house view will have their hands naturally pointing toward the ground, creating a more realistic and relaxed standing pose.
