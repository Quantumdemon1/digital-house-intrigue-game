
# Plan: Fix Avatar Thumbnail Camera to Look at Face

## Problem

The camera in the character selection grid is positioned at Y=1.1, but it's still pointing at the avatars' feet/knees because Three.js cameras look at the origin (0, 0, 0) by default. The camera position was raised, but without explicitly telling it where to look, it still aims down at the ground level.

## Root Cause

In `src/components/avatar-3d/AvatarLoader.tsx`, the `CameraController` component sets the camera position but never calls `camera.lookAt()` to direct it at the avatar's face:

```typescript
// Current code - only sets position, camera looks at origin (0,0,0)
camera.position.set(0, zoomedY, zoomedZ);
camera.updateProjectionMatrix();
```

## Solution

Update the `CameraController` to also call `camera.lookAt()` pointing at the face height (Y ~1.5-1.6 for Ready Player Me avatars).

## File Change

### `src/components/avatar-3d/AvatarLoader.tsx`

**Update the `CameraController` component** to add a lookAt call:

```typescript
const CameraController: React.FC<{ 
  baseY: number; 
  baseZ: number; 
  zoom: number;
  lookAtY?: number;  // NEW: Target Y position to look at
}> = ({ baseY, baseZ, zoom, lookAtY = 1.5 }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const zoomedZ = baseZ / zoom;
    const zoomedY = baseY * (zoom > 1 ? 1 + (zoom - 1) * 0.3 : 1);
    
    camera.position.set(0, zoomedY, zoomedZ);
    camera.lookAt(0, lookAtY, 0);  // NEW: Look at face height
    camera.updateProjectionMatrix();
  }, [camera, baseY, baseZ, zoom, lookAtY]);
  
  return null;
};
```

**Update the `SIZE_CONFIG`** to include a `lookAtY` value for each context:

| Size | Camera Y | Look At Y | Purpose |
|------|----------|-----------|---------|
| sm | 1.1 | 1.5 | Face center |
| md | 1.1 | 1.5 | Face center |
| lg | 1.1 | 1.5 | Face center |
| xl | 1.1 | 1.5 | Face center |
| full | 0 | 0.8 | Body center (customizer) |

**Update `RPMAvatarCanvas`** to pass the lookAtY to CameraController:

```typescript
<CameraController 
  baseY={sizeConfig.camera.y} 
  baseZ={sizeConfig.camera.z} 
  zoom={zoom}
  lookAtY={sizeConfig.camera.lookAtY}  // NEW
/>
```

## Technical Details

### Avatar Model Proportions (RPM Half-Body)

Ready Player Me half-body avatars have approximate heights:
- Feet: Y = 0
- Waist: Y = 1.0
- Chest: Y = 1.3
- Neck: Y = 1.5
- Face center: Y = 1.6
- Top of head: Y = 1.8

### Camera Geometry

For a camera at position (0, 1.1, 1.4) looking at (0, 1.5, 0):
- The camera looks slightly upward at the face
- This frames the head/shoulders nicely in the circular thumbnail

## Expected Result

After this fix, all avatar thumbnails in the character selection grid will properly frame the houseguests' faces instead of showing their knees/lower body.
