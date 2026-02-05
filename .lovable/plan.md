
# Spring Physics & NPC Conversation Grouping Implementation

## Overview

This plan implements two interconnected improvements to the 3D avatar system:
1. **Spring Physics** - Adds follow-through motion for head, hands, and spine bones
2. **NPC Conversation Grouping** - Dynamically positions allied characters near each other

---

## Part 1: Spring Physics for Secondary Motion

### Current State
The spring physics system is **defined but not connected**:
- `springPhysics.ts` has `SpringConfig`, `Spring3DState`, `updateSpring3D` utilities
- `SPRING_CONFIGS` defines tuning for head, spine, hand, etc.
- `AnimationController.ts` does NOT use spring physics - it applies bone rotations directly

### Implementation Approach

Create a new **SecondaryMotionLayer** that wraps the final bone output and applies spring physics for natural follow-through:

```text
Layer Flow (Updated):
┌─────────────────────────┐
│ Final Bone Rotations    │ ← Blended from all layers
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Secondary Motion Layer  │ ← NEW: Spring physics applied
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Apply to Skeleton       │
└─────────────────────────┘
```

### Files to Create

**`src/components/avatar-3d/animation/physics/SecondaryMotionSystem.ts`**
- Spring state management for each tracked bone
- Per-bone spring configurations
- Function to apply spring filtering to final bone rotations

```typescript
interface SecondaryMotionState {
  head: Spring3DState;
  neck: Spring3DState;
  spine2: Spring3DState;
  leftHand: Spring3DState;
  rightHand: Spring3DState;
}

function createSecondaryMotionState(): SecondaryMotionState;
function updateSecondaryMotion(
  state: SecondaryMotionState,
  targetBones: BoneMap,
  deltaTime: number,
  enabled: boolean
): { bones: BoneMap; state: SecondaryMotionState };
```

### Files to Modify

**`src/components/avatar-3d/animation/AnimationController.ts`**
- Import secondary motion system
- Add `secondaryMotion: SecondaryMotionState` to `ControllerState`
- After blending layers, pass result through secondary motion filter
- Only apply when `qualityConfig.enablePhysics` is true (high quality)

**`src/components/avatar-3d/animation/types.ts`**
- Ensure `QualityConfig.enablePhysics` is properly utilized

### Spring Configuration

| Bone | Stiffness | Damping | Mass | Effect |
|------|-----------|---------|------|--------|
| Head | 0.25 | 0.75 | 0.4 | Subtle head lag and overshoot |
| Neck | 0.30 | 0.70 | 0.3 | Natural neck follow |
| Spine2 | 0.40 | 0.80 | 0.6 | Body momentum |
| LeftHand | 0.15 | 0.55 | 0.15 | Loose hand follow-through |
| RightHand | 0.15 | 0.55 | 0.15 | Loose hand follow-through |

### Expected Behavior
- When head turns to look at someone, it **overshoots slightly** then settles
- Hands continue moving briefly **after gesture ends**
- Body sways have natural **momentum and follow-through**
- Effect is subtle but adds significant realism

---

## Part 2: NPC Conversation Grouping

### Current State
- Characters are placed at **fixed positions** defined in `LIVING_ROOM_POSITIONS`
- `HouseScene.tsx` uses `getCharacterPositions(count)` to assign spots
- No awareness of alliances or relationships

### Implementation Approach

Create a **position calculation system** that groups allied characters together:

```text
Input: Characters + Alliance Data + Relationships
                    ▼
┌─────────────────────────────────┐
│ Calculate Alliance Groups       │
│ - Find active alliances         │
│ - Group characters by alliance  │
│ - Sort by relationship strength │
└───────────────┬─────────────────┘
                ▼
┌─────────────────────────────────┐
│ Assign Cluster Positions        │
│ - Allied groups get adjacent    │
│   positions in "conversation    │
│   circle" formations            │
│ - Unallied characters fill gaps │
└───────────────┬─────────────────┘
                ▼
┌─────────────────────────────────┐
│ Apply Social Facing Rotations   │
│ - Characters face inward toward │
│   their cluster center          │
└─────────────────────────────────┘
```

