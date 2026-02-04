

# Plan: Redesign Weekly Status Tracker and Reorganize Header Buttons

## Problem Summary

1. **Phase Indicator is boring and unclear**: In compact mode, only icons are shown without labels - users can't tell what each phase is
2. **Promises button is cut off**: Too many buttons in the header row without proper overflow handling
3. **Save feature is hidden**: The Save/Load button is buried in the header among other buttons
4. **Layout is cluttered**: Action buttons compete for space with the phase indicator

---

## Solution Overview

Reorganize the header and status area into a cleaner 2-row layout:

```text
+--------------------------------------------------+
| DIGITAL HOUSE  |  WEEK 1  |  [Phase Progress]    |
| INTRIGUE       |          |  HoH > Noms > PoV... |
+--------------------------------------------------+

+--------------------------------------------------+
| [Save] [History] [Promises]  |  HoH: Alex        |
|                              |  8 Active | 2 Noms|
+--------------------------------------------------+
```

---

## Technical Changes

### 1. Enhance Phase Indicator with Labels and Tooltips

**File**: `src/components/ui/phase-indicator.tsx`

Make the compact mode more informative:
- Add abbreviated labels below icons even in compact mode
- Add visual polish with better hover states and tooltips
- Show current phase name prominently
- Add subtle animation to active phase

```tsx
// Phase step with always-visible label
<div className="phase-step flex flex-col items-center">
  <div className={cn('phase-step-circle', isActive && 'active', isCompleted && 'completed')}>
    {isCompleted ? <Check /> : <Icon />}
  </div>
  <span className="text-[10px] font-medium mt-1 text-center whitespace-nowrap">
    {config.shortLabel}
  </span>
</div>
```

Add tooltip support for full phase name on hover.

### 2. Reorganize GameHeader - Clean Up Button Row

**File**: `src/components/game-screen/GameHeader.tsx`

Remove action buttons from header - only keep essential branding and phase indicator:

```tsx
<header className="...">
  <div className="flex items-center justify-between">
    {/* Left: Title + Week */}
    <div className="flex items-center gap-4">
      <h1 className="game-title">Digital House Intrigue</h1>
      <WeekIndicator week={gameState.week} />
    </div>
    
    {/* Right: Profile only */}
    <ProfileButton />
  </div>
  
  {/* Full-width Phase Indicator below */}
  <div className="mt-4">
    <PhaseIndicator currentPhase={gameState.phase} week={gameState.week} />
  </div>
</header>
```

### 3. Redesign GameStatusIndicator with Action Buttons

**File**: `src/components/game-screen/GameStatusIndicator.tsx`

Move Save, History, and Promises buttons here with game status:

```tsx
<div className="game-status-bar">
  {/* Left: Action Buttons */}
  <div className="flex items-center gap-2">
    <SaveLoadButton />
    <GameRecapButton />
    <PromiseButton />
    <FastForwardButton />
  </div>
  
  {/* Right: Status Badges */}
  <div className="flex flex-wrap items-center gap-2">
    <Badge>Week {week}</Badge>
    <PhaseBadge phase={phase} />
    <Badge>{activeCount} Active</Badge>
    {hohName && <Badge>HoH: {hohName}</Badge>}
    {povName && <Badge>PoV: {povName}</Badge>}
  </div>
</div>
```

### 4. Update Phase Indicator Styling

**File**: `src/index.css`

Add enhanced styles for the phase indicator:

```css
.phase-indicator-enhanced {
  @apply flex items-center justify-between gap-1 py-3 px-4 bg-muted/30 rounded-lg;
}

.phase-step-enhanced {
  @apply flex flex-col items-center gap-1 min-w-[50px];
}

.phase-step-circle-enhanced {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
  @apply transition-all duration-300 ease-out;
}

.phase-step-circle-enhanced.active {
  background: var(--gradient-primary);
  @apply text-white scale-110;
  box-shadow: var(--shadow-glow-primary);
}

.phase-step-label-enhanced {
  @apply text-[10px] font-semibold uppercase tracking-wide;
  @apply text-muted-foreground;
}

.phase-step-label-enhanced.active {
  @apply text-primary font-bold;
}
```

---

## Layout Comparison

### Before (Broken)
```text
+----------------------------------------------------------------+
| DIGITAL HOUSE  WEEK 1 [o][o][o][o][o][o] [History][Promises... |
| INTRIGUE                                           <- CUT OFF! |
+----------------------------------------------------------------+
| Week 1 | HoH | 8 Active | HoH: Alex                            |
+----------------------------------------------------------------+
```

### After (Clean)
```text
+----------------------------------------------------------------+
| DIGITAL HOUSE INTRIGUE           WEEK 1             [Profile]  |
| [HoH] ─ [Noms] ─ [PoV Pick] ─ [PoV] ─ [Veto] ─ [Evict]        |
+----------------------------------------------------------------+
| [Save/Load] [History] [Promises] [Skip] | HoH: Alex | 8 Active |
+----------------------------------------------------------------+
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/phase-indicator.tsx` | Add labels to compact mode, improve styling, add tooltips |
| `src/components/game-screen/GameHeader.tsx` | Remove action buttons, keep only title/week/profile, expand phase indicator |
| `src/components/game-screen/GameStatusIndicator.tsx` | Add Save, History, Promises, FastForward buttons |
| `src/index.css` | Add enhanced phase indicator styles |

---

## Mobile Responsiveness

On mobile:
- Phase indicator shows abbreviated labels (HoH, Noms, etc.)
- Action buttons use icon-only mode with tooltips
- Status badges stack vertically if needed

---

## Visual Enhancements

1. **Current Phase Highlighting**: Active phase circle has pulsing glow animation
2. **Completed Phases**: Green checkmarks with connecting line turning green
3. **Labels Always Visible**: Short labels (HoH, Noms, PoV, etc.) shown below icons
4. **Hover Tooltips**: Full phase name appears on hover (e.g., "Head of Household Competition")
5. **Progress Line**: Animated line connecting phases, fills as game progresses

