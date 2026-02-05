
# Plan: Expand Big Brother House with Ornate Multi-Room Layout

## Overview

Transform the current circular stage into a full Big Brother USA-style house with multiple distinct rooms, modern ornate furnishings, and the signature BB aesthetic with LED accents, glass walls, and technology-inspired design elements.

---

## Current State Analysis

The house currently consists of:
- A circular platform (radius 10) with a center BB logo
- Basic furniture: 2 couches, coffee table, plants, light fixtures
- TV entertainment area at the back
- Kitchen area on the right side
- Diary Room door on the left
- Wall panels for basic backdrop
- Characters arranged in a circle (radius 5)

---

## Proposed Room Layout

Expand to a rectangular house with distinct areas reflecting modern BB USA design:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKYARD/POOL AREA                          │
│                           (future phase)                            │
├──────────────────┬──────────────────┬───────────────────────────────┤
│                  │                  │                               │
│   🛏️ BEDROOM 1   │   🛏️ BEDROOM 2   │      👑 HOH SUITE             │
│   (Bunk beds)    │  (Have-Not?)     │   (Elevated platform)         │
│                  │                  │                               │
├──────────────────┴──────────────────┴───────────────────────────────┤
│                              HALLWAY                                │
├────────────────┬────────────────────────────────────┬───────────────┤
│                │                                    │               │
│  🚿 BATHROOM   │          LIVING ROOM               │   🍳 KITCHEN  │
│   (Vanity,     │    (Main gathering area)           │   (Island,    │
│    mirrors)    │    (Characters positioned here)    │    stools)    │
│                │                                    │               │
├────────────────┼────────────────────────────────────┼───────────────┤
│                │                                    │               │
│   🗣️ DIARY     │       LOUNGE / NOMINATION          │   🎮 GAME     │
│     ROOM       │           AREA                     │    ROOM       │
│                │                                    │               │
└────────────────┴────────────────────────────────────┴───────────────┘
```

---

## New Room Components to Create

### 1. Living Room (Expanded Center)
**The main character interaction area**

| Element | Description |
|---------|-------------|
| Sectional Sofa | Large L-shaped modern sectional with tufted cushions |
| Memory Wall | Photo frames for all houseguests with LED backlighting |
| LED Strip Accents | Ceiling coves with color-changing ambient lighting |
| Glass Coffee Table | Geometric modern design with chrome legs |
| Statement Chandelier | Modern crystal/LED hybrid fixture |
| Decorative Pillows | BB-themed accent colors (blue, gold, red) |

### 2. HOH Suite (Elevated Platform)
**The coveted Head of Household room**

| Element | Description |
|---------|-------------|
| Platform Base | Elevated 0.3m platform with LED edge lighting |
| King Bed | Luxurious bed with upholstered headboard |
| HOH Throne Chair | Ornate high-back chair |
| Mini Fridge | Stocked amenities area |
| Private TV | Personal entertainment screen |
| Gold Accents | Crown motifs and premium finishes |
| Sliding Glass Door | Frosted glass partition |

### 3. Bedrooms (2 rooms)
**Where houseguests sleep**

| Element | Description |
|---------|-------------|
| Bunk Beds | 4 bunks per room (8 sleeping spots each) |
| LED Under-Lighting | Purple/blue accent glow |
| Wardrobe Closets | Tall cabinets with mirrors |
| Nightstands | Modern floating designs |
| Have-Not Variant | One room with less comfortable beds |

### 4. Bathroom/Vanity Area
**Getting ready for eviction**

| Element | Description |
|---------|-------------|
| Vanity Counter | Long counter with Hollywood-style mirror lights |
| Mirrors | Large illuminated mirrors |
| Shower Stall | Frosted glass enclosure |
| Decorative Tiles | Geometric pattern floor |
| Modern Sinks | Vessel sinks with chrome fixtures |

### 5. Expanded Kitchen
**The gathering spot for late-night conversations**

| Element | Description |
|---------|-------------|
| Large Island | Extended counter with waterfall edge |
| Pendant Lights | 3-4 modern globe pendants |
| Refrigerator | Modern stainless steel double-door |
| Stove/Oven | Commercial-style range |
| Open Shelving | Displayed kitchenware |
| Breakfast Nook | Built-in bench seating |

### 6. Nomination/Lounge Area
**Where the dramatic ceremonies happen**

| Element | Description |
|---------|-------------|
| Nomination Box | Iconic BB key box/nomination display |
| Curved Seating | Semi-circular couch arrangement |
| Spotlight | Dramatic overhead lighting |
| BB Eye Display | Large illuminated logo |
| Glass Partition | Separates from main living area |

### 7. Game Room
**Competition preparation area**

| Element | Description |
|---------|-------------|
| Pool Table | Full-size with LED edge |
| Arcade Cabinet | Retro-styled game machine |
| Dart Board | With protective surround |
| Lounge Seating | Bean bags and gaming chairs |
| Neon Signs | BB-themed decorative signs |

### 8. Enhanced Diary Room
**Expanded from current door**

| Element | Description |
|---------|-------------|
| Interior View | Show inside the DR when camera zooms |
| Diary Chair | Iconic confession chair |
| Camera Array | Visible camera rig |
| Dramatic Lighting | Spotlight on chair |
| Sound Panels | Acoustic wall treatment |

---

## Architecture & Walls

### Wall System Components

| Component | Details |
|-----------|---------|
| Exterior Walls | 4m height, gradient dark blue to black |
| Interior Partitions | 3m height, frosted glass panels with chrome frames |
| LED Cove Lighting | Recessed ceiling strips (blue/amber programmable) |
| Doorways | Arched openings with metallic trim |
| Glass Walls | Strategic placement for open sightlines |
| Accent Panels | Geometric 3D wall art with BB motifs |

### Floor Design

| Area | Material |
|------|----------|
| Living Room | Dark polished concrete with inlaid BB logo |
| Kitchen | White marble tile pattern |
| Bedrooms | Dark hardwood planks |
| Bathroom | Geometric black/white tiles |
| HOH Suite | Plush carpet with gold trim |

---

## Technical Implementation

### File Changes

**1. `src/components/avatar-3d/HouseFurniture.tsx`**

Add new components:
- `SectionalSofa` - L-shaped modern couch
- `MemoryWall` - Photo display with LED frames
- `HOHBed` - Luxurious king bed
- `HOHPlatform` - Elevated room base
- `BunkBed` - Stackable bed unit
- `Vanity` - Bathroom counter with lights
- `ShowerStall` - Frosted glass enclosure
- `NominationPodium` - Ceremony display
- `PoolTable` - Game room centerpiece
- `ArcadeCabinet` - Decorative game machine
- `Refrigerator` - Kitchen appliance
- `KitchenIsland` - Extended counter
- `GlassWall` - Frosted partition
- `LEDCoveLighting` - Ambient accent lights
- `CrystalChandelier` - Statement lighting
- `NeonSign` - Decorative text signs

**2. `src/components/avatar-3d/HouseScene.tsx`**

Modifications:
- Expand floor from circular to rectangular
- Update character positioning to living room area
- Add room sections with proper placement
- Create room navigation system
- Update camera bounds for larger space
- Add room labels/overlays
- Implement dynamic lighting zones

**3. New file: `src/components/avatar-3d/HouseRooms.tsx`**

Create room presets:
```typescript
export const LivingRoom: React.FC<{ position: [number, number, number] }>
export const HOHSuite: React.FC<{ position: [number, number, number] }>
export const Bedroom: React.FC<{ position: [number, number, number]; variant: 'regular' | 'havenot' }>
export const BathroomArea: React.FC<{ position: [number, number, number] }>
export const NominationLounge: React.FC<{ position: [number, number, number] }>
export const GameRoom: React.FC<{ position: [number, number, number] }>
export const DiaryRoomInterior: React.FC<{ position: [number, number, number] }>
```

---

## Visual Styling (BB USA Aesthetic)

### Color Palette

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary Blue | BB Blue | `#3b82f6` |
| Accent Gold | Winner Gold | `#fbbf24` |
| Danger Red | Eviction Red | `#dc2626` |
| Safe Green | Safety | `#22c55e` |
| Dark Base | Walls/Floor | `#0f172a` |
| Chrome | Metal Accents | `#94a3b8` |
| Glass Tint | Partitions | `#1e40af` (20% opacity) |

