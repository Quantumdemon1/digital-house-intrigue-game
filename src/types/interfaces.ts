
import type * as GameStates from '../game-states'; 
import type { GameEvent } from '../models/BigBrotherGame'; 
import type { Houseguest } from '../models/houseguest'; 
import type { BigBrotherGame } from '../models/BigBrotherGame';
// Import actual system types
import type { RelationshipSystem } from '../systems/relationship-system';
import type { CompetitionSystem } from '../systems/competition-system';
import type { AIIntegrationSystem } from '../systems/ai-integration';
import type { GameRecapGenerator } from '../utils/recap';
import type { Logger } from '../utils/logger';

// Defines the interface for methods the Game States need from the Controller
export interface IGameControllerFacade {
  game: BigBrotherGame; // Added game property to fix the build error
  transitionTo(StateType: typeof GameStates.GameStateBase): Promise<void>;
  getGameStatus(): { week: number; phase: string; hoh: string | null; nominees: string; povHolder: string | null; };
  handlePlayerAction(actionId: string, params: any): Promise<boolean>;
  saveGame(): Promise<boolean>;
  loadGame(): Promise<boolean>;
  promptNextAction(): void; // Added this method
  // Provide direct access to systems for states
  relationshipSystem: RelationshipSystem;
  competitionSystem: CompetitionSystem;
  aiSystem: AIIntegrationSystem;
  recapGenerator: GameRecapGenerator;
  logger: Logger;
  uiManager: IUIManagerFacade | null; // The UI facade
}

// Defines the interface for methods the Backend (Game/States) needs from the UI
export interface IUIManagerFacade {
  displayNarratorMessage(message: string): void;
  displayDialogue(speakerName: string, text: string, mood?: string): void;
  showChoices(choices: any[]): Promise<string | null>; // Define choice structure properly later
  updateStatus(statusData: any): void; // Define status structure later
  initializePortraits(houseguests: Houseguest[]): void;
  highlightSpeaker(speakerName: string): void;
  updateLocationBackground(locationId: string): void;
  showEventScreen(screenType: string, data: any): void;
  hideAllEventScreens(): void;
  presentCompetitionChallenge(challengeData: any): Promise<number>; // Define challenge structure later
  updateGameLog(eventLog: GameEvent[]): void;
  showRecapScreen(recapText: string): void;
  showLocationChoices(availableActions: any[]): Promise<string | null>; // Define action structure later
  showToast(title: string, options?: { description?: string; variant?: 'success' | 'error' | 'info' | 'warning'; duration?: number }): void;
}
