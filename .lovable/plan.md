
# Big Brother USA Format - Comprehensive Gameplay & UX Overhaul Plan

## Executive Summary
This plan outlines a complete overhaul of the gameplay mechanics and UX flow to ensure authentic Big Brother USA format consistency. The improvements span all game phases, ceremonies, and player interactions, prioritizing dramatic tension and strategic depth.

---

## Current State Analysis

### What's Working Well
- Basic weekly cycle structure (HoH -> Nomination -> PoV -> PoVMeeting -> Eviction)
- 3-Part Final HoH competition with correct participant logic
- Stat-weighted competition scoring system
- Key Ceremony animation for nominations
- Dramatic Vote Reveal component for evictions
- Skip/Fast-Forward functionality on major ceremonies
- Competition types (Endurance, Physical, Mental, Skill, Crapshoot)

### Critical Gaps Identified
1. **Missing Ceremonies & Speeches**
   - No nominee speeches before eviction vote
   - No HoH reveal ceremony after competition
   - No "Have-Not" or luxury competition systems
   
2. **Incomplete Phase Flow**
   - Social interaction phase placement varies from BB USA format
   - POV player selection needs "random chip draw" presentation
   - No dedicated "Live Eviction" ceremony presentation
   
3. **Jury System Issues**
   - Jury questioning is overly simplified
   - No "final speeches" before jury vote
   - Jury voting lacks dramatic reveal sequence
   
4. **Missing Game Mechanics**
   - No HoH tiebreaker implementation during eviction
   - No double eviction week support
   - No returning player/buyback competition
   - No alliance voting bloc visualization

5. **UX Inconsistencies**
   - Phase transitions lack ceremonial polish
   - Inconsistent skip button placement
   - No narrator/host voice integration
   - Missing phase progress indicators

---

## Implementation Plan

### Phase 1: Core Ceremony Polish (Priority: Critical)

#### 1.1 HoH Reveal Ceremony
**Files:** `src/components/game-phases/HOHCompetition/CompetitionResults.tsx`

Add a dedicated HoH reveal animation:
- Crown animation transitioning to winner
- "Who wants to see my HoH room?" prompt
- Photo/letter reveal option (cosmetic)
- Skip button integration

#### 1.2 Eviction Ceremony Speeches
**Files:** New `src/components/game-phases/EvictionPhase/NomineeSpeeches.tsx`

Add authentic nominee speeches before voting:
- Each nominee gets a "plea" speech opportunity
- AI-generated or player-written speech content
- Timer for each speech (30 seconds)
- Skip individual speeches or all speeches

#### 1.3 Veto Meeting Ceremony Enhancement
**Files:** `src/components/game-phases/POVMeeting/stages/InitialStage.tsx`

Add the iconic "I have decided to..." ceremony:
- PoV holder walks to each nominee
- Dramatic pause before decision reveal
- "This Power of Veto meeting is adjourned" closing
- Proper replacement nominee ceremony if veto used

#### 1.4 POV Player Selection - Chip Draw Animation
**Files:** `src/components/game-phases/POVPlayerSelection/`

Create authentic "houseguest choice" chip bag draw:
- Animated bag/container visual
- Sequential chip reveal for each random slot
- "Houseguest's Choice" chip possibility
- 6-player grid display with draw order

---

### Phase 2: Game Flow Corrections (Priority: High)

#### 2.1 Correct Weekly Cycle Order
**Current Flow:**
```text
HoH -> Nomination -> PoVPlayerSelection -> PoV -> PoVMeeting -> SocialInteraction -> Eviction
```

**Correct BB USA Flow:**
```text
HoH -> HoH Reveal -> Nomination -> PoVPlayerSelection -> PoV -> PoVMeeting -> Eviction -> SocialInteraction (pre-next HoH)
```

**Files to Update:**
- `src/contexts/reducers/reducers/game-progress-reducer.ts`
- `src/components/game-screen/PhaseContent.tsx`
- `src/game-states/index.ts`

#### 2.2 HoH Tiebreaker System
**Files:** `src/components/game-phases/EvictionPhase/HohTiebreaker.tsx` (exists, needs integration)

Implement when votes are tied:
- HoH casts the deciding vote
- Dramatic "I vote to evict..." reveal
- Special UI treatment for tiebreaker scenario
- Integration into `EvictionResults.tsx`

