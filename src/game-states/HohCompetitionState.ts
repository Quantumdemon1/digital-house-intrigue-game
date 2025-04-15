
/**
 * @file HohCompetitionState.ts
 * @description HoH competition state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class HohCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'HoH';
    this.getLogger().info('Entered HoH Competition state');
    
    // If HoH is already set (AI-controlled), immediately proceed to nominations
    const hohId = this.game.hohWinner;
    const hoh = hohId ? this.game.getHouseguestById(hohId) : null;
    if (hoh && !hoh.isPlayer) {
      this.getLogger().info(`AI HoH ${hoh.name} automatically proceeding to nominations`);
      // Immediately advance to nomination phase - no delay
      this.controller.changeState('NominationState');
    }
  }
  
  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'select_hoh',
        text: 'Select Head of Household',
        parameters: { hohId: '' }
      },
      {
        actionId: 'continue_to_nominations',
        text: 'Continue to Nominations'
      }
    ];
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    this.getLogger().info(`HoH Competition handling action: ${actionId}`);
    
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
        
      case 'continue_to_nominations':
        this.getLogger().info('Continuing to nominations');
        this.controller.changeState('NominationState');
        return true;
        
      default:
        return false;
    }
  }
}
