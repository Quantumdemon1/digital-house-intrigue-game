
# Plan: Fix Avatar Portrait Camera Framing

## Root Cause Analysis

The avatar portrait shows the torso instead of the head because:

1. **Static camera in `AvatarLoader.tsx`**: Uses fixed `camera={{ position: [0, 0, 2.5], fov: 35 }}` for all contexts
2. **Model position mismatch**: `RPMAvatar.tsx` positions the model based on context (e.g., `profile: [0, -0.55, 0]`), but the camera doesn't compensate
3. **No camera Y adjustment**: The camera looks straight ahead at Y=0, but the head is ~1.6 units above the model origin

## Solution: Context-Aware Camera Settings

Add camera configuration that varies by context to properly frame the head for portrait views.

### Camera Configuration Table

| Context | Camera Y | Camera Z | FOV | Model Y | Result |
|---------|----------|----------|-----|---------|--------|
| `thumbnail` | 0.55 | 1.2 | 25 | -0.5 | Tight head shot |
| `profile` | 0.55 | 1.5 | 30 | -0.55 | Head portrait |
| `game` | 0.4 | 2.0 | 35 | -0.7 | Upper body |
| `customizer` | 0 | 2.5 | 35 | -1.5 | Full body |

### File Changes

**`src/components/avatar-3d/AvatarLoader.tsx`**:

```typescript
// Size configurations with context-aware CAMERA settings
const SIZE_CONFIG: Record<AvatarSize, { 
  width: string; 
  height: string; 
  scale: number; 
  context: AvatarContext;
  camera: { y: number; z: number; fov: number }
}> = {
  sm: { 
    width: 'w-12', height: 'h-12', scale: 0.8, 
    context: 'thumbnail',
    camera: { y: 0.55, z: 1.2, fov: 25 }  // Tight head
  },
  md: { 
    width: 'w-20', height: 'h-20', scale: 1, 
    context: 'game',
    camera: { y: 0.4, z: 2.0, fov: 35 }   // Upper body
  },
  lg: { 
    width: 'w-32', height: 'h-32', scale: 1.2, 
    context: 'game',
    camera: { y: 0.4, z: 2.0, fov: 35 }   // Upper body
  },
  xl: { 
    width: 'w-48', height: 'h-48', scale: 1.5, 
    context: 'profile',
    camera: { y: 0.55, z: 1.5, fov: 30 }  // Head portrait
  },
  full: { 
    width: 'w-full', height: 'h-full', scale: 1, 
    context: 'customizer',
    camera: { y: 0, z: 2.5, fov: 35 }     // Full body
  },
};

// In RPMAvatarCanvas - use dynamic camera settings
<Canvas
  camera={{ 
    position: [0, sizeConfig.camera.y, sizeConfig.camera.z], 
    fov: sizeConfig.camera.fov 
  }}
  gl={{ preserveDrawingBuffer: true, antialias: true }}
>
```

### Updated RPMAvatarCanvas Props

```typescript
const RPMAvatarCanvas: React.FC<{
  avatarUrl: string;
  mood: MoodType;
  scale: number;
  context: AvatarContext;
  sizeConfig: { 
    width: string; 
    height: string; 
    camera: { y: number; z: number; fov: number } 
  };
  className?: string;
  onLoaded?: () => void;
  onError?: () => void;
}>
```

## Visual Guide

**Current (broken)**: Camera at Y=0, Z=2.5 with fixed FOV
```text
    Camera [0, 0, 2.5] ---> looks at Y=0
                    
    Head    ~1.6y  [not visible]
    Torso   ~0.8y  [visible] <-- what you see
    Legs    ~0.0y  [visible]
```

**Fixed**: Camera raised to Y=0.55, moved closer Z=1.5, narrower FOV
```text
    Camera [0, 0.55, 1.5] ---> looks at head area
                    
    Head    ~1.6y  [visible] <-- what you see
    Shoulders      [visible]
    Torso          [cut off]
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/avatar-3d/AvatarLoader.tsx` | Add camera config per size, pass to Canvas |

## Expected Result

After this fix:
- **Profile/xl size**: Camera focused on head/face
- **Thumbnail/sm size**: Tight head shot for small displays  
- **Game/md/lg size**: Upper body visible
- **Customizer/full size**: Full body for avatar editing

The avatar portrait preview will now show the face properly centered instead of showing the torso.