#### 2.3 Post-Eviction Flow
**Files:** `src/components/game-phases/EvictionPhase/EvictionResults.tsx`

After eviction announcement:
- "You have X seconds to say your goodbyes"
- Exit interview prompt (cosmetic)
- Jury announcement if applicable ("You will now join the jury")
- Automatic phase advancement to next week's HoH

---

### Phase 3: Finale & Jury Overhaul (Priority: High)

#### 3.1 Final Speeches Before Jury Vote
**Files:** New `src/components/game-phases/FinalePhase/FinalSpeeches.tsx`

Add authentic finale flow:
- Each finalist makes a final plea to jury (2 minutes)
- AI-generated speech based on game history
- Player can write their own speech if finalist
- Jury reaction indicators

#### 3.2 Jury Questioning Enhancement
**Files:** `src/components/game-phases/JuryQuestioningPhase.tsx`

Current implementation is basic. Enhance with:
- More authentic question types based on gameplay
- Relationship-based question content
- Bitter jury mechanics (low relationship = tough questions)
- Player can choose response strategy

#### 3.3 Jury Vote Reveal Ceremony
**Files:** `src/components/game-phases/FinalePhase/JuryVoting.tsx`

Create dramatic finale vote reveal:
- Key-turn style reveal (one vote at a time)
- Running tally display
- Confetti/celebration animation for winner
- Skip to results option

---

### Phase 4: Advanced Game Mechanics (Priority: Medium)

#### 4.1 Double Eviction Support
**Files:** 
- `src/models/game-state.ts` (add `isDoubleEviction` flag)
- New `src/components/game-phases/DoubleEvictionPhase.tsx`

Implement fast-paced double eviction:
- Compressed timeline UI
- Immediate HoH competition after first eviction
- Abbreviated nomination/veto ceremonies
- Second eviction same episode

#### 4.2 Have-Not System (Optional)
**Files:** New `src/systems/havenot-system.ts`

Add weekly Have-Not selection:
- Food competition or HoH selection
- Stat penalties during Have-Not week
- Slop diet references

#### 4.3 Alliance Voting Visualization
**Files:** `src/components/game-phases/EvictionPhase/VoterDisplay.tsx`

Show alliance voting patterns:
- Color-code voters by alliance
- Predict vote outcomes based on alliances
- Post-eviction vote breakdown by group

---

### Phase 5: UX Consistency Layer (Priority: Medium)

#### 5.1 Unified Phase Header
**Files:** `src/components/GamePhaseHeader.tsx`

Create consistent phase information display:
- Current week number (prominent)
- Phase name with icon
- Key players (HoH, PoV holder, Nominees)
- Progress indicator (week X of ~12)

#### 5.2 Host Narration System
**Files:** New `src/components/ui/host-narration.tsx`

Add optional Julie Chen-style narration:
- Phase transition announcements
- Ceremony introductions
- Dramatic pause moments
- Can be toggled on/off in settings

#### 5.3 Unified Skip/Fast-Forward Pattern
**Files:** All phase components

Ensure consistent skip button behavior:
- Position: Top-right of phase card header
- Style: Ghost variant with SkipForward icon
- Behavior: Skip current animation, maintain game state integrity
- Already implemented in: KeyCeremony, DramaticVoteReveal, HOHCompetition

Missing implementations needed:
- PoV Competition results animation
- Jury Questioning sequence
- Final HoH parts

#### 5.4 Phase Transition Animations
**Files:** `src/components/ui/phase-transition.tsx`

Enhance phase-to-phase transitions:
- Fade out current phase
- Show phase title card (e.g., "EVICTION NIGHT")
- Fade in new phase content
- Optional: TV-style static/transition effect

---

### Phase 6: Competition System Enhancement (Priority: Medium)

#### 6.1 Competition Preview Screen
**Files:** `src/components/game-phases/HOHCompetition/CompetitionInitial.tsx`

Before competition starts, show:
- Competition name and category
- Stat advantages explanation
- Participant grid with key stats highlighted
- "Players, take your positions" narrative

#### 6.2 Competition Play-by-Play
**Files:** `src/components/game-phases/HOHCompetition/CompetitionInProgress.tsx`

Add elimination announcements during endurance:
- "[Name] has fallen!" notifications
- Time elapsed display
- Remaining players count
- Stat-based commentary

#### 6.3 Crapshoot Fairness Indicator
**Files:** Competition UI components

