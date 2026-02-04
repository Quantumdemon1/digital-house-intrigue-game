
# Plan: Social Network Visualization Improvements

## Overview

Enhance the Social Network feature to fix visibility issues (characters off-screen), improve mobile responsiveness, create a more informative legend with Big Brother-themed symbols, and polish the overall visual design.

---

## Part 1: Fix Layout Algorithm for Better Visibility

### Modify: `src/components/social-network/utils/graph-layout.ts`

**Problem**: Current layout places player at 15% width and distributes others in a semicircle that can extend beyond visible bounds.

**Solution**: Implement a smarter layout with proper padding and adaptive positioning:

```typescript
export function calculateCircularLayout(
  houseguests: Houseguest[],
  playerId: string,
  containerSize: { width: number; height: number }
): Map<string, Position> {
  const positions = new Map<string, Position>();
  const { width, height } = containerSize;
  
  // Add generous padding to keep nodes fully visible
  const padding = 80; // Account for node size + name label
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Find player and others
  const player = houseguests.find(h => h.id === playerId);
  const others = houseguests.filter(h => h.id !== playerId);
  
  // Player position - left side but within bounds
  if (player) {
    positions.set(player.id, {
      x: padding + 50, // Ensure visible with some margin
      y: centerY
    });
  }
  
  // Adaptive radius based on container and player count
  const maxRadius = Math.min(usableWidth * 0.4, usableHeight * 0.4);
  const radius = Math.min(maxRadius, Math.max(100, others.length * 25));
  
  // Center point for the arc (shifted right from center)
  const arcCenterX = centerX + radius * 0.3;
  
  // Distribute in a wider arc to prevent overlap
  const totalAngle = Math.min(Math.PI * 1.2, others.length * 0.3); // Adaptive arc
  const angleStart = -totalAngle / 2;
  const angleStep = others.length > 1 ? totalAngle / (others.length - 1) : 0;
  
  others.forEach((houseguest, index) => {
    const angle = angleStart + angleStep * index;
    let x = arcCenterX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);
    
    // Clamp to visible bounds
    x = Math.max(padding, Math.min(width - padding, x));
    y = Math.max(padding, Math.min(height - padding, y));
    
    positions.set(houseguest.id, { x, y });
  });
  
  return positions;
}
```

---

## Part 2: Mobile-Responsive Dialog Layout

### Modify: `src/components/social-network/SocialNetworkDialog.tsx`

**Changes**:
1. Use responsive sizing with the `useIsMobile` hook
2. Stack footer controls vertically on mobile
3. Simplify legend for smaller screens
4. Make the graph area scrollable/zoomable on mobile

```typescript
// Import mobile hook
import { useIsMobile } from '@/hooks/use-mobile';

// In component:
const isMobile = useIsMobile();

// Dialog content with responsive sizing
<DialogContent className={cn(
  "p-0 gap-0 overflow-hidden",
  isMobile 
    ? "w-[98vw] h-[95vh] max-w-none max-h-none" 
    : "max-w-[95vw] w-[1200px] h-[90vh] max-h-[800px]"
)}>
```

**Footer Layout for Mobile**:
```tsx
<div className={cn(
  "px-4 py-3 border-t bg-muted/30",
  isMobile && "px-3 py-2"
)}>
  <div className={cn(
    "flex items-center",
    isMobile ? "flex-col gap-3" : "justify-between"
  )}>
    {/* Alliance section and button */}
  </div>
</div>
```

---

## Part 3: Enhanced Legend with Status Symbols

### Modify: `src/components/social-network/SocialNetworkDialog.tsx`

Create a comprehensive legend that explains both relationship colors AND status symbols:

```tsx
// New Legend Component
const NetworkLegend = ({ isMobile }: { isMobile: boolean }) => (
  <div className={cn(
    "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",
    isMobile ? "gap-x-3" : "gap-x-6"
  )}>
    {/* Relationship Colors */}
    <div className="flex items-center gap-4">
      <span className="font-medium text-muted-foreground uppercase tracking-wide">
        Relationships:
      </span>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
        <span>Allies</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400" />
        <span>Neutral</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-red-500" />
        <span>Enemies</span>
      </div>
    </div>
    
    {/* Line Thickness */}
    <div className="flex items-center gap-2 border-l pl-4 border-muted">
      <span className="text-muted-foreground">Strength:</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-0.5 bg-muted-foreground rounded" />
        <span className="text-[10px]">Weak</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-1.5 bg-muted-foreground rounded" />
        <span className="text-[10px]">Strong</span>
      </div>
    </div>
    
    {/* Status Symbols - NEW */}
    <div className="flex items-center gap-3 border-l pl-4 border-muted">
      <span className="font-medium text-muted-foreground uppercase tracking-wide">
        Status:
      </span>
      <div className="flex items-center gap-1.5">
        <HoHIcon className="h-4 w-4" />
        <span>HoH</span>
      </div>
      <div className="flex items-center gap-1.5">
        <PoVIcon className="h-4 w-4" />
        <span>PoV</span>
      </div>
      <div className="flex items-center gap-1.5">
        <NomineeIcon className="h-4 w-4" />
        <span>Nominee</span>
      </div>
    </div>
  </div>
);
```

---

## Part 4: Custom Big Brother-Themed Status Icons

