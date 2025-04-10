
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
      // Immediately advance to nomination phase - no delay
      this.controller.changeState('NominationState');
    }
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'select_hoh':
        if (params && params.hohId) {
          this.getLogger().info(`Selected HoH: ${params.hohId}`);
          this.game.hohWinner = params.hohId; // Set HoH in the game state
          
          // Check if the HoH is AI-controlled and immediately proceed to nominations if so
          const hoh = this.game.getHouseguestById(params.hohId);
          if (hoh && !hoh.isPlayer) {
            this.controller.changeState('NominationState');
          }
          
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}
