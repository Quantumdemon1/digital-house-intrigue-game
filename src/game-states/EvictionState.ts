
/**
 * @file EvictionState.ts
 * @description Eviction state
 */

import { GameStateBase } from './GameStateBase';
import { HouseguestStatus } from '../models/houseguest';

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
          return true;
        }
        return false;
        
      case 'evict_houseguest':
        if (params && params.evictedId) {
          this.getLogger().info(`Evicting houseguest: ${params.evictedId}`);
          
          // Get the evicted houseguest
          const evictedHouseguest = this.game.houseguests.find(hg => hg.id === params.evictedId);
          if (evictedHouseguest) {
            // Update the houseguest's status based on jury eligibility
            const newStatus = params.toJury ? 'Jury' : 'Evicted';
            evictedHouseguest.status = newStatus as HouseguestStatus;
            
            // If they're going to jury, add them to jury members
            if (params.toJury) {
              this.game.juryMembers.push(params.evictedId);
            }
            
            // Important: Remove from nominees list
            this.game.nominees = this.game.nominees.filter(id => id !== params.evictedId);
            
            this.getLogger().info(`${evictedHouseguest.name} has been evicted and removed from active houseguests`);
          }
          return true;
        }
        return false;
        
      case 'advance_week':
        this.getLogger().info("Advancing week after eviction");
        // After eviction is complete, advance immediately to next week/phase
        // If we're in finale, go to GameOver, otherwise advance week
        if (this.game.week >= this.controller.getGameSettings().finalWeek) {
          this.controller.changeState('GameOverState');
        } else {
          this.game.advanceWeek();
          this.controller.changeState('HohCompetitionState');
        }
        return true;
        
      case 'fast_forward':
        this.getLogger().info("Fast-forwarding eviction phase");
        // If we're in finale, go to GameOver, otherwise advance week
        if (this.game.week >= this.controller.getGameSettings().finalWeek) {
          this.controller.changeState('GameOverState');
        } else {
          this.game.advanceWeek();
          this.controller.changeState('HohCompetitionState');
        }
        return true;
        
      case 'eviction_complete':
        this.getLogger().info("Eviction complete, advancing to next phase");
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
