
# Plan: Three.js Animated "The Sims" Style Avatar System

## Overview

Revamp the entire avatar system to use 3D animated characters rendered with React Three Fiber (Three.js). Characters will have a stylized "The Sims" aesthetic with:
- Procedurally generated low-poly humanoid bodies
- Customizable features (skin tone, hair, clothing colors)
- Idle animations (breathing, blinking, subtle movements)
- Status-based animations (celebrating for HoH, nervous for nominees)
- Mood-reactive expressions and poses

---

## Technical Stack

| Library | Version | Purpose |
|---------|---------|---------|
| `three` | `>=0.133` | Core 3D rendering engine |
| `@react-three/fiber` | `^8.18` | React renderer for Three.js (React 18 compatible) |
| `@react-three/drei` | `^9.122.0` | Helper utilities (OrbitControls, useAnimations, etc.) |

---

## Part 1: Install Dependencies and Create Base Infrastructure

### New Dependencies
```json
{
  "three": ">=0.133",
  "@react-three/fiber": "^8.18",
  "@react-three/drei": "^9.122.0"
}
```

### New Directory Structure
```
src/
├── components/
│   └── avatar-3d/
│       ├── SimsAvatar.tsx           # Main 3D avatar component
│       ├── AvatarCanvas.tsx         # Canvas wrapper for 3D scene
│       ├── AvatarBody.tsx           # Procedural body mesh generation
│       ├── AvatarHead.tsx           # Face with expressions
│       ├── AvatarHair.tsx           # Hair mesh variations
│       ├── AvatarClothing.tsx       # Outfit rendering
│       ├── AvatarAnimations.tsx     # Animation controller
│       ├── hooks/
│       │   ├── useIdleAnimation.ts  # Breathing, blinking loops
│       │   ├── useMoodAnimation.ts  # Mood-reactive animations
│       │   └── useStatusAnimation.ts # Game status animations
│       ├── utils/
│       │   ├── avatar-generator.ts  # Procedural mesh generation
│       │   ├── color-palettes.ts    # Skin, hair, clothing colors
│       │   └── animation-clips.ts   # Predefined animation data
│       └── index.ts
└── models/
    └── avatar-config.ts              # Avatar customization types
```

---

## Part 2: Avatar Configuration Model

**Create: `src/models/avatar-config.ts`**

Define the customizable properties for 3D avatars:

```typescript
export interface Avatar3DConfig {
  // Body shape
  bodyType: 'slim' | 'average' | 'athletic' | 'stocky';
  height: 'short' | 'average' | 'tall';
  
  // Skin
  skinTone: string; // Hex color from palette
  
  // Face
  headShape: 'round' | 'oval' | 'square' | 'heart';
  eyeShape: 'round' | 'almond' | 'wide' | 'narrow';
  eyeColor: string;
  noseType: 'small' | 'medium' | 'large' | 'button';
  mouthType: 'thin' | 'full' | 'wide' | 'small';
  
  // Hair
  hairStyle: 'short' | 'medium' | 'long' | 'buzz' | 'ponytail' | 'bun' | 'curly' | 'bald';
  hairColor: string;
  
  // Clothing
  topStyle: 'tshirt' | 'tanktop' | 'blazer' | 'hoodie' | 'dress';
  topColor: string;
  bottomStyle: 'pants' | 'shorts' | 'skirt' | 'jeans';
  bottomColor: string;
}

// Generate random config from archetype
export function generateAvatarConfig(archetype: string, seed?: string): Avatar3DConfig;

// Convert houseguest traits to avatar appearance hints
export function traitsToAvatarHints(traits: string[]): Partial<Avatar3DConfig>;
```

---

## Part 3: Core 3D Avatar Component

**Create: `src/components/avatar-3d/SimsAvatar.tsx`**

The main component that renders a complete 3D character:

