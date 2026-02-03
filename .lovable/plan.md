
# Big Brother USA Format - Gameplay & UX Flow Improvement Plan

## Executive Summary

This plan outlines comprehensive improvements to align the game with authentic Big Brother USA format, addressing gameplay flow issues, missing ceremonies, UX inconsistencies, and enhanced dramatic presentation.

---

## Current State Analysis

### Strengths Already Implemented
- Complete weekly cycle: HoH -> Nomination -> PoV Selection -> PoV Competition -> PoV Meeting -> Eviction
- 3-Part Final HoH competition with correct participant logic
- Stat-weighted competition scoring system
- Key Ceremony animation for nominations
- Nominee speeches before eviction voting
- HoH tiebreaker during eviction
- Dramatic jury vote reveal with confetti
- Final speeches before jury voting
- POV chip draw animation
- Phase navigation options between ceremonies
- Social interaction phase with multiple action types

### Critical Issues to Address

#### 1. Game Flow & Phase Ordering
| Issue | Current State | BB USA Format |
|-------|--------------|---------------|
| Social Phase Timing | Appears mid-week between phases | Should occur ONLY after eviction, before next HoH |
| Week Advancement | Triggered inconsistently | Should trigger after eviction + social phase |
| Final 3 Transition | Abrupt jump to FinalHoH | Needs clear transition ceremony |

#### 2. Missing Ceremonies & Presentation
| Missing Element | Impact |
|-----------------|--------|
| HoH Room Reveal | No celebration moment after HoH win |
| Live Eviction Host Narration | Missing "Julie Chen" announcements |
| Eviction Interview | No goodbye moment for evicted houseguest |
| Jury House Scenes | No indication of jury dynamics |
| Double Eviction Support | No fast-paced special week format |

#### 3. Competition System Gaps
| Gap | Details |
|-----|---------|
| POV Competition Scoring | Uses `determineRandomWinner` instead of stat-weighted selection |
| Competition Variety Display | No indication of what stats matter before competing |
| Endurance Tracking | No visual representation of houseguests "falling" |
| Final HoH Part Results | Part 2/3 transitions feel rushed |

#### 4. UX Consistency Issues
| Issue | Location |
|-------|----------|
| Inconsistent Skip Button Placement | Some phases have header skip, others have footer |
| Missing Fast-Forward on JuryQuestioning | No way to speed through Q&A |
| Phase Transition Abruptness | No title cards between major phases |
| Mobile Layout Issues | Sidebar not collapsible, voting buttons too small |

---

## Implementation Plan

### Phase 1: Game Flow Corrections (Priority: Critical)

#### 1.1 Fix Social Phase Placement
**Files to Modify:**
- `src/contexts/reducers/reducers/game-progress-reducer.ts`
- `src/components/game-phases/EvictionPhase/hooks/useEvictionCompletion.ts`

**Changes:**
```text
Current flow: ... -> Eviction -> SocialInteraction -> HoH
Correct flow: ... -> Eviction -> SocialInteraction -> ADVANCE_WEEK -> HoH

The game-progress-reducer already documents the correct order but the
actual phase transitions don't enforce it. Need to:
1. After eviction completion, force transition to SocialInteraction
2. After SocialInteraction "End Phase" action, trigger ADVANCE_WEEK
3. ADVANCE_WEEK should reset week state AND set phase to 'HoH'
```

#### 1.2 Enforce Weekly Cycle Order
**Files to Modify:**
- `src/game-states/EvictionState.ts`
- `src/game-states/SocialInteractionState.ts`

**Changes:**
- EvictionState.exit() should ONLY allow transition to SocialInteraction
- SocialInteractionState should have a dedicated "End Week" action that triggers ADVANCE_WEEK
- Remove ability to navigate to SocialInteraction mid-week (after HoH/Nomination)

#### 1.3 Fix Phase Navigation Options
**Files to Modify:**
- `src/components/game-phases/HOHCompetition/CompetitionResults.tsx`
- `src/components/game-phases/NominationPhase/NominationCeremonyResult.tsx`

