
# Plan: Fix Avatar Thumbnail Camera Framing in Grid Selection

## Problem Analysis

The avatar thumbnails in the character selection grid are still showing knees instead of faces. Looking at the screenshot, the detail panel on the right (circled in red) shows the correct framing, while the grid shows the wrong framing.

After investigating the code:

1. **Camera settings in `AvatarLoader.tsx`**:
   - Camera positioned at `y: 1.1`
   - Looking at `y: 1.5`

2. **Avatar model position in `RPMAvatar.tsx`**:
   - For `profile` context: avatar is at `[0, -0.55, 0]`
   - For `thumbnail` context: avatar is at `[0, -0.5, 0]`

3. **The math problem**:
   - Ready Player Me models have their feet at Y=0, face at Y~1.6
   - When we position the model at Y=-0.55, the face is now at Y=1.6-0.55 = **~1.05**
   - But the camera is looking at Y=1.5 - **above the face!**
   - This causes the camera to aim higher than the face, showing the lower body/knees

4. **Why the detail panel works differently**:
   - Detail panel uses `size="full"` which maps to `customizer` context
   - `customizer` positions avatar at `[0, -1.5, 0]` (pushed way down)
   - Camera settings are `y: 0, lookAtY: 0.8` (looking at body center, not above)

## Solution

Adjust the `lookAtY` values in `SIZE_CONFIG` to match where the face actually is when the model is positioned:

| Size | Model Y Position | Face Y (model ~1.6 - position) | Current lookAtY | Fixed lookAtY |
|------|------------------|-------------------------------|-----------------|---------------|
| sm | -0.5 (thumbnail) | ~1.1 | 1.5 | 1.05 |
| md | -0.55 (profile) | ~1.05 | 1.5 | 1.0 |
| lg | -0.55 (profile) | ~1.05 | 1.5 | 1.0 |
| xl | -0.55 (profile) | ~1.05 | 1.5 | 1.0 |
| full | -1.5 (customizer) | ~0.1 | 0.8 | 0.8 (unchanged) |

Also adjust camera Y to be at face level, not above it:

| Size | Current Camera Y | Fixed Camera Y |
|------|------------------|----------------|
| sm | 1.1 | 1.05 |
| md | 1.1 | 1.0 |
| lg | 1.1 | 1.0 |
| xl | 1.1 | 1.0 |
| full | 0 | 0 (unchanged) |

## File to Modify

### `src/components/avatar-3d/AvatarLoader.tsx`

Update the `SIZE_CONFIG` to correct the camera and lookAt Y values:

```typescript
const SIZE_CONFIG: Record<AvatarSize, { 
  width: string; 
  height: string; 
  scale: number; 
  context: AvatarContext;
  camera: { y: number; z: number; fov: number; lookAtY: number }
}> = {
  sm: { 
    width: 'w-12', height: 'h-12', scale: 0.8, 
    context: 'thumbnail',
    camera: { y: 1.05, z: 1.2, fov: 25, lookAtY: 1.05 }  // Face level
  },
  md: { 
    width: 'w-20', height: 'h-20', scale: 1, 
    context: 'profile',
    camera: { y: 1.0, z: 1.4, fov: 28, lookAtY: 1.0 }  // Face level
  },
  lg: { 
    width: 'w-32', height: 'h-32', scale: 1.2, 
    context: 'profile',
    camera: { y: 1.0, z: 1.5, fov: 30, lookAtY: 1.0 }  // Face level
  },
  xl: { 
    width: 'w-48', height: 'h-48', scale: 1.5, 
    context: 'profile',
    camera: { y: 1.0, z: 1.5, fov: 30, lookAtY: 1.0 }  // Face level
  },
  full: { 
    width: 'w-full', height: 'h-full', scale: 1, 
    context: 'customizer',
    camera: { y: 0, z: 2.5, fov: 35, lookAtY: 0.8 }   // Body center (unchanged)
  },
};
```

## Expected Result

After this fix:
- The camera will be at the same height as where it's looking (face level ~1.0)
- The grid selection thumbnails will properly show the houseguests' faces
- The detail panel (`size="full"`) will continue to show the upper body as designed
