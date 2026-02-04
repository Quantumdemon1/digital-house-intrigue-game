
# Plan: Add RPM Avatar Templates for NPC Characters

## Overview

This plan adds Ready Player Me (RPM) 3D avatars for all 12 NPC character templates, allowing players to select these avatars as starting points and optionally customize them further using the RPM editor.

## Current Flow

```text
[Cast Selection] → [Select Template] → [Play As / Customize]
                                                ↓
                              [Customize] → [Player Form + RPM Creator]
```

Currently, NPCs have 2D profile photos but no 3D RPM avatars. When players customize a template, they must create an avatar from scratch.

## New Flow

```text
[Cast Selection] → [Select Template with RPM Avatar Preview]
                              ↓
            ┌─────────────────┴─────────────────┐
            ↓                                   ↓
    [Play As]                           [Customize]
    (Uses template's                    (Uses template's RPM
     RPM avatar as-is)                   avatar as starting point)
                                               ↓
                                    [Can edit in RPM Creator or
                                     use as-is and take photo]
```

---

## Implementation Steps

### Phase 1: Add RPM Avatar URLs to Character Templates

**File: `src/data/character-templates.ts`**

Update the `createNPCAvatarConfig` helper and each character template to include real RPM avatar URLs that visually match their 2D portraits:

```typescript
const createNPCAvatarConfig = (imageUrl: string, rpmUrl?: string): Avatar3DConfig => {
  return {
    modelSource: rpmUrl ? 'ready-player-me' : 'none',
    modelUrl: rpmUrl,
    thumbnailUrl: imageUrl,
    profilePhotoUrl: imageUrl,  // Use 2D image as default profile photo
    // ... other defaults
  };
};
```

Each character will get an RPM URL. Since RPM avatars are created via their web editor and have permanent URLs, we'll reference publicly available RPM avatar URLs or create a curated set. For now, we'll use RPM "demo" avatars that approximate each character's appearance.

**Example template update:**
```typescript
{
  id: 'alex-chen',
  name: 'Alex Chen',
  // ...
  avatar3DConfig: createNPCAvatarConfig(
    alexChenAvatar,
    'https://models.readyplayer.me/64f8c8b9c4e3a70001234567.glb' // RPM URL
  )
}
```

### Phase 2: Update CharacterFrame to Show 3D Avatars

**File: `src/components/game-setup/CharacterFrame.tsx`**

The component already conditionally renders `AvatarLoader` when `avatar3DConfig` exists. Once templates have `modelUrl` set, the 3D avatars will automatically display in the selection grid.

No changes needed - just ensure templates have valid RPM URLs.

### Phase 3: Update CharacterDetailPanel for 3D Preview

**File: `src/components/game-setup/CharacterDetailPanel.tsx`**

Replace the static `<img>` with a conditional 3D preview when the template has a 3D config:

```typescript
{template.avatar3DConfig?.modelUrl ? (
  <AvatarLoader
    avatarUrl={template.avatar3DConfig.modelUrl}
    avatarConfig={template.avatar3DConfig}
    size="xl"
    animated={true}
  />
) : (
  <img src={template.imageUrl} alt={template.name} ... />
)}
```

### Phase 4: Pre-populate AvatarCustomizer with Template Avatar

**File: `src/components/game-setup/PlayerForm.tsx`** and **`src/components/avatar-3d/AvatarCustomizer.tsx`**

When a player chooses to "Customize" a template that already has an RPM avatar:

1. Pass the template's `avatar3DConfig` (including `modelUrl`) to the customizer
2. The customizer should display this avatar immediately
3. The player can either:
   - Keep the avatar as-is and take a profile photo
   - Open the RPM editor to modify it

**PlayerForm update:**
```typescript
<AvatarPreview 
  formData={formData} 
  avatarUrl={selectedTemplate?.avatar3DConfig?.modelUrl || avatarUrl}
  initialAvatarConfig={selectedTemplate?.avatar3DConfig}
  // ...
/>
```

### Phase 5: Handle "Play As Template" with RPM Avatar

**File: `src/components/GameSetup.tsx`**

Update `handlePlayerCreationWithTemplate` to pass the template's full `avatar3DConfig`:

```typescript
const playerGuest = createHouseguest(
  uuidv4(),
  template.name,
  // ...
  template.imageUrl,
  template.traits,
  {},
  true,
  template.avatar3DConfig  // Include the RPM avatar config
);
```

---

## Technical Details

### RPM Avatar URLs

Each NPC needs a curated RPM avatar URL. These are permanent URLs in the format:
```
https://models.readyplayer.me/{avatar-id}.glb
```

We'll create/source 12 diverse RPM avatars matching the character descriptions:

| Character | Appearance Notes |
|-----------|-----------------|
| Alex Chen | Asian male, 28, professional look, slim build |
| Morgan Lee | Female, 26, athletic, darker skin |
| Jordan Taylor | Male, 31, charming smile, average build |
| Casey Wilson | Female, 24, fun/party style, blonde |
| Riley Johnson | Male, 29, glasses, nerdy look |
| Jamie Roberts | Female, 27, nurturing appearance |
| Quinn Martinez | Female, 25, influencer style, stylish |
| Avery Thompson | Male, 32, strong/protective, dark skin |
| Taylor Kim | Male, 27, athletic, Asian features |
| Sam Williams | Female, 34, leadership presence, curly hair |
| Blake Peterson | Male, 26, quiet/mysterious look |
| Maya Hassan | Female, 30, sophisticated, professional |

### Fallback Strategy

If an RPM model fails to load:
1. The `AvatarLoader` component already has an 8-second timeout
2. Falls back to 2D `PlaceholderAvatarState`
3. The 2D image (`profilePhotoUrl`) is always available

### Profile Photo Capture

When a template has an existing `profilePhotoUrl` (the 2D image), players can:
1. Use it as-is (no capture needed)
2. Take a new photo from the 3D model if they prefer

---

## Files to Modify

1. **`src/data/character-templates.ts`** - Add RPM URLs to all 12 templates
2. **`src/components/game-setup/CharacterDetailPanel.tsx`** - Show 3D preview
3. **`src/components/game-setup/PlayerForm.tsx`** - Pass initial avatar config
4. **`src/components/avatar-3d/AvatarCustomizer.tsx`** - Accept and display preset avatar
5. **`src/components/GameSetup.tsx`** - Pass avatar config when playing as template

## Notes for RPM Avatar Creation

To create matching RPM avatars:
1. Go to readyplayer.me/avatar
2. Create avatars matching each character's description
3. Export the GLB URLs
4. Update the templates with these URLs

The implementation can proceed with placeholder RPM URLs initially (using demo avatars), then replace with curated matches later.
