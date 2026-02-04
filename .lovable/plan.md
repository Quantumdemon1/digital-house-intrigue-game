
# Plan: Comprehensive Avatar System Upgrade

## Overview

This plan implements three major enhancements to create a robust, performant multi-source avatar system:

1. **Optimize Current RPM** - CDN caching, thumbnail fallbacks, pre-generated NPC library
2. **Add VRM Support** - @pixiv/three-vrm integration for anime-style avatars
3. **Self-Hosted GLB Library** - Curated preset avatars with instant loading

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Avatar Source Router                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │   Chibi     │   │   Preset    │   │    VRM      │   │    RPM      │          │
│  │ (Procedural)│   │    GLB      │   │   (Anime)   │   │  (Custom)   │          │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘          │
│         │                 │                 │                 │                  │
│         ▼                 ▼                 ▼                 ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                     AvatarLoader (Smart Router)                          │    │
│  │  - Detects modelSource: 'procedural' | 'preset' | 'vrm' | 'rpm'          │    │
│  │  - Routes to appropriate renderer                                        │    │
│  │  - Handles fallback chain: RPM → VRM → Preset → Chibi                    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Optimize Current RPM System

### 1.1 Add CDN Cache Layer

Create a caching utility that stores optimized avatar URLs with cache busting:

**New File: `src/utils/avatar-cache.ts`**
- LRU cache for avatar URLs (max 100 entries)
- Store pre-computed optimized URLs to avoid recalculating
- Add cache headers hint utility for CDN configuration
- Version-based cache busting when avatars are re-customized

### 1.2 Screenshot Thumbnail Fallback System

Generate and store 2D thumbnail images as instant fallbacks while 3D loads:

**New File: `src/components/avatar-3d/AvatarThumbnail.tsx`**
- Render avatar to canvas and export as data URL
- Store thumbnails in localStorage (compressed, max 50KB each)
- Show 2D thumbnail instantly, fade to 3D when ready

**Updates to `AvatarLoader.tsx`:**
- Add thumbnail layer behind 3D canvas
- Crossfade from thumbnail to 3D on load complete
- Use thumbnail as final fallback if all 3D fails

### 1.3 Pre-Generated NPC Avatar Library

Create 20-30 pre-made RPM avatars for NPCs with optimized URLs:

**New File: `src/data/preset-rpm-avatars.ts`**
```typescript
export const PRESET_RPM_AVATARS = [
  {
    id: 'npc-1',
    name: 'Alex',
    url: 'https://models.readyplayer.me/xxx.glb?quality=low&...',
    thumbnail: '/avatars/thumbnails/npc-1.webp',
    traits: ['athletic', 'confident']
  },
  // ... 29 more
];
```

**Process to create:**
1. Use RPM creator to design 30 diverse characters
2. Export with optimal URL parameters already applied
3. Generate thumbnail images for each
4. Store URLs in static data file

---

## Part 2: Add VRM Avatar Support

### 2.1 Install Dependencies

**Package additions:**
```json
{
  "@pixiv/three-vrm": "^3.0.0"
}
```

### 2.2 Create VRM Avatar Component

**New File: `src/components/avatar-3d/VRMAvatar.tsx`**

