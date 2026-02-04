

# Plan: Fix Pro Avatar Loading Performance

## Problem Analysis

The Ready Player Me (RPM) Pro Avatar is loading slowly due to several factors:

1. **Large GLB File Size**: The current configuration requests `quality: 'medium'` but doesn't optimize for web delivery
2. **Missing URL Optimization Parameters**: RPM supports URL query parameters like `?quality=low&textureFormat=webp` that dramatically reduce file size
3. **No Preloading**: Avatars are only loaded when rendered, causing visible delays
4. **Draco Compression Not Applied**: The SDK config sets `useDracoCompression: true` but this only applies during avatar creation, not when loading existing avatars
5. **No Progressive Loading**: Users see either nothing or a full avatar - no intermediate state
6. **Multiple Canvas Instances**: Each avatar creates its own Canvas, which is expensive

---

## Solution: Multi-Layer Optimization Strategy

### 1. Optimize Avatar URL Parameters

When an RPM avatar URL is stored, append optimization parameters to reduce file size by 60-80%:

```text
BEFORE (5-10MB):
https://models.readyplayer.me/abc123.glb

AFTER (1-2MB):
https://models.readyplayer.me/abc123.glb?quality=low&textureFormat=webp&morphTargets=ARKit,mouthOpen,mouthSmile,eyeBlinkLeft,eyeBlinkRight&lod=1
```

**Key parameters:**
- `quality=low` - Uses smaller textures (256px) and reduced mesh complexity
- `textureFormat=webp` - 40% smaller textures than PNG
- `lod=1` - 50% triangle count reduction
- `morphTargets=...` - Only include needed blendshapes instead of all 52

### 2. Add URL Optimizer Utility

Create a utility to transform raw RPM URLs into optimized versions:

```typescript
// src/utils/rpm-avatar-optimizer.ts
export const optimizeRPMUrl = (url: string, options?: {
  quality?: 'low' | 'medium' | 'high';
  morphTargets?: string[];
  textureFormat?: 'webp' | 'jpeg' | 'png';
  lod?: 0 | 1 | 2;
}) => {
  const baseUrl = url.split('?')[0]; // Remove existing params
  const params = new URLSearchParams();
  
  params.set('quality', options?.quality ?? 'low');
  params.set('textureFormat', options?.textureFormat ?? 'webp');
  params.set('lod', String(options?.lod ?? 1));
  
  const morphs = options?.morphTargets ?? [
    'ARKit', 'mouthSmileLeft', 'mouthSmileRight', 
    'eyeBlinkLeft', 'eyeBlinkRight', 'browInnerUp'
  ];
  params.set('morphTargets', morphs.join(','));
  
  return `${baseUrl}?${params.toString()}`;
};
```

### 3. Implement Aggressive Preloading

Preload avatars as soon as URLs are known, not when components render:

```typescript
// In RPMAvatarCreator when avatar is created
const handleAvatarExported = (url: string) => {
  const optimizedUrl = optimizeRPMUrl(url);
  
  // Start preloading immediately
  useGLTF.preload(optimizedUrl);
  
  onAvatarCreated(optimizedUrl); // Store optimized URL
};
```

### 4. Add Loading Progress States

Show meaningful progress during avatar load:

```typescript
const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready'>('idle');
const [progress, setProgress] = useState(0);

// Use useProgress from drei
const { progress } = useProgress();
```

### 5. Use Shared Canvas for Multiple Avatars

Instead of creating a Canvas per avatar in lists, use a single shared Canvas with portals or render avatars to textures.

### 6. Add Quality Tiers Based on Context

- **Thumbnail/List View**: `quality=low`, `lod=2` (smallest possible)
- **Profile/Dialog View**: `quality=medium`, `lod=1` (balanced)
- **Customizer Preview**: `quality=high`, `lod=0` (full quality)

---

## File Changes

### New Files (1)

