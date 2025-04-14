
import { IGameControllerFacade } from '../types/interfaces';
import { Logger } from '../utils/logger';

export interface SocialActionChoice {
  actionId: string;
  text: string;
  parameters?: any;
  disabled?: boolean;
  disabledReason?: string;
  category?: string;
}

export abstract class GameStateBase {
  protected controller: IGameControllerFacade;
  protected logger: Logger;
  
  constructor(controller: IGameControllerFacade) {
    this.controller = controller;
    this.logger = controller.logger;
  }

  get game() {
    return this.controller.game;
  }

  // Add getLogger method
  protected getLogger(): Logger {
    return this.logger;
  }

  // Add optional enter method that subclasses can override
  async enter(): Promise<void> {
    // Base implementation does nothing
  }

  // Abstract methods that all subclasses must implement
  abstract getAvailableActions(): SocialActionChoice[];
  abstract handleAction(actionId: string, parameters?: any): Promise<boolean>;
}
