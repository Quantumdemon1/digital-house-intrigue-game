
/**
 * @file index.ts
 * @description Central export for all game state classes
 */

// Export the base state and actions interface
export { GameStateBase, type SocialActionChoice } from './GameStateBase';

// Export all state classes
export { InitializationState } from './InitializationState';
export { HohCompetitionState } from './HohCompetitionState';
export { NominationState } from './NominationState';
export { SocialInteractionState } from './SocialInteractionState';
export { PovCompetitionState } from './PovCompetitionState';
export { PovMeetingState } from './PovMeetingState';
export { EvictionState } from './EvictionState';
export { FinalStageState } from './FinalStageState';
export { GameOverState } from './GameOverState';

// Export all state classes in a named object for dynamic instantiation
import { InitializationState } from './InitializationState';
import { HohCompetitionState } from './HohCompetitionState';
import { NominationState } from './NominationState';
import { SocialInteractionState } from './SocialInteractionState';
import { PovCompetitionState } from './PovCompetitionState';
import { PovMeetingState } from './PovMeetingState';
import { EvictionState } from './EvictionState';
import { FinalStageState } from './FinalStageState';
import { GameOverState } from './GameOverState';

export const states = {
  InitializationState,
  HohCompetitionState,
  NominationState,
  SocialInteractionState,
  PovCompetitionState,
  PovMeetingState,
  EvictionState,
  FinalStageState,
  GameOverState
};
