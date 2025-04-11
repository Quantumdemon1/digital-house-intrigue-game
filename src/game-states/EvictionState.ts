
/**
 * @file EvictionState.ts
 * @description Eviction state
 */

import { GameStateBase } from './GameStateBase';

export class EvictionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Eviction';
    
    // AI houseguests will automatically vote through the useVotingLogic hook
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'cast_eviction_vote':
        if (params && params.voterId && params.nomineeId) {
          this.getLogger().info(`${params.voterId} voted to evict ${params.nomineeId}`);
          return true;
        }
        return false;
      case 'hoh_tiebreaker':
        if (params && params.hohId && params.nomineeId) {
          this.getLogger().info(`HoH ${params.hohId} broke tie by voting to evict ${params.nomineeId}`);
          
          // After tiebreaker vote, advance immediately to next week/phase
          // If we're in finale, go to GameOver, otherwise advance week
          if (this.game.week >= this.controller.getGameSettings().finalWeek) {
            this.controller.changeState('GameOverState');
          } else {
            this.game.advanceWeek();
            this.controller.changeState('HohCompetitionState');
          }
          return true;
        }
        return false;
      case 'eviction_complete':
        // After eviction is complete, advance immediately to next week/phase
        // If we're in finale, go to GameOver, otherwise advance week
        if (this.game.week >= this.controller.getGameSettings().finalWeek) {
          this.controller.changeState('GameOverState');
        } else {
          this.game.advanceWeek();
          this.controller.changeState('HohCompetitionState');
        }
        return true;
      default:
        return false;
    }
  }
}
