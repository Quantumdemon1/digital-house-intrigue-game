
# Plan: Alliances Social Network Feature

## Overview

Create an interactive "Social" feature that allows players to visualize and track their connections with other houseguests in a social network graph. Inspired by the Survivor reference image, this feature will display houseguest avatars connected by relationship lines, with color-coded connections (green for friendship, red for enmity, yellow for neutral) and line thickness indicating relationship strength. Players can manually adjust their perceived connections, but this won't affect NPC views.

---

## Part 1: Social Network Visualization Component

### New File: `src/components/social-network/SocialNetworkGraph.tsx`

Create an interactive SVG-based social network visualization:

**Visual Elements:**
- Circular layout with player ("YOU") positioned prominently on the left
- Houseguest avatars in circular frames with metallic borders (similar to Survivor reference)
- Connection lines between all houseguests using SVG paths
- Line colors: Green (friendship 50+), Yellow/Neutral (0 to 50), Red (enmity, negative)
- Line thickness: Thin (weak), Medium (moderate), Thick (strong)
- Click on houseguest to see details or edit perception

**Layout Algorithm:**
- Player avatar larger and highlighted with "YOU" label
- Other houseguests arranged in a circular or force-directed pattern
- Smooth animations when updating connections

```typescript
interface SocialNetworkGraphProps {
  houseguests: Houseguest[];
  playerId: string;
  relationships: Map<string, Map<string, Relationship>>;
  playerPerceptions?: PlayerPerceptions; // Custom player notes
  alliances: Alliance[];
  onHouseguestClick?: (houseguest: Houseguest) => void;
  onEditPerception?: (houseguestId: string) => void;
}
```

---

## Part 2: Player Perception System

### New File: `src/models/player-perception.ts`

Create a model for player's personal tracking that doesn't affect NPC behavior:

```typescript
interface PlayerPerception {
  houseguestId: string;
  customRelationshipLevel: 'ally' | 'friend' | 'neutral' | 'rival' | 'enemy' | null;
  inMyAlliance: boolean;           // Player's own alliance tracking
  notes: string;                   // Custom notes
  trustLevel: number;              // 1-5 scale for trust
  threatLevel: number;             // 1-5 scale for perceived threat
  lastUpdated: number;             // Timestamp
}

interface PlayerPerceptions {
  perceptions: Map<string, PlayerPerception>;
  customAlliances: CustomAlliance[];
}

interface CustomAlliance {
  id: string;
  name: string;
  memberIds: string[];
  color: string;                   // For visual grouping on graph
  createdAt: number;
}
```

---

## Part 3: Perception Editor Dialog

### New File: `src/components/social-network/PerceptionEditorDialog.tsx`

Dialog for editing player's perception of a houseguest:

```
+------------------------------------------+
|  Edit Your View: [Houseguest Name]       |
+------------------------------------------+
|  [Avatar]  Morgan Lee                    |
|            Personal Trainer, 26          |
+------------------------------------------+
|                                          |
|  How do you see them?                    |
|  [Ally] [Friend] [Neutral] [Rival] [Enemy]|
|                                          |
|  Threat Level:  [1] [2] [3] [4] [5]      |
|                                          |
|  Trust Level:   [1] [2] [3] [4] [5]      |
|                                          |
|  Your Notes:                             |
|  +------------------------------------+  |
|  | They seem loyal but watch out for |  |
|  | their competitive nature...       |  |
|  +------------------------------------+  |
|                                          |
|  Add to Alliance: [Select Alliance v]    |
|                                          |
|  [Cancel]              [Save Perception] |
+------------------------------------------+
```

---

## Part 4: Custom Alliance Creator

### New File: `src/components/social-network/CustomAllianceDialog.tsx`

Allow players to create their own alliance groupings for visualization:

**Features:**
- Name your alliance
- Select members from active houseguests
- Choose a color for visual distinction
- These are player-only notes, not affecting game mechanics

```typescript
interface CustomAllianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAlliance?: CustomAlliance;
  houseguests: Houseguest[];
  onSave: (alliance: CustomAlliance) => void;
  onDelete?: (id: string) => void;
}
```

---

## Part 5: Social Network Screen Component