```typescript
import { VRMLoaderPlugin, VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';

// VRM uses standardized expression presets:
// - happy, angry, sad, relaxed, surprised
// - blink, blinkLeft, blinkRight
// - aa, ih, ou, ee, oh (visemes)

interface VRMAvatarProps {
  modelSrc: string;
  mood?: MoodType;
  scale?: number;
  onLoaded?: () => void;
  onError?: () => void;
}

export const VRMAvatar: React.FC<VRMAvatarProps> = ({...}) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  
  // Load VRM with custom loader
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.load(modelSrc, (gltf) => {
      const loadedVrm = gltf.userData.vrm as VRM;
      setVrm(loadedVrm);
      onLoaded?.();
    });
  }, [modelSrc]);
  
  // Apply expressions based on mood
  useEffect(() => {
    if (!vrm?.expressionManager) return;
    
    const expressionMap = {
      'Happy': VRMExpressionPresetName.Happy,
      'Upset': VRMExpressionPresetName.Sad,
      'Angry': VRMExpressionPresetName.Angry,
      'Neutral': null
    };
    
    // Reset all expressions
    Object.values(VRMExpressionPresetName).forEach(name => {
      vrm.expressionManager?.setValue(name, 0);
    });
    
    // Apply mood expression
    const expression = expressionMap[mood];
    if (expression) {
      vrm.expressionManager.setValue(expression, 0.8);
    }
  }, [vrm, mood]);
  
  // Blink animation in useFrame
  useFrame((state, delta) => {
    vrm?.update(delta);
    // Add periodic blink using vrm.expressionManager
  });
  
  return vrm ? <primitive object={vrm.scene} scale={scale} /> : null;
};
```

### 2.3 Source Free VRM Avatars

Create a curated library of 10-20 CC0/CC-BY VRM avatars:

**Sources:**
- OpenGameArt.org VRoid CC0 collection (10 models)
- VRoid Hub with permissive licenses
- Self-created in VRoid Studio (free software)

**New File: `src/data/preset-vrm-avatars.ts`**
```typescript
export const PRESET_VRM_AVATARS = [
  {
    id: 'vrm-1',
    name: 'Sakura',
    url: '/avatars/vrm/sakura.vrm',
    thumbnail: '/avatars/thumbnails/vrm-1.webp',
    style: 'anime-female',
    traits: ['cheerful', 'outgoing']
  },
  // ... 19 more
];
```

### 2.4 VRM File Hosting

**Option A: Self-host in `/public/avatars/vrm/`**
- Place .vrm files directly in public folder
- ~5-15MB per file (smaller than unoptimized RPM)
- Instant loading, no API dependency

**Option B: Lovable Cloud Storage**
- Upload VRM files to storage bucket
- Better for larger libraries
- CDN delivery included

---

## Part 3: Self-Hosted GLB Library

### 3.1 Source/Create Characters

**Sources for free GLB characters:**
- Mixamo (Adobe) - rigged humanoid characters
- Sketchfab CC0 collection
- Quaternius game assets (CC0)
- Custom creation in Blender

**Target: 30-50 diverse characters covering:**
- Various body types and ethnicities
- Different age ranges
- Casual and formal clothing
- Fantasy/stylized options

### 3.2 GLB Optimization Pipeline

**Optimization steps for each model:**

1. **Mesh optimization**
   - Reduce polycount to 5K-15K triangles
   - Merge duplicate vertices
   - Remove non-visible geometry

2. **Texture optimization**
   - Resize to 512x512 or 1024x1024
   - Convert to WebP format
   - Combine into texture atlases where possible

3. **Draco compression**
   - Use gltf-pipeline or Blender exporter
   - Reduces file size by 70-90%

4. **Final size target: 0.5-2MB per model**

**New File: `src/data/preset-glb-avatars.ts`**
```typescript
export const PRESET_GLB_AVATARS = [
  {
    id: 'glb-1',
    name: 'Marcus',
    url: '/avatars/glb/marcus.glb',
    thumbnail: '/avatars/thumbnails/glb-1.webp',
    style: 'casual',
    bodyType: 'athletic',
    traits: ['confident', 'competitive']
  },
  // ... 49 more
];
```

### 3.3 Create PresetAvatar Component

**New File: `src/components/avatar-3d/PresetAvatar.tsx`**

```typescript
export const PresetAvatar: React.FC<PresetAvatarProps> = ({
  presetId,
  mood,
  scale,
  onLoaded
}) => {
  const preset = PRESET_GLB_AVATARS.find(p => p.id === presetId);
  const { scene } = useGLTF(preset.url);
  
  // Clone scene for multiple instances
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  
  // Apply mood via morph targets if available
  // Otherwise use material color tinting or pose changes
  
  return <primitive object={clone} scale={scale} />;
};
```

