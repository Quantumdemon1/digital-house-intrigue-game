
# Comprehensive Mobile Optimization Plan

## Overview

Based on the screenshots provided, there are multiple mobile UI issues across the game:

**Screenshot 1 (Main Game Screen):**
- Phase indicator (HOH, NOMS, POV PICK, POV, VETO, E...) is cut off on the right side
- "EVICTION" label is truncated, running off screen
- The action buttons bar is cramped

**Screenshot 2 (Game Over - Player Stats):**
- Content is running off the right side of the screen
- "Competition..." and "Block St..." text is cut off
- Player names like "Casey Wils..." and "Taylor Ki..." are truncated
- Stats like "4 nominatio..." are cut off

**Screenshot 3 (Game Summary - Your Journey):**
- Stats values are missing or cut off (HoH Wins:, PoV Wins: etc.)
- Text is being truncated "You played a solid game and made it to th..."

---

## Root Cause Analysis

The issues stem from several patterns in the codebase:

1. **Fixed widths without responsive alternatives** - Many components use fixed pixel widths that don't adapt to mobile screens
2. **Horizontal layouts that don't wrap** - `flex` containers without `flex-wrap` on mobile
3. **Missing `overflow-hidden` on parent containers** - Content bleeds outside card boundaries
4. **Large padding values on mobile** - `p-6` and similar on small screens
5. **No text truncation utilities** - Long text overflows instead of truncating
6. **Grid layouts that don't stack on mobile** - `grid-cols-3` without responsive alternatives

---

## Technical Changes

### Phase 1: Core Layout Fixes

#### 1.1 Phase Indicator Mobile Optimization
**File: `src/components/ui/phase-indicator.tsx`**

The phase indicator uses fixed `min-w-[48px]` per step which causes overflow on mobile (6 phases = 288px minimum + gaps). Changes needed:

- Make phase circles smaller on mobile (`w-7 h-7` instead of `w-9 h-9`)
- Hide labels on small screens and show only icons
- Use horizontal scroll on very small screens as fallback
- Reduce gap between phases on mobile

```tsx
// Add overflow-x-auto and smaller sizing on mobile
<div className={cn(
  'flex items-center justify-between gap-1 md:gap-2 py-3 px-2 md:px-4 bg-muted/30 rounded-lg overflow-x-auto',
  className
)}>
  {/* Phase circles: smaller on mobile */}
  <div className="min-w-[36px] md:min-w-[48px]">
    <div className="w-7 h-7 md:w-9 md:h-9 rounded-full ...">
      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
    </div>
    {/* Labels hidden on mobile, shown on sm+ */}
    <span className="text-[9px] md:text-[10px] hidden xs:block ...">
      {config.shortLabel}
    </span>
  </div>
</div>
```

#### 1.2 Game Header Mobile Optimization
**File: `src/components/game-screen/GameHeader.tsx`**

- Reduce padding on mobile
- Make title smaller on mobile
- Ensure phase indicator fits

#### 1.3 Game Status Indicator Bar
**File: `src/components/game-screen/GameStatusIndicator.tsx`**

- Stack buttons vertically on very small screens
- Use icon-only buttons on mobile with tooltips
- Reduce badge text sizes

```tsx
// Mobile: icon-only buttons
<div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center sm:justify-start">
  <SaveLoadButton size="icon" className="md:hidden" />
  <SaveLoadButton size="sm" className="hidden md:flex" />
  {/* Similar pattern for other buttons */}
</div>
```

### Phase 2: Game Over Phase Fixes

#### 2.1 PlayerStats Card Layout
**File: `src/components/game-phases/GameOverPhase/PlayerStats.tsx`**

The award cards ("Competition Beast", "Block Star", "HoH Champion") use `grid-cols-3` which causes overflow. Changes:

- Change from `grid-cols-3` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Add `overflow-hidden` to cards
- Truncate player names with `truncate` class
- Reduce avatar sizes on mobile
- Add horizontal scroll for table on mobile

```tsx
// Line 244: Fix grid layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
  {/* Award cards */}
</div>

// Award card titles: truncate and smaller text
<h3 className="text-lg md:text-xl font-semibold mb-1 truncate">Competition Beast</h3>
<p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">Most competitions won</p>

// Avatar sizes: smaller on mobile
<div className="w-12 h-12 md:w-16 md:h-16 ...">
```

#### 2.2 GameSummary Your Journey Section
**File: `src/components/game-phases/GameOverPhase/GameSummary.tsx`**

- Add `truncate` to player names
- Ensure stats labels and values display properly on mobile
- Add `line-clamp-3` to the summary text paragraph

```tsx
// Line 188: Fix summary text overflow
<div className="mt-4 p-3 bg-gray-50 rounded-md border text-sm">
  <p className="line-clamp-3 md:line-clamp-none">
    {/* Summary text */}
  </p>
</div>
```

#### 2.3 Final Standings List
- Add `overflow-hidden` to the card container
- Truncate names in the standings list
- Make avatars smaller on mobile

### Phase 3: Competition Phases Mobile Fixes

#### 3.1 HOH Competition Results
**File: `src/components/game-phases/HOHCompetition/CompetitionResults.tsx`**

- Reduce winner name font size on mobile
- Stack results list more compactly
- Smaller avatars on mobile

```tsx
// Winner name: responsive sizing
<p className="text-2xl md:text-3xl font-bold font-display text-bb-gold truncate">
  {winner.name}
</p>
```

#### 3.2 Final HoH Phase
**File: `src/components/game-phases/FinalHoHPhase.tsx`**

- Stack finalist selection cards vertically on mobile
- Reduce part status indicator sizes
- More compact competition progress display

