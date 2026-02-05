
# Update Neutral Pose Coordinates

## Summary
Update the `neutral` pose definition in `PoseLibrary.ts` with your refined bone coordinates that you've tuned using the Pose Editor.

## Change Details

### File: `src/components/avatar-3d/animation/poses/PoseLibrary.ts`

Replace the `neutral` pose bones (lines ~50-65) with your new coordinates:

| Bone | Current | New |
|------|---------|-----|
| LeftShoulder | `{x: 0.05, y: 0.1, z: 0.08}` | `{x: 0.61, y: 0.18, z: -0.02}` |
| LeftArm | `{x: 0.12, y: 0.05, z: 0.35}` | `{x: 0.12, y: 0.05, z: 0.27}` |
| RightShoulder | `{x: 0.05, y: -0.1, z: -0.08}` | `{x: 0.61, y: 0.15, z: -0.05}` |
| RightArm | `{x: 0.12, y: -0.05, z: -0.35}` | `{x: 0.12, y: 0.21, z: -0.35}` |
| RightForeArm | `{x: 0.15, y: -0.02, z: -0.05}` | `{x: 0.12, y: -0.33, z: 0.44}` |
| RightHand | `{x: 0, y: 0, z: -0.08}` | `{x: -0.28, y: 0, z: -0.08}` |
| LeftHand | `{x: 0, y: 0, z: 0.08}` | `{x: 0, y: 0, z: 0.08}` (unchanged) |

## Result
All avatars using the `neutral` pose (the default) will now use your refined coordinates, providing consistent arm positioning across the game.
