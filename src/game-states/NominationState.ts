
/**
 * @file NominationState.ts
 * @description Nomination state
 */

import { GameStateBase } from './GameStateBase';

export class NominationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Nomination';
    
    // Implementation will come in Phase 2
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'make_nominations':
        if (params && params.nomineeIds && params.nomineeIds.length === 2) {
          const nominees = params.nomineeIds.map((id: string) => this.game.getHouseguestById(id));
          this.getLogger().info(`Nominations confirmed: ${nominees.map((n: any) => n?.name).join(', ')}`);
          
          // Here we would set the nominees in the game state
          // this.game.nominees = nominees;
          
          // Could transition to PovCompetitionState
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}
