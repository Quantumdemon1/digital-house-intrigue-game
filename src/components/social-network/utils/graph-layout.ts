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
 */
export function calculateCircularLayout(
  houseguests: Houseguest[],
  playerId: string,
  containerSize: { width: number; height: number }
): Map<string, Position> {
  const positions = new Map<string, Position>();
  const { width, height } = containerSize;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Calculate radius based on container size
  const radius = Math.min(width, height) * 0.35;
  
  // Find player and separate from others
  const player = houseguests.find(h => h.id === playerId);
  const others = houseguests.filter(h => h.id !== playerId);
  
  // Player position - prominent on the left
  if (player) {
    positions.set(player.id, {
      x: width * 0.15,
      y: centerY
    });
  }
  
  // Distribute others in a semi-circle on the right
  const angleStart = -Math.PI / 2; // Start from top
  const angleEnd = Math.PI / 2; // End at bottom
  const angleStep = others.length > 1 ? (angleEnd - angleStart) / (others.length - 1) : 0;
  
  others.forEach((houseguest, index) => {
    const angle = angleStart + angleStep * index;
    const x = centerX + radius * 0.6 + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
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
