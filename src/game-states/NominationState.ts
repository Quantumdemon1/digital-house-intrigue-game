
/**
 * @file NominationState.ts
 * @description Nomination state
 */

import { GameStateBase } from './GameStateBase';

export class NominationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Nomination';
    
    // If HoH is AI-controlled, trigger automatic nominations
    const hoh = this.game.hohWinner ? this.game.getHouseguestById(this.game.hohWinner) : null;
    if (hoh && !hoh.isPlayer) {
      this.getLogger().info(`AI HoH ${hoh.name} will automatically make nominations`);
      // No need to do anything here - the useAINomination hook will handle this automatically
    }
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'make_nominations':
        if (params && params.nomineeIds && params.nomineeIds.length === 2) {
          const nominees = params.nomineeIds.map((id: string) => this.game.getHouseguestById(id));
          this.getLogger().info(`Nominations confirmed: ${nominees.map((n: any) => n?.name).join(', ')}`);
          
          // After nominations are made, automatically advance to PoV competition
          setTimeout(() => {
            this.controller.changeState('PovCompetitionState');
          }, 2000);
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}
