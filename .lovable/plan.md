
# Plan: Separate Circular (Selection) and Expanded (In-Game) House Layouts

## Overview

Create two distinct 3D house environments:
1. **CircularHouseScene** - Original circular platform layout for character selection (simpler, focused on avatar showcase)
2. **ExpandedHouseScene** - Full multi-room Big Brother house for in-game exploration (accessible via "House" button)

Additionally, add a "House" button in the game header near "Social" that opens a fullscreen 3D house view.

---

## Architecture

```text
Character Selection (AvatarSelector)     In-Game (GameScreen)
           │                                      │
           ▼                                      ▼
   ┌─────────────────┐              ┌─────────────────────────┐
   │ CircularHouseScene │              │   GameHeader            │
   │  - Circular floor  │              │   [Social] [🏠 House]   │
   │  - Simple furniture│              └───────────┬─────────────┘
   │  - Character ring  │                          │
   └─────────────────┘                          │
                                                   ▼
                                      ┌─────────────────────────┐
                                      │   HouseViewDialog       │
                                      │   (Fullscreen 3D)       │
                                      │                         │
                                      │   ExpandedHouseScene    │
                                      │   - Multi-room layout   │
                                      │   - All rooms furnished │
                                      │   - Character clusters  │
                                      └─────────────────────────┘
```

---

## Files to Create

### 1. `src/components/avatar-3d/CircularHouseScene.tsx`

A new component that preserves the **original circular stage layout** for character selection.

**Key features:**
- Circular floor from original `HouseFloor` component
- Characters arranged in a circle (radius 5)
- Simple furniture: 2 couches, coffee table, plants, TV stand, kitchen area
- Diary Room door as backdrop
- No room walls or partitions
- Optimized for quick loading and avatar showcase

**Character positioning (circular):**
```typescript
const getCirclePositions = (count: number) => {
  const radius = 5;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      rotation: [0, -angle + Math.PI, 0],
      angle
    };
  });
};
```

### 2. `src/components/game-screen/HouseViewDialog.tsx`

A fullscreen dialog that displays the expanded 3D house with all active houseguests.

**Features:**
- Opens when clicking "House" button in header
- Full viewport 3D canvas
- Converts `gameState.houseguests` to `CharacterTemplate[]`
- Shows character status (HoH crown, nominee indicators)
- Close button to return to game
- Integrates existing `HouseScene` (expanded layout)

### 3. `src/components/game-screen/HouseViewButton.tsx`

Header button component to open the House View dialog.

**Design (matching Social button):**
```tsx
<Button variant="ghost" size="sm" onClick={onOpenHouseView}>
  <Home className="h-4 w-4" />
  <span className="hidden sm:inline">House</span>
</Button>
```

---

## Files to Modify

### 1. `src/components/avatar-3d/HouseScene.tsx`

**Rename internal logic to clarify it's the expanded version:**
- Keep as `HouseScene` (exported name unchanged for compatibility)
- Ensure it uses `LIVING_ROOM_POSITIONS` (social clusters)
- Uses `ExpandedHouseFloor`, `HouseWalls`, `InteriorWalls`
- Imports room components from `HouseRooms.tsx`

**No major changes needed** - this file already has the expanded layout.

### 2. `src/components/game-setup/AvatarSelector.tsx`

**Update imports to use CircularHouseScene:**
```typescript
// Before
import { HouseScene, CharacterCarousel } from '@/components/avatar-3d';

// After
import { CircularHouseScene, CharacterCarousel } from '@/components/avatar-3d';
```

**Update usage:**
```tsx
// In house view mode, use circular layout
<CircularHouseScene
  characters={characterTemplates}
  selectedId={selectedTemplate?.id || null}
  onSelect={handleHouseSelect}
/>
```

### 3. `src/components/avatar-3d/index.ts`

**Export the new circular scene:**
```typescript
export { CircularHouseScene } from './CircularHouseScene';
export { HouseScene } from './HouseScene'; // Expanded version (unchanged)
```

### 4. `src/components/game-screen/GameHeader.tsx`

**Add House button next to Social:**
```tsx
import { Network, Home } from 'lucide-react';

interface GameHeaderProps {
  onShowSocialNetwork?: () => void;
  onShowHouseView?: () => void;  // NEW
}

// In JSX:
<div className="flex items-center gap-1 sm:gap-2">
  {onShowHouseView && (
    <Button variant="ghost" size="sm" onClick={onShowHouseView}>
      <Home className="h-4 w-4" />
      <span className="hidden sm:inline">House</span>
    </Button>
  )}
  {onShowSocialNetwork && (
    <Button variant="ghost" size="sm" onClick={onShowSocialNetwork}>
      <Network className="h-4 w-4" />
      <span className="hidden sm:inline">Social</span>
    </Button>
  )}
  <SettingsDialog />
  <ProfileButton />
</div>
```

