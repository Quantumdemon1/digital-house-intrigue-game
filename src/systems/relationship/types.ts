
/**
 * @file src/systems/relationship/types.ts
 * @description Type definitions for relationship system
 */

import { RelationshipEvent, RelationshipEventType } from '../../models/relationship-event';

export interface Relationship {
  score: number;        // -100 to 100 scale
  alliance: string | null; // alliance ID if they're in an alliance together
  notes: string[];      // Important events that affected relationship
  events: RelationshipEvent[]; // History of significant relationship events
  lastInteractionWeek: number; // Last week there was a direct interaction
}

export type RelationshipMap = Map<string, Map<string, Relationship>>;
