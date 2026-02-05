
# Add DeLorean Time Machine to the Backyard

## Overview
Add a 3D DeLorean model (inspired by Back to the Future) to the backyard area of the house, built entirely with Three.js primitives (box geometries, cylinders, etc.) since we can't load external car models.

## What Gets Built

A stylized DeLorean component featuring:
- Stainless steel body (metallic silver material) with the iconic angular shape
- Gullwing doors (slightly open)
- Flux capacitor glow effect (blue emissive light from the rear)
- Glowing tire tracks / time-travel ground effect (optional subtle blue glow beneath)
- Wheels with dark rims
- Positioned in the backyard near the BBQ grill area, angled as if it just arrived

## Placement
The DeLorean will be placed at approximately `[10, 0, -6]` in the backyard's local coordinate space -- to the right side near the BBQ grill, facing slightly inward. This keeps it visible but not blocking the pool or competition areas.

## Technical Details

### New Component
**`src/components/avatar-3d/DeLorean.tsx`** -- A self-contained Three.js primitive-based DeLorean model:
- Car body: Several `boxGeometry` meshes with `meshStandardMaterial` (metallic: 1, roughness: 0.2, color: #C0C0C0)
- Windshield: Transparent blue-tinted material
- Wheels: `cylinderGeometry` with dark rubber material
- Flux capacitor glow: `pointLight` with blue color emanating from rear
- Ground glow: Flat plane beneath with emissive blue material for the "just time-traveled" effect
- Animated subtle hover/float effect using `useFrame`

### Modified Files
| File | Change |
|------|--------|
| `src/components/avatar-3d/DeLorean.tsx` | **New** -- DeLorean 3D component |
| `src/components/avatar-3d/BackyardArea.tsx` | Import and place `DeLorean` in the Backyard composite |
| `src/components/avatar-3d/index.ts` | Export the new component |
