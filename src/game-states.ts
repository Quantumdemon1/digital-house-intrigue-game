
/**
 * @file game-states.ts
 * @description Contains the state machine for the Big Brother game
 */

import { BigBrotherGame } from './models/BigBrotherGame';
import { Houseguest } from './models/houseguest';
import type { IGameControllerFacade } from './types/interfaces';

// Base state that all other states inherit from
export abstract class GameStateBase {
  protected game: BigBrotherGame;
  protected controller: IGameControllerFacade;

  constructor(controller: IGameControllerFacade) {
    this.controller = controller;
    this.game = controller.gameController.game;
  }

  // Life cycle methods
  async enter(): Promise<void> {
    // Default implementation
  }

  async exit(): Promise<void> {
    // Default implementation
  }

  async update(): Promise<void> {
    // Default implementation
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    // Default implementation returns false (not handled)
    return false;
  }

  protected getLogger(): any {
    return this.controller.logger;
  }

  // Helper method to transition to another state
  protected async transitionTo(StateConstructor: typeof GameStateBase): Promise<void> {
    await this.controller.transitionTo(StateConstructor);
  }
}

// Game initialization state
export class InitializationState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering InitializationState");
    
    // Here we would set up the initial game state
    // For Phase 1 we'll just have placeholder implementation
    
    // After setup, transition to first phase
    // In phase 2 we'll transition to HohCompetitionState
    
    this.getLogger().info("InitializationState complete");
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    switch (actionId) {
      case 'start_game':
        this.getLogger().info("Game start action received");
        return true;
      default:
        return false;
    }
  }
}

// HoH competition state
export class HohCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering HoH Competition");
    this.game.phase = 'HoH';
    
    // Implementation will come in Phase 2
  }
}

// Nomination state
export class NominationState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering Nomination Phase");
    this.game.phase = 'Nomination';
    
    // Implementation will come in Phase 2
  }
}

// PoV competition state
export class PovCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering PoV Competition");
    this.game.phase = 'PoV';
    
    // Implementation will come in Phase 2
  }
}

// PoV meeting state
export class PovMeetingState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering PoV Meeting");
    this.game.phase = 'PoVMeeting';
    
    // Implementation will come in Phase 2
  }
}

// Eviction state
export class EvictionState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering Eviction Phase");
    this.game.phase = 'Eviction';
    
    // Implementation will come in Phase 2
  }
}

// Final stage state
export class FinalStageState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering Final Stage");
    this.game.phase = 'Final';
    
    // Implementation will come in Phase 2
  }
}

// Game over state
export class GameOverState extends GameStateBase {
  async enter(): Promise<void> {
    this.getLogger().info("Entering Game Over");
    this.game.phase = 'GameOver';
    
    // Implementation will come in Phase 2
  }
}

// Export all state classes for dynamic instantiation
export const states = {
  InitializationState,
  HohCompetitionState,
  NominationState,
  PovCompetitionState,
  PovMeetingState,
  EvictionState,
  FinalStageState,
  GameOverState
};
