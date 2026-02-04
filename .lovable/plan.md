

# Plan: Modernize 3D Avatar System - GLB Model Options

## Current Situation

The existing avatar system uses **procedural Three.js primitives** (spheres, capsules, cylinders) with toon shading. While this approach offers full programmatic customization, the results look like basic geometric shapes rather than professional 3D characters.

The Prompt3D reference you shared demonstrates a much more sophisticated approach using:
- Professional GLB models created in Blender
- Real textures (diffuse, normal, roughness, specular maps)
- Morph targets for facial expressions and lip-sync
- Skeletal animations for idle/body movement

---

## Option Comparison

| Feature | Current (Procedural) | Ready Player Me | Custom GLB Models |
|---------|---------------------|-----------------|-------------------|
| Visual Quality | Basic | Excellent | Excellent |
| Setup Complexity | Already done | Medium | Medium |
| Customization | Full code control | RPM configurator | Manual in Blender |
| Expressions | Limited | 52 ARKit blendshapes | Custom blendshapes |
| Lip-sync | None | Supported via Visage | Supported |
| File Size | Minimal | ~5-10MB per avatar | 2-5MB per base model |
| External Dependencies | None | RPM SDK + API | None |
| Cost | Free | Free tier limited | Free |

---

## Recommended Approach: Ready Player Me Integration

Ready Player Me (RPM) offers the best balance of quality and ease of implementation:

### Why Ready Player Me?

1. **Professional Quality**: Realistic or stylized avatars with proper rigging
2. **Built-in Customization**: Users can customize via RPM's polished interface
3. **React Integration**: Official `@readyplayerme/visage` package for React Three Fiber
4. **Morph Targets**: 52 ARKit-compatible blendshapes for expressions
5. **Animation Ready**: Pre-rigged for Mixamo animations
6. **No 3D Modeling Required**: Skip Blender entirely

### New Dependencies

```json
{
  "@readyplayerme/visage": "^5.0.0",
  "@readyplayerme/react-avatar-creator": "^1.4.0"
}
```

---

## Implementation Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Avatar Creation Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐     ┌───────────────────────┐         │
│  │  "Create Custom" │────▶│ RPM Avatar Creator    │         │
│  │      Button      │     │ (iframe widget)       │         │
│  └──────────────────┘     │                       │         │
│                           │  - Body type          │         │
│                           │  - Face customization │         │
│                           │  - Hair/clothing      │         │
│                           │  - Accessories        │         │
│                           └───────────┬───────────┘         │
│                                       │                      │
│                                       ▼                      │
│                           ┌───────────────────────┐         │
│                           │ Returns: avatar.glb   │         │
│                           │ URL hosted by RPM     │         │
│                           └───────────┬───────────┘         │
│                                       │                      │
│                                       ▼                      │
│                           ┌───────────────────────┐         │
│                           │ Store URL in player   │         │
│                           │ config (database)     │         │
│                           └───────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Avatar Rendering Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐     ┌───────────────────────┐         │
│  │ HouseguestAvatar │────▶│ @readyplayerme/visage │         │
│  │   Component      │     │ <Avatar modelSrc=...> │         │
│  └──────────────────┘     │                       │         │
│                           │  - Loads GLB model    │         │
│                           │  - Applies animations │         │
│                           │  - Handles expressions│         │
│                           └───────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## File Changes

### New Files (3)

| File | Purpose |
|------|---------|
| `src/components/avatar-3d/RPMAvatar.tsx` | Wrapper for Ready Player Me's Avatar component |
| `src/components/avatar-3d/RPMAvatarCreator.tsx` | Avatar customization widget using RPM's creator |
| `src/components/avatar-3d/AvatarLoader.tsx` | Smart loader that renders either RPM or fallback |

### Modified Files (5)

| File | Changes |
|------|---------|
| `src/models/avatar-config.ts` | Add `avatarUrl?: string` field for GLB URL storage |
| `src/models/houseguest/model.ts` | Add `avatarUrl?: string` to Houseguest interface |
| `src/components/game-setup/PlayerForm.tsx` | Replace custom customizer with RPM creator option |
| `src/components/houseguest/HouseguestAvatar.tsx` | Render RPM avatar when URL available |
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Add tab/option to use RPM creator |

---

## RPMAvatar Component

```typescript
// src/components/avatar-3d/RPMAvatar.tsx
import React from 'react';
import { Avatar } from '@readyplayerme/visage';

interface RPMAvatarProps {
  modelSrc: string;
  animationSrc?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry';
  style?: React.CSSProperties;
  onLoaded?: () => void;
}

export const RPMAvatar: React.FC<RPMAvatarProps> = ({
  modelSrc,
  animationSrc = '/animations/idle.fbx',
  emotion = 'neutral',
  style,
  onLoaded
}) => {
  return (
    <Avatar
      modelSrc={modelSrc}
      animationSrc={animationSrc}
      emotion={emotion}
      style={style}
      onLoaded={onLoaded}
      cameraInitDistance={5}
      effects={{ ambientOcclusion: true }}
    />
  );
};
```

