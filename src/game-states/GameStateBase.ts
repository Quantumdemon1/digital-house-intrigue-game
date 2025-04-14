
import { IGameControllerFacade } from '../types/interfaces';

export interface SocialActionChoice {
  actionId: string;
  text: string;
  parameters?: any;
  disabled?: boolean;
  disabledReason?: string;
  category?: string; // Add category property to the interface
}

export abstract class GameStateBase {
  protected controller: IGameControllerFacade;
  
  constructor(controller: IGameControllerFacade) {
    this.controller = controller;
  }

  get game() {
    return this.controller.game;
  }

  abstract getAvailableActions(): SocialActionChoice[];
  abstract handleAction(actionId: string, parameters?: any): Promise<boolean>;
}
