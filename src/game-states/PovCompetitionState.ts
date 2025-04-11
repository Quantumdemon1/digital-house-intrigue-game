
/**
 * @file PovCompetitionState.ts
 * @description PoV competition state
 */

import { GameStateBase } from './GameStateBase';

export class PovCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'PoV';
    
    // If PoV winner is AI, immediately proceed to PoV meeting
    const povWinnerId = this.game.povWinner;
    const povWinner = povWinnerId ? this.game.getHouseguestById(povWinnerId) : null;
    if (povWinner && !povWinner.isPlayer) {
      this.getLogger().info(`AI PoV winner ${povWinner.name} automatically proceeding to PoV meeting`);
      // Immediately advance to PoV meeting phase - no delay
      this.controller.changeState('PovMeetingState');
    }
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'select_pov_winner':
        if (params && params.povId) {
          this.getLogger().info(`Selected PoV winner: ${params.povId}`);
          this.game.povWinner = params.povId;
          
          // After selection, check if it's AI and proceed immediately
          const povWinner = this.game.getHouseguestById(params.povId);
          if (povWinner && !povWinner.isPlayer) {
            this.controller.changeState('PovMeetingState');
          }
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}
