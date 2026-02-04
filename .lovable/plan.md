

# Plan: UI/UX Redesign for Eviction Result, Stats Selector, and Eviction Interaction Screens

## Overview

This plan addresses the UI/UX improvements for three key screens that currently feel flat and disconnected from the Big Brother aesthetic:

1. **Eviction Result Screen** - Needs more dramatic impact for this pivotal moment
2. **Stats Selector Screen** - Needs visual hierarchy and engaging stat representation  
3. **Eviction Interaction Stage** - Needs better organization and visual appeal

---

## Screen 1: Eviction Result Screen

### Current Issues
- Plain gray card with minimal visual impact
- Vote count presentation is bland
- No dramatic build-up for the eviction announcement
- The "You have been evicted" message lacks emotional weight
- Continue button uses generic styling

### Proposed Changes

**Visual Enhancements:**
- Add dramatic gradient background with spotlight effect on evicted player
- Display evicted player's large avatar with evicted status styling (grayscale effect)
- Add animated vote count reveal with versus-style layout
- Use dramatic typography with Orbitron font for the announcement
- Add subtle particle/dust animation effect for emotional impact

**Layout Restructure:**
```text
+------------------------------------------+
|          EVICTION RESULT                 |
|         [Gavel/Door Icon]                |
+------------------------------------------+
|                                          |
|    [Avatar 1]  vs  [Avatar 2]            |
|      Name 1        Name 2                |
|        4     TO      1                   |
|      VOTES         VOTES                 |
|                                          |
+------------------------------------------+
|                                          |
|    "By a vote of 4 to 1..."              |
|                                          |
|         [ cvb Avatar - Large ]           |
|            (grayscale)                   |
|                                          |
|    "...you have been evicted from        |
|     the Big Brother house."              |
|                                          |
+------------------------------------------+
|   [Dramatic Red Banner for Player]       |
|   "YOU HAVE BEEN EVICTED"                |
+------------------------------------------+
|                                          |
|     [ Continue to Jury House ]           |
|                                          |
+------------------------------------------+
```

**Technical Implementation in `EvictionResults.tsx`:**
- Use `StatusAvatar` with `status="evicted"` and `size="xl"` for evicted player
- Create a VS-style comparison layout showing both nominees with vote counts
- Add CSS animations for vote count reveals
- Use GameCard with danger variant for dramatic framing
- Add animated door-closing or fade-to-black effect

---

## Screen 2: Stats Selector Screen

### Current Issues
- Plain stat labels with no visual hierarchy
- Progress bars lack visual interest
- Color coding (red/yellow/green) is basic and uninspiring
- No tooltips or explanations for what stats mean
- Layout feels cramped and utilitarian

### Proposed Changes

**Visual Enhancements:**
- Add icons for each stat type (dumbbell for physical, brain for mental, etc.)
- Create gradient-filled progress bars with animated fill
- Add stat category headers to group related stats
- Include tooltips explaining what each stat affects in gameplay
- Show stat value as a prominent number with animated updates

**Layout Restructure:**
```text
+------------------------------------------+
|  YOUR STATS              Points: 5       |
|                     [Progress Ring]      |
+------------------------------------------+
|                                          |
| COMPETITION STATS                        |
| +--------------------------------------+ |
| | [Dumbbell] Physical           5/10  | |
| | [-] [====|========] [+]             | |
| +--------------------------------------+ |
| | [Brain] Mental                7/10  | |
| | [-] [=======|=====] [+]             | |
| +--------------------------------------+ |
| | [Flame] Endurance             5/10  | |
| | [-] [====|========] [+]             | |
| +--------------------------------------+ |
|                                          |
| SOCIAL STATS                             |
| +--------------------------------------+ |
| | [Heart] Social                6/10  | |
| | [-] [=====|=======] [+]             | |
| +--------------------------------------+ |
| | [Handshake] Loyalty           7/10  | |
| | [-] [=======|=====] [+]             | |
| +--------------------------------------+ |
|                                          |
| STRATEGIC STATS                          |
| +--------------------------------------+ |
| | [Target] Strategic            6/10  | |
| | [-] [=====|=======] [+]             | |
| +--------------------------------------+ |
| | [Dice] Luck                   5/10  | |
| | [-] [====|========] [+]             | |
| +--------------------------------------+ |
+------------------------------------------+
```

