
/**
 * @file src/models/relationship-event.ts
 * @description Defines types for relationship events
 */

export type RelationshipEventType = 
  | 'positive_connection'
  | 'negative_interaction'
  | 'betrayal'
  | 'saved'
  | 'nominated'
  | 'voted_against'
  | 'voted_for'
  | 'alliance_formed'
  | 'alliance_betrayed'
  | 'alliance_meeting'
  | 'lied'
  | 'deception'
  | 'supported';

export interface RelationshipEvent {
  timestamp: number;
  type: RelationshipEventType;
  description: string;
  impactScore: number;
  decayable: boolean;
  decayRate?: number;
}
