
/**
 * @file NominationState.ts
 * @description Nomination state
 */

import { GameStateBase } from './GameStateBase';

export class NominationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Nomination';
    
    // If HoH is AI-controlled, the AI nomination hook will handle this
    // We don't need to do anything special here
    const hoh = this.game.hohWinner ? this.game.getHouseguestById(this.game.hohWinner) : null;
    if (hoh && !hoh.isPlayer) {
      this.getLogger().info(`AI HoH ${hoh.name} will make nominations immediately`);
    }
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'make_nominations':
        if (params && params.nomineeIds && params.nomineeIds.length === 2) {
          const nominees = params.nomineeIds.map((id: string) => this.game.getHouseguestById(id));
          this.getLogger().info(`Nominations confirmed: ${nominees.map((n: any) => n?.name).join(', ')}`);
          
          // Set nominees in the game state
          this.game.nominees = params.nomineeIds;
          
          return true;
        }
        return false;
        
      case 'continue_to_pov':
        // Log that we're handling this action
        this.getLogger().info("Handling continue_to_pov action, changing to PovCompetitionState");
        
        // After nominations are made, immediately advance to PoV competition
        this.controller.changeState('PovCompetitionState');
        return true;
        
      default:
        return false;
    }
  }
}
