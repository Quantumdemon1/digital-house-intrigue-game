

# Add Male Template Pose Defaults

## Overview
Create a male equivalent of `femalePoseDefaults.ts` that applies the provided pose coordinates to all male character templates (Sam, Blake, Jordan, Avery, Alex, Riley). Then update the pose resolution chain to check for male template defaults.

## Changes

### 1. Create `malePoseDefaults.ts`
New file at `src/components/avatar-3d/animation/poses/malePoseDefaults.ts` following the same pattern as `femalePoseDefaults.ts`:
- Define `MALE_CHARACTER_NAMES` array: `['sam', 'blake', 'jordan', 'avery', 'alex', 'riley']`
- Add `isMaleCharacter()` helper function
- Define `MALE_POSE_BONES` with all 6 pose types (neutral, relaxed, confident, defensive, open, wave) using the provided coordinates

### 2. Update `PoseLibrary.ts`
Add a new step in the resolution chain between character-specific defaults and the base pose:
- Import `isMaleCharacter` and `MALE_POSE_BONES`
- Add step 5: check male template defaults (mirrors the existing female template check)

Updated resolution chain:
1. Character-specific localStorage override
2. Global localStorage override
3. Character-specific code defaults (characterPoseDefaults.ts)
4. Female template defaults
5. **Male template defaults** (new)
6. Base static pose definition

### 3. Update `poses/index.ts`
Export the new male pose helpers: `isMaleCharacter`, `MALE_POSE_BONES`, `MALE_CHARACTER_NAMES`

## Technical Details

| File | Action |
|------|--------|
| `src/components/avatar-3d/animation/poses/malePoseDefaults.ts` | Create (new file) |
| `src/components/avatar-3d/animation/poses/PoseLibrary.ts` | Add male template check in `getEffectivePose` |
| `src/components/avatar-3d/animation/poses/index.ts` | Export new male pose symbols |

