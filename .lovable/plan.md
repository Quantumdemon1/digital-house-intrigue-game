
# Plan: Complete UI/UX Overhaul for Eviction & Sidebar

## Problems Identified from Screenshot

1. **Voting Buttons Cut Off**: Player vote buttons display full nominee names ("Casey Wilson", "Av...") causing overflow and clipping
2. **Sidebar Houseguest Cards Overflow**: The "Active Houseguests" section shows cards that are too wide, with names like "Jamie Roberts" and "Sam Williams" being cut off
3. **Horizontal Overflow**: The sidebar content extends beyond its container width
4. **Grid Layout Issues**: HouseguestList uses a 4-column grid that doesn't fit in the sidebar context
5. **Text Truncation Missing**: Names and occupations overflow their containers without proper truncation

---

## Solution Overview

### 1. Fix Voting Buttons - Use Short Labels
Replace full nominee names with shorter button text to prevent overflow.

**File**: `src/components/game-phases/EvictionPhase/VoterDisplay.tsx`

Changes:
- Replace `{nominee.name}` with first name only or "Vote 1" / "Vote 2" pattern
- Add tooltip showing full nominee name
- Make buttons wrap properly on smaller screens

```typescript
// Before
<Button>
  <Vote className="h-3 w-3 mr-1" />
  {nominee.name}  // Full name causes overflow
</Button>

// After
<Tooltip>
  <TooltipTrigger asChild>
    <Button className="flex-shrink-0 min-w-0">
      <Vote className="h-3 w-3 mr-1" />
      <span className="truncate max-w-[80px]">
        {nominee.name.split(' ')[0]}  // First name only
      </span>
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Vote to evict {nominee.name}</p>
  </TooltipContent>
</Tooltip>
```

---

### 2. Fix Sidebar HouseguestList Layout
Create a dedicated compact layout for when displayed in the sidebar.

**File**: `src/components/HouseguestList.tsx`

Changes:
- Change grid to single column for sidebar context
- Use a compact card variant optimized for narrow widths
- Add horizontal scroll fallback if needed

```typescript
// Change from 4-column grid to responsive single/2-column
<div className="grid grid-cols-1 gap-2">
  {activeHouseguests.map(houseguest => (
    <CompactHouseguestCard key={houseguest.id} houseguest={houseguest} />
  ))}
</div>
```

---

### 3. Create Compact Houseguest Card Variant
Create a horizontal card layout that fits better in the sidebar.

**New File**: `src/components/houseguest/HouseguestCardCompact.tsx`

Features:
- Horizontal layout (avatar left, info right)
- Smaller avatar size
- Truncated names with ellipsis
- Status badges positioned compactly
- Fixed width constraints

```typescript
<div className="flex items-center gap-3 p-2 rounded-lg border bg-card">
  <StatusAvatar name={name} status={status} size="sm" />
  <div className="flex-1 min-w-0">  {/* min-w-0 enables truncation */}
    <p className="font-medium truncate">{houseguest.name}</p>
    <p className="text-xs text-muted-foreground truncate">
      {houseguest.age} - {houseguest.occupation}
    </p>
  </div>
  <HouseguestBadges houseguest={houseguest} compact />
</div>
```

---

### 4. Fix HouseguestCard Text Overflow
Add proper text truncation and min-width constraints.

**File**: `src/components/houseguest/HouseguestCard.tsx`

Changes:
- Add `min-w-0` to flex containers to enable truncation
- Add `truncate` class to name and occupation
- Reduce padding for tighter layout
- Cap card max-width

```typescript
<h3 className="font-bold text-center truncate max-w-full">
  {houseguest.name}
</h3>
<p className="text-xs text-muted-foreground text-center mt-0.5 truncate">
  {houseguest.age} - {houseguest.occupation}
</p>
```

---

### 5. Fix GameSidebar Scroll Container
Ensure sidebar content respects boundaries.

**File**: `src/components/game-screen/GameSidebar.tsx`

Changes:
- Add `overflow-hidden` to parent containers
- Ensure ScrollArea doesn't allow horizontal overflow
- Add proper width constraints

```typescript
<Card className="game-card overflow-hidden">
  <ScrollArea className="h-[400px]">
    <CardContent className="p-3 overflow-hidden">
      <HouseguestListComponent compact />
    </CardContent>
  </ScrollArea>
</Card>
```

---

### 6. Improve HouseguestBadges for Compact Mode
Add compact variant for badges that uses icons only.

**File**: `src/components/houseguest/HouseguestBadges.tsx`

Changes:
- Add `compact` prop
- In compact mode, show only icons without text labels
- Stack vertically for narrow spaces

```typescript
{houseguest.isHoH && (
  <Badge className={compact ? "p-1" : "px-2"}>
    <Crown className="h-3 w-3" />
    {!compact && <span className="ml-1">HoH</span>}
  </Badge>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/game-phases/EvictionPhase/VoterDisplay.tsx` | Fix vote button overflow with first names + tooltips |
| `src/components/HouseguestList.tsx` | Change to single-column layout, add compact mode support |
| `src/components/houseguest/HouseguestCard.tsx` | Add truncation, compact variant, width constraints |
| `src/components/houseguest/HouseguestBadges.tsx` | Add compact mode (icon-only badges) |
| `src/components/game-screen/GameSidebar.tsx` | Add overflow constraints, pass compact prop |

---

## Visual Comparison

### Before (Current Issues)
```
+---------------------------+
| Active Houseguests        |
+---------------------------+
| [X]  xzxc (You)           |  <- Cards too wide
|  25 - zc                  |
| [Compact][Loyal]          |  <- Traits overflow
+--[JR]---[SW]---[CW]-------+  <- Cut off cards
| Jamie  Sam     Casey      |  <- Names cut off
| Roberts Williams Wilson   |
+---------------------------+

Voting Buttons:
[Casey Wilson] [Av...]  <- Buttons cut off
```

### After (Fixed)
```
+---------------------------+
| Active Houseguests        |
+---------------------------+
| [X] xzxc (You)   25-zc    |  <- Horizontal compact card
| [JR] Jamie Roberts  27    |  <- Single column, truncated
| [SW] Sam Williams   34    |
| [CW] Casey Wilson   24    |
+---------------------------+

Voting Buttons:
[Vote Casey] [Vote Avery]   <- First names + tooltips
```

---

## Technical Details

### Key CSS Fixes

1. **Enable Text Truncation in Flex Containers**
   ```css
   .min-w-0 {
     min-width: 0;  /* Required for truncate to work in flex */
   }
   ```

2. **Button Flex Shrink Prevention**
   ```css
   .flex-shrink-0 {
     flex-shrink: 0;  /* Prevent buttons from shrinking */
   }
   ```

3. **Sidebar Card Constraints**
   ```css
   .overflow-hidden {
     overflow: hidden;  /* Clip overflow content */
   }
   ```

### Responsive Breakpoints
- Sidebar width: 320px (lg:w-80) to 384px (xl:w-96)
- Compact cards adapt to available width
- Single column layout eliminates horizontal overflow

---

## Testing Checklist

After implementation:
- [ ] Vote buttons show first names and don't overflow
- [ ] Tooltips appear on hover showing full nominee names
- [ ] Sidebar houseguest cards are single-column and compact
- [ ] Long names truncate with ellipsis
- [ ] Status badges (HoH, PoV, Nom) display correctly in compact mode
- [ ] No horizontal scrolling in sidebar
- [ ] Cards are clickable and open the houseguest dialog
- [ ] Mobile responsiveness maintained