### New File: `src/components/social-network/SocialNetworkScreen.tsx`

Full-screen or dialog view for the social network:

**Layout:**
```
+------------------------------------------------------------------+
|  SOCIAL NETWORK                                    [Close] [?]   |
+------------------------------------------------------------------+
|                                                                  |
|  Legend:                                                         |
|  [===] Strong  [==] Medium  [=] Weak                            |
|  [Green] Friendship  [Yellow] Neutral  [Red] Enmity             |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|                     [Social Network Graph SVG]                   |
|                                                                  |
|       Shows all houseguests with relationship lines              |
|       Alliance groupings shown as colored circles                |
|       Click any avatar to edit your perception                   |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  Your Alliances:   [+ New Alliance]                             |
|  [The Core Four] [Final 3 Deal]                                 |
|                                                                  |
|  [View: All | Alliances Only | Your Connections]                |
+------------------------------------------------------------------+
```

---

## Part 6: Integration with Game UI

### Modify: `src/components/game-screen/GameHeader.tsx`

Add a "Social" button to access the network:

```typescript
// Add Users icon button
<Button onClick={() => setShowSocialNetwork(true)}>
  <Users className="h-4 w-4" />
  Social
</Button>
```

### Modify: `src/components/game-screen/GameScreen.tsx`

Add state and dialog for social network:

```typescript
const [showSocialNetwork, setShowSocialNetwork] = useState(false);

// Include SocialNetworkDialog component
<SocialNetworkDialog 
  open={showSocialNetwork}
  onOpenChange={setShowSocialNetwork}
/>
```

### Modify: `src/components/game-screen/GameSidebar.tsx`

Add a tab or quick-access for the social network alongside Houseguests and Log.

---

## Part 7: Persistence in Game State

### Modify: `src/models/game-state.ts`

Add player perceptions to game state:

```typescript
interface GameState {
  // ... existing fields
  playerPerceptions?: {
    perceptions: Record<string, PlayerPerception>;
    customAlliances: CustomAlliance[];
  };
}
```

### Modify: `src/contexts/reducers/game-reducer.ts`

Add actions for perception management:

```typescript
case 'UPDATE_PLAYER_PERCEPTION':
  // Update a single perception
  
case 'CREATE_CUSTOM_ALLIANCE':
  // Create player's custom alliance
  
case 'UPDATE_CUSTOM_ALLIANCE':
  // Update alliance members/name
  
case 'DELETE_CUSTOM_ALLIANCE':
  // Remove custom alliance
```

---

## Part 8: Graph Connection Logic

### New File: `src/components/social-network/utils/graph-layout.ts`

Utility functions for calculating graph layout:

```typescript
// Calculate positions for circular layout
function calculateCircularLayout(
  houseguests: Houseguest[],
  playerId: string,
  containerSize: { width: number; height: number }
): Map<string, { x: number; y: number }>

// Calculate connection line style based on relationship
function getConnectionStyle(
  score: number
): { color: string; width: number; opacity: number }

// Get alliance circle bounds for visual grouping
function calculateAllianceCircles(
  alliances: Alliance[],
  positions: Map<string, { x: number; y: number }>
): AllianceCircle[]
```

### New File: `src/components/social-network/utils/connection-renderer.ts`

SVG path generation for curved connection lines:

```typescript
// Generate curved path between two points
function generateConnectionPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curvature: number
): string

// Generate alliance enclosure path
function generateAllianceEnclosure(
  memberPositions: { x: number; y: number }[],
  padding: number
): string
```

---

## Part 9: Connection Line Component

### New File: `src/components/social-network/ConnectionLine.tsx`

SVG component for relationship lines:

```typescript
interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  relationshipScore: number;
  isAlliance: boolean;
  isPlayerConnection: boolean;
  animated?: boolean;
}
```

**Visual Features:**
- Curved SVG paths (bezier curves)
- Color based on relationship: green (positive), yellow (neutral), red (negative)
- Width based on absolute strength
- Dashed lines for uncertain/new relationships
- Alliance connections have special styling

---

## Part 10: Network Node Component

### New File: `src/components/social-network/NetworkNode.tsx`

Individual houseguest node in the graph:

