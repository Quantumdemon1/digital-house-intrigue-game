

# Plan: Enhanced Character Avatar Poses, Look-At Logic & Future Improvements

## Overview

This plan introduces three major enhancements to make the House Scene avatars more lifelike and varied:
1. **Pose Variety System** - Different poses per character (standing, arms crossed, hands on hips, sitting)
2. **Look-At System** - Characters dynamically look at the selected character or camera
3. **Brainstormed Future Improvements** - Additional ideas for even more immersive avatars

---

## 1. Pose Variety System

### Current State
All characters use the same `IDLE_POSE` in `useIdlePose.ts` - arms relaxed at sides with subtle sway.

### Enhanced System: Per-Character Pose Types

Create a pose assignment system that varies poses based on character personality or archetype:

| Pose Type | Bone Rotations | Best For |
|-----------|----------------|----------|
| `relaxed` | Arms down, natural stance | Underdogs, Socialites |
| `crossed-arms` | Arms folded across chest | Strategists, Competitors |
| `hands-on-hips` | Hands resting on hips | Wildcards, Confident types |
| `thinking` | One hand to chin | Strategists, Analytical |
| `casual-lean` | Weight shifted to one leg | Socialites, Relaxed types |

### Pose Rotation Values

```text
CROSSED_ARMS Pose:
├── LeftArm:     Z: 0.6,  X: 0.8   (arm across body)
├── RightArm:    Z: -0.6, X: 0.8   (arm across body)
├── LeftForeArm: Z: 1.8            (forearm bent up)
├── RightForeArm: Z: -1.8          (forearm bent up)
└── Subtle animation: Arms shift slightly

HANDS_ON_HIPS Pose:
├── LeftArm:     Z: 0.8,  X: 0.2   (elbow out)
├── RightArm:    Z: -0.8, X: 0.2   (elbow out)
├── LeftForeArm: Z: 1.5, Y: -0.3   (hand towards hip)
├── RightForeArm: Z: -1.5, Y: 0.3  (hand towards hip)
└── Subtle animation: Weight shift side-to-side

THINKING Pose:
├── LeftArm:     Same as relaxed
├── RightArm:    Z: -0.2, X: 1.0   (arm raised)
├── RightForeArm: Z: -2.0          (hand to chin)
├── Head:        X: -0.1, Z: 0.05  (head tilted, looking thoughtful)
└── Subtle animation: Head sway as if contemplating
```

### Archetype-to-Pose Mapping

```typescript
const ARCHETYPE_POSES: Record<Archetype, PoseType[]> = {
  strategist: ['crossed-arms', 'thinking'],
  competitor: ['hands-on-hips', 'crossed-arms'],
  socialite: ['relaxed', 'casual-lean'],
  wildcard: ['hands-on-hips', 'relaxed'],
  underdog: ['relaxed', 'thinking'],
};

// Assign pose based on character index for variety
const getPoseForCharacter = (archetype: Archetype, index: number): PoseType => {
  const poses = ARCHETYPE_POSES[archetype];
  return poses[index % poses.length];
};
```

---

## 2. Look-At System (Bone-Based Head Tracking)

### Behavior

