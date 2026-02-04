
# Plan: Fix Avatar Framing in Character Grid Thumbnails

## Problem Analysis

The character selection grid shows only the legs of 3D avatars because the camera and avatar positioning are misconfigured for small circular frames.

### Current Configuration

| Size | Context | Camera Y | Camera Z | Avatar Position Y |
|------|---------|----------|----------|-------------------|
| `md` | `game` | 0.4 | 2.0 | -0.7 |
| `lg` | `game` | 0.4 | 2.0 | -0.7 |
| `xl` | `profile` | 0.55 | 1.5 | -0.55 |
| `full` | `customizer` | 0 | 2.5 | -1.5 |

The `md` and `lg` sizes use `game` context which frames the upper body, but the camera is positioned too low (Y=0.4) and the avatar is pushed down (Y=-0.7), resulting in showing only the legs/waist area.

### Root Cause

The `game` context camera settings (Y=0.4, Z=2.0) combined with avatar position (Y=-0.7) places the camera looking at the lower body rather than the face/chest.

## Solution

Adjust the `md` and `lg` size configurations in `AvatarLoader.tsx` to use head-focused framing similar to `profile` or `thumbnail` context:

1. Change `md` and `lg` to use `profile` context instead of `game`
2. Adjust camera Y position to 0.5-0.55 (looking at head level)
3. Adjust camera Z to 1.3-1.5 (closer for tighter framing)
4. Increase FOV slightly to capture more of the head/shoulders

### Updated SIZE_CONFIG

```typescript
const SIZE_CONFIG = {
  sm: { 
    width: 'w-12', height: 'h-12', scale: 0.8, 
    context: 'thumbnail',
    camera: { y: 0.55, z: 1.2, fov: 25 }  // Tight head shot
  },
  md: { 
    width: 'w-20', height: 'h-20', scale: 1, 
    context: 'profile',  // Changed from 'game'
    camera: { y: 0.55, z: 1.4, fov: 28 }  // Head-focused
  },
  lg: { 
    width: 'w-32', height: 'h-32', scale: 1.2, 
    context: 'profile',  // Changed from 'game'
    camera: { y: 0.55, z: 1.5, fov: 30 }  // Head-focused
  },
  xl: { 
    width: 'w-48', height: 'h-48', scale: 1.5, 
    context: 'profile',
    camera: { y: 0.55, z: 1.5, fov: 30 }  // Head portrait
  },
  full: { 
    width: 'w-full', height: 'h-full', scale: 1, 
    context: 'customizer',
    camera: { y: 0, z: 2.5, fov: 35 }  // Full body
  },
};
```

## Files to Modify

### `src/components/avatar-3d/AvatarLoader.tsx`

Update the `SIZE_CONFIG` object to use head-focused camera settings for `md` and `lg` sizes:

- Line 56-63: Change `md` context from `game` to `profile`, adjust camera to `{ y: 0.55, z: 1.4, fov: 28 }`
- Line 60-64: Change `lg` context from `game` to `profile`, adjust camera to `{ y: 0.55, z: 1.5, fov: 30 }`

## Expected Result

After this change:
1. Character grid thumbnails will show the face/head area instead of legs
2. The detail panel preview will continue showing the full-body view
3. Both views will be properly framed for their respective UI contexts

## Technical Details

The camera Y position (0.55) combined with avatar position (Y=-0.55 from RPMAvatar's `profile` context) centers the camera on the head. The Z distance (1.4-1.5) provides appropriate zoom for the circular frame, and the FOV (28-30) captures head and shoulders without distortion.