### Material Themes

```typescript
// Luxury materials for HOH
const goldAccent = new THREE.MeshStandardMaterial({
  color: '#fbbf24',
  metalness: 0.9,
  roughness: 0.2,
  emissive: '#fbbf24',
  emissiveIntensity: 0.1
});

// Frosted glass for partitions
const frostedGlass = new THREE.MeshPhysicalMaterial({
  color: '#ffffff',
  transmission: 0.9,
  roughness: 0.1,
  ior: 1.5,
  thickness: 0.5
});

// Velvet upholstery
const velvetFabric = new THREE.MeshStandardMaterial({
  color: '#1e3a5f',
  roughness: 0.95,
  metalness: 0
});
```

---

## Layout Dimensions

| Area | Size (meters) | Position |
|------|---------------|----------|
| Total House | 30 x 25 | Centered |
| Living Room | 12 x 10 | Center |
| HOH Suite | 8 x 8 | Top right (+10, 0, -10) |
| Bedroom 1 | 8 x 6 | Top left (-10, 0, -10) |
| Bedroom 2 | 8 x 6 | Top center (0, 0, -10) |
| Kitchen | 8 x 8 | Right (+12, 0, 0) |
| Bathroom | 6 x 5 | Left (-12, 0, 3) |
| Nomination | 10 x 6 | Front center (0, 0, 10) |
| Diary Room | 4 x 4 | Left (-12, 0, -3) |
| Game Room | 6 x 6 | Right (+12, 0, 8) |

