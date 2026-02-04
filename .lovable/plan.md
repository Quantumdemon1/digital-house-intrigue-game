

# Plan: Fix Avatar Display & Add Profile Picture Screenshot Feature

## Problem Analysis

After investigating the codebase and network requests:

1. **GLB files ARE loading successfully** (200 status responses) - the models exist and load
2. **Broken display issues:**
   - Thumbnails show broken image icon because `/public/avatars/thumbnails/` only contains a README
   - Some models are non-humanoid (Luna = fox, Zara = horse, Maya = robot)
   - Models need camera positioning adjustments to center on "face" area
3. **Missing feature:** Screenshot capture for profile pictures

---

## Solution Overview

### Part 1: Fix Broken Avatar Display

**1.1 Remove Thumbnails References (No Physical Files)**

Update the preset data files to remove thumbnail references since they don't exist:
- Set `thumbnail: undefined` for all GLB presets
- Set `thumbnail: undefined` for all VRM presets
- This stops the broken image icon from appearing

**1.2 Mark Non-Humanoid Models Appropriately**

Add a `category` field to distinguish model types:
- `humanoid` - Standard human characters
- `robot` - Robot/android characters (Tyler, Maya)
- `creature` - Animals/fantasy creatures (Luna, Zara)
- `demo` - Technical demo models (Marcus, Derek, Jamal)

Update `PresetAvatarSelector` to filter by category, showing humanoids by default.

**1.3 Adjust Camera Framing for Different Model Types**

Update canvas camera settings to better frame different model types:
- Position camera higher for humanoid models (focus on face/upper body)
- Adjust scale based on model category
- Add different Y-offset for robots vs creatures

---

### Part 2: Add Profile Picture Screenshot Feature

**2.1 Create Screenshot Capture Component**

New file: `src/components/avatar-3d/AvatarScreenshotCapture.tsx`

Features:
- Captures the Three.js canvas as a PNG/WebP image
- Crops to square aspect ratio centered on face area
- Provides "Take Photo" button in customizer
- Returns base64 data URL for storage

```text
┌──────────────────────────────────────┐
│     [3D Avatar Preview Canvas]       │
│                                      │
│      ┌─────────────────────┐         │
│      │   Capture Region    │         │
│      │   (Face Focus)      │         │
│      └─────────────────────┘         │
│                                      │
│      [📷 Take Profile Photo]         │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Profile Picture Preview Modal      │
│   ┌──────────┐                       │
│   │ Captured │   [Retake] [Save]     │
│   │  Photo   │                       │
│   └──────────┘                       │
└──────────────────────────────────────┘
```

**2.2 Update AvatarCustomizer with Screenshot Button**

Add to customizer:
- "Take Profile Photo" button below avatar preview
- Photo preview modal with retake/save options
- Store captured photo in avatar config as `profilePhotoUrl`

**2.3 Update Avatar3DConfig Type**

Add new field:
```typescript
profilePhotoUrl?: string; // Base64 data URL of captured face screenshot
```

**2.4 Create Profile Picture Display Component**

New file: `src/components/avatar-3d/AvatarProfilePicture.tsx`

- Displays the captured 2D profile photo
- Falls back to 3D avatar render if no photo captured
- Used in game UI for profile displays

---

## File Changes Summary

### New Files (2)

| File | Purpose |
|------|---------|
| `src/components/avatar-3d/AvatarScreenshotCapture.tsx` | Canvas screenshot capture with face-region cropping |
| `src/components/avatar-3d/AvatarProfilePicture.tsx` | Display captured profile photos in game UI |

### Modified Files (5)

| File | Changes |
|------|---------|
| `src/data/preset-glb-avatars.ts` | Remove thumbnail refs, add `category` field, mark non-humanoids |
| `src/data/preset-vrm-avatars.ts` | Remove thumbnail refs |
| `src/components/avatar-3d/PresetAvatarSelector.tsx` | Add category filter, show category badges |
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Add "Take Photo" button and capture flow |
| `src/models/avatar-config.ts` | Add `profilePhotoUrl` to config type |

---

## Technical Details

### Screenshot Capture Implementation

```typescript
// Core capture function
const captureProfilePhoto = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return null;
  
  // Get canvas dimensions
  const { width, height } = canvas;
  
  // Create offscreen canvas for cropping (square, centered on upper half)
  const cropCanvas = document.createElement('canvas');
  const cropSize = Math.min(width, height);
  cropCanvas.width = 256;  // Fixed output size
  cropCanvas.height = 256;
  
  const ctx = cropCanvas.getContext('2d');
  
  // Crop from upper-center region (face area)
  const sx = (width - cropSize) / 2;
  const sy = 0; // Start from top for face focus
  
  ctx.drawImage(
    canvas,
    sx, sy, cropSize, cropSize,  // Source crop
    0, 0, 256, 256               // Destination (256x256 square)
  );
  
  return cropCanvas.toDataURL('image/webp', 0.85);
};
```

### GLB Category Mapping

```typescript
// Updated preset-glb-avatars.ts
export interface GLBPresetAvatar {
  // ... existing fields
  category: 'humanoid' | 'robot' | 'creature' | 'demo';
}

// Assignments:
// - marcus.glb → 'demo' (RiggedFigure - basic humanoid test)
// - elena.glb → 'humanoid' (Michelle - good human model)
// - tyler.glb → 'robot' (Xbot - robot model)
// - sophia.glb → 'humanoid' (Soldier - human character)
// - jamal.glb → 'demo' (RiggedSimple - very basic)
// - maya.glb → 'robot' (RobotExpressive)
// - derek.glb → 'demo' (CesiumMan - space suit)
// - luna.glb → 'creature' (Fox)
// - zara.glb → 'creature' (Horse)
```

### Category Filter UI

```typescript
// In PresetAvatarSelector
const categoryFilters = [
  { value: 'all', label: 'All' },
  { value: 'humanoid', label: 'Human' },
  { value: 'robot', label: 'Robot' },
  { value: 'creature', label: 'Creature' },
];
```

---

## Implementation Order

1. **Fix thumbnails** - Remove broken thumbnail references
2. **Add categories** - Categorize GLB models and add filter
3. **Camera adjustments** - Better framing for face-focused display
4. **Screenshot capture** - Add capture component and button
5. **Profile integration** - Store and display profile photos

---

## Notes

- The canvas already has `preserveDrawingBuffer: true` which enables screenshot capture
- Captured photos will be stored as base64 data URLs (~50-100KB each)
- For game use, profile photos provide instant display without 3D rendering overhead
- VRM models have better standardized face positioning due to VRM format requirements