```typescript
interface SimsAvatarProps {
  config: Avatar3DConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: MoodType;
  status?: AvatarStatus;
  isPlayer?: boolean;
  animated?: boolean;
  showShadow?: boolean;
  className?: string;
}

export const SimsAvatar: React.FC<SimsAvatarProps> = ({
  config,
  size = 'md',
  mood = 'Neutral',
  status = 'none',
  isPlayer = false,
  animated = true,
  showShadow = true,
  className
}) => {
  return (
    <AvatarCanvas size={size} className={className}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      <group>
        <AvatarBody config={config} />
        <AvatarHead config={config} mood={mood} />
        <AvatarHair config={config} />
        <AvatarClothing config={config} />
        
        {animated && (
          <AvatarAnimations 
            mood={mood} 
            status={status} 
            isPlayer={isPlayer}
          />
        )}
      </group>
      
      {showShadow && <ContactShadows />}
    </AvatarCanvas>
  );
};
```

---

## Part 4: Procedural Body Generation

**Create: `src/components/avatar-3d/AvatarBody.tsx`**

Generate a low-poly humanoid body procedurally:

```typescript
// Sims-style proportions:
// - Slightly oversized head (cartoonish)
// - Simplified body shapes
// - No fingers (mitten hands like original Sims)
// - Smooth, rounded edges

export const AvatarBody: React.FC<{ config: Avatar3DConfig }> = ({ config }) => {
  const bodyMesh = useMemo(() => {
    // Create torso - rounded cylinder/capsule shape
    const torsoGeometry = createTorsoGeometry(config.bodyType);
    
    // Create limbs - simple cylinders with rounded caps
    const armGeometry = createArmGeometry(config.bodyType);
    const legGeometry = createLegGeometry(config.bodyType);
    
    // Create hands - sphere "mittens"
    const handGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    
    return { torso: torsoGeometry, arms: armGeometry, legs: legGeometry, hands: handGeometry };
  }, [config.bodyType]);

  return (
    <group>
      {/* Torso */}
      <mesh geometry={bodyMesh.torso}>
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.3, 0, 0]} geometry={bodyMesh.arms}>
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      <mesh position={[0.3, 0, 0]} geometry={bodyMesh.arms}>
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.1, -0.5, 0]} geometry={bodyMesh.legs}>
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      <mesh position={[0.1, -0.5, 0]} geometry={bodyMesh.legs}>
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
    </group>
  );
};
```

---

## Part 5: Animated Head with Expressions

**Create: `src/components/avatar-3d/AvatarHead.tsx`**

Sims-style head with mood-reactive expressions:

```typescript
const moodExpressions = {
  Happy: { eyeScale: 1.1, mouthCurve: 0.3, browRaise: 0.1 },
  Content: { eyeScale: 1.0, mouthCurve: 0.1, browRaise: 0 },
  Neutral: { eyeScale: 1.0, mouthCurve: 0, browRaise: 0 },
  Upset: { eyeScale: 0.9, mouthCurve: -0.2, browRaise: -0.1 },
  Angry: { eyeScale: 0.8, mouthCurve: -0.3, browRaise: -0.2 }
};

export const AvatarHead: React.FC<{ config: Avatar3DConfig; mood: MoodType }> = ({ 
  config, 
  mood 
}) => {
  const expression = moodExpressions[mood];
  const blinkRef = useRef<THREE.Mesh>(null);
  
  // Blinking animation
  useFrame((state) => {
    // Blink every 3-5 seconds
    const blink = Math.sin(state.clock.elapsedTime * 0.5) > 0.99;
    if (blinkRef.current) {
      blinkRef.current.scale.y = blink ? 0.1 : expression.eyeScale;
    }
  });

  return (
    <group position={[0, 0.8, 0]}>
      {/* Head base */}
      <mesh>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      
      {/* Eyes */}
      <group position={[0, 0.05, 0.2]}>
        <mesh ref={blinkRef} position={[-0.08, 0, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.08, 0, 0.03]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color={config.eyeColor} />
        </mesh>
      </group>
      
      {/* Mouth - curved line based on mood */}
      <MouthShape curve={expression.mouthCurve} />
    </group>
  );
};
```

---

## Part 6: Animation System

**Create: `src/components/avatar-3d/hooks/useIdleAnimation.ts`**

Subtle idle movements for lifelike feel:

```typescript
export function useIdleAnimation(groupRef: React.RefObject<THREE.Group>) {
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Breathing - subtle chest expansion
    groupRef.current.scale.x = 1 + Math.sin(time * 1.5) * 0.01;
    groupRef.current.scale.y = 1 + Math.sin(time * 1.5) * 0.005;
    
    // Slight sway
    groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
    
    // Head micro-movements
    groupRef.current.children[0].rotation.y = Math.sin(time * 0.3) * 0.05;
  });
}
```

