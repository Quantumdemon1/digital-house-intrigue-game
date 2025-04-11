
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
  | 'general_interaction' // General interaction
  | 'strategy_discussion' // Discussed game strategy
  | 'deception' // Deceived another player
  | 'confrontation' // Had a confrontation
  | 'positive_connection' // Made a positive connection
  | 'negative_interaction' // Had a negative interaction
  | 'alliance_exposed' // Alliance was exposed
  | 'alliance_meeting' // Had an alliance meeting
  | 'alliance_target_discussion' // Discussed targets with alliance
  | 'alliance_vote_coordination' // Coordinated votes with alliance
  | 'eavesdropped' // Overheard a conversation
  | 'loyalty_proven' // Proved loyalty to alliance/ally
  | 'loyalty_questioned'; // Had loyalty questioned