---

## Character Positioning Update

Move characters from circular to living room groupings:

```typescript
// Living room conversation clusters
const LIVING_ROOM_POSITIONS = [
  // Main sofa group
  { position: [-3, 0, 0], rotation: [0, Math.PI/4, 0] },
  { position: [-1, 0, 1], rotation: [0, Math.PI/6, 0] },
  { position: [1, 0, 1], rotation: [0, -Math.PI/6, 0] },
  { position: [3, 0, 0], rotation: [0, -Math.PI/4, 0] },
  // Kitchen area
  { position: [8, 0, 0], rotation: [0, -Math.PI/2, 0] },
  { position: [8, 0, 2], rotation: [0, -Math.PI/3, 0] },
  // Lounge area
  { position: [-2, 0, 6], rotation: [0, Math.PI, 0] },
  { position: [0, 0, 7], rotation: [0, Math.PI, 0] },
  { position: [2, 0, 6], rotation: [0, Math.PI, 0] },
  // Standing by memory wall
  { position: [-6, 0, -3], rotation: [0, Math.PI/2, 0] },
  { position: [-6, 0, -1], rotation: [0, Math.PI/2, 0] },
  { position: [-6, 0, 1], rotation: [0, Math.PI/2, 0] },
];
```

---

## Lighting Design

### Zone-Based Lighting

| Zone | Primary Light | Accent | Mood |
|------|--------------|--------|------|
| Living Room | Chandelier (warm white) | Blue LED strips | Social |
| HOH Suite | Recessed spots | Gold accent LEDs | Luxurious |
| Bedrooms | Soft overhead | Purple under-bed | Intimate |
| Kitchen | Bright pendants | White LED | Functional |
| Nomination | Dramatic spot | Red accent | Tense |
| Bathroom | Hollywood bulbs | White | Glam |

---

## Expected Results

After implementation:
- House expands from ~20m to ~30m diameter
- 7+ distinct room areas with unique furnishings
- Modern BB USA aesthetic with glass, chrome, and LED accents
- Characters naturally positioned in living room clusters
- HOH suite elevated and visually distinct
- Memory wall showcasing all houseguests
- Nomination area with dramatic ceremony staging
- Improved lighting with zone-based ambiance
- Game room and bathroom add immersive detail
- Camera can explore full house layout