### Files to Create

**`src/components/avatar-3d/utils/conversationGrouping.ts`**
Core logic for grouping and positioning:

```typescript
interface CharacterGroup {
  characters: string[];  // Character IDs
  positions: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
}

function calculateConversationGroups(
  characterIds: string[],
  alliances: Alliance[],
  relationships: Map<string, Map<string, { score: number }>>,
  basePositions: Array<{ position: [number, number, number] }>
): Map<string, { position: [number, number, number]; rotation: [number, number, number] }>;
```

### Grouping Algorithm

1. **Identify alliance clusters**
   - Get all active alliances with 2+ members present
   - Sort alliances by size (larger groups get priority)

2. **Assign cluster positions**
   - Pick a "cluster center" position for each alliance
   - Place members in a semicircle around center, facing inward
   - Offset: ~1.2m between characters for personal space

3. **Handle non-allied characters**
   - Characters not in alliances get remaining positions
   - Pair high-relationship characters (score > 50) together
   - Enemies (score < -30) get distant positions

4. **Face toward group center**
   - Calculate rotation to face cluster midpoint
   - Allied characters subtly angle toward each other

### Visual Layout Example

```text
Before (Static):
  1  2  3  4     (arbitrary positions)
  5  6  7  8

After (Grouped):
  ╭───────────╮
  │ Alliance A │ ← Characters 2,4,6 face each other
  │  2   4    │
  │    6      │
  ╰───────────╯
       1 3      ← Non-allied fill remaining spots
  ╭───────────╮
  │ Alliance B │ ← Characters 5,7 face each other
  │  5   7    │
  ╰───────────╯
       8        ← Loner in corner
```

### Files to Modify

**`src/components/avatar-3d/HouseScene.tsx`**
- Import new grouping utilities
- Receive `alliances` and `relationships` as props
- Replace `getCharacterPositions` call with new grouped calculation
- Pass computed positions to `CharacterSpot` components

**`src/components/game-phases/social-interaction/HouseViewPanel.tsx`**
- Pass alliances from game state to HouseScene
- Extract relationship data from game context

### Props Changes

```typescript
interface HouseSceneProps {
  // ... existing props ...
  alliances?: Alliance[];  // NEW: For grouping
  relationships?: Map<string, Map<string, { score: number }>>;  // Enhanced type
}
```

---

## Implementation Order

### Phase 1: Spring Physics (Simpler, Self-Contained)
1. Create `SecondaryMotionSystem.ts`
2. Add state to AnimationController
3. Wire up spring filtering in animation loop
4. Test with high-quality preset

### Phase 2: Conversation Grouping
1. Create `conversationGrouping.ts` utilities
2. Update HouseViewPanel to pass alliance data
3. Update HouseScene to use grouped positions
4. Add facing rotation calculations

---

## Files Summary

### Create
| File | Purpose |
|------|---------|
| `src/components/avatar-3d/animation/physics/SecondaryMotionSystem.ts` | Spring physics for bones |
| `src/components/avatar-3d/utils/conversationGrouping.ts` | Alliance-based positioning |

### Modify
| File | Changes |
|------|---------|
| `AnimationController.ts` | Integrate secondary motion layer |
| `HouseScene.tsx` | Use grouped positions, accept alliance props |
| `HouseViewPanel.tsx` | Pass alliances and relationships |
| `animation/index.ts` | Export new physics module |

---

## Testing Checklist

### Spring Physics
- [ ] Head overshoots when turning to look at selected character
- [ ] Hands continue moving briefly after wave gesture ends
- [ ] Effect disabled on low/medium quality (performance)
- [ ] No jitter or instability at high frame rates

### Conversation Grouping
- [ ] Alliance members cluster together in scene
- [ ] Characters face toward their group
- [ ] Non-allied characters fill remaining positions
- [ ] Positions update when alliances change
