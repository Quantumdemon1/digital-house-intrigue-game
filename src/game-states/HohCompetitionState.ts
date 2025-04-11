
/**
 * @file HohCompetitionState.ts
 * @description HoH competition state
 */

import { GameStateBase } from './GameStateBase';

export class HohCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'HoH';
    
    // If HoH is AI-controlled, immediately proceed to nominations
    const hoh = this.game.hohWinner ? this.game.getHouseguestById(this.game.hohWinner) : null;
    if (hoh && !hoh.isPlayer) {
      this.getLogger().info(`AI HoH ${hoh.name} automatically proceeding to nominations`);
      // After a small delay to allow UI to update, advance to nomination phase
      setTimeout(() => {
        this.gameController.changeState('NominationState');
      }, 2000);
    }
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
