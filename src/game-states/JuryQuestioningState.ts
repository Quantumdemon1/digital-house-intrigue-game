
/**
 * @file JuryQuestioningState.ts
 * @description Jury questioning state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class JuryQuestioningState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'JuryQuestioning';
    this.getLogger().info("Starting Jury Questioning");
    
    // If we don't have a final two yet, go back to Final HoH
    if (!this.game.finalTwo || this.game.finalTwo.length !== 2) {
      this.getLogger().error("No final two selected yet, returning to Final HoH");
      this.controller.changeState('FinalHoHState');
    }
  }
  
  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'complete_questioning',
        text: 'Complete Jury Questioning',
      },
      {
        actionId: 'continue_to_voting',
        text: 'Continue to Final Voting'
      }
    ];
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    switch (actionId) {
      case 'complete_questioning':
      case 'continue_to_voting':
        this.getLogger().info("Jury questioning complete, moving to final vote");
        // Move directly to the Finale state which handles the voting and winner determination
        this.controller.changeState('FinalStageState');
        return true;
        
      default:
        return false;
    }
  }
}
