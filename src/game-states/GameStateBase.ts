
/**
 * @file GameStateBase.ts
 * @description Base class for all game states
 */

import { BigBrotherGame } from '../models/BigBrotherGame';
import type { IGameControllerFacade } from '../types/interfaces';

// Define structure for actions the social state can return
export interface SocialActionChoice {
  text: string;
  actionId: string;
  disabled?: boolean;
  disabledReason?: string;
  parameters?: any;
}

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

  // Added base implementation that can be overridden by specific states
  getAvailableActions(): SocialActionChoice[] {
    // Default implementation returns an empty array
    return [];
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