**Changes:**
- Remove "Talk to Houseguests First" option after HoH (BB USA format has no social phase here)
- Remove "Campaign Period" option after Nomination (nominees campaign during eviction phase)
- Keep primary action buttons only: "Continue to Nominations", "Continue to PoV Selection"

---

### Phase 2: POV Competition Stat-Weighted Scoring (Priority: High)

#### 2.1 Apply Consistent Competition Logic
**Files to Modify:**
- `src/components/game-phases/POVCompetition/index.tsx`
- `src/components/game-phases/POVCompetition/utils.ts`

**Changes:**
```typescript
// Current (utils.ts):
export const determineRandomWinner = (players: Houseguest[]): Houseguest | null => {
  return players[Math.floor(Math.random() * players.length)];
};

// Should use selectRandomWinner from HOH utils which applies stat weights
// Import and use: selectRandomWinner(players, competitionType)
```

- Generate random competition type at POV start
- Use `selectRandomWinner` with stat weighting
- Display competition type before starting (Physical, Mental, Endurance, etc.)

#### 2.2 Add Competition Type Display
**Files to Modify:**
- `src/components/game-phases/POVCompetition/InitialStage.tsx`

**Changes:**
- Show randomly selected competition type
- Display which stats give advantages
- Add visual indicator like HOH Competition has

---

### Phase 3: Ceremony Enhancements (Priority: Medium)

#### 3.1 Add HoH Room Reveal Ceremony
**New File:** `src/components/game-phases/HOHCompetition/HoHRoomReveal.tsx`

**Features:**
- "Who wants to see my HoH room?" prompt after HoH win
- Photo/letter reveal (cosmetic element)
- Crown animation transition
- Can be skipped
- Integrates after CompetitionResults, before Nomination navigation

#### 3.2 Enhance Eviction Ceremony Presentation
**Files to Modify:**
- `src/components/game-phases/EvictionPhase.tsx`
- `src/components/game-phases/EvictionPhase/EvictionResults.tsx`

**New Features:**
- Host-style announcement: "By a vote of X to Y... [Name], you have been evicted"
- Goodbye moment: "You have 30 seconds to say your goodbyes"
- Jury announcement: "You will now join the jury house"
- Exit interview placeholder (can be cosmetic)

#### 3.3 Add Phase Title Cards
**New File:** `src/components/ui/phase-title-card.tsx`

**Features:**
- Full-screen overlay between major phases
- Shows phase name with dramatic styling (e.g., "EVICTION NIGHT", "FINALE")
- Auto-dismisses after 2 seconds or on click
- Optional TV-static transition effect

---

### Phase 4: Jury System Improvements (Priority: Medium)

#### 4.1 Enhanced Jury Questioning
**Files to Modify:**
- `src/components/game-phases/JuryQuestioningPhase.tsx`

**Changes:**
- Add relationship-based question selection (bitter jurors ask tougher questions)
- Allow player to choose response strategy when they're a finalist
- Add skip/fast-forward button for entire questioning sequence
- Show juror reactions to answers

#### 4.2 Jury House Mentions
**New File:** `src/components/game-phases/EvictionPhase/JuryHousePreview.tsx`

**Features:**
- Brief mention when houseguest joins jury
- Show current jury composition
- Optional: Jury reaction to eviction (cosmetic)

---

### Phase 5: Final Stage Polish (Priority: Medium)

#### 5.1 Improve Final 3 Transition
**Files to Modify:**
- `src/components/game-phases/FinalHoHPhase.tsx`
- `src/contexts/reducers/reducers/game-progress-reducer.ts`

**Changes:**
- Add clear "Final 3" announcement before Part 1
- Explain the 3-part competition format to player
- Show who competes in each part more clearly
- Add "Part X Complete" interstitials

#### 5.2 Fix Final HoH Winner Selection
**Current Issue:** Part 3 winner selection dispatches to game state but UI doesn't always reflect it

**Files to Modify:**
- `src/components/game-phases/FinalHoHPhase.tsx`

**Changes:**
- Ensure Part 3 winner is correctly set as final HoH
- Add celebration moment before finalist selection
- Fix `avatarUrl` vs `imageUrl` inconsistency (lines 289, 320, 322, 426, 430)

---

