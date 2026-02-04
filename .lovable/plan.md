
# Plan: Fix Social, Promises, and Deals Integration

## Problem Analysis

After thorough investigation, I found multiple critical issues preventing the systems from working together:

### Issue 1: Missing Deals Section UI
The `ActionSections.tsx` filters for `category === 'deal'` but there's **no `DealsSection.tsx` component** to render deal actions. The `SocialInteractionState` generates `propose_deal` actions with `category: 'deal'`, but they're never displayed.

### Issue 2: Disconnected Action Flow
When player clicks actions like "Talk to [name]" or "Build relationship":
- The UI dispatches `PLAYER_ACTION` to the reducer
- The reducer logs it but doesn't call the game state handlers
- The actual handlers in `talkHandler.ts`, `relationshipHandler.ts` etc. are never executed
- No relationship changes occur

### Issue 3: No Feedback After Interactions
- Actions complete silently with no visual confirmation
- The `RELATIONSHIP_IMPACT` events are dispatched but there's no UI showing them inline
- Players can't see if their actions had any effect

### Issue 4: NPC Proposals Not Triggering
- Proposals generate at phase start but require `game.dealSystem` which may not be set
- The `generateNPCProposalsForPlayer` runs but proposals don't appear if `dealSystem` returns no results

### Issue 5: Legacy Promises Overlap with Deals
- Both "Make a Promise" and "Propose Deal" exist with overlapping functionality
- The promise system (`MakePromiseDialog`) doesn't integrate with the new deal system
- Creates confusion and duplicated features

---

## Part 1: Create Deals Section Component

**New File: `src/components/game-phases/social-interaction/sections/DealsSection.tsx`**

Create a section to display deal proposal buttons for each houseguest:

```typescript
// Display cards for each houseguest with:
// - Their avatar and current relationship
// - Active deals with them (if any)
// - "Propose Deal" button that opens ProposeDealDialog
// - Badge showing trust score
```

---

## Part 2: Fix Action Handler Connection

**Modify: `src/contexts/reducers/reducers/player-action-reducer.ts`**

The reducer needs to actually execute the social action handlers:

```typescript
case 'talk_to':
case 'relationship_building':
case 'strategic_discussion':
  // These are currently just logged
  // Need to actually update relationships here OR
  // Ensure the game state machine calls the handlers
  break;
```

Better approach: Import and call handlers directly:

```typescript
import { handleTalkTo, handleRelationshipBuilding } from '@/game-states/social/handlers';

case 'talk_to': {
  // Get controller facade and call handler
  const controller = getControllerFromState(state);
  handleTalkTo({ controller, targetId: payload.params.targetId });
  break;
}
```

**Alternative (simpler):** Update relationships directly in reducer:

```typescript
case 'talk_to': {
  const playerId = state.houseguests.find(h => h.isPlayer)?.id;
  const targetId = payload.params.targetId;
  const improvement = Math.floor(Math.random() * 5) + 3; // 3-7 points
  
  // Update relationships directly
  const key = [playerId, targetId].sort().join('-');
  const currentRel = state.relationships?.[key] ?? 0;
  
  return {
    ...state,
    relationships: {
      ...state.relationships,
      [key]: currentRel + improvement
    }
  };
}
```

---

## Part 3: Add Inline Interaction Feedback

**Modify: `src/components/game-phases/social-interaction/sections/ConversationsSection.tsx`**

Add visual feedback when player interacts:

```typescript
const [recentInteraction, setRecentInteraction] = useState<{
  targetId: string;
  message: string;
  change: number;
} | null>(null);

const handleActionClick = async (actionId: string, params: any) => {
  onActionClick(actionId, params);
  
  // Show feedback toast or inline message
  const improvement = Math.floor(Math.random() * 5) + 3;
  setRecentInteraction({
    targetId: params.targetId,
    message: `Relationship improved by +${improvement}`,
    change: improvement
  });
  
  // Clear after animation
  setTimeout(() => setRecentInteraction(null), 2000);
};
```

Display feedback on the houseguest card:

```tsx
{recentInteraction?.targetId === targetId && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="text-green-500 text-sm font-medium"
  >
    +{recentInteraction.change} relationship
  </motion.div>
)}
```

---

## Part 4: Consolidate Promises into Deals

**Remove or Hide: Legacy Promise Actions**

**Modify: `src/game-states/SocialInteractionState.ts`**

Remove the legacy `make_promise` actions since deals cover the same functionality:

```typescript
// REMOVE this block:
// activeGuests.forEach(houseguest => {
//   if (!houseguest.isPlayer) {
//     actions.push({
//       actionId: 'make_promise',
//       text: `Make a promise to ${houseguest.name}`,
//       parameters: { targetId: houseguest.id, targetName: houseguest.name },
//       category: 'promise'
//     });
//   }
// });

// CHANGE check_promises to check_deals:
actions.push({
  actionId: 'check_deals',
  text: 'Check active deals',
  parameters: {},
  category: 'status'
});
```

**Modify: `src/components/game-phases/social-interaction/ActionSections.tsx`**

Add DealsSection and remove PromiseSection:

```typescript
import DealsSection from './sections/DealsSection';

// Add deals filter
const dealActions = availableActions.filter(action => 
  action.category === 'deal'
);

// In render:
{dealActions.length > 0 && (
  <DealsSection
    actions={dealActions}
    onActionClick={onActionClick}
  />
)}

// Remove or keep PromiseSection for legacy, but deprioritize
```

---

## Part 5: Improve NPC Proposal Generation

