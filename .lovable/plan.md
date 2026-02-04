
# Plan: Manual Profile Photo Capture for Player Setup

## Problem Analysis

The current implementation has a fundamental conflict:
1. **Customizer Canvas**: Uses `full` size with camera at Y=0, Z=2.5, showing the full body
2. **Auto-capture**: Tries to crop the head from this full-body view, which doesn't work reliably
3. **Profile Preview**: Uses `xl` size with camera at Y=0.55, Z=1.5 for head portrait, but this is a different canvas instance

The auto-capture runs on the customizer's full-body canvas, so no matter how we crop, we're extracting from a view where the head is small.

## Solution: Dedicated Profile Photo Capture Canvas

Replace the unreliable auto-capture with a **manual "Take Photo" workflow** inside the customizer dialog:

1. **Add a dedicated portrait preview** inside the customizer that shows how the profile photo will look (head-focused camera)
2. **Add a prominent "Take Profile Photo" button** that captures from this portrait preview
3. **Show preview with confirm/retake** before saving
4. **Require profile photo** before allowing the player to continue to the game

## User Flow

```text
1. Player opens "Customize Avatar" dialog
2. Creates/selects avatar in RPM creator panel
3. Full-body preview shows on the left (existing)
4. NEW: "Profile Photo" section appears below with:
   - Small portrait preview (head-focused camera)
   - "Take Photo" button
5. Clicking "Take Photo" opens preview modal
6. Player can "Use Photo" or "Retake"
7. Photo saved to avatarConfig.profilePhotoUrl
8. Continue button enabled
```

## File Changes

### 1. `src/components/avatar-3d/AvatarCustomizer.tsx`

**Remove**: Auto-capture logic (lines 50-103)

**Add**: 
- Portrait preview component with dedicated head-focused camera
- Manual "Take Profile Photo" button
- Photo preview section showing captured photo or capture prompt
- Require photo before "Continue" button works

```typescript
// New state
const [profilePhotoCapture, setProfilePhotoCapture] = useState<string | null>(null);

// New component: ProfilePhotoCapture section
<div className="mt-6 p-4 rounded-lg border border-border/50 bg-muted/20">
  <h4 className="font-semibold mb-3 flex items-center gap-2">
    <Camera className="w-4 h-4" />
    Profile Photo
  </h4>
  
  {/* Portrait preview canvas - head-focused */}
  <div className="flex items-center gap-4">
    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30">
      {config.modelUrl ? (
        <ProfilePortraitCanvas avatarUrl={config.modelUrl} />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
    </div>
    
    {config.profilePhotoUrl ? (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Check className="w-4 h-4" />
          Photo saved
        </div>
        <Button variant="outline" size="sm" onClick={handleRetake}>
          <Camera className="w-4 h-4 mr-2" />
          Retake
        </Button>
      </div>
    ) : (
      <Button onClick={handleTakePhoto}>
        <Camera className="w-4 h-4 mr-2" />
        Take Profile Photo
      </Button>
    )}
  </div>
</div>

// Disable Continue button if no profile photo
<Button
  onClick={onComplete}
  disabled={!config.modelUrl || !config.profilePhotoUrl}
>
  Continue
</Button>
```

### 2. New Component: `src/components/avatar-3d/ProfilePortraitCanvas.tsx`

A small, dedicated canvas component with head-focused camera settings:

```typescript
interface ProfilePortraitCanvasProps {
  avatarUrl: string;
  size?: number;
  onCapture?: (dataUrl: string) => void;
}

// Camera settings optimized for head portrait
const PORTRAIT_CAMERA = {
  position: [0, 0.6, 1.3] as const,
  fov: 25
};

// Renders just the head/face area for profile photos
export const ProfilePortraitCanvas: React.FC<ProfilePortraitCanvasProps> = ({
  avatarUrl,
  size = 96,
  onCapture
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Capture function reads from THIS canvas
  const capture = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/webp', 0.85);
      onCapture?.(dataUrl);
    }
  }, [onCapture]);

  return (
    <div style={{ width: size, height: size }} className="rounded-full overflow-hidden">
      <Canvas
        ref={canvasRef}
        camera={PORTRAIT_CAMERA}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 2, 3]} intensity={0.8} />
        <Suspense fallback={null}>
          <RPMAvatar 
            modelSrc={avatarUrl} 
            context="profile"
            position={[0, -0.55, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
```

### 3. Update `src/components/game-setup/AvatarPreview.tsx`

Show the captured profile photo (circular) instead of the 3D canvas when available:

```typescript
// In the avatar display section
<motion.div className="w-32 h-32 rounded-full relative overflow-hidden">
  {avatarConfig?.profilePhotoUrl ? (
    // Show captured 2D profile photo
    <img 
      src={avatarConfig.profilePhotoUrl}
      alt={playerName}
      className="w-full h-full object-cover"
    />
  ) : has3DConfig ? (
    // Fallback to 3D loader
    <AvatarLoader avatarConfig={avatarConfig || localConfig} ... />
  ) : (
    // Gradient placeholder
    ...
  )}
</motion.div>
```

## Visual Comparison

| Before | After |
|--------|-------|
| Auto-capture from full-body canvas | Manual capture from portrait canvas |
| Crops torso/lower body | Captures exactly the head area |
| Silent capture, often wrong | Preview + confirm workflow |
| Can continue without photo | Must take photo to continue |

## Expected Result

1. Player creates avatar in RPM creator
2. Portrait preview updates to show head close-up
3. Player clicks "Take Profile Photo" 
4. Preview modal shows the captured headshot
5. Player confirms or retakes
6. Photo saved and shown in setup page
7. Photo used throughout game UI

## Technical Notes

- The `ProfilePortraitCanvas` uses `preserveDrawingBuffer: true` to enable screenshot capture
- Camera position Y=0.6, Z=1.3 with FOV 25 frames just the head
- Model position Y=-0.55 shifts avatar up so head is centered
- Photo stored as base64 WebP data URL in `avatarConfig.profilePhotoUrl`
