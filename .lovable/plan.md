
# Plan: Fix Custom Avatar Profile Photo Display

## Problem Summary

The custom avatar profile photo is being captured and stored correctly, but the display components are looking at the wrong property. The data flow shows:

1. **Capture**: Profile photo is captured in `AvatarCustomizer` and stored in `avatarConfig.profilePhotoUrl`
2. **Storage**: `createHouseguest()` correctly sets `avatarUrl = avatarConfig?.profilePhotoUrl || imageUrl`
3. **Display Bug**: `HouseguestList.tsx` checks `guest.imageUrl` instead of `guest.avatarUrl`

The player's `imageUrl` is set to the raw RPM model URL or `/placeholder.svg`, not the captured profile photo.

## Solution

Update display components to use the correct property priority:

```text
Priority Order:
1. avatarConfig?.profilePhotoUrl  (captured headshot - best)
2. avatarUrl                       (fallback, should also have the photo)
3. imageUrl                        (raw model URL - last resort)
```

## File Changes

### 1. `src/components/game-setup/HouseguestList.tsx`

Update the avatar display logic to check for profile photo in the correct order:

**Current (lines 77-89):**
```typescript
{guest.imageUrl && guest.imageUrl !== '/placeholder.svg' ? (
  <img
    src={guest.imageUrl}
    alt={guest.name}
    className="w-full h-full object-cover"
  />
) : (
  // Fallback initials
)}
```

**Fixed:**
```typescript
// Get the best available avatar image
const avatarImage = guest.avatarConfig?.profilePhotoUrl 
  || guest.avatarUrl 
  || guest.imageUrl;

{avatarImage && avatarImage !== '/placeholder.svg' ? (
  <img
    src={avatarImage}
    alt={guest.name}
    className="w-full h-full object-cover"
  />
) : (
  // Fallback initials
)}
```

## Why This Fixes It

| Property | Player Value | NPC Value |
|----------|-------------|-----------|
| `imageUrl` | `/placeholder.svg` or RPM URL | Real headshot URL |
| `avatarUrl` | Captured profile photo (if taken) | Same as imageUrl |
| `avatarConfig.profilePhotoUrl` | Captured base64 headshot | undefined |

By checking `avatarConfig?.profilePhotoUrl` first, we get the manually captured headshot for the player. For NPCs (who don't have a captured photo), it falls back to their pre-set `imageUrl`.

## Technical Details

- The change is minimal - just updating the image source selection logic
- No changes needed to the data model or capture flow
- Works for both player (captured photo) and NPCs (preset images)
- Base64 data URLs work directly in `<img>` tags
