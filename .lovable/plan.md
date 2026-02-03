
# Feature: Spectator Mode for Evicted Player (Jury Member)

## Problem Summary

When the player is evicted from the Big Brother house, the game gets stuck on the eviction announcement screen. The UI shows "You have been evicted from the Big Brother house" but provides **no button to continue**, making it impossible to proceed.

### Current Behavior
In `EvictionResults.tsx` lines 211-216, when the player is evicted:
```tsx
{evictedHouseguest.isPlayer ? (
  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
    <p className="font-bold text-red-700">
      You have been evicted from the Big Brother house.
    </p>
  </div>
) : (
  // Button only appears for non-player evictions
  <Button onClick={() => setStage('goodbye')} ...>
```

### Expected Behavior
- Player eviction should show a "Continue as Jury Member" button
- Game should enter spectator mode where all phases auto-play or can be skipped
- Player regains control during Finale to cast their jury vote

---

## Solution Overview

1. **Fix the stuck screen** - Add a continue button when player is evicted
2. **Enable spectator mode** - Auto-play remaining phases with skip capability
3. **Jury voting integration** - Player casts their vote during the finale

---

## Technical Implementation

### 1. Fix EvictionResults.tsx - Add Continue Button for Player Eviction

**File**: `src/components/game-phases/EvictionPhase/EvictionResults.tsx`

Add a button below the eviction message that advances to the jury stage:

```tsx
{evictedHouseguest.isPlayer ? (
  <div className="mt-6 space-y-4">
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="font-bold text-red-700">
        You have been evicted from the Big Brother house.
      </p>
    </div>
    {goesToJury && (
      <p className="text-purple-600 font-medium">
        You will join the jury and help decide the winner.
      </p>
    )}
    <Button 
      onClick={() => goesToJury ? setStage('jury') : setStage('complete')} 
      className="mt-4"
      size="lg"
    >
      {goesToJury ? 'Continue as Jury Member' : 'Continue'}
    </Button>
  </div>
) : (
  // ... existing non-player eviction button
)}
```

### 2. Add Spectator Mode State to GameState

**File**: `src/models/game-state.ts`

Add a new state property to track spectator mode:

```tsx
export interface GameState {
  // ... existing properties
  isSpectatorMode: boolean;  // True when player is evicted but game continues
}
```

**File**: `src/contexts/reducers/reducers/eviction-reducer.ts`

When player is evicted, enable spectator mode:

```tsx
case 'EVICT_HOUSEGUEST': {
  const { evicted, toJury } = action.payload;
  
  return {
    ...state,
    // ... existing updates
    isSpectatorMode: evicted.isPlayer ? true : state.isSpectatorMode,
  };
}
```

### 3. Create Spectator Mode Banner Component

**File**: `src/components/game-screen/SpectatorBanner.tsx` (new file)

Display a banner at the top of the game screen when in spectator mode:

```tsx
const SpectatorBanner: React.FC = () => {
  const { gameState } = useGame();
  const { fastForward } = useGameControl();
  
  if (!gameState.isSpectatorMode) return null;
  
  const player = gameState.houseguests.find(h => h.isPlayer);
  const playerStatus = player?.status;
  
  return (
    <div className="bg-purple-900/90 text-white px-4 py-3 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <span>
          {playerStatus === 'Jury' 
            ? "You are now a jury member. Watch the remaining game unfold."
            : "You have been evicted. Watch the remaining game unfold."
          }
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={fastForward} className="text-white">
        <SkipForward className="h-4 w-4 mr-1" />
        Skip to Next Phase
      </Button>
    </div>
  );
};
```

### 4. Integrate Spectator Banner into GameScreen

**File**: `src/components/game-screen/GameScreen.tsx`

Add the spectator banner:

```tsx
import SpectatorBanner from './SpectatorBanner';

const GameScreen: React.FC = () => {
  // ...
  return (
    <div className="min-h-screen bg-background">
      <div className="relative container mx-auto px-4 py-4 md:py-6 space-y-4">
        <SpectatorBanner />  {/* Add this */}
        <GameHeader />
        {/* ... rest of content */}
      </div>
    </div>
  );
};
```

### 5. Auto-Advance Phases in Spectator Mode

**File**: `src/components/game-phases/HOHCompetition/index.tsx` (and other phase components)

Add auto-advance logic when in spectator mode:

```tsx
// Inside HOHCompetition component
useEffect(() => {
  if (gameState.isSpectatorMode && competitionStage === 'initial') {
    // Auto-start the competition after a brief delay
    const timer = setTimeout(() => {
      startCompetition();
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [gameState.isSpectatorMode, competitionStage]);
```

Apply similar auto-advance logic to:
- `NominationPhase/index.tsx`
- `POVPlayerSelection/index.tsx`
- `POVCompetition/index.tsx`
- `POVMeeting/index.tsx`
- `EvictionPhase/index.tsx`

### 6. Ensure Player Can Vote as Jury Member in Finale

**File**: `src/components/game-phases/FinalePhase.tsx`

The existing `JuryVotingWrapper` already handles player jury voting correctly:
- Line 331: Checks `if (!currentJuror.isPlayer)` before auto-voting
- Lines 387-405: Shows vote buttons only for player jurors

No changes needed here - it already works correctly.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/game-phases/EvictionPhase/EvictionResults.tsx` | Add continue button for player eviction |
| `src/models/game-state.ts` | Add `isSpectatorMode` property |
| `src/contexts/reducers/reducers/eviction-reducer.ts` | Set spectator mode when player is evicted |
| `src/components/game-screen/SpectatorBanner.tsx` | New file - spectator mode UI banner |
| `src/components/game-screen/GameScreen.tsx` | Add SpectatorBanner component |
| `src/components/game-phases/HOHCompetition/index.tsx` | Auto-start in spectator mode |
| `src/components/game-phases/NominationPhase/index.tsx` | Auto-advance in spectator mode |
| `src/components/game-phases/POVPlayerSelection/index.tsx` | Auto-advance in spectator mode |
| `src/components/game-phases/POVCompetition/index.tsx` | Auto-start in spectator mode |
| `src/components/game-phases/POVMeeting/index.tsx` | Auto-advance in spectator mode |
| `src/components/game-phases/EvictionPhase.tsx` | Auto-advance AI-controlled eviction |

---

## Testing Checklist

After implementation:
- [ ] Player eviction shows continue button instead of dead end
- [ ] Spectator banner appears after player is evicted
- [ ] Remaining game phases auto-play with skip button available
- [ ] Player can cast jury vote in finale when it's their turn
- [ ] Winner is correctly determined and game ends properly

---

## User Experience Flow

```text
Player is evicted
       ↓
"You have been evicted" message
       ↓
[Continue as Jury Member] button
       ↓
Spectator mode enabled
Purple banner: "You are now a jury member. Watch the remaining game unfold." [Skip to Next Phase]
       ↓
All phases auto-play (with skip capability)
       ↓
Finale Phase
       ↓
Player gets to cast jury vote
       ↓
Winner announced → GameOver
```
