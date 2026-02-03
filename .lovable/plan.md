
# Plan: Fix Weekly Status Tracker UI and Refactor Save System

## Problem Summary

### Issue 1: Save System Not Working
The save/load feature is **completely broken**. The `loadGame` function finds the saved game data from localStorage but **never dispatches it to the reducer**. The code has a comment "Note: dispatch is handled by the caller" but no caller ever does this.

### Issue 2: Phase Indicator UI Overlapping
The weekly status tracker in the header has overlapping icons because:
- Circle elements are too large relative to the gap spacing
- The active circle's glow shadow extends beyond its container
- No minimum width constraints on the phase step containers

---

## Technical Solution

### Part 1: Fix Save/Load System

The fix requires restructuring how `loadGame` works. Instead of expecting the caller to handle dispatch (which it doesn't), the hook should receive `dispatch` and handle it internally.

**File: `src/contexts/game/hooks/useSaveLoadFunctions.ts`**

```typescript
import { toast } from "sonner";
import { GameState } from "../../../models/game-state";
import { GameAction } from "../../types/game-context-types";

export function useSaveLoadFunctions(
  user: any, 
  gameState: GameState, 
  dispatch: React.Dispatch<GameAction>  // Add dispatch parameter
) {
  // ... saveGame stays the same ...
  
  const loadGame = async (saveName: string): Promise<void> => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      const existingSaves = JSON.parse(existingSavesStr);
      
      const saveToLoad = existingSaves.find((save: any) => save.name === saveName);
      
      if (!saveToLoad) {
        toast.error(`Save '${saveName}' not found`);
        throw new Error(`Save '${saveName}' not found`);
      }
      
      // Actually dispatch the loaded state to the reducer
      dispatch({
        type: 'LOAD_GAME',
        payload: saveToLoad.data
      });
      
      toast.success(`Game loaded: ${saveName}`);
    } catch (error) {
      console.error('Failed to load game:', error);
      toast.error('Failed to load game');
      throw error;
    }
  };
  
  // ... rest stays the same ...
}
```

**File: `src/contexts/game/GameProvider.tsx`**

Update the hook call to pass `dispatch`:

```typescript
const {
  saveGame,
  loadGame,
  deleteSavedGame,
  getSavedGames
} = useSaveLoadFunctions(user, gameState, dispatch);  // Add dispatch
```

---

### Part 2: Fix Phase Indicator UI

The overlapping is caused by inadequate spacing and glow effects extending beyond containers.

**File: `src/index.css`** - Update phase indicator styles:

```css
.phase-indicator {
  @apply flex items-center gap-3 md:gap-5 overflow-x-auto py-2 px-2;
}

.phase-step {
  @apply flex flex-col items-center gap-1 transition-all duration-300 shrink-0;
  min-width: 3rem;
}

.phase-step-circle {
  @apply w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.phase-step-circle.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
  animation: none;  /* Remove pulse that can cause layout shift */
}

.phase-step-connector {
  @apply w-6 md:w-10 h-0.5 transition-all duration-300 shrink-0;
  background: hsl(var(--border));
}
```

**File: `src/components/ui/phase-indicator.tsx`** - Fix layout structure:

```tsx
return (
  <div className={cn('phase-indicator', className)}>
    {weeklyPhases.map((phase, index) => {
      const config = getPhaseConfig(phase);
      const isCompleted = currentIndex > index;
      const isActive = normalizedCurrent === phase;
      const Icon = config.icon;

      return (
        <React.Fragment key={phase}>
          {index > 0 && (
            <div 
              className={cn(
                'phase-step-connector',
                isCompleted && 'completed'
              )}
            />
          )}
          <div 
            className="phase-step"
            title={config.label}  // Move tooltip to container
          >
            <div 
              className={cn(
                'phase-step-circle',
                isCompleted && 'completed',
                isActive && 'active'
              )}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
            </div>
            {!compact && (
              <span 
                className={cn(
                  'phase-step-label text-center',
                  isActive && 'active'
                )}
              >
                {config.shortLabel}
              </span>
            )}
          </div>
        </React.Fragment>
      );
    })}
  </div>
);
```

---

### Part 3: Additional Save System Improvements

**Display Improvements for SaveLoadButton**

Format the save name and date for better UX:

```tsx
// In SaveLoadButton.tsx - parse and display cleaner save names

// Extract just the user-entered name (before the timestamp)
const displayName = save.name.split('_').slice(0, -1).join('_') || save.name;

// Format the date nicely
const displayDate = new Date(save.date).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/game/hooks/useSaveLoadFunctions.ts` | Add `dispatch` parameter, dispatch `LOAD_GAME` action in `loadGame` |
| `src/contexts/game/GameProvider.tsx` | Pass `dispatch` to `useSaveLoadFunctions` |
| `src/index.css` | Fix phase indicator spacing, reduce circle sizes, remove pulse animation |
| `src/components/ui/phase-indicator.tsx` | Reduce icon sizes, improve structure |
| `src/components/game-screen/SaveLoadButton.tsx` | Improve display of save names and dates |

---

## Visual Comparison

### Phase Indicator Before (Broken)
```text
[HoH]--[Nom]--[PoV]--[Vet]--[Evict]  <- Icons overlapping
  ^glow effect extends into neighbors
```

### Phase Indicator After (Fixed)
```text
[HoH] -- [Nom] -- [PoV] -- [Vet] -- [Evict]
         proper spacing, contained effects
```

---

## Testing Checklist

After implementation:
- [ ] Click Save/Load button in game header
- [ ] Enter a save name and click "Save Game" - verify toast appears
- [ ] Switch to "Load Game" tab - verify your save appears
- [ ] Click on a save to load it - verify game state changes
- [ ] Verify phase indicator icons are properly spaced and don't overlap
- [ ] Test on mobile viewport to ensure responsive layout
- [ ] Delete a saved game and verify it disappears from the list
