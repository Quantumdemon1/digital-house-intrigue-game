
# Plan: Add House View to Social Interaction Phase

## Overview

Add the interactive 3D House View alongside the Social Phase UI, allowing players to see all houseguests in the Big Brother house environment while making social decisions. The House View will be displayed as a collapsible/toggleable panel next to (or above) the existing social interaction controls.

---

## Design Approach

### Layout Options

The Social Interaction Phase currently uses a single-column card layout. We'll add a **split-view layout** where:
- **Left/Top**: 3D House View showing all active houseguests
- **Right/Bottom**: Existing social interaction controls (actions, NPC feed, etc.)

On desktop: Side-by-side layout (House View left, Controls right)
On mobile: Stacked layout with collapsible House View

```text
┌─────────────────────────────────────────────────────────────┐
│                    SOCIAL PHASE - WEEK 3                     │
├───────────────────────────────┬─────────────────────────────┤
│                               │  📍 Current Location         │
│    🏠 THE BIG BROTHER HOUSE   │  ⚡ 3 Actions Remaining      │
│                               │                             │
│     ○  ○  ○     ← 3D View →   │  📣 NPC Activity Feed       │
│        ○     ○                │    • Alex talked to Morgan  │
│     ○          ○              │    • Casey proposed deal    │
│        ○  ○  ○                │                             │
│                               │  🎯 Available Actions       │
│   [Character Carousel]        │    Talk | Bond | Strategy   │
└───────────────────────────────┴─────────────────────────────┘
```

### Key Features

1. **Houseguest-to-CharacterTemplate Mapping**: Convert active `Houseguest` objects to `CharacterTemplate` format for HouseScene
2. **Visual Status Indicators**: Show HoH, nominees, PoV holder with visual badges in the 3D scene
3. **Interactive Selection**: Clicking a character in House View opens their interaction options
4. **Relationship Indicators**: Optional visual connection lines between allied houseguests
5. **Toggle View**: Button to show/hide House View for performance on lower-end devices

---

## Files to Create/Modify

### 1. Create `src/components/game-phases/social-interaction/HouseViewPanel.tsx`

New component that:
- Wraps HouseScene for use in social phase
- Converts active `Houseguest[]` to `CharacterTemplate[]` format
- Handles character selection to trigger social actions
- Shows character status overlays (HoH crown, nominee ring, etc.)
- Includes toggle button to collapse/expand

**Key mapping function:**
```typescript
const mapHouseguestToTemplate = (hg: Houseguest): CharacterTemplate => {
  const original = characterTemplates.find(t => t.id === hg.id) || characterTemplates.find(t => t.name === hg.name);
  
  return {
    id: hg.id,
    name: hg.name,
    age: hg.age,
    occupation: hg.occupation,
    hometown: hg.hometown,
    bio: hg.bio,
    imageUrl: hg.imageUrl || original?.imageUrl || '',
    traits: hg.traits,
    archetype: original?.archetype || 'underdog',
    tagline: getStatusTagline(hg), // "HoH", "Nominee", etc.
    avatar3DConfig: hg.avatarConfig || original?.avatar3DConfig
  };
};
```

### 2. Modify `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx`

Updates:
- Import and add HouseViewPanel component
- Add state for selected houseguest from House View
- Connect House View selection to social action dialogs
- Restructure layout to accommodate split view
- Add "View House" toggle button in header

**Layout change:**
```tsx
<div className="flex flex-col lg:flex-row gap-4">
  {/* House View (optional, collapsible) */}
  {showHouseView && (
    <div className="lg:w-1/2 xl:w-3/5 h-[400px] lg:h-auto">
      <HouseViewPanel
        houseguests={game.getActiveHouseguests()}
        selectedId={selectedHouseguest}
        onSelect={handleHouseSelect}
        hohId={game.hohWinner}
        nomineeIds={game.nominees}
        povHolderId={game.povWinner}
      />
    </div>
  )}
  
  {/* Existing social controls */}
  <div className={showHouseView ? 'lg:w-1/2 xl:w-2/5' : 'w-full'}>
    {/* Location, Actions, NPC Feed, etc. */}
  </div>
</div>
```

### 3. Create `src/components/game-phases/social-interaction/HouseViewToggle.tsx`

Simple toggle button component:
- Shows "🏠 Show House" / "📋 Hide House" 
- Saves preference to localStorage
- Animated transition

### 4. Modify `src/components/avatar-3d/HouseScene.tsx`

Minor updates to support game state display:
- Add optional `statusOverlay` prop for HoH/nominee badges
- Add `compact` mode prop for smaller embedded view
- Reduce default camera distance for embedded use

---

## Technical Details

### Houseguest to CharacterTemplate Conversion

The HouseScene expects `CharacterTemplate[]` with `avatar3DConfig.modelUrl` for 3D avatars. We need to:

1. Match houseguests to their original templates by ID or name
2. Fall back to the original template's 3D config if houseguest doesn't have one
3. Generate dynamic taglines based on game status (HoH, Nominee, etc.)

```typescript
const getStatusTagline = (hg: Houseguest): string => {
  if (hg.isHoH) return '👑 Head of Household';
  if (hg.isPovHolder) return '🏆 PoV Holder';
  if (hg.isNominated) return '⚠️ Nominated';
  if (hg.isPlayer) return '⭐ You';
  return hg.occupation; // Default fallback
};
```

### Selection Integration

When a character is selected in House View:
1. Update `selectedHouseguest` state
2. If clicking same character again, open their profile/action dialog
3. Pass selected houseguest to ActionSections for context-aware buttons

### Performance Considerations

- Make House View lazy-loaded to avoid impacting initial load
- Add toggle to hide House View (saves in localStorage)
- Use `React.memo` on HouseViewPanel
- Consider reduced avatar quality for embedded view

### Responsive Behavior

| Screen Size | Layout |
|-------------|--------|
| Mobile (<768px) | House View above controls, collapsible |
| Tablet (768-1024px) | Side-by-side, 50/50 split |
| Desktop (>1024px) | Side-by-side, 60/40 split (House larger) |

---

## Component Hierarchy

```text
SocialInteractionPhase
├── GameCard (container)
│   ├── GameCardHeader (with House toggle button)
│   └── GameCardContent
│       └── Split Layout
│           ├── HouseViewPanel (new)
│           │   ├── HouseScene
│           │   └── CharacterCarousel (simplified)
│           └── Controls Column
│               ├── LocationDisplay
│               ├── InteractionsCounter
│               ├── NPCActivityFeed
│               └── ActionSections
└── Dialogs (unchanged)
```

---

## Expected Result

After implementation:
- Social Phase displays the 3D House View with all active houseguests
- Characters show their game status (HoH crown, nominee glow, etc.)
- Clicking a character in the 3D view selects them for interaction
- Characters turn their heads toward the selected person
- Players can toggle House View off if preferred
- Layout adapts responsively to screen size
- Performance remains smooth with lazy loading