| File | Purpose |
|------|---------|
| `src/utils/rpm-avatar-optimizer.ts` | URL optimization utilities for RPM avatars |

### Modified Files (5)

| File | Changes |
|------|---------|
| `src/components/avatar-3d/RPMAvatarCreator.tsx` | Apply URL optimization on export, add loading progress |
| `src/components/avatar-3d/AvatarLoader.tsx` | Add quality tier support, improve loading states, use preloading |
| `src/components/avatar-3d/RPMAvatar.tsx` | Add loading callbacks, optimize render loop |
| `src/components/avatar-3d/hooks/useAvatarPreloader.ts` | Preload optimized URLs, add batch preloading |
| `src/models/avatar-config.ts` | Add `avatarQuality` preference field |

---

## Technical Details

### URL Optimization Impact

| Quality | File Size | Load Time (3G) | Use Case |
|---------|-----------|----------------|----------|
| High (current) | 8-12 MB | 15-25s | Never for web |
| Medium | 3-5 MB | 6-10s | Customizer only |
| Low + WebP | 1-2 MB | 2-4s | All game views |
| Low + WebP + lod=2 | 0.5-1 MB | 1-2s | Thumbnails |

### Optimized Avatar Config

```typescript
const avatarConfig = {
  quality: 'low' as const,           // Changed from 'medium'
  morphTargets: [
    'ARKit',                          // Base expression set
    'mouthSmileLeft', 'mouthSmileRight',
    'eyeBlinkLeft', 'eyeBlinkRight',
    'browInnerUp', 'mouthFrownLeft', 'mouthFrownRight'
  ],
  useDracoCompression: true,
  textureFormat: 'webp',              // New: 40% smaller textures
  lod: 1,                             // New: 50% fewer triangles
};
```

### Preloading Strategy

```typescript
// When game starts, preload all RPM avatars
const houseguests = useGameState(s => s.houseguests);

useEffect(() => {
  const rpmUrls = houseguests
    .filter(hg => hg.avatarConfig?.modelSource === 'ready-player-me')
    .map(hg => optimizeRPMUrl(hg.avatarConfig.modelUrl, { quality: 'low' }));
  
  // Preload in background with low priority
  rpmUrls.forEach(url => useGLTF.preload(url));
}, [houseguests]);
```

### Loading State Component

```typescript
const RPMLoadingState: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
    <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
      />
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      {progress < 100 ? `Loading ${Math.round(progress)}%` : 'Preparing...'}
    </p>
  </div>
);
```

---

## Additional Refinements

### 1. Fallback Chain
If RPM avatar fails or takes >5 seconds, automatically fall back to chibi:

```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    if (loadState !== 'ready') {
      setForceChibibi(true);
      console.warn('RPM avatar timeout, using chibi fallback');
    }
  }, 5000);
  return () => clearTimeout(timeout);
}, []);
```

### 2. Cache Busting for Updated Avatars
Store a version timestamp to force refresh when avatar is re-customized:

```typescript
const urlWithCache = `${optimizedUrl}&v=${avatarVersion}`;
```

### 3. Network-Aware Quality Selection
Detect connection speed and auto-select quality:

```typescript
const connection = navigator.connection;
const quality = connection?.effectiveType === '4g' ? 'medium' : 'low';
```

### 4. Lazy Load RPM SDK
The SDK itself is large - ensure it's only loaded when user clicks "Pro Avatar":

```typescript
// Already implemented with lazy() but ensure the chunk is small
const LazyRPMCreator = lazy(() => import('./RPMAvatarCreator'));
```

---

## Expected Results

After implementation:
- **Load time reduction**: From 15-25s to 2-4s (80% faster)
- **File size reduction**: From 8-12 MB to 1-2 MB (85% smaller)
- **Better UX**: Progress indicator instead of blank screen
- **Graceful fallback**: Chibi avatar shown if RPM fails
- **Preloaded avatars**: Zero wait time for previously seen avatars

