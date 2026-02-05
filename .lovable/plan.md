
# Plan: Make All Houseguests Adopt Relaxed Pose in House View

## Problem

Currently, characters in the House View are assigned different poses based on their archetype:
- **Strategist**: `crossed-arms`, `thinking`
- **Competitor**: `hands-on-hips`, `crossed-arms`  
- **Socialite**: `relaxed`, `casual-lean`
- **Wildcard**: `hands-on-hips`, `relaxed`
- **Underdog**: `relaxed`, `thinking`

The user wants all characters to adopt the same relaxed pose as Alex Chen (visible in the reference image with arms naturally at sides).

## Solution

Modify the `ARCHETYPE_POSES` mapping in both house scene files to use only the `relaxed` pose for all archetypes. This ensures every character stands with their arms naturally at their sides, creating a consistent look across the House View.

## Files to Modify

### 1. `src/components/avatar-3d/CircularHouseScene.tsx`

Update the `ARCHETYPE_POSES` constant to only include `relaxed` for all archetypes:

```typescript
// Map archetype to pose types - all use relaxed pose
const ARCHETYPE_POSES: Record<Archetype, PoseType[]> = {
  strategist: ['relaxed'],
  competitor: ['relaxed'],
  socialite: ['relaxed'],
  wildcard: ['relaxed'],
  underdog: ['relaxed'],
};
```

### 2. `src/components/avatar-3d/HouseScene.tsx`

Apply the same change:

```typescript
// Map archetype to pose types - all use relaxed pose for consistency
const ARCHETYPE_POSES: Record<Archetype, PoseType[]> = {
  strategist: ['relaxed'],
  competitor: ['relaxed'],
  socialite: ['relaxed'],
  wildcard: ['relaxed'],
  underdog: ['relaxed'],
};
```

## Technical Details

The `relaxed` pose configuration (already defined in `usePoseVariety.ts`) positions arms naturally at sides:

```typescript
relaxed: {
  LeftArm: { x: 0.05, y: 0.1, z: 1.45 },      // Arms at sides
  RightArm: { x: 0.05, y: -0.1, z: -1.45 },   // Arms at sides
  LeftForeArm: { x: 0, y: 0, z: 0.08 },       // Slight elbow bend
  RightForeArm: { x: 0, y: 0, z: -0.08 },
  LeftHand: { x: 0, y: 0, z: 0.05 },          // Relaxed wrist
  RightHand: { x: 0, y: 0, z: -0.05 },
  Spine: { x: -0.02, y: 0, z: 0 },
  Spine1: { x: -0.01, y: 0, z: 0 },
}
```

This matches the pose shown by Alex Chen in the reference image.

## Expected Result

After this change:
- All houseguests in both the character selection House View (setup) and the in-game House View will stand with their arms relaxed at their sides
- Characters will maintain subtle idle animations (breathing, weight shift) for natural movement
- The pose will match Alex Chen's stance shown in the reference image