### Phase 6: Skip/Fast-Forward Consistency (Priority: Medium)

#### 6.1 Standardize Skip Button Pattern
**Files to Modify:** All phase components

**Standard Pattern:**
```text
Position: Top-right of GameCardHeader
Style: Button variant="ghost" with SkipForward icon
Text: "Skip" or "Fast Forward"
Behavior: dispatch 'game:fastForward' event
```

**Components Needing Updates:**
| Component | Current State | Needed |
|-----------|---------------|--------|
| JuryQuestioningPhase | No skip button | Add skip for entire sequence |
| FinalHoHPhase | No skip per part | Add skip for each competition part |
| POVMeeting | Has skip | Verify consistency |
| FinalePhase (speeches) | Has skip | Verify consistency |

#### 6.2 Global Fast-Forward Handler
**Files to Modify:**
- `src/hooks/useFastForward.ts`

**Changes:**
- Ensure all phase components listen for `game:fastForward` event
- Add keyboard shortcut (Space or Enter) to trigger fast-forward when available

---

### Phase 7: Mobile & Accessibility (Priority: Lower)

#### 7.1 Mobile Layout Optimization
**Files to Modify:**
- `src/components/game-screen/GameSidebar.tsx`
- `src/components/game-phases/EvictionPhase/EvictionVoting.tsx`

**Changes:**
- Make sidebar collapsible on mobile
- Increase touch target size for vote buttons
- Add swipe gestures for houseguest cards
- Bottom navigation for phase actions on mobile

#### 7.2 Accessibility Improvements
**Changes:**
- Add ARIA labels to all interactive elements
- Keyboard navigation for ceremonies
- Screen reader announcements for phase changes
- Color contrast check for all game states

---

## Technical Details

### State Management Updates
Add to `GameState` interface:
```typescript
interface GameState {
  // Existing fields...
  
  // New fields
  currentCeremony?: 'hoh_reveal' | 'eviction' | 'veto_meeting' | 'finale';
  isDoubleEviction?: boolean;
  ceremonyProgress?: number; // 0-100 for animations
}
```

### New Components Summary
```text
src/components/
├── game-phases/
│   ├── HOHCompetition/
│   │   └── HoHRoomReveal.tsx (NEW)
│   ├── EvictionPhase/
│   │   └── JuryHousePreview.tsx (NEW)
│   └── (existing files modified)
├── ui/
│   └── phase-title-card.tsx (NEW)
```

### Files to Modify Summary
| File | Changes |
|------|---------|
| `game-progress-reducer.ts` | Enforce phase ordering, fix ADVANCE_WEEK logic |
| `POVCompetition/index.tsx` | Use stat-weighted winner selection |
| `POVCompetition/utils.ts` | Import selectRandomWinner from HOH utils |
| `CompetitionResults.tsx` | Remove mid-week social navigation option |
| `NominationCeremonyResult.tsx` | Remove campaign period navigation option |
| `JuryQuestioningPhase.tsx` | Add skip button, relationship-based questions |
| `FinalHoHPhase.tsx` | Fix image prop names, add skip buttons |
| `EvictionResults.tsx` | Add goodbye moment, jury announcement |

---

## Testing Checklist

After implementation, verify:
- [ ] Complete game from Week 1 to Finale without errors
- [ ] Social phase ONLY appears after eviction, before next HoH
- [ ] POV Competition uses stat-weighted scoring
- [ ] All skip buttons work consistently
- [ ] Phase navigation only shows appropriate options
- [ ] Final 3 transition is clear and ceremonial
- [ ] Jury questioning can be fast-forwarded
- [ ] Mobile layout is usable throughout all phases
- [ ] HoH tiebreaker triggers when votes are tied
- [ ] Winner is crowned with celebration animation

---

## Implementation Priority Order

| Week | Features |
|------|----------|
| 1 | Fix Social Phase timing, POV stat-weighting, Remove mid-week social navigation |
| 2 | HoH Room Reveal, Skip button consistency, Eviction ceremony enhancement |
| 3 | Phase title cards, Jury questioning improvements, Final 3 transition polish |
| 4 | Mobile optimization, Accessibility improvements, Double eviction support |
