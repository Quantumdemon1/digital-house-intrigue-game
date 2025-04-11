
import { GamePhase } from '../models/game-state';
import { GameStateBase } from './GameStateBase';
import type { IGameControllerFacade } from '../types/interfaces';

export class FinalStageState extends GameStateBase {
  constructor(controller: IGameControllerFacade) {
    super(controller);
  }

  async enter(): Promise<void> {
    await super.enter();
    this.controller.phase = 'Finale'; // Changed from 'Final' to 'Finale' to match GamePhase type
    this.getLogger().info("Entering final stage");
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    this.getLogger().debug(`Final stage action: ${actionId}`, params);
    return true;
  }
}
