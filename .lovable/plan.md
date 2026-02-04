

# Plan: Replace Chibi Placeholder Avatars with RPM Avatars

## Problem

The UI is showing old chibi placeholder avatars (seen in your screenshots) because multiple components are still using `SimsAvatar` (the legacy chibi renderer) instead of `AvatarLoader` (the RPM renderer).

While the character templates already have RPM avatar URLs configured correctly, the actual rendering components ignore them and render chibi avatars instead.

## Components to Update

| Component | Current | Fix |
|-----------|---------|-----|
| `CharacterFrame.tsx` | Uses `SimsAvatar` for NPC cards | Replace with `AvatarLoader` |
| `AvatarPreview.tsx` | Uses `SimsAvatar` for player preview | Replace with `AvatarLoader` |
| `status-avatar.tsx` | Uses `SimsAvatar` for game UI | Replace with `AvatarLoader` |

## Solution Overview

### 1. Update CharacterFrame.tsx

Replace the `SimsAvatar` component with `AvatarLoader` which properly handles RPM models:

```typescript
// Before
import { SimsAvatar } from '@/components/avatar-3d';

{has3DConfig ? (
  <SimsAvatar
    config={template.avatar3DConfig}
    size={config.avatarSize}
    animated={false}
  />
) : (
  <img ... />
)}

// After
import { AvatarLoader } from '@/components/avatar-3d';

{has3DConfig ? (
  <AvatarLoader
    avatarConfig={template.avatar3DConfig}
    size={sizeMap[size]} // Map to AvatarLoader size
    animated={false}
  />
) : (
  <img ... />
)}
```

### 2. Update AvatarPreview.tsx

Same pattern - replace `SimsAvatar` with `AvatarLoader`:

```typescript
// Before
<SimsAvatar 
  config={avatarConfig || localConfig}
  size="xl"
  isPlayer={true}
  animated={true}
/>

// After
<AvatarLoader
  avatarConfig={avatarConfig || localConfig}
  size="xl"
  isPlayer={true}
  animated={true}
/>
```

### 3. Update status-avatar.tsx

Replace the lazy-loaded `SimsAvatar` with `AvatarLoader`:

```typescript
// Before
const SimsAvatar = React.lazy(() => import('@/components/avatar-3d/SimsAvatar'));

<SimsAvatar
  config={config}
  size={size3DMap[size]}
  ...
/>

// After
import { AvatarLoader } from '@/components/avatar-3d';

<AvatarLoader
  avatarConfig={config}
  size={size}
  ...
/>
```

### 4. Delete or Deprecate SimsAvatar

After updating all references, either:
- Delete `SimsAvatar.tsx` and its dependencies (`AvatarBody.tsx`, `AvatarHead.tsx`, `AvatarHair.tsx`, `AvatarClothing.tsx`)
- Or mark them as deprecated and remove exports from `index.ts`

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/components/game-setup/CharacterFrame.tsx` | **Modify** | Replace SimsAvatar → AvatarLoader |
| `src/components/game-setup/AvatarPreview.tsx` | **Modify** | Replace SimsAvatar → AvatarLoader |
| `src/components/ui/status-avatar.tsx` | **Modify** | Replace SimsAvatar → AvatarLoader |
| `src/components/avatar-3d/index.ts` | **Modify** | Remove SimsAvatar export |
| `src/components/avatar-3d/SimsAvatar.tsx` | **Delete** | No longer needed |
| `src/components/avatar-3d/AvatarBody.tsx` | **Delete** | Only used by SimsAvatar |
| `src/components/avatar-3d/AvatarHead.tsx` | **Delete** | Only used by SimsAvatar |
| `src/components/avatar-3d/AvatarHair.tsx` | **Delete** | Only used by SimsAvatar |
| `src/components/avatar-3d/AvatarClothing.tsx` | **Delete** | Only used by SimsAvatar |
| `src/components/avatar-3d/materials/ToonMaterials.tsx` | **Delete** | Only used by chibi components |

## Size Mapping

`AvatarLoader` uses different size names than `SimsAvatar`:

| SimsAvatar | AvatarLoader |
|------------|--------------|
| 'md' | 'md' |
| 'lg' | 'lg' |
| 'xl' | 'xl' |

The sizes are compatible so minimal mapping needed.

## Expected Result

After this change:
1. **NPC character cards** will show real 3D RPM avatars from the preset list
2. **Player avatar preview** will show the RPM avatar created/selected by the user
3. **Game UI status avatars** will use RPM models instead of chibi placeholders
4. **Smaller bundle** - removing ~500+ lines of unused chibi rendering code

## Technical Details

### AvatarLoader Size Configuration

The existing `AvatarLoader` already has proper size configs:

```typescript
const SIZE_CONFIG: Record<AvatarSize, {...}> = {
  sm: { width: 'w-12', height: 'h-12', scale: 0.8, context: 'thumbnail' },
  md: { width: 'w-20', height: 'h-20', scale: 1, context: 'game' },
  lg: { width: 'w-32', height: 'h-32', scale: 1.2, context: 'game' },
  xl: { width: 'w-48', height: 'h-48', scale: 1.5, context: 'profile' },
  full: { width: 'w-full', height: 'h-full', scale: 1, context: 'customizer' },
};
```

### CharacterFrame Size Map

Will need to map the existing size config to AvatarLoader sizes:

```typescript
const sizeToAvatarLoader: Record<'sm' | 'md' | 'lg', AvatarSize> = {
  sm: 'sm',
  md: 'md', 
  lg: 'lg'
};
```

