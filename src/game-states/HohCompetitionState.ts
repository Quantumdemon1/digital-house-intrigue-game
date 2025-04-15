
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
      // Add a slight delay to ensure state changes properly
      setTimeout(() => {
        this.getLogger().info(`Changing state to NominationState for AI HoH ${hoh.name}`);
        this.changeState('NominationState');
      }, 1000);
    } else {
      this.getLogger().info('Waiting for HOH competition to complete or player action');
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
    this.getLogger().info(`HoH Competition handling action: ${actionId}`, params);
    
    switch (actionId) {
      case 'select_hoh':
        if (params && params.hohId) {
          this.getLogger().info(`Selected HoH: ${params.hohId}`);
          this.game.hohWinner = params.hohId; // Set HoH in the game state
          
          // Check if the HoH is AI-controlled and immediately proceed to nominations if so
          const hoh = this.game.getHouseguestById(params.hohId);
          if (hoh && !hoh.isPlayer) {
            this.getLogger().info(`AI HoH ${hoh.name} automatically proceeding to nominations`);
            setTimeout(() => {
              this.changeState('NominationState');
            }, 500);
          } else {
            this.getLogger().info(`Player HoH ${hoh?.name} selected, waiting for continue action`);
          }
          
          return true;
        }
        this.getLogger().warn('select_hoh action called without hohId parameter');
        return false;
        
      case 'continue_to_nominations':
        this.getLogger().info('Continuing to nominations via explicit action');
        // Add a small delay to ensure the state changes properly
        setTimeout(() => {
          this.getLogger().info('Executing state change to NominationState');
          this.changeState('NominationState');
        }, 200);
        return true;
        
      default:
        this.getLogger().warn(`Unknown action received: ${actionId}`);
        return false;
    }
  }
  
  changeState(stateName: string): void {
    this.getLogger().info(`HohCompetitionState changing to ${stateName}`);
    if (this.controller) {
      this.controller.changeState(stateName);
    } else {
      this.getLogger().error('Cannot change state: controller is undefined');
      // Fallback: update game phase directly
      if (stateName === 'NominationState') {
        this.game.phase = 'Nomination';
        this.getLogger().info('Set game phase directly to Nomination as fallback');
      }
    }
  }
}
