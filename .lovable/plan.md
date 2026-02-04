

# Plan: Out-of-Phase Social Action Limits

## Overview

Change the social action system so that Talk, Bond, and Propose Deal actions are available in ALL phases (not just Social Interaction), but with a limited number of uses outside the social phase. The limit resets when entering the Social Interaction phase.

---

## Limit Formula

**Actions allowed per non-social phase period:**
```
limit = Math.floor(activePlayersRemaining / 3)
```

| Active Players | Allowed Actions (Outside Social Phase) |
|----------------|----------------------------------------|
| 16             | 5                                      |
| 12             | 4                                      |
| 9              | 3                                      |
| 6              | 2                                      |
| 3              | 1                                      |

During Social Interaction phase: **Unlimited** actions

---

## Part 1: Add State Tracking

**Modify: `src/models/game-state.ts`**

Add new properties to track out-of-phase actions:

```typescript
export interface GameState {
  // ... existing properties ...
  
  // Track out-of-phase social actions (resets on entering SocialInteraction phase)
  outOfPhaseSocialActionsUsed?: number;
}
```

**Modify: `createInitialGameState()`**

```typescript
outOfPhaseSocialActionsUsed: 0,
```

---

## Part 2: Reset Counter on Social Phase Entry

**Modify: `src/contexts/reducers/reducers/game-progress-reducer.ts`**

Reset the counter when entering Social Interaction phase:

```typescript
case 'SET_PHASE':
  // ... existing phase logic ...
  
  // BB USA Format: Social Interaction happens AFTER Eviction, before next HoH
  if (normalizedPhase === 'socialinteraction') {
    return {
      ...state,
      phase: 'SocialInteraction' as GamePhase,
      outOfPhaseSocialActionsUsed: 0,  // Reset action counter
    };
  }
  
  // ... rest of existing logic ...
```

---

## Part 3: Increment Counter on Social Actions

**Modify: `src/contexts/reducers/reducers/player-action-reducer.ts`**

Add logic to track out-of-phase action usage:

```typescript
case 'talk_to': {
  const playerId = state.houseguests.find(h => h.isPlayer)?.id;
  const targetId = payload.params?.targetId;
  
  if (playerId && targetId) {
    const isSocialPhase = state.phase === 'SocialInteraction';
    
    // Check if out-of-phase action limit is reached
    if (!isSocialPhase) {
      const activeCount = state.houseguests.filter(h => h.status === 'Active').length;
      const maxActions = Math.floor(activeCount / 3);
      const usedActions = state.outOfPhaseSocialActionsUsed ?? 0;
      
      if (usedActions >= maxActions) {
        console.log('Out-of-phase action limit reached');
        return state; // Don't allow action
      }
    }
    
    const improvement = Math.floor(Math.random() * 5) + 3;
    const newState = updateRelationshipInState(state, playerId, targetId, improvement);
    
    // ... existing log/feedback code ...
    
    return {
      ...newState,
      // ... existing return properties ...
      // Increment counter only if NOT in social phase
      outOfPhaseSocialActionsUsed: isSocialPhase 
        ? state.outOfPhaseSocialActionsUsed 
        : (state.outOfPhaseSocialActionsUsed ?? 0) + 1
    };
  }
  break;
}
```

Apply the same pattern to `relationship_building` and `strategic_discussion` cases.

---

## Part 4: Update HouseguestDialog UI

**Modify: `src/components/houseguest/HouseguestDialog.tsx`**

Replace phase-only restriction with limit-based logic:

```typescript
const HouseguestDialog: React.FC<HouseguestDialogProps> = ({ houseguest }) => {
  const { gameState, getRelationship, dispatch } = useGame();
  const player = gameState.houseguests.find(h => h.isPlayer);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  
  // Calculate action availability
  const isSocialPhase = gameState.phase === 'SocialInteraction';
  const activeCount = gameState.houseguests.filter(h => h.status === 'Active').length;
  const maxOutOfPhaseActions = Math.floor(activeCount / 3);
  const usedActions = gameState.outOfPhaseSocialActionsUsed ?? 0;
  const remainingActions = isSocialPhase ? Infinity : maxOutOfPhaseActions - usedActions;
  const canAct = remainingActions > 0;
  
  // ... rest of existing code ...
```