### 3.4 Build Selection UI

**New File: `src/components/avatar-3d/PresetAvatarSelector.tsx`**

Features:
- Grid of avatar thumbnails (WebP images for instant display)
- Filter by style/traits
- Click to select (no customization, just pick)
- 3D preview on hover/focus

```typescript
export const PresetAvatarSelector: React.FC<{
  source: 'glb' | 'vrm' | 'rpm';
  onSelect: (avatarId: string, url: string) => void;
}> = ({ source, onSelect }) => {
  const presets = source === 'vrm' ? PRESET_VRM_AVATARS 
    : source === 'rpm' ? PRESET_RPM_AVATARS 
    : PRESET_GLB_AVATARS;
  
  return (
    <div className="grid grid-cols-5 gap-4">
      {presets.map(preset => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.id, preset.url)}
          className="relative aspect-square rounded-lg overflow-hidden
                     hover:ring-2 ring-primary transition-all"
        >
          <img 
            src={preset.thumbnail} 
            alt={preset.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 inset-x-0 bg-black/60 
                          text-white text-xs p-1 text-center">
            {preset.name}
          </span>
        </button>
      ))}
    </div>
  );
};
```

---

## Part 4: Unified Avatar System

### 4.1 Update Data Model

**Updates to `src/models/avatar-config.ts`:**

```typescript
export type AvatarModelSource = 
  | 'procedural'      // Current chibi system
  | 'preset-glb'      // Self-hosted GLB library
  | 'vrm'             // VRM anime avatars  
  | 'ready-player-me' // RPM custom avatars
  | 'custom-glb';     // User-provided GLB URL

export interface Avatar3DConfig {
  modelSource?: AvatarModelSource;
  modelUrl?: string;          // For RPM/custom URLs
  presetId?: string;          // For preset-glb/vrm selection
  thumbnailUrl?: string;      // Cached 2D fallback
  
  // Existing procedural config...
  bodyType: BodyType;
  // ...
}
```

### 4.2 Update AvatarLoader

**Updates to `src/components/avatar-3d/AvatarLoader.tsx`:**

```typescript
export const AvatarLoader: React.FC<AvatarLoaderProps> = ({
  avatarUrl,
  avatarConfig,
  size = 'md',
  mood = 'Neutral',
  ...
}) => {
  const modelSource = avatarConfig?.modelSource || 'procedural';
  
  // Route to appropriate renderer
  switch (modelSource) {
    case 'vrm':
      return (
        <Suspense fallback={<AvatarThumbnail url={avatarConfig?.thumbnailUrl} />}>
          <VRMAvatar 
            modelSrc={avatarConfig?.modelUrl || getVRMPresetUrl(avatarConfig?.presetId)}
            mood={mood}
            onError={() => setFallbackToChibibi(true)}
          />
        </Suspense>
      );
      
    case 'preset-glb':
      return (
        <Suspense fallback={<AvatarThumbnail url={avatarConfig?.thumbnailUrl} />}>
          <PresetAvatar
            presetId={avatarConfig?.presetId}
            mood={mood}
          />
        </Suspense>
      );
      
    case 'ready-player-me':
      return (
        <Suspense fallback={<AvatarThumbnail url={avatarConfig?.thumbnailUrl} />}>
          <RPMAvatarCanvas avatarUrl={avatarUrl} mood={mood} ... />
        </Suspense>
      );
      
    case 'procedural':
    default:
      return <SimsAvatar config={avatarConfig} mood={mood} ... />;
  }
};
```

### 4.3 Update AvatarCustomizer

**Updates to `src/components/avatar-3d/AvatarCustomizer.tsx`:**

Add new tabs for avatar source selection:

