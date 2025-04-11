
/**
 * @file PovMeetingState.ts
 * @description PoV meeting state
 */

import { GameStateBase } from './GameStateBase';
import { Houseguest } from '../models/houseguest';

export class PovMeetingState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'PoVMeeting';
    
    // If POV holder is an AI player, handle automatic decisions
    const povHolder = this.game.povWinner ? this.game.getHouseguestById(this.game.povWinner) : null;
    
    if (povHolder && !povHolder.isPlayer) {
      this.getLogger().info(`AI POV holder ${povHolder.name} making veto decision automatically`);
      // AI logic will be handled by the React hooks in the UI
    }
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    await super.handleAction(actionId, params);
    
    switch (actionId) {
      case 'use_veto':
        if (params && params.useVeto !== undefined) {
          this.getLogger().info(`Veto decision: ${params.useVeto ? 'use' : 'not use'}`);
          return true;
        }
        return false;
        
      case 'save_nominee':
        if (params && params.nomineeId) {
          const nominee = this.game.getHouseguestById(params.nomineeId);
          if (nominee) {
            this.getLogger().info(`Saving nominee: ${nominee.name}`);
            return true;
          }
        }
        return false;
        
      case 'select_replacement':
        if (params && params.replacementId) {
          const replacement = this.game.getHouseguestById(params.replacementId);
          if (replacement) {
            this.getLogger().info(`Selected replacement nominee: ${replacement.name}`);
            // When replacement is selected, the meeting is complete
            // The next phase will be handled by the component's hook
            return true;
          }
        }
        return false;
        
      case 'fast_forward':
        this.getLogger().info('Fast-forwarding POV Meeting');
        // Fast-forward is handled in the React hooks
        return true;
        
      default:
        return false;
    }
  }
}