**Create: `src/components/avatar-3d/hooks/useStatusAnimation.ts`**

Game-status reactive animations:

```typescript
export function useStatusAnimation(
  groupRef: React.RefObject<THREE.Group>,
  status: AvatarStatus
) {
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    switch (status) {
      case 'hoh':
        // Confident pose - slight lean back, chest out
        groupRef.current.rotation.x = -0.05;
        // Subtle glow effect via scale pulse
        const hohPulse = 1 + Math.sin(time * 2) * 0.02;
        groupRef.current.scale.setScalar(hohPulse);
        break;
        
      case 'nominee':
        // Nervous - fidgeting, looking around
        groupRef.current.position.y = Math.sin(time * 4) * 0.02;
        groupRef.current.rotation.y = Math.sin(time * 2) * 0.1;
        break;
        
      case 'pov':
        // Confident but alert
        groupRef.current.rotation.x = -0.03;
        break;
        
      case 'evicted':
        // Sad pose - slumped shoulders
        groupRef.current.rotation.x = 0.1;
        groupRef.current.position.y = -0.05;
        break;
    }
  });
}
```

---

## Part 7: Canvas Wrapper with Size Presets

**Create: `src/components/avatar-3d/AvatarCanvas.tsx`**

Responsive canvas wrapper:

```typescript
const sizeConfig = {
  sm: { width: 40, height: 40, cameraZ: 3 },
  md: { width: 64, height: 64, cameraZ: 2.5 },
  lg: { width: 96, height: 96, cameraZ: 2 },
  xl: { width: 128, height: 128, cameraZ: 1.8 }
};

export const AvatarCanvas: React.FC<{
  size: keyof typeof sizeConfig;
  children: React.ReactNode;
  className?: string;
}> = ({ size, children, className }) => {
  const config = sizeConfig[size];
  
  return (
    <div 
      className={cn('relative rounded-full overflow-hidden', className)}
      style={{ width: config.width, height: config.height }}
    >
      <Canvas
        camera={{ position: [0, 0.3, config.cameraZ], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};
```

---

## Part 8: Integration with Existing System

### Replace StatusAvatar

**Modify: `src/components/ui/status-avatar.tsx`**

Add 3D mode while preserving 2D fallback:

```typescript
interface StatusAvatarProps {
  name: string;
  status?: AvatarStatus;
  size?: AvatarSize;
  // ... existing props
  use3D?: boolean;
  avatarConfig?: Avatar3DConfig;
}

export const StatusAvatar: React.FC<StatusAvatarProps> = ({
  use3D = false,
  avatarConfig,
  ...props
}) => {
  // If 3D mode enabled and config available, render 3D avatar
  if (use3D && avatarConfig) {
    return (
      <div className={cn('status-avatar relative inline-flex', props.className)}>
        <SimsAvatar
          config={avatarConfig}
          size={props.size}
          status={props.status}
          mood={/* derive from houseguest */}
          isPlayer={props.isPlayer}
          animated={props.animated}
        />
        {/* Keep existing badge/indicator overlays */}
        {props.showBadge && props.status !== 'none' && (
          <StatusBadge status={props.status} size={props.size} />
        )}
        {props.isPlayer && <PlayerIndicator size={props.size} />}
      </div>
    );
  }
  
  // Fall back to existing 2D implementation
  return <StatusAvatar2D {...props} />;
};
```

### Add avatarConfig to Houseguest Model

**Modify: `src/models/houseguest/types.ts`**

```typescript
export interface Houseguest {
  // ... existing properties
  avatarConfig?: Avatar3DConfig; // 3D avatar configuration
}
```

### Update Character Templates

**Modify: `src/data/character-templates.ts`**

Add 3D configs for existing templates:

```typescript
export interface CharacterTemplate {
  // ... existing properties
  avatar3DConfig: Avatar3DConfig;
}

export const characterTemplates: CharacterTemplate[] = [
  {
    id: 'alex-chen',
    name: 'Alex Chen',
    // ... existing
    avatar3DConfig: {
      bodyType: 'slim',
      height: 'average',
      skinTone: '#E8C4A0',
      headShape: 'oval',
      eyeShape: 'almond',
      eyeColor: '#3B2314',
      hairStyle: 'short',
      hairColor: '#1A1A1A',
      topStyle: 'blazer',
      topColor: '#2C3E50',
      bottomStyle: 'pants',
      bottomColor: '#1A1A1A'
    }
  },
  // ... other templates
];
```

---

## Part 9: Avatar Customization UI

**Create: `src/components/avatar-3d/AvatarCustomizer.tsx`**

Interactive 3D avatar editor for player creation:

```typescript
export const AvatarCustomizer: React.FC<{
  initialConfig?: Avatar3DConfig;
  onChange: (config: Avatar3DConfig) => void;
}> = ({ initialConfig, onChange }) => {
  const [config, setConfig] = useState(initialConfig || generateDefaultConfig());
  
  const updateConfig = (updates: Partial<Avatar3DConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Live 3D Preview */}
      <div className="flex justify-center">
        <div className="w-64 h-64 rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900">
          <SimsAvatar config={config} size="xl" animated />
        </div>
      </div>
      
      {/* Customization Controls */}
      <div className="space-y-6">
        {/* Body Type */}
        <div>
          <Label>Body Type</Label>
          <RadioGroup 
            value={config.bodyType}
            onValueChange={(v) => updateConfig({ bodyType: v as any })}
          >
            {['slim', 'average', 'athletic', 'stocky'].map(type => (
              <RadioGroupItem key={type} value={type}>{type}</RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
        
        {/* Skin Tone Picker */}
        <div>
          <Label>Skin Tone</Label>
          <ColorPalette 
            colors={SKIN_TONE_PALETTE}
            value={config.skinTone}
            onChange={(color) => updateConfig({ skinTone: color })}
          />
        </div>
        
        {/* Hair Style & Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Hair Style</Label>
            <Select value={config.hairStyle} onValueChange={(v) => updateConfig({ hairStyle: v as any })}>
              {HAIR_STYLES.map(style => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Label>Hair Color</Label>
            <ColorPalette 
              colors={HAIR_COLOR_PALETTE}
              value={config.hairColor}
              onChange={(color) => updateConfig({ hairColor: color })}
            />
          </div>
        </div>
        
        {/* Clothing */}
        {/* ... similar structure for clothing options */}
      </div>
    </div>
  );
};
```

---

## Part 10: Performance Optimizations

### Geometry Instancing
For houseguest list views with many avatars:

```typescript
// Use instanced meshes for shared geometries
const SharedBodyInstances = ({ houseguests, configs }) => {
  const bodyGeometry = useMemo(() => createBodyGeometry(), []);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    houseguests.forEach((hg, i) => {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(i * 0.5, 0, 0);
      instancedMeshRef.current?.setMatrixAt(i, matrix);
    });
    instancedMeshRef.current?.instanceMatrix.needsUpdate = true;
  }, [houseguests]);

  return (
    <instancedMesh ref={instancedMeshRef} args={[bodyGeometry, null, houseguests.length]}>
      <meshStandardMaterial />
    </instancedMesh>
  );
};
```

### Level of Detail (LOD)
Reduce polygon count for small avatars:

```typescript
// sm size: 16 segments, md: 24, lg: 32, xl: 48
const getSegments = (size: AvatarSize) => ({
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36
}[size]);
```

### Lazy Loading
Only load 3D canvas when avatar is in viewport:

```typescript
const LazyAvatar = ({ ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? <SimsAvatar {...props} /> : <AvatarPlaceholder {...props} />}
    </div>
  );
};
```

---

## Files Summary

