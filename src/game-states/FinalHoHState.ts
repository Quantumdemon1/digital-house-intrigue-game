
/**
 * @file FinalHoHState.ts
 * @description Final HoH competition state - 3 parts
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class FinalHoHState extends GameStateBase {
  private currentPart: number = 1;
  
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'FinalHoH';
    this.currentPart = 1;
    
    // Set up final HoH if not already done
    if (!this.game.finalHoHWinners) {
      this.game.finalHoHWinners = {
        part1: null,
        part2: null,
        part3: null
      };
    }
    
    this.getLogger().info(`Starting Final HoH Competition - Part ${this.currentPart}`);
  }
  
  getAvailableActions(): SocialActionChoice[] {
    const actions: SocialActionChoice[] = [
      {
        actionId: 'select_part1_winner',
        text: 'Complete Part 1',
        parameters: { winnerId: '' }
      }
    ];
    
    // Add part 2 action if part 1 is complete
    if (this.game.finalHoHWinners?.part1) {
      actions.push({
        actionId: 'select_part2_winner',
        text: 'Complete Part 2',
        parameters: { winnerId: '' }
      });
    }
    
    // Add part 3 action if parts 1 and 2 are complete
    if (this.game.finalHoHWinners?.part1 && this.game.finalHoHWinners?.part2) {
      actions.push({
        actionId: 'select_part3_winner',
        text: 'Complete Part 3',
        parameters: { winnerId: '' }
      });
    }
    
    // Add final selection action if part 3 is complete
    if (this.game.finalHoHWinners?.part3) {
      actions.push({
        actionId: 'select_finalist',
        text: 'Choose Final 2 Houseguest',
        parameters: { finalistId: '' }
      });
    }
    
    return actions;
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    switch (actionId) {
      case 'select_part1_winner':
        if (params && params.winnerId) {
          this.game.finalHoHWinners!.part1 = params.winnerId;
          this.getLogger().info(`Final HoH Part 1 Winner: ${params.winnerId}`);
          this.currentPart = 2;
          return true;
        }
        return false;
        
      case 'select_part2_winner':
        if (params && params.winnerId) {
          this.game.finalHoHWinners!.part2 = params.winnerId;
          this.getLogger().info(`Final HoH Part 2 Winner: ${params.winnerId}`);
          this.currentPart = 3;
          return true;
        }
        return false;
        
      case 'select_part3_winner':
        if (params && params.winnerId) {
          // Winner of part 3 is the final HoH
          this.game.finalHoHWinners!.part3 = params.winnerId;
          this.game.hohWinner = params.winnerId;
          
          const hoh = this.game.getHouseguestById(params.winnerId);
          if (hoh) {
            this.getLogger().info(`Final HoH Part 3 Winner (Final HoH): ${hoh.name}`);
          }
          
          return true;
        }
        return false;
        
      case 'select_finalist':
        if (params && params.finalistId) {
          // Get the final HoH and the selected finalist
          const hohId = this.game.hohWinner;
          const finalistId = params.finalistId;
          
          if (hohId && finalistId) {
            const hoh = this.game.getHouseguestById(hohId);
            const finalist = this.game.getHouseguestById(finalistId);
            
            if (hoh && finalist) {
              this.getLogger().info(`Final HoH ${hoh.name} has selected ${finalist.name} to go to the Final 2`);
              
              // The third houseguest is evicted and goes to jury
              const finalThree = this.game.getActiveHouseguests();
              const evicted = finalThree.find(hg => 
                hg.id !== hohId && hg.id !== finalistId
              );
              
              if (evicted) {
                evicted.status = 'Jury';
                this.game.juryMembers.push(evicted.id);
                this.getLogger().info(`${evicted.name} has been evicted and will join the jury`);
                
                // Set the final two
                this.game.finalTwo = [hoh, finalist];
                
                // Move to jury questioning
                this.controller.changeState('JuryQuestioningState');
                return true;
              }
            }
          }
        }
        return false;
        
      default:
        return false;
    }
  }
}
