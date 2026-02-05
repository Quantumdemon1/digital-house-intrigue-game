
# Per-Avatar Pose Customization System

## Overview
Currently, poses are stored globally by pose type (neutral, relaxed, etc.) and apply identically to all avatars. This plan adds the ability to save pose coordinates for individual avatars, using their unique character ID (e.g., `quinn-martinez`) as the storage key.

## Storage Structure

### Current Format
```
localStorage['avatar_pose_overrides'] = {
  "neutral": { bones... },
  "relaxed": { bones... }
}
```

### New Format (Character-Specific)
```
localStorage['avatar_pose_overrides'] = {
  "neutral": { bones... },                    // Global fallback
  "neutral:quinn-martinez": { bones... },     // Quinn-specific neutral pose
  "neutral:alex-chen": { bones... },          // Alex-specific neutral pose
  "relaxed:maya-hassan": { bones... }         // Maya-specific relaxed pose
}
```

The key format uses `poseName:characterId` for per-avatar overrides, falling back to just `poseName` for global defaults.

---

## File Changes

### 1. PoseLibrary.ts
Add new functions for character-specific pose storage:

| Function | Purpose |
|----------|---------|
| `getCharacterPoseOverride(poseName, characterId)` | Get override for specific character |
| `saveCharacterPoseOverride(poseName, characterId, bones)` | Save override for specific character |
| `clearCharacterPoseOverride(poseName, characterId)` | Clear specific character's override |
| `getEffectivePoseForCharacter(poseName, characterId)` | Get pose with character fallback chain |

Fallback order:
1. Character-specific override (`neutral:quinn-martinez`)
2. Global pose override (`neutral`)
3. Base pose definition

---

### 2. PoseEditor.tsx
Update the editor to support character selection:

- Add new prop: `characterId?: string` and `characterName?: string`
- Add character selector dropdown showing all available characters
- Update header to show which character is being edited (e.g., "Pose Editor - Quinn")
- Modify save/load/clear logic to use character-specific storage keys
- Show indicator when editing a character-specific vs global pose

UI Changes:
- New "Character" dropdown above "Base Pose" selector
- Options: "All Characters (Global)" + list of individual character names
- Status bar shows: "Editing: Quinn Martinez" or "Editing: All Characters"

---

### 3. HouseScene.tsx
Pass the selected character info to the PoseEditor:

- Track which character is currently selected in the scene
- Pass `characterId` and `characterName` to `<PoseEditor>` component
- Update `handleBoneAdjust` to apply live preview to the selected character only

---

### 4. applyPose.ts
Update pose application to support character-specific overrides:

- Modify `applyStaticPose` to accept optional `characterId` parameter
- Use `getEffectivePoseForCharacter()` to get the right pose data

---

### 5. RPMAvatar.tsx
Pass character ID through the pose application chain:

- Ensure the avatar's character ID is passed when applying poses
- This allows each avatar to automatically use its character-specific pose if one exists

---

## Technical Implementation Details

### Storage Key Format
```typescript
function getCharacterPoseKey(poseName: string, characterId?: string): string {
  return characterId ? `${poseName}:${characterId}` : poseName;
}
```

### Fallback Chain Implementation
```typescript
function getEffectivePoseForCharacter(
  poseType: StaticPoseType,
  characterId?: string
): PoseDefinition {
  const overrides = getPoseOverrides();
  
  // 1. Try character-specific override
  if (characterId) {
    const charKey = `${poseType}:${characterId}`;
    if (overrides[charKey]) {
      return { ...STATIC_POSES[poseType], bones: overrides[charKey] };
    }
  }
  
  // 2. Try global override
  if (overrides[poseType]) {
    return { ...STATIC_POSES[poseType], bones: overrides[poseType] };
  }
  
  // 3. Return base pose
  return STATIC_POSES[poseType];
}
```

---

## User Workflow

1. Open Pose Editor in the 3D House view
2. Select a character from the dropdown (e.g., "Quinn Martinez")
3. Adjust bone rotations using sliders or paste JSON
4. Click **Save** - coordinates are saved specifically for Quinn
5. Repeat for other characters as needed
6. Select "All Characters (Global)" to set a default for characters without custom poses

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/avatar-3d/animation/poses/PoseLibrary.ts` | Add character-specific storage functions |
| `src/components/avatar-3d/admin/PoseEditor.tsx` | Add character selector UI, update save/load logic |
| `src/components/avatar-3d/HouseScene.tsx` | Pass selected character to PoseEditor |
| `src/components/avatar-3d/animation/poses/applyPose.ts` | Support character ID in pose application |
| `src/components/avatar-3d/RPMAvatar.tsx` | Pass character ID through pose chain |

---

## Result
After implementation, you can customize poses for each avatar individually:
- Quinn gets her refined coordinates saved under `neutral:quinn-martinez`
- Other characters can have their own unique poses
- Characters without custom poses fall back to the global override or base pose
