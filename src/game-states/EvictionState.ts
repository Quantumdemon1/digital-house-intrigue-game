
/**
 * @file EvictionState.ts
 * @description Eviction state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';
import { HouseguestStatus } from '../models/houseguest';

export class EvictionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Eviction';
    
    // Check if we're at final 3
    const activeHouseguests = this.game.getActiveHouseguests();
    if (activeHouseguests.length <= 3) {
      this.getLogger().info("Final 3 detected: HoH will solely decide who to evict");
      // At final 3, there are no votes - the HoH solely decides who to evict
      // This will be handled in the UI layer
    } else {
      // AI houseguests will automatically vote through the useVotingLogic hook
      this.getLogger().info("Regular eviction ceremony: Houseguests will vote");
    }
  }
  
  getAvailableActions(): SocialActionChoice[] {
    // Return available actions for this state
    return [
      {
        actionId: 'cast_eviction_vote',
        text: 'Cast Eviction Vote',
        parameters: { nomineeId: '' }
      },
      {
        actionId: 'eviction_complete',
        text: 'Complete Eviction',
      }
    ];
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
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
        
      case 'final3_hoh_decision':
        // Special case for final 3 where HOH directly evicts someone
        if (params && params.nomineeId) {
          const evictedHouseguest = this.game.houseguests.find(hg => hg.id === params.nomineeId);
          if (evictedHouseguest) {
            this.getLogger().info(`Final 3: HOH directly evicted ${evictedHouseguest.name}`);
            
            // Always add to jury at final 3
            evictedHouseguest.status = 'Jury' as HouseguestStatus;
            this.game.juryMembers.push(params.nomineeId);
            
            // The remaining two houseguests become the final two
            // But we need Houseguest objects, not just IDs
            const finalTwoHouseguests = this.game.getActiveHouseguests().filter(hg => hg.id !== params.nomineeId);
            this.game.finalTwo = finalTwoHouseguests; // Now assigning Houseguest[] instead of string[]
            
            // Advance to Finale phase
            this.controller.changeState('FinalStageState');
            return true;
          }
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
