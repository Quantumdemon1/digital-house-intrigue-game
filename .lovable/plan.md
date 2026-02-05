

# Plan: Fix T-Pose - Create Natural Standing Idle Pose for House Scene Characters

## Problem

Ready Player Me avatars in the House Scene display in their default T-pose (arms straight out) rather than a natural standing pose. This looks unnatural and breaks immersion.

## Root Cause

RPM GLB avatars are exported in a T-pose bind pose by default. Without loading external animation files (FBX/GLB), the skeleton remains in this default state. The current code only animates:
- Morph targets (facial expressions, blinking)
- The outer group rotation (head movement)
- Scale breathing effects on the wrapper group

None of these affect the actual skeleton bones that control arm/body position.

## Solution

Programmatically manipulate the avatar skeleton bones to create a natural "idle standing" pose, then add subtle per-frame bone animations for lifelike movement. This avoids needing external animation files.

### RPM Skeleton Bone Names (Standard)

Based on Ready Player Me's armature:
- `Hips` - Root bone
- `Spine`, `Spine1`, `Spine2` - Torso
- `Neck`, `Head` - Head area
- `LeftShoulder`, `RightShoulder` - Shoulders
- `LeftArm`, `RightArm` - Upper arms
- `LeftForeArm`, `RightForeArm` - Lower arms
- `LeftHand`, `RightHand` - Hands

### Natural Standing Pose Values

To move arms down from T-pose to a relaxed position:

| Bone | Rotation (radians) | Effect |
|------|-------------------|--------|
| `LeftArm` | Z: +1.2, X: +0.1 | Arm down at side, slight forward |
| `RightArm` | Z: -1.2, X: +0.1 | Arm down at side, slight forward |
| `LeftForeArm` | Z: +0.3 | Slight elbow bend |
| `RightForeArm` | Z: -0.3 | Slight elbow bend |
| `Spine` | X: -0.02 | Very slight chest-out posture |

---

## Implementation

### 1. Create New Hook: `useIdlePose.ts`

Create a new hook that:
1. Finds skeleton bones in the cloned scene
2. Applies a natural standing pose on mount
3. Adds subtle per-frame bone micro-movements (arm sway, weight shift)

```typescript
// Key bone adjustments for natural pose
const IDLE_POSE = {
  LeftArm: { x: 0.1, y: 0, z: 1.2 },       // Arm down
  RightArm: { x: 0.1, y: 0, z: -1.2 },     // Arm down  
  LeftForeArm: { x: 0, y: 0, z: 0.3 },     // Slight bend
  RightForeArm: { x: 0, y: 0, z: -0.3 },   // Slight bend
  Spine: { x: -0.02, y: 0, z: 0 },         // Slight posture
};

// Per-frame subtle animations
useFrame(({ clock }) => {
  const time = clock.elapsedTime + phase;
  
  // Subtle arm sway
  leftArmBone.rotation.z = 1.2 + Math.sin(time * 0.5) * 0.03;
  rightArmBone.rotation.z = -1.2 + Math.sin(time * 0.5 + 0.5) * 0.03;
  
  // Weight shift in spine
  spineBone.rotation.z = Math.sin(time * 0.3) * 0.01;
});
```

### 2. Update `RPMAvatar.tsx`

Add a new prop `applyIdlePose` (default: false) and integrate the pose hook:

- When `applyIdlePose={true}`, find skeleton bones after scene clone
- Apply initial pose rotations
- Run per-frame subtle bone animations
- Stagger animations by passing an optional `phaseOffset` prop

### 3. Update `HouseScene.tsx`

Pass `applyIdlePose={true}` to RPMAvatar instances in CharacterSpot:

```typescript
<RPMAvatar
  modelSrc={modelUrl}
  context="game"
  scale={1}
  position={[0, 0, 0]}
  applyIdlePose={true}
  phaseOffset={index * 0.7}  // Stagger animations
/>
```

---

## Files to Modify

### 1. Create `src/components/avatar-3d/hooks/useIdlePose.ts`

New hook that:
- Accepts a cloned THREE scene
- Traverses to find bones by name using `scene.getObjectByName()`
- Applies initial rotation values for natural pose
- Runs subtle per-frame bone animations with phase offset

### 2. Modify `src/components/avatar-3d/RPMAvatar.tsx`

- Add `applyIdlePose?: boolean` and `phaseOffset?: number` props
- Import and call `useIdlePose` hook when enabled
- Pass the cloned scene to the hook for bone manipulation
- Keep existing morph target animations (blink, expressions)

### 3. Modify `src/components/avatar-3d/HouseScene.tsx`

- Update RPMAvatar usage in CharacterSpot to include:
  - `applyIdlePose={true}`
  - `phaseOffset={index * 0.7}` for staggered animations

---

## Technical Details

### Finding Bones

```typescript
const findBone = (scene: THREE.Object3D, name: string): THREE.Bone | null => {
  let bone: THREE.Bone | null = null;
  scene.traverse((child) => {
    if (child instanceof THREE.Bone && child.name === name) {
      bone = child;
    }
  });
  return bone;
};
```

### Applying Pose with Euler Rotations

```typescript
const applyPoseRotation = (bone: THREE.Bone, rot: {x: number, y: number, z: number}) => {
  bone.rotation.set(rot.x, rot.y, rot.z);
};
```

### Animation Phase Offset

Each character gets a unique phase offset (e.g., `index * 0.7`) so their micro-movements aren't synchronized, creating natural variation.

---

## Expected Result

After implementation:
- All 12 characters in the House Scene will have arms naturally at their sides
- Subtle breathing and arm micro-sway will make them appear alive
- Each character will have slightly different animation timing (staggered)
- Existing facial expressions and blinking continue to work
- No external animation files required

