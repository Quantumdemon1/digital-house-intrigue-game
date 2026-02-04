

# Plan: 3D Avatar Customization Screen & System-Wide 3D Avatars

## Overview

This plan updates the player creation flow to feature a full "Sims-style" 3D avatar customizer and enables 3D avatars throughout the game UI.

---

## Part 1: Create Sims-Style Avatar Customizer Component

### New Component: `AvatarCustomizer.tsx`

A dedicated full-screen customization interface inspired by The Sims' character creation:

**Layout Structure:**
- **Left Side**: Large 3D avatar preview (rotating, interactive)
- **Right Side**: Categorized customization panels

**Customization Categories (Tabbed):**

| Tab | Options |
|-----|---------|
| **Body** | Body Type (4 options), Height (3 options) |
| **Skin** | Skin Tone picker (12 diverse colors) |
| **Face** | Head Shape (4), Eye Shape (4), Eye Color (6+), Nose Type (4), Mouth Type (4) |
| **Hair** | Hair Style (8 styles), Hair Color (natural + fantasy colors) |
| **Clothing** | Top Style (5), Top Color, Bottom Style (4), Bottom Color |

**UI Components:**
- Visual icon-based selectors (not just dropdowns)
- Color swatches for skin/hair/clothing
- Live 3D preview updates as user selects options
- "Randomize" button per category
- "Randomize All" button

---

## Part 2: Add Larger Canvas Size for Customizer

### Modify: `AvatarCanvas.tsx`

Add new sizes for the customization screen:

```typescript
const SIZE_CONFIG = {
  // ... existing sizes
  xxl: { width: 200, height: 200, cameraZ: 1.4, cameraY: 0.35 },
  full: { width: 280, height: 280, cameraZ: 1.2, cameraY: 0.3 }
};
```

This allows a large, detailed view of the avatar during customization.

---

## Part 3: Integrate Customizer into Player Creation Flow

### Modify: `PlayerForm.tsx`

Replace the current `AvatarPreview` section with:
- A button to "Customize Avatar" that opens the full customizer
- Or embed a compact version of the customizer directly

### Modify: `AvatarPreview.tsx`

Update to display the 3D avatar instead of initials/gradient:
- Use `SimsAvatar` component with the player's avatar config
- Show the 3D animated avatar as the main preview

### Modify: `types.ts`

Add `avatarConfig` to `PlayerFormData`:

```typescript
export interface PlayerFormData {
  // ... existing fields
  avatarConfig?: Avatar3DConfig;  // 3D avatar configuration
}
```

---

## Part 4: Update Character Frame to Show 3D Avatars

### Modify: `CharacterFrame.tsx`

Replace the 2D template image with 3D avatar when `avatar3DConfig` is available:

```typescript
// If template has 3D config, render SimsAvatar
{template.avatar3DConfig ? (
  <SimsAvatar 
    config={template.avatar3DConfig} 
    size="lg" 
    animated={false}
  />
) : (
  <img src={template.imageUrl} ... />
)}
```

---

## Part 5: Enable 3D Avatars in Game UI

### Modify: `HouseguestAvatar.tsx`

Update to support 3D mode:

```typescript
interface HouseguestAvatarProps {
  houseguest: Houseguest;
  size?: 'sm' | 'md' | 'lg';
  use3D?: boolean;  // New prop
}

// If houseguest has avatarConfig and use3D is true, render SimsAvatar
```

### Modify: `HouseguestDialog.tsx`

Pass `use3D={true}` to `HouseguestAvatar` when the houseguest has an avatar config.

---

## Part 6: Create Color Palette Picker Component

### New Component: `ColorPalettePicker.tsx`

A reusable swatch-based color picker:

```typescript
interface ColorPalettePickerProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}
```

- Grid of clickable color swatches
- Selected state with ring/checkmark
- Optional category labels

---

## Part 7: Create Option Selector Components

### New Component: `AvatarOptionSelector.tsx`

A visual selector for non-color options (body type, hair style, etc.):

```typescript
interface AvatarOptionSelectorProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  renderOption: (option: T, isSelected: boolean) => React.ReactNode;
  columns?: number;
}
```

