
/**
 * @file NominationState.ts
 * @description Nomination state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class NominationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'Nomination';
    
    // If HoH is AI-controlled, the AI nomination hook will handle this
    // We don't need to do anything special here
    const hohId = this.game.hohWinner;
    const hoh = hohId ? this.game.getHouseguestById(hohId) : null;
    if (hoh && !hoh.isPlayer) {
      this.getLogger().info(`AI HoH ${hoh.name} will make nominations immediately`);
    }
  }
  
  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'make_nominations',
        text: 'Make Nominations',
        parameters: { nomineeIds: [] }
      },
      {
        actionId: 'continue_to_pov_selection', // Updated to go to PoV player selection
        text: 'Continue to Power of Veto Player Selection'
      },
      {
        actionId: 'fast_forward',
        text: 'Fast Forward'
      }
    ];
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    switch (actionId) {
      case 'make_nominations':
        if (params && params.nomineeIds && params.nomineeIds.length === 2) {
          const nomineeIds = params.nomineeIds;
          // Get nominee objects from their IDs
          const nominees = nomineeIds.map((id: string) => this.game.getHouseguestById(id)).filter(Boolean);
          this.getLogger().info(`Nominations confirmed: ${nominees.map((n: any) => n?.name).join(', ')}`);
          
          // Set nominees in the game state - store the IDs
          this.game.nominees = nomineeIds;
          
          return true;
        }
        return false;
      
      case 'fast_forward':
        // When fast forwarding, make AI nominations if HoH exists
        const hohId = this.game.hohWinner;
        const hoh = hohId ? this.game.getHouseguestById(hohId) : null;
        
        if (hoh) {
          // Get list of eligible houseguests for nominations (not HoH)
          const eligibleNominees = this.game.getActiveHouseguests()
            .filter(hg => hg.id !== hohId);
          
          if (eligibleNominees.length >= 2) {
            // Choose two random nominees
            const randomNominees = eligibleNominees
              .sort(() => 0.5 - Math.random())
              .slice(0, 2)
              .map(hg => hg.id);
            
            this.getLogger().info(`Fast forward - Auto nominations: ${randomNominees.map(id => 
              this.game.getHouseguestById(id)?.name).join(', ')}`);
            
            // Set nominees and advance
            this.game.nominees = randomNominees;
            this.controller.changeState('PovPlayerSelectionState'); // Updated to go to PoV player selection
            return true;
          }
        }
        
        this.getLogger().info("Fast forward activated - advancing to PoV Player Selection");
        // Always advance to the next state
        this.controller.changeState('PovPlayerSelectionState'); // Updated to go to PoV player selection
        return true;
        
      case 'continue_to_pov_selection': // Updated action name
        // After nominations are made, advance to PoV player selection
        this.getLogger().info("Continue to PoV Player Selection");
        this.controller.changeState('PovPlayerSelectionState');
        return true;
        
      default:
        return false;
    }
  }
}
