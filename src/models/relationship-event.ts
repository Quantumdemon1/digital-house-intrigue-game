
/**
 * @file src/models/relationship-event.ts
 * @description Model for relationship events and memory
 */

export interface RelationshipEvent {
  timestamp: number;
  type: RelationshipEventType;
  description: string;
  impactScore: number; // The initial impact on relationship score
  decayable: boolean;  // Whether this event's impact should decay over time
  decayRate?: number;  // Custom decay rate (defaults to global rate if not specified)
}

export type RelationshipEventType = 
  | 'betrayal'      // Nominated/voted against ally
  | 'saved'         // Used veto to save
  | 'protected'     // Didn't nominate when had opportunity
  | 'nominated'     // Nominated for eviction
  | 'voted_against' // Voted for eviction
  | 'voted_for'     // Voted to keep
  | 'shared_info'   // Shared game information
  | 'lied'          // Lied about game information
  | 'alliance_formed' // Formed alliance
  | 'alliance_betrayed' // Betrayed alliance
  | 'competition_help' // Helped in competition
  | 'general_interaction'; // General interaction
