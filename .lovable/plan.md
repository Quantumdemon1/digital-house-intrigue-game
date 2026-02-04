
# Plan: Simplify to RPM-Only Avatar System

## Overview

Remove the Realistic (preset-glb), Anime (VRM), and any legacy mode toggle options, leaving only the Ready Player Me (RPM) "Pro" avatar system as the single, streamlined avatar customization option.

## Current State

The `AvatarCustomizer` currently has:
- **3 modes**: `preset | vrm | rpm`
- **Mode toggle UI**: Realistic / Anime / Pro buttons
- **Multiple data files**: `preset-glb-avatars.ts`, `preset-vrm-avatars.ts`, `preset-rpm-avatars.ts`
- **Multiple renderers**: `PresetAvatar.tsx`, `VRMAvatar.tsx`, `RPMAvatar.tsx`
- **Complex routing** in `AvatarLoader.tsx` switching between sources

## Changes to Implement

### 1. Simplify AvatarCustomizer.tsx

**Remove:**
- Mode toggle UI (Realistic/Anime/Pro buttons)
- `avatarMode` state and type definition
- `handlePresetSelected` and `handleVRMSelected` handlers
- Conditional rendering for preset/VRM panels
- `PresetAvatarSelector` import
- References to `Users`, `Star` icons for removed modes

**Keep/Enhance:**
- `RPMAvatarCreatorPanel` as the main content
- `RPMAvatarCreator` dialog for full-screen editing
- 3D preview with RPM avatar
- Profile photo capture functionality
- Rotation controls

**Result UI:**
```text
+---------------------------+-----------------------------------+
|       3D Preview          |   RPM Creator Panel               |
|      +---------+          |   [My Avatars | Create New]       |
|      |   RPM   |          |                                   |
|      |  Avatar |          |   Gallery of saved avatars        |
|      +---------+          |     OR                            |
|   [< Reset >]             |   Embedded RPM creator iframe     |
|   [Open Full Editor]      |                                   |
|   [Take Profile Photo]    +-----------------------------------+
|                           |   [Continue] button               |
+---------------------------+-----------------------------------+
```

### 2. Simplify AvatarLoader.tsx

**Remove:**
- `LazyVRMAvatar` import and lazy loader
- `LazyPresetAvatar` import and lazy loader
- `VRMAvatarCanvas` component
- `PresetAvatarCanvas` component
- Switch cases for `'vrm'` and `'preset-glb'`

**Keep:**
- `RPMAvatarCanvas` as the primary renderer
- Loading states and timeout logic
- Fallback to placeholder/thumbnail

### 3. Update avatar-config.ts

**Simplify `AvatarModelSource` type:**
```typescript
// Before
export type AvatarModelSource = 'preset-glb' | 'vrm' | 'ready-player-me' | 'custom-glb';

// After (keep custom-glb for backward compat with user-uploaded models)
export type AvatarModelSource = 'ready-player-me' | 'custom-glb';
```

**Update `generateDefaultConfig`:**
Set default `modelSource` to `'ready-player-me'` if needed.

### 4. Remove Unused Components/Files

**Files to delete (or deprecate):**
- `src/components/avatar-3d/VRMAvatar.tsx` - No longer needed
- `src/components/avatar-3d/PresetAvatar.tsx` - No longer needed
- `src/components/avatar-3d/PresetAvatarSelector.tsx` - No longer needed
- `src/data/preset-glb-avatars.ts` - No longer needed
- `src/data/preset-vrm-avatars.ts` - No longer needed
- `public/avatars/glb/*.glb` - Can delete the preset GLB files
- `public/avatars/vrm/*.vrm` - Can delete the VRM files

**Keep:**
- `src/data/preset-rpm-avatars.ts` - For NPC/demo RPM avatars
- All RPM-related components

### 5. Update index.ts Exports

Remove exports for:
- `VRMAvatar`, `preloadVRM`
- `PresetAvatar`, `preloadPresetAvatars`, `preloadAllPresets`, `getPresetById`, `getPresetUrl`
- `PresetAvatarSelector`, `PresetSource`

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/avatar-3d/AvatarCustomizer.tsx` | **Modify** | Remove mode toggle, preset/VRM handlers, show only RPM panel |
| `src/components/avatar-3d/AvatarLoader.tsx` | **Modify** | Remove VRM/Preset canvas components and switch cases |
| `src/models/avatar-config.ts` | **Modify** | Simplify `AvatarModelSource` type, remove preset-glb/vrm |
| `src/components/avatar-3d/index.ts` | **Modify** | Remove VRM/Preset exports |
| `src/components/avatar-3d/VRMAvatar.tsx` | **Delete** | No longer used |
| `src/components/avatar-3d/PresetAvatar.tsx` | **Delete** | No longer used |
| `src/components/avatar-3d/PresetAvatarSelector.tsx` | **Delete** | No longer used |
| `src/data/preset-glb-avatars.ts` | **Delete** | No longer used |
| `src/data/preset-vrm-avatars.ts` | **Delete** | No longer used |

---

## Benefits

1. **Simpler UX** - One clear path to avatar creation
2. **Better avatars** - RPM provides higher quality, fully customizable avatars
3. **Less code** - Removing ~1000+ lines of unused component code
4. **Smaller bundle** - No need to lazy-load VRM/Preset renderers
5. **Consistent experience** - All users get the same pro-quality avatars

---

## Technical Details

### Updated AvatarCustomizer Structure

```tsx
export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  initialConfig,
  onChange,
  onComplete,
  showCompleteButton = true,
  rpmSubdomain = 'demo',
  className
}) => {
  const [config, setConfig] = useState<Avatar3DConfig>(initialConfig || generateDefaultConfig());
  const [rotation, setRotation] = useState(0);
  const [showRPMCreator, setShowRPMCreator] = useState(false);
  
  // ... updateConfig, handleRPMAvatarCreated, handleProfilePhotoCaptured
  
  return (
    <div className={cn('sims-cas-background ...', className)}>
      {/* RPM Full Editor Dialog */}
      <RPMAvatarCreator ... />
      
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left: 3D Preview */}
        <div>
          <AvatarLoader avatarConfig={config} ... />
          {/* Rotation controls */}
          {/* Open Full Editor button */}
          {/* Profile Photo Capture */}
        </div>
        
        {/* Right: RPM Panel Only */}
        <div className="sims-panel">
          <h3>Create Your Avatar</h3>
          <RPMAvatarCreatorPanel
            onAvatarSelected={handleRPMAvatarCreated}
            subdomain={rpmSubdomain}
          />
        </div>
        
        {/* Continue Button */}
      </div>
    </div>
  );
};
```

### Updated AvatarLoader Routing

```tsx
// Simplified routing - only RPM/custom-glb supported
const modelUrl = avatarUrl || avatarConfig?.modelUrl;

if (modelSource === 'ready-player-me' || modelSource === 'custom-glb') {
  if (modelUrl) {
    return <RPMAvatarCanvas ... />;
  }
}

// Fallback to placeholder
return <PlaceholderAvatarState ... />;
```

---

## Implementation Order

1. Update `AvatarCustomizer.tsx` - Remove mode toggle and unused handlers
2. Update `AvatarLoader.tsx` - Remove VRM/Preset routing
3. Update `avatar-config.ts` - Simplify model source types
4. Update `index.ts` - Remove unused exports
5. Delete unused files - VRMAvatar, PresetAvatar, PresetAvatarSelector, data files
6. Test the streamlined RPM flow
