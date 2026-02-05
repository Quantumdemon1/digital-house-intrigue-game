
# Plan: Raise Camera Y Position for Avatar Thumbnails in Grid Selection

## Problem

The camera in the character selection grid is pointed too low, showing the avatars' knees/lower body instead of their faces.

## Current State

In `src/components/avatar-3d/AvatarLoader.tsx`, the `SIZE_CONFIG` defines camera positions for each avatar size:

```typescript
const SIZE_CONFIG = {
  sm: { camera: { y: 0.55, z: 1.2, fov: 25 } },
  md: { camera: { y: 0.55, z: 1.4, fov: 28 } },
  lg: { camera: { y: 0.55, z: 1.5, fov: 30 } },
  xl: { camera: { y: 0.55, z: 1.5, fov: 30 } },
  full: { camera: { y: 0, z: 2.5, fov: 35 } }
};
```

The `CharacterFrame` component maps frame sizes to avatar sizes:
- `sm` frame uses `md` avatar size
- `md` frame uses `lg` avatar size  
- `lg` frame uses `xl` avatar size

## Solution

Double the camera Y position (from `0.55` to `1.1`) for the thumbnail/profile contexts (`sm`, `md`, `lg`, `xl`) to frame the avatars' faces instead of their knees.

## File Changes

### `src/components/avatar-3d/AvatarLoader.tsx`

Update the `SIZE_CONFIG` camera Y values:

| Size | Current Y | New Y |
|------|-----------|-------|
| sm | 0.55 | 1.1 |
| md | 0.55 | 1.1 |
| lg | 0.55 | 1.1 |
| xl | 0.55 | 1.1 |
| full | 0 | 0 (unchanged - full body view) |

```typescript
const SIZE_CONFIG = {
  sm: { 
    width: 'w-12', height: 'h-12', scale: 0.8, 
    context: 'thumbnail',
    camera: { y: 1.1, z: 1.2, fov: 25 }  // Doubled Y for face framing
  },
  md: { 
    width: 'w-20', height: 'h-20', scale: 1, 
    context: 'profile',
    camera: { y: 1.1, z: 1.4, fov: 28 }  // Doubled Y for face framing
  },
  lg: { 
    width: 'w-32', height: 'h-32', scale: 1.2, 
    context: 'profile',
    camera: { y: 1.1, z: 1.5, fov: 30 }  // Doubled Y for face framing
  },
  xl: { 
    width: 'w-48', height: 'h-48', scale: 1.5, 
    context: 'profile',
    camera: { y: 1.1, z: 1.5, fov: 30 }  // Doubled Y for face framing
  },
  full: { 
    width: 'w-full', height: 'h-full', scale: 1, 
    context: 'customizer',
    camera: { y: 0, z: 2.5, fov: 35 }    // Full body - unchanged
  },
};
```

## Expected Result

After this change, all avatar thumbnails in the character selection grid will show the houseguests' faces/upper body instead of their knees.
