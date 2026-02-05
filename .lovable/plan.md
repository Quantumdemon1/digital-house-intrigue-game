
# Fix Pose Editor Connection and Live Preview

## Root Cause Analysis

The Pose Editor UI exists and saves values to localStorage, but it has no actual connection to the avatar because:

1. **Missing callback wiring**: `PoseEditor.onBoneAdjust` is defined but HouseScene never provides it
2. **Static clone creation**: Poses are applied once during `useMemo` clone creation - changes after mount are ignored
3. **No live preview mechanism**: There's no way to push bone adjustments to the rendered avatar in real-time

## Solution Architecture

```text
+----------------+     onBoneAdjust      +----------------+     boneOverrides     +----------------+
| PoseEditor.tsx | --------------------> | HouseScene.tsx | --------------------> | RPMAvatar.tsx  |
+----------------+                       +----------------+                       +----------------+
       |                                        |                                        |
       v                                        v                                        v
  [Slider Move]                          [State Update]                        [useAvatarAnimator]
       |                                        |                                        |
       v                                        v                                        v
  onBoneAdjust({...})                   liveBoneOverrides                      Apply in useFrame
```

## Implementation Plan

### 1. Add Live Bone Override State to HouseScene.tsx

Create state to hold real-time bone adjustments from the pose editor:

```typescript
// New state for live pose editing
const [liveBoneOverrides, setLiveBoneOverrides] = useState<Record<string, BoneRotation> | null>(null);

// Handler for pose editor
const handleBoneAdjust = useCallback((bones: Record<string, BoneRotation>) => {
  setLiveBoneOverrides(bones);
}, []);
```

Pass to PoseEditor:
```tsx
<PoseEditor
  isVisible={showPoseEditor}
  onClose={() => setShowPoseEditor(false)}
  currentPose={editorPoseType}
  onPoseChange={setEditorPoseType}
  onBoneAdjust={handleBoneAdjust}  // <-- Missing connection
/>
```

### 2. Pass Live Overrides to Player Avatar

Modify CharacterSpot to accept and pass bone overrides to RPMAvatar:

```typescript
// In CharacterSpot props
liveBoneOverrides?: Record<string, BoneRotation> | null;

// In RPMAvatar props  
liveBoneOverrides?: Record<string, BoneRotation> | null;
```

Only apply to selected avatar (or player) when pose editor is active.

### 3. Apply Overrides in useAvatarAnimator

Add a new property to the animator hook that takes bone overrides and applies them in `useFrame`:

```typescript
// In AvatarAnimator.ts config
export interface AvatarAnimatorConfig {
  // ... existing props
  liveBoneOverrides?: Record<string, BoneRotation> | null;
}

// In useFrame, after breathing/gestures:
if (config.liveBoneOverrides) {
  for (const [boneName, rotation] of Object.entries(config.liveBoneOverrides)) {
    const bone = boneMap.get(boneName);
    if (bone) {
      bone.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }
}
```

### 4. Ensure Saved Overrides Load on Mount

The current `getEffectivePose` should already work for loading saved overrides. Verify it's called during clone creation.

## Files to Modify

| File | Changes |
|------|---------|
| `HouseScene.tsx` | Add `liveBoneOverrides` state, wire `onBoneAdjust` to PoseEditor, pass to CharacterSpot for player |
| `CharacterSpot` (in HouseScene) | Accept and pass `liveBoneOverrides` to RPMAvatar |
| `RPMAvatar.tsx` | Accept `liveBoneOverrides` prop, pass to `useAvatarAnimator` |
| `AvatarAnimator.ts` | Add `liveBoneOverrides` to config, apply in useFrame loop |

## Technical Details

### Bone Override Application Priority

In `useAvatarAnimator`, apply in this order (later overrides earlier):
1. Base pose (from static pose)
2. Breathing micro-motion
3. Gesture animation
4. Live bone overrides (editor preview - highest priority)

### localStorage Persistence

The existing `saveSinglePoseOverride` / `getPoseOverrides` in PoseLibrary.ts already handles persistence. When user clicks "Save", the override is stored. On next avatar mount, `getEffectivePose` merges saved overrides with base pose.

### Reapply Saved Poses on Pose Type Change

When user selects a different base pose in the editor dropdown:
1. Load base pose values + any saved overrides for that pose
2. Apply to current bone sliders
3. Push to live preview immediately

## Expected Behavior After Fix

1. **Open Pose Editor** - Current pose sliders reflect saved values or defaults
2. **Drag Slider** - Avatar bones rotate in real-time
3. **Click Reset** - Avatar returns to base pose defaults
4. **Click Save** - Values persisted to localStorage
5. **Close & Reopen** - Saved values load correctly
6. **Reload Page** - Saved overrides apply to avatars on mount