Update the UI to show remaining actions instead of "Social Phase Only":

```tsx
{/* Actions section header */}
<h4 className="font-medium text-sm flex items-center gap-2">
  <Users className="h-4 w-4" />
  Actions
  {!isSocialPhase && (
    <span className={cn(
      "text-xs flex items-center gap-1 ml-auto",
      remainingActions > 0 ? "text-blue-500" : "text-muted-foreground"
    )}>
      {remainingActions > 0 ? (
        <>
          <MessageCircle className="h-3 w-3" />
          {remainingActions} action{remainingActions !== 1 ? 's' : ''} left
        </>
      ) : (
        <>
          <Lock className="h-3 w-3" />
          Wait for Social Phase
        </>
      )}
    </span>
  )}
  {isSocialPhase && (
    <span className="text-xs text-green-500 ml-auto">
      Unlimited
    </span>
  )}
</h4>

{/* Update button disabled states */}
<Button
  variant="outline"
  size="sm"
  onClick={handleTalkTo}
  disabled={!canAct}
  className="flex items-center gap-2"
>
  <MessageCircle className="h-4 w-4" />
  Talk
</Button>
```

---

## Visual Layout

**During Social Phase:**
```text
+------------------------------------------+
| 👥 Actions                    ✓ Unlimited |
| +-------------+ +------------------+     |
| | 💬 Talk     | | ❤️ Bond          |     |
| +-------------+ +------------------+     |
| +--------------------------------------+ |
| | 🤝 Propose Deal                      | |
| +--------------------------------------+ |
+------------------------------------------+
```

**Outside Social Phase (with actions remaining):**
```text
+------------------------------------------+
| 👥 Actions               💬 2 actions left |
| +-------------+ +------------------+     |
| | 💬 Talk     | | ❤️ Bond          |     |
| +-------------+ +------------------+     |
| +--------------------------------------+ |
| | 🤝 Propose Deal                      | |
| +--------------------------------------+ |
+------------------------------------------+
```

**Outside Social Phase (limit reached):**
```text
+------------------------------------------+
| 👥 Actions          🔒 Wait for Social Phase |
| +-------------+ +------------------+     |
| | 💬 Talk     | | ❤️ Bond          |     |
| | (disabled)  | | (disabled)       |     |
| +-------------+ +------------------+     |
| +--------------------------------------+ |
| | 🤝 Propose Deal (disabled)           | |
| +--------------------------------------+ |
+------------------------------------------+
```

---

## Files Summary

| File | Changes |
|------|---------|
| `src/models/game-state.ts` | Add `outOfPhaseSocialActionsUsed` property |
| `src/contexts/reducers/reducers/game-progress-reducer.ts` | Reset counter on SocialInteraction phase entry |
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Add limit checking and counter increment |
| `src/components/houseguest/HouseguestDialog.tsx` | Update UI to show remaining actions, enable buttons based on limit |

---

## Expected Behavior

1. **In Social Phase:** Buttons always enabled, shows "Unlimited"
2. **Outside Social Phase with actions remaining:** Buttons enabled, shows "X actions left"
3. **Outside Social Phase with no actions remaining:** Buttons disabled, shows "Wait for Social Phase"
4. **Counter resets:** When entering Social Interaction phase, counter resets to 0
5. **Limit scales:** More players = more out-of-phase actions allowed (16 players = 5 actions, 6 players = 2 actions)

---

## Technical Notes

### Why Track in State vs Component
- State-level tracking ensures persistence across navigation
- Counter survives dialog close/reopen
- All components see the same remaining count
- Could extend to show count in other UI elements (sidebar, etc.)

### Action Types That Count
All three social actions count toward the limit:
- `talk_to`
- `relationship_building` 
- `strategic_discussion`

Proposing deals also counts (when implemented) since it's a social interaction.

