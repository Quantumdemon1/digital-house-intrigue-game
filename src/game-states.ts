
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
    // Use the controller's game property, not directly accessing game
    this.game = controller.game;
  }

  // Life cycle methods
  async enter(): Promise<void> {
    // Default implementation
    this.getLogger().info(`Entering ${this.constructor.name}`);
  }

  async exit(): Promise<void> {
    // Default implementation
    this.getLogger().info(`Exiting ${this.constructor.name}`);
  }

  async update(): Promise<void> {
    // Default implementation
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    // Log the action for verification
    this.getLogger().info(`${this.constructor.name} handling action: ${actionId}`, params);
    
    // Default implementation returns false (not handled)
    return false;
  }

  protected getLogger(): any {
    return this.controller.logger;
  }

  // Helper method to transition to another state
  protected async transitionTo(StateConstructor: typeof GameStateBase): Promise<void> {
    this.getLogger().info(`Transitioning from ${this.constructor.name} to ${StateConstructor.name}`);
    await this.controller.transitionTo(StateConstructor);
  }
}

// Game initialization state
export class InitializationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.getLogger().info("Initializing game");
    
    // Here we would set up the initial game state
    // For Phase 1 we'll just have placeholder implementation
    
    // After setup, transition to first phase
    // In phase 2 we'll transition to HohCompetitionState
    
    this.getLogger().info("InitializationState complete");
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'start_game':
        this.getLogger().info("Game start action received");
        // Could transition to HohCompetitionState here
        return true;
      default:
        return false;
    }
  }
}

// HoH competition state
export class HohCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'HoH';
    
    // Implementation will come in Phase 2
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'select_hoh':
        if (params && params.hohId) {
          this.getLogger().info(`Selected HoH: ${params.hohId}`);
          // Set HoH logic here
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}

// Nomination state
export class NominationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Nomination';
    
    // Implementation will come in Phase 2
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'make_nominations':
        if (params && params.nomineeIds && params.nomineeIds.length === 2) {
          const nominees = params.nomineeIds.map((id: string) => this.game.getHouseguestById(id));
          this.getLogger().info(`Nominations confirmed: ${nominees.map((n: any) => n?.name).join(', ')}`);
          
          // Here we would set the nominees in the game state
          // this.game.nominees = nominees;
          
          // Could transition to PovCompetitionState
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}

// PoV competition state
export class PovCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'PoV';
    
    // Implementation will come in Phase 2
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'select_pov_winner':
        if (params && params.povId) {
          this.getLogger().info(`Selected PoV winner: ${params.povId}`);
          // Set PoV winner logic here
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}

// PoV meeting state
export class PovMeetingState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'PoVMeeting';
    
    // Implementation will come in Phase 2
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'use_veto':
        if (params && params.useVeto !== undefined) {
          this.getLogger().info(`Veto decision: ${params.useVeto ? 'use' : 'not use'}`);
          return true;
        }
        return false;
      case 'select_replacement':
        if (params && params.replacementId) {
          this.getLogger().info(`Selected replacement nominee: ${params.replacementId}`);
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}

// Eviction state
export class EvictionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Eviction';
    
    // Implementation will come in Phase 2
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'cast_eviction_vote':
        if (params && params.voterId && params.nomineeId) {
          this.getLogger().info(`${params.voterId} voted to evict ${params.nomineeId}`);
          return true;
        }
        return false;
      case 'hoh_tiebreaker':
        if (params && params.hohId && params.nomineeId) {
          this.getLogger().info(`HoH ${params.hohId} broke tie by voting to evict ${params.nomineeId}`);
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}

// Final stage state
export class FinalStageState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Final';
    
    // Implementation will come in Phase 2
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'final_hoh_eviction':
        if (params && params.evictedId) {
          this.getLogger().info(`Final HoH decided to evict: ${params.evictedId}`);
          return true;
        }
        return false;
      case 'jury_vote':
        if (params && params.jurorId && params.voteForId) {
          this.getLogger().info(`Juror ${params.jurorId} voted for ${params.voteForId}`);
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}

// Game over state
export class GameOverState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
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
