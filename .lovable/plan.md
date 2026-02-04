
# Plan: Deep Integration of Ready Player Me Avatar Customization

## Current State Analysis

### Existing RPM Components
1. **`RPMAvatarCreator.tsx`** - Dialog wrapper using deprecated `@readyplayerme/rpm-react-sdk`
2. **`RPMAvatar.tsx`** - 3D renderer with facial expressions (ARKit blendshapes)
3. **`AvatarCustomizer.tsx`** - Main UI with 3-mode toggle (Preset/VRM/RPM)
4. **`preset-rpm-avatars.ts`** - Placeholder NPC avatar data (not populated with real URLs)

### Current Issues
1. **Deprecated SDK** - Using `@readyplayerme/rpm-react-sdk` which has been deprecated in favor of `@readyplayerme/react-avatar-creator`
2. **Limited Integration** - RPM is only accessible via a button that opens an external dialog
3. **No Inline Customization** - Users must click "Pro" then navigate to external iframe
4. **Placeholder Data** - `preset-rpm-avatars.ts` has fake URLs that don't load
5. **No Saved Avatars** - Users can't save/manage multiple RPM avatars
6. **Missing Features** - No access to RPM's photo booth, outfit changes, or animation options

---

## Proposed Solution

### Phase 1: Upgrade to New RPM Package

**Install new package:**
```bash
npm install @readyplayerme/react-avatar-creator
```

**Update `RPMAvatarCreator.tsx` to use new package:**
- Replace `@readyplayerme/rpm-react-sdk` import with `@readyplayerme/react-avatar-creator`
- Use new event-based API (`AvatarExportedEvent`)
- Maintain backward compatibility with existing `onAvatarCreated` callback

### Phase 2: Enhanced Inline RPM Experience

**Create `RPMAvatarCreatorPanel.tsx`** - Embedded creator (not just dialog)

Features:
- Full-width embedded RPM iframe in customizer panel
- Avatar gallery below showing previously created RPM avatars
- Quick-switch between creation and selection
- Live preview updating as user customizes

**New UI Flow:**
```text
┌─────────────────────────────────────────────────────────────┐
│  [Realistic]  [Anime]  [Pro Custom]                        │
└─────────────────────────────────────────────────────────────┘

When "Pro Custom" is selected:
┌──────────────┐  ┌──────────────────────────────────────────┐
│   Preview    │  │   RPM Avatar Creator (Embedded)          │
│   ┌──────┐   │  │                                          │
│   │ 3D   │   │  │   [Full RPM iframe with all options]     │
│   │Avatar│   │  │                                          │
│   └──────┘   │  │   - Body type selection                  │
│              │  │   - Face customization                   │
│ [📷 Photo]   │  │   - Outfit selection                     │
│              │  │   - Accessories                          │
├──────────────┤  ├──────────────────────────────────────────┤
│Your Avatars  │  │ [Create New] or select from gallery:    │
│ ┌──┐ ┌──┐    │  │  ○ Avatar 1  ○ Avatar 2  ○ Avatar 3     │
│ │A1│ │A2│    │  │                                          │
│ └──┘ └──┘    │  └──────────────────────────────────────────┘
└──────────────┘
```

### Phase 3: RPM Avatar Gallery & Management

**Create `RPMAvatarGallery.tsx`** component:

- Display previously created RPM avatars as selectable cards
- Store avatar URLs in localStorage or Supabase (if authenticated)
- Allow deletion of saved avatars
- Show loading thumbnails generated from the RPM API

**Avatar storage structure:**
```typescript
interface SavedRPMAvatar {
  id: string;
  url: string;          // The RPM GLB URL
  thumbnail?: string;   // Captured screenshot or RPM render URL
  createdAt: Date;
  name?: string;        // User-given nickname
}
```

### Phase 4: RPM Configuration Options

**Enhance editor config with game-appropriate defaults:**

```typescript
const gameEditorConfig: AvatarCreatorConfig = {
  clearCache: false,          // Keep user's previous work
  bodyType: 'fullbody',       // Full body for game rendering
  quickStart: false,          // Show full customization
  language: 'en',
  
  // Custom for Big Brother game theme:
  // - Hide certain outfit categories if desired
  // - Pre-select casual clothing styles
};
```

**Add RPM URL optimization panel:**
- Quality slider (Low/Medium/High)
- Show estimated file size
- Preview loading time

### Phase 5: Pre-populated RPM Gallery

**Populate `preset-rpm-avatars.ts` with real avatars:**

Create 10-15 diverse pre-made RPM avatars by:
1. Using RPM's public demo to create characters
2. Extracting the avatar URLs
3. Adding them to the preset gallery

These serve as:
- Quick-start options for users who don't want to customize
- NPC avatars for AI houseguests
- Examples of what's possible

---

## Technical Implementation

### File Changes

| File | Changes |
|------|---------|
| **NEW** `src/components/avatar-3d/RPMAvatarCreatorPanel.tsx` | Embedded inline RPM creator with gallery |
| **NEW** `src/components/avatar-3d/RPMAvatarGallery.tsx` | Saved avatar management |
| **NEW** `src/hooks/useRPMAvatarStorage.ts` | LocalStorage/Supabase persistence hook |
| `src/components/avatar-3d/RPMAvatarCreator.tsx` | Upgrade to new SDK package |
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Replace RPM mode with inline panel |
| `src/data/preset-rpm-avatars.ts` | Populate with real avatar URLs |
| `src/models/avatar-config.ts` | Add `savedRPMAvatars` array field |
| `package.json` | Add `@readyplayerme/react-avatar-creator` |

### New Hook: `useRPMAvatarStorage`

```typescript
interface UseRPMAvatarStorage {
  avatars: SavedRPMAvatar[];
  addAvatar: (url: string, thumbnail?: string) => SavedRPMAvatar;
  removeAvatar: (id: string) => void;
  updateAvatar: (id: string, updates: Partial<SavedRPMAvatar>) => void;
  isLoading: boolean;
}
```

### Updated AvatarCustomizer Flow

```typescript
// In AvatarCustomizer.tsx
{avatarMode === 'rpm' && (
  <RPMAvatarCreatorPanel
    onAvatarSelected={(avatar: SavedRPMAvatar) => {
      updateConfig({
        modelSource: 'ready-player-me',
        modelUrl: avatar.url,
        thumbnailUrl: avatar.thumbnail
      });
    }}
    onAvatarCreated={(url: string) => {
      // Auto-capture thumbnail and save to gallery
      handleProfilePhotoCaptured(thumbnail);
      handleRPMAvatarCreated(url);
    }}
    savedAvatars={savedRPMAvatars}
    subdomain={rpmSubdomain}
  />
)}
```

---

## Implementation Order

1. **Package upgrade** - Install new RPM SDK, update imports
2. **RPM Gallery component** - Display/manage saved avatars
3. **Storage hook** - Persist avatars to localStorage
4. **Inline panel** - Embed RPM creator in customizer
5. **Real preset data** - Populate preset-rpm-avatars.ts
6. **Polish** - Add transitions, loading states, error handling

---

## Notes

- The new `@readyplayerme/react-avatar-creator` package uses event-based callbacks
- RPM avatars include 52 ARKit blendshapes for facial expressions (already supported in `RPMAvatar.tsx`)
- Subdomain "demo" works for development; production apps should register at studio.readyplayer.me
- File sizes can be reduced 60-80% using the existing `rpm-avatar-optimizer.ts` utilities
