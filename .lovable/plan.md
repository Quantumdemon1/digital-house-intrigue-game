
# Comprehensive Feature Implementation Plan

## Overview
This plan covers five major features to enhance the Big Brother USA gameplay experience:
1. Testing/Verification of Eviction Flow (speeches + tiebreaker)
2. Final Speeches Component for Finale
3. Jury Vote Reveal Ceremony with dramatic key-turn reveal
4. POV Player Selection Chip Draw Animation
5. Navigation Buttons between Game Phases

---

## Part 1: Eviction Flow Testing Guidance

The eviction flow has been implemented with the following stages:
- `interaction` -> `speeches` -> `voting` -> `tiebreaker` (if tied) -> `results`

### Test Cases to Verify:
1. **Nominee Speeches**: After clicking "Proceed to Voting" from interaction stage, speeches should appear with 30-second timers
2. **HoH Tiebreaker**: When votes are exactly tied (e.g., 2-2), the HoH should be prompted to cast the deciding vote
3. **Skip Functionality**: All skip buttons should work to bypass animations

---

## Part 2: Final Speeches Component

### New File: `src/components/game-phases/FinalePhase/FinalSpeeches.tsx`

Create a component for finalist pleas before jury voting:
- Each finalist gets 2 minutes (or 60 seconds for pacing)
- Player can write their own speech if they're a finalist
- AI generates speeches for non-player finalists based on game history
- Progress indicator showing current speaker
- Skip buttons for individual speeches and all speeches

### Integration with FinalePhase

Modify `src/components/game-phases/FinalePhase.tsx` to add a multi-stage flow:
1. `intro` - Show final 2 with "The Final Vote" header
2. `speeches` - Final speeches before jury voting
3. `voting` - Jury voting (existing)
4. `reveal` - Dramatic vote reveal (new)
5. `complete` - Winner announcement

---

## Part 3: Jury Vote Reveal Ceremony

### New File: `src/components/game-phases/FinalePhase/JuryVoteReveal.tsx`

Create a dramatic key-turn style vote reveal:
- One vote revealed at a time (like keys being turned)
- Running tally display between finalists
- Dramatic pause between each reveal
- Confetti/celebration animation when winner determined
- Skip to results button

### Features:
- Vote counter showing X votes to win (majority of jury)
- Visual "key turn" animation for each vote reveal
- Envelope opening visual metaphor
- Sound-ready placeholder for future audio effects

### Technical Implementation:
```text
Props:
- votes: Record<string, string> (jurorId -> finalistId)
- jurors: Houseguest[]
- finalists: [Houseguest, Houseguest]
- onComplete: (winner, runnerUp) => void

State:
- revealedVotes: number (0 to jurors.length)
- tallies: { [finalistId]: number }
- winner: Houseguest | null
```

---

## Part 4: POV Player Selection Chip Draw Animation

### Modify: `src/components/game-phases/POVPlayerSelection/POVPlayerSelectionContent.tsx`

Add an animated "chip bag draw" experience:
- Visual chip bag/container
- Sequential chip reveals for each random slot
- "Houseguest's Choice" special chip possibility
- 6-player grid display with draw order indicators

### New File: `src/components/game-phases/POVPlayerSelection/ChipDraw.tsx`

Create the animated chip draw component:
- Bag visual with shaking animation
- Chip emerges with player name
- Grid updates to show drawn order (1st, 2nd, 3rd)
- Auto-draw or manual draw per chip
- Skip button to reveal all at once

### Visual Design:
```text
┌──────────────────────────────┐
│       POV PLAYER DRAW        │
├──────────────────────────────┤
│   ┌─────────────────────┐    │
│   │    [Chip Bag]       │    │
│   │   🎱 Draw Chip      │    │
│   └─────────────────────┘    │
│                              │
│  Mandatory Players:          │
│  [HoH] [Nominee] [Nominee]   │
│                              │
│  Random Draws:               │
│  [1st] [2nd] [3rd]           │
│                              │
│  [Draw Next] [Draw All]      │
└──────────────────────────────┘
```

---

## Part 5: Navigation Buttons Between Phases

### New File: `src/components/ui/phase-navigation.tsx`

Create a unified navigation component that appears after key moments:
- After HoH is selected: options to go to Nomination or Social Phase
- After Nomination: options to proceed to PoV Player Selection
- After PoV Meeting: proceed to Eviction
- Context-aware button labels and icons

### Integration Points:

#### 1. HOH Competition Results
Modify `CompetitionResults.tsx` to show navigation options:
- "Continue to Nominations" (primary action)
- "Talk to Houseguests First" (secondary - goes to Social phase)

#### 2. Nomination Ceremony Complete
Add navigation after key ceremony:
- "Continue to PoV Player Selection" (primary)
- "Campaign Period" (optional social interaction)

#### 3. PoV Meeting Complete
After veto decision:
- "Continue to Eviction" (primary)

### Component Structure:
```text
interface PhaseNavigationProps {
  options: {
    label: string;
    phase: GamePhase;
    icon: LucideIcon;
    primary?: boolean;
    description?: string;
  }[];
  onNavigate: (phase: GamePhase) => void;
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/game-phases/FinalePhase/FinalSpeeches.tsx` | Finalist pleas before jury vote |
| `src/components/game-phases/FinalePhase/JuryVoteReveal.tsx` | Dramatic key-turn vote reveal |
| `src/components/game-phases/POVPlayerSelection/ChipDraw.tsx` | Animated chip bag draw |
| `src/components/ui/phase-navigation.tsx` | Navigation between phases |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/game-phases/FinalePhase.tsx` | Add multi-stage flow with speeches and reveal |
| `src/components/game-phases/FinalePhase/JuryVoting.tsx` | Integrate with new reveal component |
| `src/components/game-phases/POVPlayerSelection/POVPlayerSelectionContent.tsx` | Add chip draw animation |
| `src/components/game-phases/HOHCompetition/CompetitionResults.tsx` | Add navigation options |
| `src/components/game-phases/NominationPhase/NominationCeremonyResult.tsx` | Add navigation options |
| `src/components/game-phases/POVMeeting/stages/CompletedStage.tsx` | Add navigation options |

---

## Implementation Order

1. **Final Speeches Component** - Standalone, adds to finale experience
2. **Jury Vote Reveal** - Builds on speeches, completes finale overhaul
3. **POV Chip Draw** - Independent feature, enhances PoV selection
4. **Phase Navigation** - Cross-cutting feature, requires multiple file edits

---

## Technical Details

### Jury Vote Reveal Algorithm:
```text
1. Start with empty revealed votes
2. Every 2-3 seconds, reveal next vote
3. Update running tally
4. Check if winner can be determined:
   - If one finalist has majority (>50% of jury), they win
   - Continue until all votes revealed or winner determined
5. Trigger confetti and celebration
6. Show final result with vote count
```

### Chip Draw Animation States:
```text
1. 'idle' - Bag visible, waiting for draw
2. 'shaking' - Bag shaking animation (500ms)
3. 'drawing' - Chip emerging from bag (800ms)
4. 'revealed' - Chip shows player name (1500ms)
5. 'placed' - Chip moves to player grid
6. Repeat for next draw or complete
```

### Navigation Button Styling:
- Primary actions: Gradient background (bb-blue or bb-gold)
- Secondary actions: Ghost/outline variant
- All buttons include appropriate icons
- Optional descriptions for context