---

## RPMAvatarCreator Component

```typescript
// src/components/avatar-3d/RPMAvatarCreator.tsx
import React, { useState } from 'react';
import { AvatarCreator } from '@readyplayerme/react-avatar-creator';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface RPMAvatarCreatorProps {
  open: boolean;
  onClose: () => void;
  onAvatarCreated: (avatarUrl: string) => void;
}

export const RPMAvatarCreator: React.FC<RPMAvatarCreatorProps> = ({
  open,
  onClose,
  onAvatarCreated
}) => {
  const handleAvatarExported = (event: AvatarExportedEvent) => {
    onAvatarCreated(event.data.url);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <AvatarCreator
          subdomain="lovable-game"  // Would need RPM account
          config={{
            bodyType: 'halfbody',
            quickStart: false,
            language: 'en',
          }}
          style={{ width: '100%', height: '100%' }}
          onAvatarExported={handleAvatarExported}
        />
      </DialogContent>
    </Dialog>
  );
};
```

---

## Smart Avatar Loader

```typescript
// src/components/avatar-3d/AvatarLoader.tsx
import React, { Suspense } from 'react';
import { SimsAvatar } from './SimsAvatar';
import { RPMAvatar } from './RPMAvatar';
import { Avatar3DConfig } from '@/models/avatar-config';

interface AvatarLoaderProps {
  avatarUrl?: string;        // GLB URL from RPM
  avatarConfig?: Avatar3DConfig;  // Fallback procedural config
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const AvatarLoader: React.FC<AvatarLoaderProps> = ({
  avatarUrl,
  avatarConfig,
  size = 'md',
  animated = true
}) => {
  // If we have a GLB URL, use Ready Player Me avatar
  if (avatarUrl) {
    return (
      <Suspense fallback={<AvatarSkeleton size={size} />}>
        <RPMAvatar modelSrc={avatarUrl} />
      </Suspense>
    );
  }
  
  // Otherwise, use procedural chibi avatar
  return (
    <SimsAvatar 
      config={avatarConfig} 
      size={size} 
      animated={animated} 
    />
  );
};
```

---

## Alternative: Self-Hosted GLB Models

If you prefer not to depend on Ready Player Me, we could:

1. **Source Free GLB Models**: Use models from Sketchfab, Mixamo, or create custom ones
2. **Host in `/public`**: Store base models locally
3. **Custom Material Swapping**: Modify colors/textures at runtime

### Pros:
- No external API dependency
- Full control over appearance
- Works offline

### Cons:
- Need 3D modeling skills for new characters
- Manual rigging for animations
- More development work

---

## Data Model Changes

```typescript
// Updated Avatar3DConfig
export interface Avatar3DConfig {
  // Existing procedural config...
  bodyType: BodyType;
  // ...etc
  
  // NEW: GLB model URL (from RPM or custom)
  modelUrl?: string;
  
  // NEW: Source type
  modelSource?: 'procedural' | 'ready-player-me' | 'custom-glb';
}

// Updated Houseguest
export interface Houseguest {
  // ...existing fields
  avatarUrl?: string;  // Direct GLB URL for fast loading
}
```

---

## Migration Strategy

1. **Phase 1**: Add RPM integration as an alternative option
   - Keep existing chibi avatars working
   - Add "Use Ready Player Me" button in customizer
   
2. **Phase 2**: Store avatar URLs in database
   - Save GLB URLs when users create RPM avatars
   - Load from URL during gameplay

3. **Phase 3**: Optional - Replace all NPCs with RPM
   - Pre-generate NPC avatars via RPM API
   - Store URLs for faster loading

---

## Expected Results

After implementation:
- **Professional Quality**: Avatars that look like they belong in a modern game
- **Rich Expressions**: 52 blendshapes for nuanced emotions
- **Animation Ready**: Works with Mixamo animation library
- **User Choice**: Players can use RPM or stick with chibi style
- **Future-Proof**: Can add lip-sync, full body, VR support later

---

## Questions to Consider

1. **RPM Account**: Ready Player Me requires setting up a free account and subdomain - is this acceptable?

2. **Style Preference**: RPM offers realistic or stylized avatars - which fits the game better?

3. **Fallback Strategy**: Should NPCs use RPM too, or stay procedural for faster loading?

4. **Storage**: Where should avatar URLs be stored? (Database, localStorage, or regenerate each session?)