**Modify: `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx`**

Ensure proposals generate correctly:

```typescript
// Generate NPC proposals at start of social phase
useEffect(() => {
  if (!game || hasGeneratedProposals.current) return;
  if (game?.currentState?.constructor.name !== 'SocialInteractionState') return;
  
  hasGeneratedProposals.current = true;
  
  const timer = setTimeout(() => {
    try {
      // Check if dealSystem exists
      if (!game.dealSystem) {
        console.warn('DealSystem not initialized');
        return;
      }
      
      const proposals = generateNPCProposalsForPlayer(game);
      console.log(`Generated ${proposals.length} NPC proposals`);
      
      if (proposals.length > 0) {
        setProposalQueue(proposals);
        setTimeout(() => {
          setCurrentProposal(proposals[0]);
        }, 3000);
      }
    } catch (error) {
      console.error('Error generating NPC proposals:', error);
    }
  }, 1500);
  
  return () => clearTimeout(timer);
}, [game?.currentState]);
```

---

## Part 6: Show Active Deals & Relationship Status

**Modify: `src/components/game-phases/social-interaction/sections/DealsSection.tsx`**

Show existing deals on each houseguest card:

```tsx
const DealsSection = ({ actions, onActionClick }) => {
  const { game } = useGame();
  const player = game?.houseguests.find(h => h.isPlayer);
  
  // Get active deals for player
  const playerDeals = game?.dealSystem?.getActiveDeals(player?.id || '') || [];
  
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2">
        <Handshake className="h-4 w-4" />
        DEALS & AGREEMENTS
      </h3>
      
      {/* Show active deals summary */}
      {playerDeals.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="text-sm font-medium">Active Deals: {playerDeals.length}</div>
          {playerDeals.slice(0, 3).map(deal => (
            <div key={deal.id} className="text-xs text-muted-foreground">
              {deal.title} with {/* partner name */}
            </div>
          ))}
        </div>
      )}
      
      {/* Deal proposal buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map(action => (
          <DealActionCard 
            key={action.actionId + action.parameters?.targetId}
            action={action}
            onActionClick={onActionClick}
            existingDeals={playerDeals.filter(d => 
              d.recipientId === action.parameters?.targetId ||
              d.proposerId === action.parameters?.targetId
            )}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## Part 7: Add Relationship Display on Houseguest Cards

**Modify: `src/components/game-phases/social-interaction/sections/ConversationsSection.tsx`**

Add relationship score display:

```tsx
// In the houseguest card:
const relationship = game?.relationshipSystem?.getRelationship(
  player?.id || '', 
  targetId
) ?? 0;

<div className="flex items-center gap-2 text-xs">
  <Heart className={cn(
    "h-3 w-3",
    relationship > 30 ? "text-green-500" : 
    relationship > 0 ? "text-blue-400" :
    relationship > -20 ? "text-gray-400" : "text-red-500"
  )} />
  <span>{relationship >= 0 ? '+' : ''}{relationship}</span>
</div>
```

---

## Part 8: Ensure DealSystem Initialization

**Modify: `src/contexts/game/hooks/useSystems.ts`**

Verify deal system is properly initialized:

```typescript
useEffect(() => {
  if (game && !game.dealSystem) {
    const dealSystem = new DealSystem(logger);
    dealSystem.setGame(game);
    game.dealSystem = dealSystem;
  }
}, [game]);
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/game-phases/social-interaction/sections/DealsSection.tsx` | Display deal actions with relationship context |

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Handle social actions with relationship updates |
| `src/game-states/SocialInteractionState.ts` | Remove legacy promise actions, keep deals |
| `src/components/game-phases/social-interaction/ActionSections.tsx` | Add DealsSection import and rendering |
| `src/components/game-phases/social-interaction/sections/ConversationsSection.tsx` | Add relationship display and interaction feedback |
| `src/components/game-phases/social-interaction/sections/RelationshipSection.tsx` | Add relationship score display |
| `src/components/game-phases/social-interaction/sections/StrategicSection.tsx` | Add feedback for strategic discussions |
| `src/components/game-phases/social-interaction/SocialInteractionPhase.tsx` | Improve error handling for proposal generation |
| `src/contexts/game/hooks/useSystems.ts` | Ensure DealSystem is always initialized |

---

## Expected Outcome

After implementation:

1. **Deals Section visible** - Players see "Propose a Deal" options for each houseguest
2. **Working interactions** - Clicking "Talk to" or "Build Relationship" actually changes relationships
3. **Visual feedback** - Green "+5 relationship" animations appear after interactions
4. **NPC Proposals appear** - NPCs approach player with deal offers during social phase
5. **Consolidated system** - Deals replace legacy promises, single unified system
6. **Relationship visibility** - Each houseguest card shows current relationship score
7. **Active deals shown** - Players can see their existing deals at a glance

---

## Technical Notes

### State Synchronization
The key issue was that `PLAYER_ACTION` dispatch goes to the reducer, but the actual game logic handlers (in `social/handlers/`) weren't being called. The fix ensures relationship updates happen directly in the reducer using `gameState.relationships` as the source of truth.

### Backward Compatibility
- Keep `promises` array in state but stop creating new ones
- Migrate any existing promises to deals on load (optional)
- Legacy `PromiseSection` can remain hidden or show as "Legacy" items

### Testing
- Test each interaction type (talk, relationship build, strategic discussion)
- Verify relationship scores update in real-time
- Confirm NPC proposals appear after 3+ seconds in social phase
- Test accepting/declining proposals updates deals array
