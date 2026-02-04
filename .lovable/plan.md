
# Plan: Add Social Action Buttons to Houseguest Profile Dialog

## Overview

Add "Talk to", "Build Relationship", and "Propose Deal" action buttons directly to the individual houseguest profile dialogs (HouseguestDialog). This gives players a convenient way to interact with houseguests from anywhere in the game without needing to navigate through the social phase sections.

---

## Current State

The `HouseguestDialog` component shows:
- Houseguest name, age, occupation, status
- Personality traits
- Relationship score bar (for non-player houseguests)

**Missing:** Any interactive action buttons to talk, build relationship, or propose deals.

---

## Solution

Add an "Actions" section at the bottom of the dialog containing:

1. **Talk to [Name]** - Quick conversation (+3-7 relationship)
2. **Build Relationship** - Quality time (+5-12 relationship)  
3. **Propose Deal** - Opens the ProposeDealDialog
4. **Discuss Strategy** - Opens strategic discussion options

These actions will be **enabled only during the Social Interaction phase** to maintain game balance.

---

## Implementation Details

### Modify: `src/components/houseguest/HouseguestDialog.tsx`

Add action buttons section:

```typescript
// New imports
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Handshake, Users, Lock } from 'lucide-react';
import ProposeDealDialog from '@/components/deals/ProposeDealDialog';
import { toast } from 'sonner';

// Inside component - add state for deal dialog
const [dealDialogOpen, setDealDialogOpen] = useState(false);
const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

// Check if social phase is active
const isSocialPhase = gameState.phase === 'SocialInteraction';

// Handle action clicks
const handleTalkTo = () => {
  dispatch({ 
    type: 'PLAYER_ACTION', 
    payload: { actionId: 'talk_to', params: { targetId: houseguest.id } }
  });
  // Show feedback
  toast.success(`You had a conversation with ${houseguest.name}`);
};

const handleBuildRelationship = () => {
  dispatch({ 
    type: 'PLAYER_ACTION', 
    payload: { actionId: 'relationship_building', params: { targetId: houseguest.id } }
  });
  toast.success(`You spent quality time with ${houseguest.name}`);
};
```

Add action buttons UI (only for non-player, active houseguests):

```tsx
{/* Social Actions */}
{player && !houseguest.isPlayer && houseguest.status === 'Active' && (
  <div className="border-t pt-4 space-y-3">
    <h4 className="font-medium text-sm flex items-center gap-2">
      <Users className="h-4 w-4" />
      Actions
      {!isSocialPhase && (
        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
          <Lock className="h-3 w-3" />
          Social Phase Only
        </span>
      )}
    </h4>
    
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTalkTo}
        disabled={!isSocialPhase}
        className="flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Talk
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleBuildRelationship}
        disabled={!isSocialPhase}
        className="flex items-center gap-2"
      >
        <Heart className="h-4 w-4" />
        Bond
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDealDialogOpen(true)}
        disabled={!isSocialPhase}
        className="flex items-center gap-2 col-span-2 border-amber-300 hover:bg-amber-50"
      >
        <Handshake className="h-4 w-4 text-amber-600" />
        Propose Deal
      </Button>
    </div>
    
    {/* Relationship change feedback */}
    {feedbackMessage && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-green-500 text-sm text-center"
      >
        {feedbackMessage}
      </motion.div>
    )}
  </div>
)}

{/* Propose Deal Dialog */}
<ProposeDealDialog
  open={dealDialogOpen}
  onOpenChange={setDealDialogOpen}
  params={{
    targetId: houseguest.id,
    targetName: houseguest.name
  }}
/>
```

---

## Visual Layout

```text
+--------------------------------------------------+
|  Morgan Lee                              [X]     |
+--------------------------------------------------+
|                                                  |
|  [ML]    Age: 26                                |
|          Occupation: Personal Trainer            |
|          Status: Active                          |
|          [Competitive] [Loyal]                   |
|                                                  |
|  +--------------------------------------------+  |
|  | Relationship with you:                     |  |
|  | 💔 ████████░░░░░░░░░░░░░░░░░░░░░░░  -4    |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  | 👥 Actions                  🔒 Social Only |  |
|  | +----------------+ +--------------------+  |  |
|  | | 💬 Talk        | | ❤️ Bond            |  |  |
|  | +----------------+ +--------------------+  |  |
|  | +----------------------------------------+ |  |
|  | | 🤝 Propose Deal                        | |  |
|  | +----------------------------------------+ |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

---

## Key Features

1. **Phase-Aware Actions**
   - Buttons are visible but disabled outside Social Interaction phase
   - Lock icon and "Social Phase Only" label explains why buttons are disabled
   - Prevents gameplay exploitation while maintaining UI discoverability

2. **Immediate Feedback**
   - Toast notifications confirm action success
   - Relationship bar updates immediately after action
   - Uses existing `lastRelationshipImpact` from reducer for feedback

3. **Deal Integration**
   - "Propose Deal" button opens the existing ProposeDealDialog
   - Full deal workflow remains unchanged

4. **Clean UI**
   - Buttons organized in 2-column grid
   - "Propose Deal" spans full width to emphasize its importance
   - Consistent with existing game card styling

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/houseguest/HouseguestDialog.tsx` | Add action buttons section, import ProposeDealDialog, add state and handlers |

---

## Optional Enhancements

If needed in future iterations:
- Add cooldown indicators for actions
- Show remaining interaction count from SocialInteractionState
- Add "Discuss Strategy" as a third quick action
- Add tooltip showing exact relationship change range
