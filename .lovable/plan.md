
# Plan: Add Real RPM Avatar URLs for NPC Characters

## Overview

Add the user-provided Ready Player Me avatar URLs to the 12 NPC character templates. The 2D profile photos remain as the default display, with players able to capture a new profile photo after customizing their avatar.

## Provided Avatar URLs

| Character | RPM URL |
|-----------|---------|
| Quinn Martinez | `https://models.readyplayer.me/6983cd3afcad0d2f33f8c9d2.glb` |
| Jamie Roberts | `https://models.readyplayer.me/6983cd7eea77ff02ffa7b78e.glb` |
| Jordan Taylor | `https://models.readyplayer.me/6983cdc66eb4878bb838a8e1.glb` |
| Avery Thompson | `https://models.readyplayer.me/6983ce4dea77ff02ffa7bef0.glb` |
| Alex Chen | `https://models.readyplayer.me/6983cec8fcad0d2f33f8d828.glb` |
| Blake Peterson | `https://models.readyplayer.me/6983cf1b0b547ce9ae23d348.glb` |
| Casey Wilson | `https://models.readyplayer.me/6983d039ea77ff02ffa7d0d5.glb` |
| Riley Johnson | `https://models.readyplayer.me/6983d0c547a75ab0c803f7c0.glb` |
| Maya Hassan | `https://models.readyplayer.me/6983d12446ee350e50efa604.glb` |
| Taylor Kim | `https://models.readyplayer.me/6983d21c47a75ab0c804039e.glb` |
| Sam Williams | `https://models.readyplayer.me/6983d2e246ee350e50efb69f.glb` |
| Morgan Lee | *(not provided - will remain undefined)* |

## File Changes

### `src/data/character-templates.ts`

Update the `NPC_RPM_AVATARS` mapping with the provided URLs:

```typescript
const NPC_RPM_AVATARS: Record<string, string | undefined> = {
  'alex-chen': 'https://models.readyplayer.me/6983cec8fcad0d2f33f8d828.glb',
  'morgan-lee': undefined, // Not provided yet
  'jordan-taylor': 'https://models.readyplayer.me/6983cdc66eb4878bb838a8e1.glb',
  'casey-wilson': 'https://models.readyplayer.me/6983d039ea77ff02ffa7d0d5.glb',
  'riley-johnson': 'https://models.readyplayer.me/6983d0c547a75ab0c803f7c0.glb',
  'jamie-roberts': 'https://models.readyplayer.me/6983cd7eea77ff02ffa7b78e.glb',
  'quinn-martinez': 'https://models.readyplayer.me/6983cd3afcad0d2f33f8c9d2.glb',
  'avery-thompson': 'https://models.readyplayer.me/6983ce4dea77ff02ffa7bef0.glb',
  'taylor-kim': 'https://models.readyplayer.me/6983d21c47a75ab0c804039e.glb',
  'sam-williams': 'https://models.readyplayer.me/6983d2e246ee350e50efb69f.glb',
  'blake-peterson': 'https://models.readyplayer.me/6983cf1b0b547ce9ae23d348.glb',
  'maya-hassan': 'https://models.readyplayer.me/6983d12446ee350e50efa604.glb',
};
```

## Behavior Summary

1. **Character Selection Grid**: Shows 3D avatars for all templates (except Morgan Lee)
2. **Character Detail Panel**: Displays interactive 3D preview when selected
3. **"Play As" Option**: Uses the template's 3D avatar with the 2D image as the profile photo
4. **"Customize" Option**: Pre-loads the template's 3D avatar in the customizer, player can modify and capture a new profile photo

## Note

Morgan Lee is missing from the provided list. The system will continue using the 2D fallback image for this character until an RPM URL is provided.
