/**
 * @file src/components/social-network/utils/connection-renderer.ts
 * @description SVG path generation for curved connection lines
 */

import { Position } from './graph-layout';

/**
 * Generate curved path between two points using quadratic bezier
 */
export function generateConnectionPath(
  from: Position,
  to: Position,
  curvature: number = 0.2
): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  // Calculate perpendicular offset for curve
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Control point offset perpendicular to line
  const offsetX = -dy * curvature;
  const offsetY = dx * curvature;
  
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;
  
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

/**
 * Generate straight path between two points (for strong relationships)
 */
export function generateStraightPath(from: Position, to: Position): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

/**
 * Generate alliance enclosure path (rounded blob around members)
 */
export function generateAllianceEnclosure(
  memberPositions: Position[],
  padding: number = 50
): string {
  if (memberPositions.length === 0) return '';
  
  if (memberPositions.length === 1) {
    // Single member - draw a circle
    const pos = memberPositions[0];
    return `M ${pos.x - padding} ${pos.y} 
            a ${padding} ${padding} 0 1 1 ${padding * 2} 0 
            a ${padding} ${padding} 0 1 1 ${-padding * 2} 0`;
  }
  
  if (memberPositions.length === 2) {
    // Two members - draw a pill shape
    const [p1, p2] = memberPositions;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;
    
    const offsetX = Math.cos(perpAngle) * padding;
    const offsetY = Math.sin(perpAngle) * padding;
    
    return `M ${p1.x + offsetX} ${p1.y + offsetY}
            L ${p2.x + offsetX} ${p2.y + offsetY}
            A ${padding} ${padding} 0 0 1 ${p2.x - offsetX} ${p2.y - offsetY}
            L ${p1.x - offsetX} ${p1.y - offsetY}
            A ${padding} ${padding} 0 0 1 ${p1.x + offsetX} ${p1.y + offsetY}`;
  }
  
  // Multiple members - use convex hull with rounded corners
  const hull = computeConvexHull(memberPositions);
  return generateRoundedHullPath(hull, padding);
}

/**
 * Compute convex hull using Graham scan algorithm
 */
function computeConvexHull(points: Position[]): Position[] {
  if (points.length < 3) return points;
  
  // Find the point with lowest y (and leftmost if tie)
  let start = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[start].y || 
        (points[i].y === points[start].y && points[i].x < points[start].x)) {
      start = i;
    }
  }
  
  // Sort points by polar angle with respect to start
  const startPoint = points[start];
  const sortedPoints = points
    .filter((_, i) => i !== start)
    .sort((a, b) => {
      const angleA = Math.atan2(a.y - startPoint.y, a.x - startPoint.x);
      const angleB = Math.atan2(b.y - startPoint.y, b.x - startPoint.x);
      return angleA - angleB;
    });
  
  const hull: Position[] = [startPoint];
  
  for (const point of sortedPoints) {
    while (hull.length > 1 && !isCounterClockwise(hull[hull.length - 2], hull[hull.length - 1], point)) {
      hull.pop();
    }
    hull.push(point);
  }
  
  return hull;
}

/**
 * Check if three points make a counter-clockwise turn
 */
function isCounterClockwise(p1: Position, p2: Position, p3: Position): boolean {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x) > 0;
}

/**
 * Generate a rounded path around a convex hull
 */
function generateRoundedHullPath(hull: Position[], padding: number): string {
  if (hull.length === 0) return '';
  
  // Expand hull outward
  const expandedHull = hull.map((point, i) => {
    const prev = hull[(i - 1 + hull.length) % hull.length];
    const next = hull[(i + 1) % hull.length];
    
    // Calculate outward normal (average of two edge normals)
    const dx1 = point.x - prev.x;
    const dy1 = point.y - prev.y;
    const dx2 = next.x - point.x;
    const dy2 = next.y - point.y;
    
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    const nx1 = -dy1 / len1;
    const ny1 = dx1 / len1;
    const nx2 = -dy2 / len2;
    const ny2 = dx2 / len2;
    
    const nx = (nx1 + nx2) / 2;
    const ny = (ny1 + ny2) / 2;
    const nlen = Math.sqrt(nx * nx + ny * ny);
    
    return {
      x: point.x + (nx / nlen) * padding,
      y: point.y + (ny / nlen) * padding
    };
  });
  
  // Generate path with smooth curves
  let path = `M ${expandedHull[0].x} ${expandedHull[0].y}`;
  
  for (let i = 0; i < expandedHull.length; i++) {
    const next = expandedHull[(i + 1) % expandedHull.length];
    path += ` L ${next.x} ${next.y}`;
  }
  
  path += ' Z';
  return path;
}
