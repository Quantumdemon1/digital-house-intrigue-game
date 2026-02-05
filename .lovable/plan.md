
# Fix: Avatar Network Failure Shows Wrong Fallback in HouseScene

## Problem Analysis

When Ready Player Me CDN fails to load (network error), the avatars appear as strange geometric objects instead of proper placeholders. This is because:

1. `RPMAvatar`'s internal `AvatarRenderBoundary` catches the error and returns `null`
2. Returning `null` is a valid render - it doesn't trigger the `Suspense` fallback
3. The character spot becomes "empty" and shows underlying scene geometry (walls, furniture)
4. The yellow ring around "Jordan Taylor" is the platform, not the avatar

## Root Cause

The error handling flow is broken:

```text
Current Flow (Broken):
┌─────────────────────────────────────────────────────────┐
│ Suspense fallback={<AvatarPlaceholder />}               │
│   └── RPMAvatar                                         │
│         └── AvatarRenderBoundary catches error → null   │
│                                                         │
│ Result: null renders, no fallback shown                 │
└─────────────────────────────────────────────────────────┘
```

## Solution

Modify `RPMAvatar` to render its own 3D fallback mesh when an error occurs, rather than returning `null`. This ensures there's always a visible avatar representation.

## Changes Required

### 1. Update `RPMAvatar.tsx`

When `hasError` is true, instead of returning `null`, render the `RPMAvatarFallback` component:

```typescript
// If error occurred, show fallback mesh
if (hasError) {
  return <RPMAvatarFallback isError />;
}
```

### 2. Improve `RPMAvatarFallback` Positioning

The fallback mesh needs to match the avatar's expected position and scale:

- Use the same `effectivePosition` and `scale` as the main avatar
- Ensure the capsule/sphere geometry is at the correct height
- Keep the wireframe style to distinguish it as a placeholder

### 3. Update `RPMAvatarInner` Error Callback

Pass the `onError` callback properly so network failures bubble up:

```typescript
const { scene } = useGLTF(optimizedUrl);
// useGLTF throws on failure, caught by boundary
```

## Technical Details

### Modified Error Flow

```text
New Flow (Fixed):
┌─────────────────────────────────────────────────────────┐
│ Suspense fallback={<AvatarPlaceholder />}               │
│   └── RPMAvatar                                         │
│         ├── hasError=false → RPMAvatarInner             │
│         └── hasError=true  → <RPMAvatarFallback />      │
│                                                         │
│ Result: Wireframe capsule always visible on error       │
└─────────────────────────────────────────────────────────┘
```

### Fallback Visual

The fallback will show:
- Gray wireframe capsule body (loading state)
- Red wireframe capsule body (error state)
- Sphere for head indicator
- Positioned correctly at character position

## Files to Modify

| File | Change |
|------|--------|
| `src/components/avatar-3d/RPMAvatar.tsx` | Return `<RPMAvatarFallback />` instead of `null` when error occurs |

## Expected Outcome

- When avatars fail to load, users see a clear wireframe placeholder
- The placeholder is positioned at the character's spot with correct scale
- Selection rings and name labels still work correctly
- No "invisible" characters showing underlying scene geometry
