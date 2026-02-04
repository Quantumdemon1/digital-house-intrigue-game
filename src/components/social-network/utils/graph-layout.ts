/**
 * @file src/components/social-network/utils/graph-layout.ts
 * @description Utility functions for calculating graph layout
 */

import { Houseguest } from '@/models/houseguest';
import { CustomAlliance } from '@/models/player-perception';

export interface Position {
  x: number;
  y: number;
}

export interface ConnectionStyle {
  color: string;
  width: number;
  opacity: number;
}

export interface AllianceCircle {
  alliance: CustomAlliance;
  centerX: number;
  centerY: number;
  radius: number;
}

/**
 * Calculate positions for circular layout with player prominently on the left
 * Ensures all nodes stay within visible bounds with proper padding
 */
export function calculateCircularLayout(
  houseguests: Houseguest[],
  playerId: string,
  containerSize: { width: number; height: number }
): Map<string, Position> {
  const positions = new Map<string, Position>();
  const { width, height } = containerSize;
  
  // Generous padding to keep nodes and labels visible
  const padding = 90; // Account for node size (56px) + name label + badges
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Find player and separate from others
  const player = houseguests.find(h => h.id === playerId);
  const others = houseguests.filter(h => h.id !== playerId);
  
  // Player position - left side but within bounds
  if (player) {
    positions.set(player.id, {
      x: padding + 60, // Ensure visible with margin for "YOU" label
      y: centerY
    });
  }
  
  // Adaptive radius based on container and player count
  const maxRadius = Math.min(usableWidth * 0.38, usableHeight * 0.38);
  const minRadius = Math.max(80, others.length * 18);
  const radius = Math.min(maxRadius, Math.max(minRadius, 120));
  
  // Center point for the arc (shifted right from center for better distribution)
  const arcCenterX = centerX + radius * 0.2;
  
  // Adaptive arc angle based on number of houseguests
  // More houseguests = wider arc to prevent overlap
  const baseAngle = Math.PI * 0.8;
  const totalAngle = Math.min(Math.PI * 1.4, baseAngle + (others.length * 0.08));
  const angleStart = -totalAngle / 2;
  const angleStep = others.length > 1 ? totalAngle / (others.length - 1) : 0;
  
  others.forEach((houseguest, index) => {
    const angle = angleStart + angleStep * index;
    let x = arcCenterX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);
    
    // Clamp to visible bounds with padding
    x = Math.max(padding, Math.min(width - padding, x));
    y = Math.max(padding, Math.min(height - padding, y));
    
    positions.set(houseguest.id, { x, y });
  });
  
  return positions;
}

/**
 * Calculate connection line style based on relationship score
 */
export function getConnectionStyle(score: number): ConnectionStyle {
  const absScore = Math.abs(score);
  
  // Color based on relationship
  let color: string;
  if (score >= 80) {
    color = 'hsl(142, 71%, 45%)'; // Bright green
  } else if (score >= 50) {
    color = 'hsl(142, 69%, 73%)'; // Light green
  } else if (score >= 0) {
    color = 'hsl(45, 93%, 47%)'; // Yellow/Amber
  } else if (score >= -50) {
    color = 'hsl(0, 93%, 81%)'; // Light red
  } else {
    color = 'hsl(0, 84%, 60%)'; // Bright red
  }
  
  // Width based on absolute strength
  let width: number;
  if (absScore > 70) {
    width = 4;
  } else if (absScore > 30) {
    width = 2.5;
  } else {
    width = 1.5;
  }
  
  // Opacity based on strength
  const opacity = 0.4 + (absScore / 100) * 0.5;
  
  return { color, width, opacity };
}

/**
 * Get alliance circle bounds for visual grouping
 */
export function calculateAllianceCircles(
  alliances: CustomAlliance[],
  positions: Map<string, Position>
): AllianceCircle[] {
  return alliances.map(alliance => {
    // Get positions of all alliance members
    const memberPositions = alliance.memberIds
      .map(id => positions.get(id))
      .filter((pos): pos is Position => pos !== undefined);
    
    if (memberPositions.length === 0) {
      return {
        alliance,
        centerX: 0,
        centerY: 0,
        radius: 0
      };
    }
    
    // Calculate center as average of member positions
    const centerX = memberPositions.reduce((sum, pos) => sum + pos.x, 0) / memberPositions.length;
    const centerY = memberPositions.reduce((sum, pos) => sum + pos.y, 0) / memberPositions.length;
    
    // Calculate radius to encompass all members with padding
    const radius = memberPositions.reduce((maxDist, pos) => {
      const dist = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
      return Math.max(maxDist, dist);
    }, 0) + 60; // Add padding
    
    return {
      alliance,
      centerX,
      centerY,
      radius
    };
  });
}

/**
 * Get relationship level label and color
 */
export function getRelationshipLevelInfo(level: string | null): { label: string; color: string } {
  switch (level) {
    case 'ally':
      return { label: 'Ally', color: 'hsl(142, 71%, 45%)' };
    case 'friend':
      return { label: 'Friend', color: 'hsl(142, 69%, 73%)' };
    case 'neutral':
      return { label: 'Neutral', color: 'hsl(45, 93%, 47%)' };
    case 'rival':
      return { label: 'Rival', color: 'hsl(0, 93%, 81%)' };
    case 'enemy':
      return { label: 'Enemy', color: 'hsl(0, 84%, 60%)' };
    default:
      return { label: 'Unknown', color: 'hsl(var(--muted-foreground))' };
  }
}