```typescript
interface NetworkNodeProps {
  houseguest: Houseguest;
  position: { x: number; y: number };
  isPlayer: boolean;
  isSelected: boolean;
  perception?: PlayerPerception;
  gameStatus: AvatarStatus;
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
}
```

**Visual Features:**
- Circular avatar with metallic frame (like Survivor reference)
- Name plate below
- Status indicators (HoH crown, nominee target)
- Player perception badge (ally/rival/etc)
- Selection ring when clicked
- "YOU" label for player

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/models/player-perception.ts` | Player perception types |
| `src/components/social-network/SocialNetworkGraph.tsx` | Main visualization |
| `src/components/social-network/SocialNetworkScreen.tsx` | Full screen wrapper |
| `src/components/social-network/SocialNetworkDialog.tsx` | Dialog version |
| `src/components/social-network/NetworkNode.tsx` | Individual node |
| `src/components/social-network/ConnectionLine.tsx` | Relationship line |
| `src/components/social-network/PerceptionEditorDialog.tsx` | Edit perception |
| `src/components/social-network/CustomAllianceDialog.tsx` | Create alliances |
| `src/components/social-network/utils/graph-layout.ts` | Layout calculations |
| `src/components/social-network/utils/connection-renderer.ts` | SVG path generation |
| `src/components/social-network/index.ts` | Exports |

## Files to Modify

| File | Changes |
|------|---------|
| `src/models/game-state.ts` | Add playerPerceptions to GameState |
| `src/contexts/reducers/game-reducer.ts` | Add perception actions |
| `src/components/game-screen/GameHeader.tsx` | Add Social button |
| `src/components/game-screen/GameScreen.tsx` | Include network dialog |
| `src/components/game-screen/GameSidebar.tsx` | Add Social tab option |

---

## Visual Style Details

### Color Scheme (Big Brother themed)
- **Strong Friendship (80+)**: Bright green (#22c55e)
- **Friendship (50-79)**: Light green (#86efac)
- **Neutral (0-49)**: Yellow/Amber (#fbbf24)
- **Rivalry (-1 to -49)**: Light red (#fca5a5)
- **Enmity (-50 to -100)**: Bright red (#ef4444)

### Line Thickness
- **Strong (|score| > 70)**: 4px
- **Medium (|score| 30-70)**: 2.5px
- **Weak (|score| < 30)**: 1.5px

### Node Frames (Survivor-inspired)
- Circular avatar with gradient metallic border
- Player node: Pink/magenta border with "YOU" label
- HoH: Gold crown badge
- Nominee: Red target indicator
- PoV Holder: Gold shield badge

### Alliance Groupings
- Dashed colored circles around alliance members
- Color-coded per alliance
- Semi-transparent fill for visual grouping

---

## Interaction Flow

```text
User clicks "Social" button in header
    |
    v
[Social Network Dialog opens]
    |
    +---> View full network with all connections
    |
    +---> Click on a houseguest node
    |         |
    |         v
    |     [Perception Editor opens]
    |         |
    |         +---> Set relationship perception
    |         +---> Add notes
    |         +---> Assign to alliance
    |         +---> Save
    |
    +---> Click "New Alliance" button
    |         |
    |         v
    |     [Custom Alliance Dialog]
    |         |
    |         +---> Name alliance
    |         +---> Select members
    |         +---> Choose color
    |         +---> Save
    |
    +---> Toggle views: All / Alliances / My Connections
    |
    v
[Close dialog - perceptions saved]
```

---

## Technical Considerations

### Performance
- Use CSS transforms for node positioning (GPU-accelerated)
- Memoize connection line calculations
- Lazy render off-screen connections
- Use requestAnimationFrame for smooth animations

### Responsiveness
- Scale graph to fit container
- Zoom/pan on mobile via touch gestures
- Simplified view on very small screens
- Full-screen mode for detailed viewing

### Data Persistence
- Player perceptions stored in game state
- Saved with game saves
- Doesn't affect NPC AI decisions (player-only view)
- Syncs with actual game relationships for display

### Accessibility
- Keyboard navigation between nodes
- Screen reader announcements for relationships
- High contrast mode support
- Focus indicators on interactive elements
