/**
 * @file src/models/player-perception.ts
 * @description Player perception types for personal tracking that doesn't affect NPC behavior
 */

export type RelationshipLevel = 'ally' | 'friend' | 'neutral' | 'rival' | 'enemy';

export interface PlayerPerception {
  houseguestId: string;
  customRelationshipLevel: RelationshipLevel | null;
  inMyAlliance: boolean;           // Player's own alliance tracking
  notes: string;                   // Custom notes
  trustLevel: number;              // 1-5 scale for trust
  threatLevel: number;             // 1-5 scale for perceived threat
  lastUpdated: number;             // Timestamp
}

export interface CustomAlliance {
  id: string;
  name: string;
  memberIds: string[];
  color: string;                   // For visual grouping on graph
  createdAt: number;
}

export interface PlayerPerceptions {
  perceptions: Record<string, PlayerPerception>;
  customAlliances: CustomAlliance[];
}

export const createDefaultPerception = (houseguestId: string): PlayerPerception => ({
  houseguestId,
  customRelationshipLevel: null,
  inMyAlliance: false,
  notes: '',
  trustLevel: 3,
  threatLevel: 3,
  lastUpdated: Date.now()
});

export const createInitialPlayerPerceptions = (): PlayerPerceptions => ({
  perceptions: {},
  customAlliances: []
});

// Alliance colors for visual distinction
export const ALLIANCE_COLORS = [
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
];

export const getNextAllianceColor = (existingColors: string[]): string => {
  const availableColors = ALLIANCE_COLORS.filter(c => !existingColors.includes(c));
  return availableColors.length > 0 
    ? availableColors[0] 
    : ALLIANCE_COLORS[Math.floor(Math.random() * ALLIANCE_COLORS.length)];
};
