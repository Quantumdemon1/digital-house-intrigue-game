
# Fix Social Network Graph Mobile Layout

## Problem Summary

Looking at your screenshot, the social network graph has these issues on mobile:

1. **Avatar nodes are overlapping** - Morgan, Blake, RI, Sam, Quinn, and Juan are all clustered in the center
2. **Names are overlapping** - Text labels are colliding with each other  
3. **The circular layout doesn't spread properly** - Not enough space between houseguests

---

## Root Causes

### 1. Layout Radius Too Small for Mobile
The current calculation creates a radius that's too tight for mobile screens:
```typescript
const maxRadius = Math.min(usableWidth * 0.38, usableHeight * 0.38);
```
On a 350px wide mobile screen with 90px padding on each side, this gives only ~65px radius - way too small.

### 2. Arc Spread Doesn't Account for Node Sizes
The arc calculation doesn't consider that on mobile, even with smaller nodes, there needs to be minimum spacing between them.

### 3. Node Sizes Not Reduced for Mobile
The `SIZE_MAP` uses 56px "medium" nodes which take up too much space on mobile - they should be smaller.

---

## Solution

### Part 1: Mobile-Optimized Layout Algorithm

Update `graph-layout.ts` to:
- Use a larger percentage of available space on mobile
- Reduce padding since nodes will be smaller
- Ensure minimum angular spacing between nodes
- Use a full circular layout instead of arc when many houseguests

### Part 2: Smaller Nodes on Mobile

Update `NetworkNode.tsx` and `SocialNetworkGraph.tsx` to:
- Pass `isMobile` prop to nodes
- Use smaller node sizes on mobile (40px instead of 56px)
- Reduce font sizes for labels

### Part 3: Responsive Graph Container

Update `SocialNetworkGraph.tsx` to:
- Ensure proper minimum height for mobile
- Use correct container measurement

---

## Technical Changes

### File 1: `src/components/social-network/utils/graph-layout.ts`

```typescript
export function calculateCircularLayout(
  houseguests: Houseguest[],
  playerId: string,
  containerSize: { width: number; height: number },
  isMobile: boolean = false  // NEW parameter
): Map<string, Position> {
  const positions = new Map<string, Position>();
  const { width, height } = containerSize;
  
  // Smaller padding on mobile for smaller nodes
  const padding = isMobile ? 60 : 90;
  const nodeSize = isMobile ? 40 : 56;
  
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const player = houseguests.find(h => h.id === playerId);
  const others = houseguests.filter(h => h.id !== playerId);
  
  // Player position - ensure within bounds
  if (player) {
    positions.set(player.id, {
      x: padding + (isMobile ? 40 : 60),
      y: centerY
    });
  }
  
  // Mobile: use larger percentage of available space
  const radiusMultiplier = isMobile ? 0.42 : 0.38;
  const maxRadius = Math.min(usableWidth * radiusMultiplier, usableHeight * radiusMultiplier);
  
  // Ensure minimum spacing between nodes based on node size
  const minNodeSpacing = nodeSize * 1.4; // 40% gap between nodes
  const circumferenceNeeded = others.length * minNodeSpacing;
  const radiusForSpacing = circumferenceNeeded / (Math.PI * 1.5); // For ~270° arc
  
  const radius = Math.max(
    Math.min(maxRadius, radiusForSpacing),
    isMobile ? 100 : 120
  );
  
  // Arc center shifted right to balance with player on left
  const arcCenterX = centerX + (isMobile ? radius * 0.15 : radius * 0.2);
  
  // Use wider arc on mobile to prevent clustering
  const totalAngle = isMobile 
    ? Math.min(Math.PI * 1.6, Math.PI * 0.9 + others.length * 0.12)
    : Math.min(Math.PI * 1.4, Math.PI * 0.8 + others.length * 0.08);
  
  const angleStart = -totalAngle / 2;
  const angleStep = others.length > 1 ? totalAngle / (others.length - 1) : 0;
  
  others.forEach((houseguest, index) => {
    const angle = angleStart + angleStep * index;
    let x = arcCenterX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);
    
    // Clamp with reduced padding for mobile
    x = Math.max(padding, Math.min(width - padding, x));
    y = Math.max(padding, Math.min(height - padding, y));
    
    positions.set(houseguest.id, { x, y });
  });
  
  return positions;
}
```

### File 2: `src/components/social-network/NetworkNode.tsx`

Add mobile-specific sizes:

```typescript
interface NetworkNodeProps {
  // ...existing props
  isMobile?: boolean;  // NEW
}

const SIZE_MAP = {
  small: { node: 32, ring: 36, fontSize: 9, iconSize: 10 },    // Smaller for mobile
  medium: { node: 56, ring: 62, fontSize: 12, iconSize: 14 },
  large: { node: 72, ring: 80, fontSize: 14, iconSize: 16 }
};

// Mobile-specific size map
const MOBILE_SIZE_MAP = {
  small: { node: 28, ring: 32, fontSize: 8, iconSize: 9 },
  medium: { node: 40, ring: 44, fontSize: 10, iconSize: 12 },  // Reduced from 56 to 40
  large: { node: 52, ring: 58, fontSize: 11, iconSize: 14 }    // Reduced from 72 to 52
};
```

And use the correct map based on `isMobile` prop.

### File 3: `src/components/social-network/SocialNetworkGraph.tsx`

Pass mobile info to layout function and nodes:

```typescript
// In positions calculation
const positions = useMemo(() => 
  calculateCircularLayout(activeHouseguests, playerId, containerSize, isMobile),
  [activeHouseguests, playerId, containerSize, isMobile]
);

// When rendering NetworkNode
<NetworkNode
  key={houseguest.id}
  houseguest={houseguest}
  position={position}
  isPlayer={isPlayer}
  isSelected={selectedId === houseguest.id}
  perception={perception}
  size={isPlayer ? 'large' : 'medium'}
  isMobile={isMobile}  // NEW
  onClick={() => handleNodeClick(houseguest)}
/>
```

---

## Visual Comparison

| Metric | Before (Mobile) | After (Mobile) |
|--------|-----------------|----------------|
| Node size | 56px | 40px |
| Player node | 72px | 52px |
| Layout radius | ~65px | ~100px+ |
| Arc spread | ~1.0π | ~1.6π |
| Min spacing | None | 56px (1.4× node) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/social-network/utils/graph-layout.ts` | Add `isMobile` param, calculate larger radius, wider arc |
| `src/components/social-network/NetworkNode.tsx` | Add `isMobile` prop, use smaller size map for mobile |
| `src/components/social-network/SocialNetworkGraph.tsx` | Pass `isMobile` to layout function and nodes |

---

## Expected Result

After these changes, on mobile:
- Nodes will be smaller (40px vs 56px) giving more room
- The layout will spread nodes in a wider arc around the graph
- Names will have enough spacing to not overlap
- Player (Morgan with "YOU" label) will be clearly visible on the left
- Other houseguests will be distributed evenly around the right side