```typescript
// New mode options
type AvatarMode = 'procedural' | 'preset' | 'vrm' | 'rpm';

// Mode selector UI
<div className="flex gap-2 mb-4">
  <ModeButton mode="procedural" icon={Wand2} label="Chibi" />
  <ModeButton mode="preset" icon={Users} label="Presets" />
  <ModeButton mode="vrm" icon={Sparkles} label="Anime" />
  <ModeButton mode="rpm" icon={Globe} label="Pro" />
</div>

// Content based on mode
{avatarMode === 'preset' && (
  <PresetAvatarSelector 
    source="glb" 
    onSelect={handlePresetSelect} 
  />
)}
{avatarMode === 'vrm' && (
  <PresetAvatarSelector 
    source="vrm" 
    onSelect={handleVRMSelect} 
  />
)}
```

---

## File Changes Summary

### New Files (10)

| File | Purpose |
|------|---------|
| `src/utils/avatar-cache.ts` | LRU cache for avatar URLs |
| `src/components/avatar-3d/AvatarThumbnail.tsx` | 2D thumbnail fallback component |
| `src/components/avatar-3d/VRMAvatar.tsx` | VRM format avatar renderer |
| `src/components/avatar-3d/PresetAvatar.tsx` | Self-hosted GLB preset renderer |
| `src/components/avatar-3d/PresetAvatarSelector.tsx` | Grid UI for selecting preset avatars |
| `src/data/preset-rpm-avatars.ts` | Pre-generated RPM NPC library |
| `src/data/preset-vrm-avatars.ts` | VRM avatar library metadata |
| `src/data/preset-glb-avatars.ts` | GLB avatar library metadata |
| `public/avatars/thumbnails/.gitkeep` | Thumbnail images directory |
| `public/avatars/vrm/.gitkeep` | VRM files directory |
| `public/avatars/glb/.gitkeep` | GLB files directory |

### Modified Files (6)

| File | Changes |
|------|---------|
| `src/models/avatar-config.ts` | Add new source types, presetId, thumbnailUrl |
| `src/components/avatar-3d/AvatarLoader.tsx` | Add VRM/Preset routing, thumbnail layer |
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Add mode tabs, preset selection UI |
| `src/components/avatar-3d/index.ts` | Export new components |
| `src/components/avatar-3d/hooks/useAvatarPreloader.ts` | Add VRM preloading support |
| `package.json` | Add @pixiv/three-vrm dependency |

---

## Implementation Order

**Phase 1: RPM Optimization (Priority)**
1. Create avatar-cache.ts utility
2. Add AvatarThumbnail.tsx with localStorage caching
3. Update AvatarLoader with thumbnail layer
4. Create preset-rpm-avatars.ts with 5 initial NPCs

**Phase 2: VRM Support**
1. Install @pixiv/three-vrm package
2. Create VRMAvatar.tsx component
3. Source 5-10 CC0 VRM avatars
4. Add VRM routing to AvatarLoader
5. Create preset-vrm-avatars.ts

**Phase 3: Self-Hosted GLB Library**
1. Source/download 10-20 CC0 GLB characters
2. Optimize with Draco compression
3. Create PresetAvatar.tsx component
4. Build PresetAvatarSelector.tsx UI
5. Integrate into AvatarCustomizer

**Phase 4: Polish**
1. Generate thumbnails for all presets
2. Add filtering/search to selector
3. Optimize preloading strategy
4. Test performance across all sources

---

## Performance Expectations

| Source | Load Time | File Size | Quality | Use Case |
|--------|-----------|-----------|---------|----------|
| Chibi (Procedural) | Instant | 0 KB | Stylized | Default, fastest |
| Preset GLB | 0.5-1.5s | 0.5-2 MB | High | NPCs, quick selection |
| VRM | 1-2s | 5-15 MB | Anime | Anime fans, self-host |
| RPM (Optimized) | 2-4s | 1-2 MB | Realistic | Custom player avatars |

---

## Notes

- VRM avatars work offline once downloaded (no API dependency)
- Preset GLB library provides instant selection without customization complexity
- Thumbnail fallbacks ensure users never see blank loading states
- All sources share the same mood-to-expression mapping interface
- NPC characters can be assigned from preset libraries for consistent, fast loading
