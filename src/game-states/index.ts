
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
export { PovPlayerSelectionState } from './PovPlayerSelectionState'; // Add new state
export { PovCompetitionState } from './PovCompetitionState';
export { PovMeetingState } from './PovMeetingState';
export { EvictionState } from './EvictionState';
export { FinalHoHState } from './FinalHoHState'; // Add new state
export { JuryQuestioningState } from './JuryQuestioningState'; // Add new state
export { FinalStageState } from './FinalStageState';
export { GameOverState } from './GameOverState';

// Export all state classes in a named object for dynamic instantiation
import { InitializationState } from './InitializationState';
import { HohCompetitionState } from './HohCompetitionState';
import { NominationState } from './NominationState';
import { SocialInteractionState } from './SocialInteractionState';
import { PovPlayerSelectionState } from './PovPlayerSelectionState'; // Add new state
import { PovCompetitionState } from './PovCompetitionState';
import { PovMeetingState } from './PovMeetingState';
import { EvictionState } from './EvictionState';
import { FinalHoHState } from './FinalHoHState'; // Add new state
import { JuryQuestioningState } from './JuryQuestioningState'; // Add new state
import { FinalStageState } from './FinalStageState';
import { GameOverState } from './GameOverState';

export const states = {
  InitializationState,
  HohCompetitionState,
  NominationState,
  SocialInteractionState,
  PovPlayerSelectionState, // Add new state
  PovCompetitionState,
  PovMeetingState,
  EvictionState,
  FinalHoHState, // Add new state
  JuryQuestioningState, // Add new state
  FinalStageState,
  GameOverState
};