- Grid layout with visual icons/previews
- Selected state with border highlight

---

## Files Summary

### New Files (4)

| File | Purpose |
|------|---------|
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Full Sims-style customization UI |
| `src/components/avatar-3d/ColorPalettePicker.tsx` | Color swatch picker component |
| `src/components/avatar-3d/AvatarOptionSelector.tsx` | Visual option selector |
| `src/components/avatar-3d/AvatarCustomizerPreview.tsx` | Large 3D preview with controls |

### Modified Files (8)

| File | Changes |
|------|---------|
| `src/components/avatar-3d/AvatarCanvas.tsx` | Add `xxl` and `full` size presets |
| `src/components/game-setup/types.ts` | Add `avatarConfig` to `PlayerFormData` |
| `src/components/game-setup/PlayerForm.tsx` | Integrate avatar customizer |
| `src/components/game-setup/AvatarPreview.tsx` | Use 3D avatar in preview |
| `src/components/game-setup/CharacterFrame.tsx` | Render 3D avatars for templates |
| `src/components/houseguest/HouseguestAvatar.tsx` | Add 3D mode support |
| `src/components/houseguest/HouseguestDialog.tsx` | Enable 3D avatars |
| `src/models/avatar-config.ts` | Export all type arrays for selectors |

---

## UI Design: Avatar Customizer Screen

```text
+------------------------------------------------------------------+
|  < Back                     CREATE YOUR AVATAR                    |
+------------------------------------------------------------------+
|                                                                   |
|  +---------------------------+  +------------------------------+  |
|  |                           |  |  [Body] [Skin] [Face] [Hair] [Clothes] |
|  |     +--------------+      |  +------------------------------+  |
|  |     |              |      |  |                              |  |
|  |     |   3D AVATAR  |      |  |  Body Type:                  |  |
|  |     |   (Rotating) |      |  |  [Slim] [Average] [Athletic] [Stocky] |
|  |     |   (Large)    |      |  |                              |  |
|  |     |              |      |  |  Height:                     |  |
|  |     +--------------+      |  |  [Short] [Average] [Tall]    |  |
|  |                           |  |                              |  |
|  |     [Rotate Left/Right]   |  |  [Randomize Body]            |  |
|  |     [Randomize All]       |  |                              |  |
|  +---------------------------+  +------------------------------+  |
|                                                                   |
|                         [Continue with this Avatar]               |
+------------------------------------------------------------------+
```

---

## Implementation Steps

1. **Create `ColorPalettePicker` component** - Reusable color swatch picker
2. **Create `AvatarOptionSelector` component** - Visual option grid selector
3. **Extend `AvatarCanvas` sizes** - Add larger preview sizes
4. **Create `AvatarCustomizer` component** - Main customization UI with tabs
5. **Update `PlayerFormData` type** - Add avatarConfig field
6. **Modify `PlayerForm`** - Add customizer integration
7. **Update `AvatarPreview`** - Show 3D avatar preview
8. **Update `CharacterFrame`** - Render 3D for templates
9. **Update `HouseguestAvatar`** - Add 3D rendering mode
10. **Update `HouseguestDialog`** - Enable 3D avatars in dialogs

---

## Expected Behavior

1. **Create Custom Character flow**: Opens full-screen Sims-style customizer
2. **Live preview**: 3D avatar updates instantly as options are changed
3. **Tabbed navigation**: Easy switching between Body, Skin, Face, Hair, Clothes
4. **Visual selectors**: Icon-based selectors instead of plain dropdowns
5. **Color palettes**: Swatch grids for skin/hair/clothing colors
6. **Randomize options**: Per-category and global randomize buttons
7. **Game UI**: All houseguest avatars render as 3D when config available
8. **Status animations**: 3D avatars show HoH glow, nominee nervousness, etc.

---

## Visual Style Guide

- **Background**: Dark slate gradient to make 3D avatar pop
- **Category tabs**: Pill-shaped buttons with icons
- **Option cards**: Rounded cards with hover effects
- **Color swatches**: Circular swatches in grid layout
- **Selected state**: Ring highlight + subtle glow
- **Animations**: Smooth transitions between selections