When a character is selected:
- **Non-selected characters** turn their heads toward the selected character
- When **no one is selected**, all characters look toward the camera
- Smooth interpolation for natural head movement
- Respect pose limits (don't over-rotate)

### Technical Approach

**New Hook: `useLookAt.ts`**

```typescript
interface LookAtConfig {
  targetPosition: THREE.Vector3 | null;  // Selected char or camera
  characterPosition: [number, number, number];
  maxHeadRotationY: number;  // Limit: ~60 degrees (1.04 rad)
  maxHeadRotationX: number;  // Limit: ~30 degrees (0.52 rad)
  lerpSpeed: number;         // Smooth transition speed
}

const useLookAt = (
  scene: THREE.Object3D | null,
  config: LookAtConfig
) => {
  const headBone = useRef<THREE.Bone | null>(null);
  const neckBone = useRef<THREE.Bone | null>(null);
  
  // Find Head and Neck bones
  useEffect(() => {
    if (!scene) return;
    headBone.current = findBone(scene, 'Head');
    neckBone.current = findBone(scene, 'Neck');
  }, [scene]);
  
  useFrame(() => {
    if (!headBone.current || !config.targetPosition) return;
    
    // Calculate direction to target
    const charPos = new THREE.Vector3(...config.characterPosition);
    const direction = config.targetPosition.clone().sub(charPos);
    
    // Convert to local head rotation
    const targetRotY = Math.atan2(direction.x, direction.z);
    const targetRotX = Math.atan2(-direction.y, direction.length());
    
    // Clamp to limits
    const clampedY = THREE.MathUtils.clamp(targetRotY, -config.maxHeadRotationY, config.maxHeadRotationY);
    const clampedX = THREE.MathUtils.clamp(targetRotX, -config.maxHeadRotationX, config.maxHeadRotationX);
    
    // Smoothly interpolate
    headBone.current.rotation.y = THREE.MathUtils.lerp(
      headBone.current.rotation.y,
      clampedY * 0.7,  // Head takes 70% of rotation
      config.lerpSpeed
    );
    neckBone.current?.rotation.y = THREE.MathUtils.lerp(
      neckBone.current.rotation.y,
      clampedY * 0.3,  // Neck takes 30%
      config.lerpSpeed
    );
  });
};
```

### Integration in HouseScene

```typescript
// In CharacterSpot component:
const lookAtTarget = useMemo(() => {
  if (selectedId === template.id) {
    // Selected character looks at camera
    return camera.position.clone();
  } else if (selectedId && selectedPosition) {
    // Other characters look at selected character
    return new THREE.Vector3(...selectedPosition);
  }
  // Default: slight variation, mostly forward
  return null;
}, [selectedId, selectedPosition, camera]);

// Pass to RPMAvatar via new prop
<RPMAvatar
  modelSrc={modelUrl}
  lookAtTarget={lookAtTarget}
  ...
/>
```

---

## 3. File Changes

### Create `src/components/avatar-3d/hooks/usePoseVariety.ts`

New hook that:
- Defines multiple pose configurations (relaxed, crossed-arms, hands-on-hips, thinking)
- Accepts a `poseType` parameter
- Applies the initial bone rotations
- Runs pose-specific subtle animations

### Create `src/components/avatar-3d/hooks/useLookAt.ts`

New hook that:
- Finds Head and Neck bones
- Calculates direction to target (selected character or camera)
- Applies clamped, smooth rotations
- Blends naturally with existing animations

### Modify `src/components/avatar-3d/RPMAvatar.tsx`

- Add `poseType?: PoseType` prop (default: 'relaxed')
- Add `lookAtTarget?: THREE.Vector3` prop
- Integrate `usePoseVariety` and `useLookAt` hooks
- Keep backward compatibility (existing behavior when props not provided)

### Modify `src/components/avatar-3d/HouseScene.tsx`

- Calculate look-at targets for each character
- Pass `lookAtTarget` and `poseType` to RPMAvatar
- Map character archetype to appropriate pose type
- Pass camera position for characters to look at when selected

---

## 4. Brainstormed Future Improvements

### Implemented in This Phase
1. Pose variety (crossed arms, hands on hips, thinking)
2. Dynamic head look-at toward selected character/camera

### Future Enhancement Ideas

| Category | Enhancement | Description |
|----------|-------------|-------------|
| **Expressions** | Mood-reactive expressions | Change facial expression when another character is selected (curious, jealous, supportive) |
| **Interactions** | Social reactions | Characters near selected one lean in or react |
| **Animations** | Gesture library | Occasional gestures (wave, nod, shrug) on events |
| **Positioning** | Dynamic clustering | Characters form groups based on alliances |
| **Audio** | Lip sync mumble | Subtle mouth movement with ambient audio |
| **Eye Tracking** | Eye bone targeting | Eyes track independently of head for more realism |
| **Body Language** | Personality-based stance | Nervous characters fidget more, confident ones stand taller |
| **Props** | Character accessories | Coffee cups, phones, or items based on occupation |
| **Lighting** | Character spotlight | Subtle rim light on selected character |
| **VFX** | Aura/mood particles | Subtle particles around characters based on mood |

### Priority Recommendations for Next Phase
1. **Eye tracking** - Eyes are the first thing we look at; independent eye movement is high impact
2. **Mood-reactive expressions** - Connects game state to visual feedback
3. **Gesture library** - Occasional animations add life without being distracting

---

## Technical Implementation Details

### Pose Types Enum

```typescript
type PoseType = 
  | 'relaxed'       // Current default - arms at sides
  | 'crossed-arms'  // Arms folded across chest
  | 'hands-on-hips' // Confident power pose
  | 'thinking'      // One hand to chin
  | 'casual-lean';  // Weight on one leg, relaxed
```

### Pose Bone Configurations

```typescript
const POSE_CONFIGS: Record<PoseType, PoseBoneRotations> = {
  relaxed: {
    LeftArm: { x: 0.1, y: 0, z: 1.2 },
    RightArm: { x: 0.1, y: 0, z: -1.2 },
    // ... current idle pose
  },
  'crossed-arms': {
    LeftArm: { x: 0.8, y: 0.2, z: 0.5 },
    RightArm: { x: 0.8, y: -0.2, z: -0.5 },
    LeftForeArm: { x: 0, y: 0.4, z: 1.7 },
    RightForeArm: { x: 0, y: -0.4, z: -1.7 },
    LeftHand: { x: 0, y: -0.3, z: 0 },
    RightHand: { x: 0, y: 0.3, z: 0 },
    Spine: { x: -0.03, y: 0, z: 0 },  // Slight lean back
  },
  'hands-on-hips': {
    LeftArm: { x: 0.15, y: -0.2, z: 0.7 },
    RightArm: { x: 0.15, y: 0.2, z: -0.7 },
    LeftForeArm: { x: 0, y: 0.5, z: 1.4 },
    RightForeArm: { x: 0, y: -0.5, z: -1.4 },
    Spine: { x: -0.02, y: 0, z: 0 },
    Hips: { x: 0, y: 0, z: 0.03 },  // Slight hip shift
  },
  thinking: {
    LeftArm: { x: 0.1, y: 0, z: 1.2 },  // Left arm relaxed
    RightArm: { x: 0.9, y: 0, z: -0.2 },  // Right arm up
    RightForeArm: { x: 0, y: 0, z: -2.0 },  // Hand to chin
    RightHand: { x: -0.3, y: 0, z: 0 },
    Head: { x: -0.08, y: 0, z: 0.04 },  // Head tilted thoughtfully
    Spine: { x: -0.02, y: 0.02, z: 0 },
  },
  'casual-lean': {
    LeftArm: { x: 0.1, y: 0, z: 1.3 },
    RightArm: { x: 0.1, y: 0, z: -1.1 },
    Hips: { x: 0, y: 0, z: 0.04 },  // Weight to one side
    LeftUpLeg: { x: 0, y: 0, z: 0.05 },  // Leg out slightly
    Spine: { x: -0.01, y: 0.02, z: 0.02 },  // Slight lean
  },
};
```

### Animation Variations Per Pose

Each pose type has unique subtle animations:
- **Crossed-arms**: Gentle tightening/loosening of arm grip
- **Hands-on-hips**: Hip sway side-to-side
- **Thinking**: Occasional head tilt, finger tap
- **Casual-lean**: Weight shift between legs

---

## Expected Results

After implementation:
- Characters have visually distinct poses based on personality
- When you click a character, others turn their heads to look at them
- Clicking away, characters return to looking at camera/forward
- The scene feels alive with natural variety and social awareness
- Performance remains smooth (bone rotations are cheap operations)

