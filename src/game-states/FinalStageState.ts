
import { GamePhase } from '../models/game-state';
import { GameStateBase, SocialActionChoice } from './GameStateBase';
import type { IGameControllerFacade } from '../types/interfaces';

export class FinalStageState extends GameStateBase {
  constructor(controller: IGameControllerFacade) {
    super(controller);
  }

  async enter(): Promise<void> {
    await super.enter();
    this.controller.phase = 'Finale';
    this.getLogger().info("Entering final stage");
  }

  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'jury_vote',
        text: 'Cast Jury Vote',
        parameters: { finalist: '' }
      },
      {
        actionId: 'end_game',
        text: 'End Game'
      }
    ];
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    this.getLogger().debug(`Final stage action: ${actionId}`, params);
    return true;
  }
}
