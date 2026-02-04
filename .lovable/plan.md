

# Plan: Replace Non-Human Avatars with Proper Humanoid Characters

## Problem Summary

Based on the screenshots provided, the current avatar system has major issues:

| Avatar | Current Model | Problem |
|--------|--------------|---------|
| **Elena** | Michelle (Three.js) | Works perfectly - proper human character |
| **Sophia** | Soldier | Too large - shows only torso/armor |
| **Tyler** | Xbot | Robot mannequin - fills entire frame |
| **Marcus** | RiggedFigure | Basic skeleton - head cut off |
| **Jamal** | RiggedSimple | Giant green triangle shape |
| **Maya** | RobotExpressive | Shows only robot legs/underside |
| **Derek** | CesiumMan | Works okay - astronaut in suit |
| **Luna** | Fox | Animal - not a humanoid character |
| **Zara** | Horse | Animal - not a humanoid character |

**Root Causes:**
1. Most models have vastly different scales and aren't normalized
2. Camera positioning assumes human proportions but models vary wildly
3. Non-humanoid models (animals, robots) don't fit the avatar use case

---

## Solution: Replace with Properly Scaled Human Characters

### Strategy: Use Three.js Official Models + Sketchfab Free Characters

Replace all problematic avatars with verified human-proportioned GLB models from:
1. **Three.js Examples** - Michelle, Soldier, Kira (verified working)
2. **ReadyPlayerMe sample** - Available in Three.js examples as `readyplayer.me.glb`

### New Avatar Roster (10 Characters)

| Name | New Model URL | Description | Style |
|------|---------------|-------------|-------|
| **Elena** | `/avatars/glb/elena.glb` (Michelle) | Keep - works great | Casual/Stylized |
| **Marcus** | `threejs.org/.../Soldier.glb` | Military tactical character | Formal |
| **Sophia** | `threejs.org/.../kira.glb` | Anime-style female | Casual |
| **Tyler** | `threejs.org/.../readyplayer.me.glb` | Ready Player Me sample | Athletic |
| **Jamal** | `threejs.org/.../facecap.glb` | Face capture model with expressions | Casual |
| **Maya** | Re-download Michelle variant | Duplicate of Elena with different name | Fantasy |
| **Derek** | Keep CesiumMan | Astronaut character - works ok | Casual |
| Remove | Luna (Fox) | Not humanoid - remove from list | - |
| Remove | Zara (Horse) | Not humanoid - remove from list | - |
| Add | **Nadia** | New character from verified source | Professional |
| Add | **Carlos** | New character from verified source | Athletic |

---

## Implementation Steps

### Step 1: Download Verified Human GLB Models

Download these models from Three.js examples (proven to work):

```text
https://threejs.org/examples/models/gltf/Michelle.glb      → elena.glb (keep)
https://threejs.org/examples/models/gltf/Soldier.glb       → marcus.glb (replace)
https://threejs.org/examples/models/gltf/kira.glb          → sophia.glb (replace)
https://threejs.org/examples/models/gltf/readyplayer.me.glb → tyler.glb (replace)
https://threejs.org/examples/models/gltf/facecap.glb       → jamal.glb (replace)
https://threejs.org/examples/models/gltf/CesiumMan/CesiumMan.glb → derek.glb (keep if working)
```

### Step 2: Update preset-glb-avatars.ts

Remove Luna, Zara (animals), and Carlos placeholder. Update metadata for replaced models:

```typescript
export const PRESET_GLB_AVATARS: GLBPresetAvatar[] = [
  {
    id: 'glb-elena',
    name: 'Elena',
    url: '/avatars/glb/elena.glb',
    style: 'casual',
    bodyType: 'slim',
    category: 'humanoid',
    traits: ['graceful', 'charming'],
    description: 'Stylized female with expressive animations',
    isPlaceholder: false
  },
  {
    id: 'glb-marcus',
    name: 'Marcus',
    url: '/avatars/glb/marcus.glb',
    style: 'formal',
    bodyType: 'athletic',
    category: 'humanoid',
    traits: ['confident', 'tactical'],
    description: 'Military tactical character',
    isPlaceholder: false
  },
  // ... 6-8 more verified human characters
];
```

### Step 3: Add Model Scaling Logic to PresetAvatar Component

Add per-model scale adjustments since different models have different native sizes:

```typescript
// In PresetAvatar.tsx
const MODEL_SCALE_OVERRIDES: Record<string, number> = {
  'glb-marcus': 0.5,    // Soldier is large
  'glb-sophia': 2.0,    // Kira is small
  'glb-tyler': 1.2,     // RPM sample
  'glb-jamal': 0.8,     // Facecap model
  'glb-derek': 1.5,     // CesiumMan
  'glb-elena': 1.0,     // Michelle - reference size
};

const effectiveScale = (MODEL_SCALE_OVERRIDES[preset.id] || 1) * scale;
```

### Step 4: Update Camera/Framing in AvatarLoader

Adjust camera position to better frame humanoid characters:

```typescript
// In PresetAvatarCanvas
<Canvas 
  camera={{ 
    position: [0, 0.3, 2.0],  // Slightly higher and closer
    fov: 40                    // Narrower FOV for portrait framing
  }}
>
```

---

## File Changes Summary

### Files to Modify

| File | Changes |
|------|---------|
| `public/avatars/glb/marcus.glb` | Replace with Soldier.glb from Three.js |
| `public/avatars/glb/sophia.glb` | Replace with kira.glb from Three.js |
| `public/avatars/glb/tyler.glb` | Replace with readyplayer.me.glb |
| `public/avatars/glb/jamal.glb` | Replace with facecap.glb |
| `public/avatars/glb/maya.glb` | Remove or replace |
| `public/avatars/glb/luna.glb` | Delete (animal) |
| `public/avatars/glb/zara.glb` | Delete (animal) |
| `src/data/preset-glb-avatars.ts` | Update roster, remove animals |
| `src/components/avatar-3d/PresetAvatar.tsx` | Add model-specific scale overrides |
| `src/components/avatar-3d/AvatarLoader.tsx` | Adjust camera framing |

---

## Fallback: If Models Still Have Issues

If after downloading the new models there are still scaling issues, implement automatic bounding box normalization:

```typescript
// Auto-scale based on bounding box
useEffect(() => {
  if (!clonedScene) return;
  
  const box = new THREE.Box3().setFromObject(clonedScene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  
  // Normalize to ~2 units tall
  const normalizeScale = 2 / maxDim;
  groupRef.current?.scale.setScalar(normalizeScale * scale);
  
  // Center vertically
  const center = box.getCenter(new THREE.Vector3());
  groupRef.current?.position.y = -center.y * normalizeScale;
}, [clonedScene, scale]);
```

---

## Expected Outcome

After implementation:
- All 8 avatars will be properly proportioned humanoid characters
- Characters will fit within the avatar preview window
- Face/upper body will be visible for all characters
- No more animal or abstract shapes in the selection

---

## Technical Notes

- Three.js example models are MIT licensed and safe to use
- Michelle.glb (Elena) is the reference - all other models should match her visual scale
- The `facecap.glb` model has facial morph targets for expressions
- CesiumMan and Soldier include idle animations
- We'll keep Derek as-is if the astronaut style is acceptable