```tsx
// Line 459: Stack finalists on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
  {otherFinalists.map(finalist => (
    // Finalist cards
  ))}
</div>
```

### Phase 4: Eviction Phase Mobile Fixes

#### 4.1 Eviction Phase Nominees Display
**File: `src/components/game-phases/EvictionPhase.tsx`**

- Stack nominees vertically on very small screens
- Reduce nominee card padding
- Smaller target icon between nominees

```tsx
// Line 206: Responsive nominee layout
<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
  {nominees.map((nominee, index) => (
    // Nominee display
  ))}
</div>
```

### Phase 5: Sidebar Mobile Fixes

#### 5.1 Game Sidebar
**File: `src/components/game-screen/GameSidebar.tsx`**

- Reduce card content padding on mobile
- Make houseguest list more compact
- Smaller nominee displays

#### 5.2 HouseguestCardCompact
**File: `src/components/houseguest/HouseguestCardCompact.tsx`**

- Ensure proper truncation of all text
- Smaller avatars on mobile
- More compact badge display

### Phase 6: Finale Phase Mobile Fixes

#### 6.1 Finale Intro Screen
**File: `src/components/game-phases/FinalePhase.tsx`**

- Stack finalists vertically on mobile
- Reduce "VS" divider size
- Smaller jury member avatars on mobile
- Wrap jury members better

```tsx
// Line 135: Stack finalists on mobile
<div className="flex flex-col items-center justify-center gap-6 md:gap-8">
  {finalists.map((finalist, index) => (
    // Stack vertically on mobile, show VS between
  ))}
</div>

// Line 172: Better jury wrapping
<div className="flex flex-wrap justify-center gap-2 md:gap-4">
```

### Phase 7: Global CSS Utility Additions

#### 7.1 Add Extra Small Breakpoint
**File: `tailwind.config.ts`**

Add an `xs` breakpoint for very small screens:

```typescript
screens: {
  'xs': '375px',  // Add this for iPhone SE and similar
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1400px'
}
```

#### 7.2 Update Global Styles
**File: `src/index.css`**

Add mobile-specific utility classes:

```css
/* Mobile-specific utilities */
@layer utilities {
  .text-responsive-sm {
    @apply text-xs sm:text-sm;
  }
  
  .text-responsive-base {
    @apply text-sm sm:text-base;
  }
  
  .text-responsive-lg {
    @apply text-base sm:text-lg md:text-xl;
  }
  
  .text-responsive-xl {
    @apply text-lg sm:text-xl md:text-2xl;
  }
  
  .p-responsive {
    @apply p-3 sm:p-4 md:p-6;
  }
  
  .gap-responsive {
    @apply gap-2 sm:gap-3 md:gap-4;
  }
}

/* Ensure no horizontal overflow on mobile */
.game-card {
  @apply max-w-full overflow-hidden;
}
```

### Phase 8: Game Card Component

#### 8.1 Update GameCard Components
**File: `src/components/ui/game-card.tsx`**

- Add `max-w-full` to prevent overflow
- Reduce padding on mobile

```tsx
// GameCardContent: responsive padding
<div className={cn('game-card-content p-3 sm:p-4 md:p-6', className)}>
  {children}
</div>

// GameCardFooter: responsive padding
<div className={cn('game-card-footer p-3 sm:p-4 md:p-6 ...', className)}>
  {children}
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add `xs` breakpoint (375px) for very small screens |
| `src/index.css` | Add responsive utility classes; ensure game-card has max-w-full |
| `src/components/ui/phase-indicator.tsx` | Smaller circles/labels on mobile; overflow-x-auto |
| `src/components/ui/game-card.tsx` | Responsive padding; max-w-full |
| `src/components/game-screen/GameHeader.tsx` | Smaller title on mobile; compact layout |
| `src/components/game-screen/GameStatusIndicator.tsx` | Icon-only buttons on mobile; compact badges |
| `src/components/game-phases/GameOverPhase/PlayerStats.tsx` | Responsive grid; truncation; smaller avatars |
| `src/components/game-phases/GameOverPhase/GameSummary.tsx` | Truncation; line-clamp; responsive text sizes |
| `src/components/game-phases/HOHCompetition/CompetitionResults.tsx` | Responsive winner display |
| `src/components/game-phases/FinalHoHPhase.tsx` | Stack finalist cards on mobile |
| `src/components/game-phases/EvictionPhase.tsx` | Stack nominees on mobile |
| `src/components/game-phases/FinalePhase.tsx` | Responsive finalist and jury layouts |
| `src/components/game-screen/GameSidebar.tsx` | Compact mobile layout |

---

## Testing Checkpoints

After implementation, the following should be verified on mobile (375px viewport):

1. Phase indicator shows all 6 phases without horizontal overflow
2. Game Over stats cards display in a single column
3. Player names truncate properly instead of running off screen
4. "Your Journey" summary text is readable with line clamping
5. Competition results fit within card boundaries
6. Eviction nominee display stacks vertically
7. Finale jury members wrap properly
8. All action buttons are accessible and tappable
9. No horizontal scrollbar appears on the main game screen

---

## Implementation Priority

1. **High Priority** (fixes critical usability issues):
   - Phase indicator overflow fix
   - PlayerStats grid layout fix
   - GameSummary truncation

2. **Medium Priority** (improves mobile experience):
   - GameStatusIndicator compact buttons
   - Competition results responsive sizing
   - Eviction phase stacking

3. **Lower Priority** (polish and consistency):
   - Global responsive utility classes
   - xs breakpoint addition
   - Sidebar optimizations
