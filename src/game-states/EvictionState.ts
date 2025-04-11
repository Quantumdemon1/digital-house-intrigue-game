
/**
 * @file EvictionState.ts
 * @description Eviction state
 */

import { GameStateBase } from './GameStateBase';

export class EvictionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Eviction';
    
    // Implementation will come in Phase 2
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
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}
