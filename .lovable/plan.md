
# Plan: Remove Chibi Avatars & Fix Broken Presets

## Problem Summary

The avatar system has three broken pieces:
1. **Chibi mode** - User wants it removed entirely
2. **Realistic Presets (GLB)** - All marked as placeholders but no real files exist
3. **Anime Presets (VRM)** - URLs point to non-existent files with no placeholder handling

The current behavior: When users click on preset avatars, the system tries to load files that don't exist, gets HTML error pages instead, and crashes with "Unexpected token '<'" errors.

---

## Solution Overview

### 1. Remove Chibi Mode Completely

Remove the "Chibi" tab from the avatar customizer and eliminate the procedural avatar option:

**Changes to `AvatarCustomizer.tsx`:**
- Remove the "Chibi/procedural" mode button from the 4-mode selector (becomes 3-mode)
- Remove the procedural customization tabs (Body, Skin, Face, Hair, Clothing)
- Remove the `SimsAvatar` import and usage
- Change default mode from `'procedural'` to `'preset'`
- Remove all "Switch to Chibi" buttons

### 2. Fix VRM Preset Data

Add `isPlaceholder` flag to VRM avatars matching the GLB pattern:

**Changes to `preset-vrm-avatars.ts`:**
- Add `isPlaceholder?: boolean` to the `VRMPresetAvatar` interface
- Mark all current entries as `isPlaceholder: true`

### 3. Update VRM Component Error Handling

Make VRMAvatar gracefully handle placeholders like PresetAvatar does:

**Changes to `VRMAvatar.tsx`:**
- Add import for VRM preset data
- Check for placeholder status before loading
- Trigger `onError` immediately for placeholders

### 4. Update Avatar Loader Fallbacks

Change fallback behavior since Chibi is being removed:

**Changes to `AvatarLoader.tsx`:**
- Remove references to "chibi" fallback
- Use empty/loading state instead of procedural avatar when timeouts occur
- Remove `SimsAvatar` imports
- Remove the `forceChibibAvatar` prop
- Show a placeholder UI when no valid avatar is selected

### 5. Update Data Model

Remove procedural as a model source:

**Changes to `avatar-config.ts`:**
- Remove `'procedural'` from `AvatarModelSource` type
- Update default config to not assume procedural

### 6. Fix Preset Selector Display

Show clearer indication that presets need real assets:

**Changes to `PresetAvatarSelector.tsx`:**
- Add visual indicator for placeholder avatars
- Show "Coming Soon" or similar badge on placeholders

---

## File Changes Summary

### Modified Files (7)

| File | Changes |
|------|---------|
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Remove Chibi tab, make Presets default, remove procedural mode UI |
| `src/components/avatar-3d/AvatarLoader.tsx` | Remove chibi fallbacks, update timeout behavior, remove SimsAvatar |
| `src/data/preset-vrm-avatars.ts` | Add `isPlaceholder` flag to interface and all entries |
| `src/components/avatar-3d/VRMAvatar.tsx` | Add placeholder check before loading |
| `src/components/avatar-3d/PresetAvatarSelector.tsx` | Show visual indicator for placeholder avatars |
| `src/models/avatar-config.ts` | Remove 'procedural' from AvatarModelSource |
| `src/components/avatar-3d/index.ts` | Clean up exports if needed |

---

## Technical Details

### New Default Mode

```typescript
// Before: defaults to chibi
const [avatarMode, setAvatarMode] = useState<AvatarMode>('procedural');

// After: defaults to presets
const [avatarMode, setAvatarMode] = useState<AvatarMode>('preset');
```

### Updated Mode Selector (3 modes instead of 4)

```typescript
const modes = [
  { mode: 'preset' as const, icon: Users, label: 'Realistic' },
  { mode: 'vrm' as const, icon: Star, label: 'Anime' },
  { mode: 'rpm' as const, icon: Globe, label: 'Pro' },
];
```

### Placeholder Avatar Card UI

```typescript
{preset.isPlaceholder && (
  <Badge 
    variant="outline" 
    className="absolute top-2 right-2 text-[8px] bg-background/80"
  >
    Coming Soon
  </Badge>
)}
```

### VRM Placeholder Check

```typescript
// In VRMAvatar.tsx
useEffect(() => {
  const preset = getVRMPresetById(presetIdFromUrl);
  if (preset?.isPlaceholder) {
    onError?.(new Error(`VRM "${preset.name}" is a placeholder`));
  }
}, [modelSrc]);
```

---

## Fallback Behavior After Changes

| Scenario | Current Behavior | New Behavior |
|----------|------------------|--------------|
| GLB placeholder selected | Falls back to chibi | Shows placeholder message |
| VRM placeholder selected | Crashes with JSON error | Shows placeholder message |
| RPM timeout | Falls back to chibi | Shows loading state/placeholder |
| No avatar selected | Shows chibi | Shows empty avatar placeholder |

---

## Placeholder State UI

When a placeholder avatar is selected or when there's no valid avatar:

```typescript
const PlaceholderAvatarState = () => (
  <div className="flex flex-col items-center justify-center h-full bg-muted/30 rounded-lg">
    <User className="w-12 h-12 text-muted-foreground mb-2" />
    <p className="text-sm text-muted-foreground">No avatar selected</p>
    <p className="text-xs text-muted-foreground/60">Choose from available presets</p>
  </div>
);
```

---

## Notes

- The SimsAvatar component files can be kept for now but won't be used in the customizer
- Existing houseguests with `modelSource: 'procedural'` will show placeholder state
- Real avatar files (GLB/VRM) need to be added to `/public/avatars/` to make presets functional
- RPM (Ready Player Me) avatars will still work as they load from external API