**Technical Implementation in `StatsSelector.tsx`:**
- Add Lucide icons for each stat: `Dumbbell`, `Brain`, `Flame`, `Heart`, `Handshake`, `Target`, `Dice`, `Swords`
- Group stats into categories: Competition (physical, mental, endurance), Social (social, loyalty), Strategic (strategic, luck, competition)
- Create enhanced progress bar with gradient fill matching stat level
- Add tooltips using Tooltip component to explain each stat
- Animate value changes with scale bounce effect
- Show remaining points as an animated progress ring

---

## Screen 3: Eviction Interaction Stage

### Current Issues
- Plain white houseguest cards with no visual distinction
- AI thought bubbles appear disconnected from cards
- Remaining interactions counter is buried in a card
- "Skip Remaining & Proceed" button has poor contrast
- Toggle for AI thoughts is small and easy to miss
- No visual indication of which houseguests you've already interacted with

### Proposed Changes

**Visual Enhancements:**
- Use StatusAvatar component for houseguest avatars with proper status indicators
- Integrate AI thought bubbles directly into cards (expandable on hover/click)
- Create a prominent interaction counter with visual countdown
- Add visual feedback for already-interacted houseguests
- Make the Skip/Proceed button more prominent with proper danger styling
- Separate nominees from voters visually

**Layout Restructure:**
```text
+------------------------------------------+
|     [UserX Icon]                         |
|    EVICTION NIGHT                        |
|    Talk with houseguests to influence    |
|    the upcoming vote                     |
|                                          |
|    [Toggle] Show AI Thoughts             |
+------------------------------------------+
|                                          |
|  INTERACT WITH VOTERS                    |
|  +----------------+ +----------------+   |
|  | [Avatar]       | | [Avatar]       |   |
|  | Jordan Taylor  | | Riley Johnson  |   |
|  | Sales Rep      | | Software Eng   |   |
|  | [AI Bubble]    | | [AI Bubble]    |   |
|  +----------------+ +----------------+   |
|  ...                                     |
+------------------------------------------+
|                                          |
|  +====================================+  |
|  |  REMAINING INTERACTIONS: 3         |  |
|  |  [O] [O] [O]                       |  |
|  |  Use wisely to influence the vote  |  |
|  +====================================+  |
|                                          |
|  [ Skip Remaining & Proceed >>> ]        |
|                                          |
+------------------------------------------+
```

**Technical Implementation in `EvictionInteractionStage.tsx`:**
- Replace plain avatar circles with `StatusAvatar` component
- Create visual interaction dots that deplete as interactions are used
- Add hover states with glow effect on interactable cards
- Move AI thought display inside cards with smooth expand animation
- Track and visually mark already-interacted houseguests (opacity reduction or checkmark)
- Use distinct sections for nominees vs voters when player is not nominated
- Add progress bar for interactions remaining

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/game-phases/EvictionPhase/EvictionResults.tsx` | Complete redesign with dramatic VS layout, StatusAvatar integration, animated reveals |
| `src/components/game-setup/StatsSelector.tsx` | Add icons, category groupings, enhanced progress bars, tooltips |
| `src/components/game-phases/EvictionPhase/EvictionInteractionStage.tsx` | StatusAvatar integration, improved thought display, interaction counter redesign |
| `src/index.css` | Add new animations for eviction drama and stat changes |

---

## New Animations to Add

```css
/* Eviction reveal animation */
@keyframes eviction-reveal {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

/* Stat value bounce */
@keyframes stat-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* Interaction used fade */
@keyframes interaction-used {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.5; transform: scale(0.9); }
}
```

---

## Design System Alignment

All changes will use:
- **Colors**: `bb-blue`, `bb-red`, `bb-gold`, `bb-green` semantic colors
- **Typography**: Orbitron for headers, Montserrat for body
- **Components**: GameCard, StatusAvatar, Badge from existing UI library
- **Shadows**: `shadow-glow-*` for emphasis on active elements
- **Animations**: Consistent with existing `animate-fade-in`, `animate-pulse-glow`

---

## Mobile Responsiveness

- Stats selector will stack categories vertically on mobile
- Eviction interaction cards will be single column on small screens
- Vote count VS layout will stack vertically on mobile
- All touch targets will be minimum 44px

