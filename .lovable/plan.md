
# Fix Avatar Rigging Glitches - Heads and Arms Going Wrong Directions

## Problem Analysis

Based on the screenshot and code analysis, the avatars are "glitching out" with heads and arms going in every direction. This is caused by **three main issues**:

### Root Cause 1: Spring Physics Instability
The spring physics system has a **critical bug** in delta time normalization that causes exponential oscillation:

```typescript
// SecondaryMotionSystem.ts line 125
const dt = Math.min(deltaTime, 0.05) * 60; // This can create dt values up to 3.0!
```

When `deltaTime` is 0.05s (50ms), `dt` becomes `3.0`, which causes the spring physics to become unstable - the springs overshoot their targets massively, creating wild oscillations in head/arm rotations.

### Root Cause 2: Uninitialized Spring States
When springs aren't initialized with the current bone values, they start at `{x: 0, y: 0, z: 0}` and try to "catch up" to the target poses. This creates a violent snap/oscillation as the spring tries to move from 0 to ~1.45 radians (arm positions).

### Root Cause 3: Missing Rotation Clamping
There's no safety clamping on the final bone rotations being applied. If a spring goes unstable, rotations can go to infinity or NaN, causing the visual glitches seen in the screenshot.

---

## Technical Fix Plan

### Fix 1: Stabilize Spring Delta Time Calculation

The current formula `deltaTime * 60` can produce values much greater than 1.0, which destabilizes the spring simulation.

**Current (broken):**
```typescript
const dt = Math.min(deltaTime, 0.05) * 60; // Can be up to 3.0!
```

**Fixed:**
```typescript
// Normalize to 60fps baseline but clamp to reasonable range
const dt = Math.min(Math.max(deltaTime * 60, 0.1), 1.5);
```

**Files to modify:**
- `src/components/avatar-3d/animation/physics/SecondaryMotionSystem.ts`
- `src/components/avatar-3d/animation/layers/LookAtLayer.ts` (same issue on lines 161-162)

### Fix 2: Add Velocity Damping and Value Clamping

Add safety limits to prevent springs from going unstable:

**In springPhysics.ts:**
```typescript
export const updateSpring = (
  state: SpringState,
  config: SpringConfig,
  deltaTime: number
): SpringState => {
  // ...existing physics calculation...
  
  // CLAMP: Prevent runaway velocity
  const maxVelocity = 5.0; // Radians per normalized frame
  const clampedVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, newVelocity));
  
  // CLAMP: Prevent extreme positions
  const maxPosition = Math.PI * 2; // Full rotation limit
  const clampedPosition = Math.max(-maxPosition, Math.min(maxPosition, newPosition));
  
  // NaN safety check
  if (isNaN(clampedPosition) || isNaN(clampedVelocity)) {
    return { position: state.target, velocity: 0, target: state.target };
  }
  
  return {
    position: clampedPosition,
    velocity: clampedVelocity,
    target: state.target,
  };
};
```

### Fix 3: Initialize Springs from Current Bone State

Ensure springs are properly initialized with the base pose values, not zeros:

**In SecondaryMotionSystem.ts:**
```typescript
export const initializeSecondaryMotion = (
  state: SecondaryMotionState,
  currentBones: BoneMap
): SecondaryMotionState => {
  const springs: Record<string, Spring3DState> = {};
  
  TRACKED_BONES.forEach(boneName => {
    const bone = currentBones[boneName];
    if (bone) {
      // Initialize with BOTH position and target set to current value
      const initialPos = {
        x: bone.rotation.x,
        y: bone.rotation.y,
        z: bone.rotation.z,
      };
      springs[boneName] = createSpring3D(initialPos);
      // Also set the target to the same value to prevent initial oscillation
      springs[boneName] = setSpring3DTarget(springs[boneName], initialPos);
    } else {
      springs[boneName] = createSpring3D({ x: 0, y: 0, z: 0 });
    }
  });
  
  return { springs, initialized: true };
};
```

### Fix 4: Add Final Rotation Clamping in boneUtils

Add a safety clamp when applying rotations to bones:

**In boneUtils.ts - applyBoneMap:**
```typescript
export const applyBoneMap = (
  boneCache: Map<string, THREE.Bone>,
  boneMap: BoneMap,
  blend: number = 1
): void => {
  // Define per-bone rotation limits
  const BONE_LIMITS: Record<string, { min: number; max: number }> = {
    Head: { min: -0.8, max: 0.8 },
    Neck: { min: -0.5, max: 0.5 },
    Spine: { min: -0.3, max: 0.3 },
    Spine1: { min: -0.3, max: 0.3 },
    Spine2: { min: -0.3, max: 0.3 },
    LeftArm: { min: -2.0, max: 2.0 },
    RightArm: { min: -2.0, max: 2.0 },
    LeftForeArm: { min: -2.5, max: 2.5 },
    RightForeArm: { min: -2.5, max: 2.5 },
    LeftHand: { min: -1.0, max: 1.0 },
    RightHand: { min: -1.0, max: 1.0 },
  };
  
  Object.entries(boneMap).forEach(([boneName, state]) => {
    const bone = boneCache.get(boneName);
    if (!bone) return;
    
    // Get limits for this bone
    const limits = BONE_LIMITS[boneName] || { min: -Math.PI, max: Math.PI };
    
    // Clamp rotations to safe ranges
    const safeX = clampAndValidate(state.rotation.x, limits.min, limits.max);
    const safeY = clampAndValidate(state.rotation.y, limits.min, limits.max);
    const safeZ = clampAndValidate(state.rotation.z, limits.min, limits.max);
    
    if (blend >= 1) {
      bone.rotation.set(safeX, safeY, safeZ);
    } else {
      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, safeX, blend);
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, safeY, blend);
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, safeZ, blend);
    }
  });
};

// Helper to clamp and handle NaN
const clampAndValidate = (value: number, min: number, max: number): number => {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.max(min, Math.min(max, value));
};
```

### Fix 5: Disable Physics on Mobile/Low Quality

The physics system is too aggressive for mobile devices. Disable it more thoroughly:

**In AnimationController.ts:**
```typescript
// Use physics only on high quality AND non-mobile
const enablePhysics = qualityConfig.enablePhysics && !window.matchMedia('(max-width: 768px)').matches;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/avatar-3d/animation/utils/springPhysics.ts` | Add velocity/position clamping, NaN checks |
| `src/components/avatar-3d/animation/utils/boneUtils.ts` | Add per-bone rotation limits, NaN safety |
| `src/components/avatar-3d/animation/physics/SecondaryMotionSystem.ts` | Fix delta time calculation, improve initialization |
| `src/components/avatar-3d/animation/layers/LookAtLayer.ts` | Fix delta time scaling |
| `src/components/avatar-3d/animation/AnimationController.ts` | Add mobile detection for physics disable |

---

## Testing Approach

After implementing fixes:
1. Verify arms stay in relaxed position (Z ≈ 1.45 radians)
2. Verify head stays centered (X/Y/Z near 0)
3. Verify subtle idle breathing animation works
4. Verify no jerky movements on mobile
5. Verify characters don't glitch when switching between them quickly

---

## Why This Happens

The core issue is that the spring physics simulation becomes numerically unstable when:
1. Frame times are long (low FPS on mobile)
2. The delta time multiplier creates values > 1.0
3. Springs "overshoot" their targets and the next frame overshoots even more
4. This creates an exponential oscillation that makes arms/heads spin wildly

The fix ensures:
- Delta time stays in a stable range
- Velocities and positions have hard limits
- NaN values are caught and reset
- Per-bone rotation limits prevent physically impossible poses
