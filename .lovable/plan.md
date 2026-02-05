

# Update Default Houseguests to Match Game Mode Characters

## Problem
The `defaultHouseguests.ts` file contains outdated character data with placeholder images (`/placeholder.svg`), shorter bios, and is missing Maya Hassan (the 12th character). The richer "game mode" versions in `character-templates.ts` have proper avatar images, detailed bios, and 3D avatar configurations.

## What Changes

### 1. Update `src/components/game-setup/defaultHouseguests.ts`
- Replace all 11 character entries with data from `character-templates.ts` (matching names, ages, occupations, hometowns, bios, traits)
- Import and use the actual avatar images instead of `/placeholder.svg`
- Add the missing 12th character: **Maya Hassan**
- Keep the `personalityTraits` export unchanged (it is used by `GameSetup.tsx`)

### Characters Updated
| Character | Key Changes |
|-----------|-------------|
| Alex Chen | Image: actual avatar, Bio: enriched |
| Morgan Lee | Image: actual avatar, Bio: enriched |
| Jordan Taylor | Image: actual avatar, Bio: enriched |
| Casey Wilson | Image: actual avatar, Bio: enriched |
| Riley Johnson | Image: actual avatar, Bio: enriched |
| Jamie Roberts | Image: actual avatar, Bio: enriched |
| Quinn Martinez | Image: actual avatar, Bio: enriched |
| Avery Thompson | Image: actual avatar, Bio: enriched |
| Taylor Kim | Image: actual avatar, Bio: enriched |
| Sam Williams | Image: actual avatar, Bio: enriched |
| Blake Peterson | Image: actual avatar, Bio: enriched |
| **Maya Hassan** | **NEW** - Added as 12th character |

### Note on Poses
The base poses are already handled by the pose resolution system (`femalePoseDefaults.ts`, `malePoseDefaults.ts`, `characterPoseDefaults.ts`). No pose data needs to be duplicated into `defaultHouseguests.ts` -- the existing resolution chain automatically applies the correct gender/character-specific poses when avatars are rendered.

## Files Modified
| File | Action |
|------|--------|
| `src/components/game-setup/defaultHouseguests.ts` | Update all entries + add Maya Hassan |