### New File: `src/components/social-network/StatusIcons.tsx`

Create custom SVG icons that match the Big Brother theme instead of generic Lucide icons:

```typescript
// Head of Household - Golden Crown with BB styling
export const HoHIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--bb-gold))" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="hsl(var(--bb-gold))" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2L15.5 8L22 9L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9L8.5 8L12 2Z"
      fill="url(#goldGradient)"
      stroke="hsl(36, 60%, 35%)"
      strokeWidth="0.5"
    />
    <text x="12" y="14" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#4a3000">H</text>
  </svg>
);

// Power of Veto - Golden Veto medallion
export const PoVIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <radialGradient id="vetoGradient" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="100%" stopColor="hsl(var(--bb-gold))" />
      </radialGradient>
    </defs>
    {/* Octagonal veto shape */}
    <polygon 
      points="12,2 17,5 20,10 20,14 17,19 12,22 7,19 4,14 4,10 7,5"
      fill="url(#vetoGradient)"
      stroke="hsl(36, 60%, 35%)"
      strokeWidth="0.75"
    />
    <text x="12" y="14" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#4a3000">V</text>
  </svg>
);

// Nominee - Red target/crosshairs
export const NomineeIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="9" fill="hsl(var(--bb-red))" opacity="0.9" />
    <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" fill="white" opacity="0.9" />
    <line x1="12" y1="2" x2="12" y2="6" stroke="white" strokeWidth="1.5" />
    <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="1.5" />
    <line x1="2" y1="12" x2="6" y2="12" stroke="white" strokeWidth="1.5" />
    <line x1="18" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5" />
  </svg>
);
```

---

## Part 5: Update NetworkNode with Custom Icons

### Modify: `src/components/social-network/NetworkNode.tsx`

Replace Lucide icons with the custom Big Brother-themed icons:

```typescript
import { HoHIcon, PoVIcon, NomineeIcon } from './StatusIcons';

// Replace the status badges section with:
{/* HoH Badge */}
{isHoH && (
  <g transform={`translate(${position.x + sizeConfig.node / 2 - 6}, ${position.y - sizeConfig.node / 2 - 8})`}>
    <HoHIcon className="w-5 h-5" />
  </g>
)}

{/* PoV Badge */}
{isPovHolder && !isHoH && (
  <g transform={`translate(${position.x + sizeConfig.node / 2 - 6}, ${position.y - sizeConfig.node / 2 - 8})`}>
    <PoVIcon className="w-5 h-5" />
  </g>
)}

{/* Nominee Badge */}
{isNominated && (
  <g transform={`translate(${position.x - sizeConfig.node / 2 - 2}, ${position.y - sizeConfig.node / 2 - 8})`}>
    <NomineeIcon className="w-5 h-5" />
  </g>
)}
```

---

## Part 6: Improve Graph Container

### Modify: `src/components/social-network/SocialNetworkGraph.tsx`

Add proper minimum height calculations and enable pan/zoom for mobile:

```typescript
// Update container size tracking
useEffect(() => {
  const updateSize = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Ensure minimum dimensions for good spacing
      const minHeight = Math.max(400, activeHouseguests.length * 45);
      setContainerSize({ 
        width: Math.max(rect.width, 300), 
        height: Math.max(rect.height, minHeight) 
      });
    }
  };
  
  updateSize();
  // ... rest
}, [activeHouseguests.length]);
```

**Add touch-based pan/zoom for mobile**:
```tsx
<div 
  ref={containerRef} 
  className={cn(
    "w-full h-full min-h-[400px] relative touch-pan-x touch-pan-y",
    isMobile && "overflow-auto"
  )}
>
  {/* SVG with viewBox that scales properly */}
</div>
```

---

## Part 7: Compact Mobile Legend

### New: Collapsible legend for mobile

```tsx
{/* Mobile: Collapsible Legend */}
{isMobile ? (
  <Collapsible>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm" className="w-full justify-between">
        <span className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Legend & Help
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <NetworkLegend isMobile={true} />
    </CollapsibleContent>
  </Collapsible>
) : (
  <NetworkLegend isMobile={false} />
)}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/social-network/StatusIcons.tsx` | Custom BB-themed SVG icons for HoH, PoV, Nominee |
| `src/components/social-network/NetworkLegend.tsx` | Reusable legend component with responsive design |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/social-network/utils/graph-layout.ts` | Fix layout algorithm with proper bounds/padding |
| `src/components/social-network/SocialNetworkDialog.tsx` | Mobile responsiveness, improved legend |
| `src/components/social-network/SocialNetworkGraph.tsx` | Better container sizing, mobile touch support |
| `src/components/social-network/NetworkNode.tsx` | Use custom icons instead of generic ones |

---

## Visual Improvements Summary

1. **Layout**: Nodes will stay within visible bounds with proper padding
2. **Mobile**: Full-screen dialog with stacked controls and collapsible legend
3. **Legend**: Shows both relationship colors AND game status symbols
4. **Icons**: Custom SVG icons with gradients matching the Big Brother aesthetic:
   - HoH: Golden star/crown with "H" 
   - PoV: Golden octagonal medallion with "V"
   - Nominee: Red target with crosshairs
5. **Responsive**: Graph area fills available space and scrolls if needed on mobile