### New Files (15)
| File | Purpose |
|------|---------|
| `src/models/avatar-config.ts` | 3D avatar configuration types |
| `src/components/avatar-3d/index.ts` | Module exports |
| `src/components/avatar-3d/SimsAvatar.tsx` | Main 3D avatar component |
| `src/components/avatar-3d/AvatarCanvas.tsx` | Canvas wrapper |
| `src/components/avatar-3d/AvatarBody.tsx` | Procedural body mesh |
| `src/components/avatar-3d/AvatarHead.tsx` | Head with expressions |
| `src/components/avatar-3d/AvatarHair.tsx` | Hair mesh variations |
| `src/components/avatar-3d/AvatarClothing.tsx` | Clothing rendering |
| `src/components/avatar-3d/AvatarAnimations.tsx` | Animation controller |
| `src/components/avatar-3d/AvatarCustomizer.tsx` | Customization UI |
| `src/components/avatar-3d/hooks/useIdleAnimation.ts` | Idle animation hook |
| `src/components/avatar-3d/hooks/useMoodAnimation.ts` | Mood animations |
| `src/components/avatar-3d/hooks/useStatusAnimation.ts` | Status animations |
| `src/components/avatar-3d/utils/avatar-generator.ts` | Procedural mesh utils |
| `src/components/avatar-3d/utils/color-palettes.ts` | Color presets |

### Modified Files (6)
| File | Changes |
|------|---------|
| `package.json` | Add three, @react-three/fiber, @react-three/drei |
| `src/components/ui/status-avatar.tsx` | Add 3D mode support |
| `src/models/houseguest/types.ts` | Add avatarConfig property |
| `src/data/character-templates.ts` | Add avatar3DConfig to templates |
| `src/components/game-setup/PlayerForm.tsx` | Integrate AvatarCustomizer |
| `src/components/game-setup/AvatarPreview.tsx` | Use 3D avatar in preview |

---

## Visual Preview

```text
+--------------------------------------------------+
|                  3D SIMS AVATAR                   |
|                                                  |
|              .-""""""""-.                        |
|             /   O    O   \     <- Blinking eyes  |
|            |      <>      |    <- Animated nose  |
|            |    \____/    |    <- Mood mouth     |
|             \            /                       |
|              '-........-'                        |
|                  |||                             |
|              .---|||---.     <- Breathing torso  |
|             /    |||    \                        |
|            |     |||     |                       |
|            |   /     \   |   <- Idle arm sway   |
|            |  /       \  |                       |
|             \/         \/                        |
|             ||         ||    <- Standing pose    |
|             ||         ||                        |
+--------------------------------------------------+
|  Animation: Idle breathing + blinking + sway     |
|  Status effects: HoH glow, Nominee nervous       |
+--------------------------------------------------+
```

---

## Implementation Order

1. **Phase 1: Dependencies & Base** (Foundation)
   - Install Three.js packages
   - Create avatar-config model
   - Set up AvatarCanvas wrapper

2. **Phase 2: Body Generation** (Core Rendering)
   - AvatarBody procedural mesh
   - AvatarHead with basic shapes
   - Simple static rendering

3. **Phase 3: Expressions & Animation** (Bring to Life)
   - Idle animation hook
   - Mood-based expressions
   - Status animations

4. **Phase 4: Customization** (Hair, Clothing)
   - AvatarHair variations
   - AvatarClothing rendering
   - Color palette system

5. **Phase 5: Integration** (Replace 2D)
   - Update StatusAvatar with 3D mode
   - Add avatarConfig to houseguest model
   - Update character templates

6. **Phase 6: Customizer UI** (Player Creation)
   - Interactive customization interface
   - Integrate with PlayerForm

7. **Phase 7: Performance** (Optimization)
   - Lazy loading
   - LOD system
   - Geometry instancing for lists

---

## Expected Behavior

1. **Idle State**: Avatars breathe subtly, blink every 3-5 seconds, sway slightly
2. **HoH Status**: Avatar has confident pose with subtle golden glow pulse
3. **Nominee Status**: Avatar looks nervous, fidgets, shifts weight
4. **PoV Status**: Avatar stands tall, alert posture
5. **Evicted Status**: Sad, slumped posture, desaturated colors
6. **Mood Happy**: Wide eyes, upturned mouth, bouncy
7. **Mood Angry**: Furrowed brows, downturned mouth, tense pose

---

## Technical Notes

### Why Procedural Instead of Pre-made Models?
- Infinite customization possibilities
- Smaller bundle size (no GLTF files)
- Consistent art style across all characters
- Easier to animate programmatically
- React-native Three.js patterns

### Performance Targets
- 60 FPS with 16 avatars visible
- < 5ms render time per avatar
- < 1MB additional bundle size

### Fallback Strategy
- 2D avatars remain as fallback
- `use3D` prop controls mode
- Can be disabled per-user for low-end devices