When Crapshoot competition type:
- Display "Anyone can win this one!"
- Equal chance messaging
- Random outcome emphasis

---

### Phase 7: Mobile & Accessibility (Priority: Lower)

#### 7.1 Mobile Layout Optimization
- Collapsible sidebar for small screens
- Touch-friendly vote buttons
- Swipe between houseguest cards
- Bottom navigation for phase actions

#### 7.2 Accessibility Improvements
- ARIA labels for all interactive elements
- Keyboard navigation for ceremonies
- Screen reader announcements for phase changes
- Color contrast compliance for all game states

---

## Technical Architecture Changes

### State Management Updates
```text
GameState additions:
- isDoubleEviction: boolean
- currentCeremony: 'none' | 'hoh_reveal' | 'nomination' | 'veto_meeting' | 'eviction'
- nomineeSpeeches: Record<string, string>
- juryQuestions: JuryQuestion[]
- phaseProgress: number (0-100 for animations)
```

### New Components Summary
```text
src/components/
├── game-phases/
│   ├── EvictionPhase/
│   │   └── NomineeSpeeches.tsx (NEW)
│   ├── FinalePhase/
│   │   ├── FinalSpeeches.tsx (NEW)
│   │   └── JuryVoteReveal.tsx (NEW)
│   ├── HOHCompetition/
│   │   └── HoHRevealCeremony.tsx (NEW)
│   └── DoubleEvictionPhase.tsx (NEW)
├── ui/
│   └── host-narration.tsx (NEW)
```

### Phase Reducer Updates
The `game-progress-reducer.ts` needs updated phase transition logic to match the correct BB USA flow order and handle special cases like double eviction.

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority | Status |
|---------|--------|--------|----------|--------|
| Nominee Speeches | High | Medium | Week 1 | ✅ DONE |
| HoH Tiebreaker Integration | High | Low | Week 1 | ✅ DONE |
| Correct Phase Order | High | Medium | Week 1 | ✅ DONE |
| POV Chip Draw Animation | Medium | Medium | Week 2 | Pending |
| Jury Vote Reveal Ceremony | High | Medium | Week 2 | Pending |
| Final Speeches | Medium | Medium | Week 2 | Pending |
| Skip Button Consistency | Medium | Low | Week 2 | Pending |
| Host Narration System | Low | Medium | Week 3 | Pending |
| Double Eviction | Medium | High | Week 3 | Pending |
| Phase Transition Animations | Low | Low | Week 3 | Pending |
| Competition Play-by-Play | Low | Medium | Week 4 | Pending |
| Have-Not System | Low | High | Backlog | Pending |

---

## Completed Features

### Week 1 Implementation (COMPLETE)

#### 1. Nominee Speeches (`NomineeSpeeches.tsx`)
- Created new component with 30-second timer per nominee
- Player can write custom speech when nominated
- AI generates contextual plea speeches for NPCs
- Skip individual or all speeches with button
- Fast-forward event integration
- Animated speech reveal with speaker progress dots

#### 2. HoH Tiebreaker Integration
- Enhanced `HohTiebreaker.tsx` with dramatic UI
- Automatic tie detection in `useEvictionPhase.ts`
- New 'tiebreaker' stage in eviction flow
- AI HoH makes decision with thinking delay
- Player HoH gets choice buttons
- Fast-forward support for AI decisions

#### 3. Correct Phase Order (BB USA Format)
- Updated `game-progress-reducer.ts` with documentation
- Social Interaction now occurs AFTER Eviction, before next HoH
- Week flow: HoH → Nomination → PoVPlayerSelection → PoV → PoVMeeting → Eviction → SocialInteraction

#### 4. Eviction Stage System Update
- Added 'speeches' and 'tiebreaker' stages to `useEvictionStages.ts`
- Updated all eviction hooks for new stage types
- Stage header badge shows current stage name

---

## Testing Checklist

After implementation, verify:
- [ ] Complete game playthrough from Week 1 to Finale
- [ ] Player as HoH completes all ceremonies correctly
- [x] Player as nominee can give speech and campaign
- [x] Tiebreaker triggers correctly when votes are equal
- [ ] Skip buttons work on all animated sequences
- [ ] Jury voting reveals correctly with dramatic pacing
- [ ] Winner is crowned with proper celebration
- [ ] Fast-forward through entire game maintains state integrity
- [ ] Mobile layout remains usable throughout all phases
