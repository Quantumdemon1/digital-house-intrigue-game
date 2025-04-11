
/**
 * @file PovCompetitionState.ts
 * @description PoV competition state
 */

import { GameStateBase } from './GameStateBase';

export class PovCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'PoV';
    
    // If PoV winner is AI, automatically proceed to PoV meeting
    const povWinner = this.game.povWinner ? this.game.getHouseguestById(this.game.povWinner) : null;
    if (povWinner && !povWinner.isPlayer) {
      this.getLogger().info(`AI PoV winner ${povWinner.name} automatically proceeding to PoV meeting`);
      // After a small delay to allow UI to update, advance to PoV meeting phase
      setTimeout(() => {
        this.controller.changeState('PovMeetingState');
      }, 2000);
    }
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'select_pov_winner':
        if (params && params.povId) {
          this.getLogger().info(`Selected PoV winner: ${params.povId}`);
          // After selection, check if it's AI and proceed automatically
          const povWinner = this.game.getHouseguestById(params.povId);
          if (povWinner && !povWinner.isPlayer) {
            setTimeout(() => {
              this.controller.changeState('PovMeetingState');
            }, 2000);
          }
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}