### 5. `src/components/game-screen/GameScreen.tsx`

**Add House View state and dialog:**
```typescript
import HouseViewDialog from './HouseViewDialog';

const GameScreen: React.FC = () => {
  const [showSocialNetwork, setShowSocialNetwork] = useState(false);
  const [showHouseView, setShowHouseView] = useState(false);  // NEW
  
  // ...
  
  return (
    <>
      {/* ... existing content ... */}
      
      <GameHeader 
        onShowSocialNetwork={canShowSocial ? () => setShowSocialNetwork(true) : undefined}
        onShowHouseView={canShowSocial ? () => setShowHouseView(true) : undefined}
      />
      
      {/* ... */}
      
      {/* House View Dialog */}
      <HouseViewDialog
        open={showHouseView}
        onOpenChange={setShowHouseView}
      />
    </>
  );
};
```

### 6. `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx`

**Keep existing HouseViewPanel integration** - no changes needed. The inline toggle for House View in Social Phase remains functional alongside the new header button which opens a fullscreen dialog.

---

## Technical Details

### CircularHouseScene - Scene Content

```typescript
// Circular positions for character showcase
const CIRCLE_RADIUS = 5;
const getCirclePositions = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      position: [
        Math.cos(angle) * CIRCLE_RADIUS,
        0,
        Math.sin(angle) * CIRCLE_RADIUS
      ] as [number, number, number],
      rotation: [0, -angle + Math.PI, 0] as [number, number, number],
      angle
    };
  });
};
```

### CircularHouseScene - Simple Furniture Layout

```typescript
// Minimal furniture for selection scene
<HouseFloor />  // Original circular floor from HouseFurniture.tsx
<Couch position={[-5, 0, -4]} rotation={[0, Math.PI / 4, 0]} />
<Couch position={[5, 0, -4]} rotation={[0, -Math.PI / 4, 0]} />
<CoffeeTable position={[0, 0, -3]} />
<TVStand position={[0, 0, -7]} />
<KitchenArea position={[6, 0, 2]} />
<DiaryRoomDoor position={[-7, 0, 0]} />
<Plant position={[-4, 0, 3]} />
<Plant position={[4, 0, 3]} />
<LightFixture position={[0, 4, 0]} />
```

### HouseViewDialog - Houseguest Mapping

```typescript
// Convert active houseguests to CharacterTemplate format
const mapHouseguestToCharacter = (hg: Houseguest): CharacterTemplate => {
  const original = characterTemplates.find(t => t.id === hg.id);
  return {
    id: hg.id,
    name: hg.name,
    // ... other fields
    tagline: getStatusTagline(hg),  // "👑 HoH", "⚠️ Nominated", etc.
    avatar3DConfig: hg.avatarConfig || original?.avatar3DConfig
  };
};
```

---

## Component Relationships

```text
Before:
  AvatarSelector ───uses───► HouseScene (expanded)
  SocialInteractionPhase ──► HouseViewPanel ──► HouseScene (expanded)
  GameHeader ──► [Social button only]

After:
  AvatarSelector ───uses───► CircularHouseScene (simple circular)
  SocialInteractionPhase ──► HouseViewPanel ──► HouseScene (expanded inline)
  GameScreen ──► HouseViewDialog ──► HouseScene (expanded fullscreen)
  GameHeader ──► [House button] + [Social button]
```

---

## UI Layout

### Header Button Placement (matching screenshot)

```text
┌────────────────────────────────────────────────────────────────────────┐
│  DIGITAL HOUSE INTRIGUE  │  WEEK 1              🏠 House  👥 Social ⚙️ │
├────────────────────────────────────────────────────────────────────────┤
│  [HOH] ─── [NOMS] ─── [POV PICK] ─── [POV] ─── [VETO] ─── [EVICT]     │
└────────────────────────────────────────────────────────────────────────┘
```

### HouseViewDialog Layout

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕  THE BIG BROTHER HOUSE                                    [Close]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                     ┌─────────────────────────────┐                     │
│                     │      3D HOUSE SCENE         │                     │
│                     │   (Full expanded layout)    │                     │
│                     │                             │                     │
│                     │   Characters in clusters    │                     │
│                     │   All rooms visible         │                     │
│                     │   Orbit controls enabled    │                     │
│                     │                             │                     │
│                     └─────────────────────────────┘                     │
│                                                                         │
│              [Character Carousel - Bottom Navigation]                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Expected Results

After implementation:
- **Character Selection** uses the original circular stage layout
- **In-Game Header** has a new "House" button next to "Social"  
- **House View Dialog** opens fullscreen with expanded multi-room layout
- **Social Phase** retains its inline House View toggle (split layout)
- Both scenes work independently with appropriate character positioning
- Performance optimized: circular scene loads faster for selection
- Consistent navigation between 2D game UI and 3D house exploration
