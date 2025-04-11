
/**
 * @file PovMeetingState.ts
 * @description PoV meeting state
 */

import { GameStateBase } from './GameStateBase';
import { Houseguest } from '../models/houseguest';
import { config } from '../config';

export class PovMeetingState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'PoVMeeting';
    
    // If POV holder is an AI player, handle automatic decisions
    const povWinnerId = this.game.povWinner;
    const povHolder = povWinnerId ? this.game.getHouseguestById(povWinnerId) : null;
    
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
          const nomineeId = params.nomineeId;
          const nominee = this.game.getHouseguestById(nomineeId);
          const povWinnerId = this.game.povWinner;
          const povHolder = povWinnerId ? this.game.getHouseguestById(povWinnerId) : null;
          
          if (nominee && povHolder) {
            this.getLogger().info(`Saving nominee: ${nominee.name}`);
            
            // Record this as a significant relationship event
            // The saved nominee will be very grateful to the POV holder
            this.controller.relationshipSystem.recordSave(
              povHolder.id,
              nominee.id,
              `${povHolder.name} used the Power of Veto to save you from the block.`
            );
            
            // Update mood and stress levels
            if (nominee && povHolder) {
              // Being saved from the block improves mood and reduces stress
              const savedNominee = this.game.getHouseguestById(nominee.id);
              if (savedNominee) {
                this.getLogger().info(`Updating ${savedNominee.name}'s mental state after being saved`);
                savedNominee.mood = 'Happy'; // Direct assignment for immediate impact
                savedNominee.stressLevel = 'Relaxed';
                
                // Add reflection about being saved
                if (!savedNominee.internalThoughts) savedNominee.internalThoughts = [];
                savedNominee.internalThoughts.push(
                  `I'm so relieved that ${povHolder.name} saved me with the veto! I owe them big time.`
                );
              }
            }
            
            // Update relationships for other houseguests who see this act of loyalty
            if (nominee.id !== povHolder.id) { // Only if saving someone else
              this.game.houseguests.forEach(hg => {
                if (hg.id !== povHolder.id && hg.id !== nominee.id && hg.status === 'Active') {
                  // How other houseguests perceive this act depends on their relationship with the saved nominee
                  const theirRelWithNominee = this.controller.relationshipSystem.getRelationship(hg.id, nominee.id);
                  
                  // If they like the nominee, they'll view this positively
                  // If they dislike the nominee, they'll view this negatively
                  const perceptionFactor = Math.max(-1, Math.min(1, theirRelWithNominee / 50));
                  const relationshipChange = Math.round(perceptionFactor * 5);
                  
                  if (relationshipChange !== 0) {
                    this.controller.relationshipSystem.updateRelationship(
                      hg.id, 
                      povHolder.id, 
                      relationshipChange,
                      `${hg.name}'s opinion of ${povHolder.name} changed after they saved ${nominee.name}`
                    );
                  }
                }
              });
            }
            
            return true;
          }
        }
        return false;
        
      case 'select_replacement':
        if (params && params.replacementId) {
          const replacementId = params.replacementId;
          const replacement = this.game.getHouseguestById(replacementId);
          const hohId = this.game.hohWinner;
          const hoh = hohId ? this.game.getHouseguestById(hohId) : null;
          
          if (replacement && hoh) {
            this.getLogger().info(`Selected replacement nominee: ${replacement.name}`);
            
            // Record this as a significant relationship event
            // The nominated houseguest will be unhappy with the HoH
            this.controller.relationshipSystem.updateRelationship(
              replacement.id,
              hoh.id,
              config.NOMINATION_PENALTY_NOMINEE,
              `${hoh.name} nominated you as a replacement nominee.`
            );
            
            // Update the replacement nominee's mood and stress
            if (replacement) {
              this.getLogger().info(`Updating ${replacement.name}'s mental state after nomination`);
              // Being nominated is stressful and upsetting
              replacement.mood = 'Upset';
              replacement.stressLevel = 'Stressed';
              
              // Add internal thought about being nominated
              if (!replacement.internalThoughts) replacement.internalThoughts = [];
              replacement.internalThoughts.push(
                `I can't believe ${hoh.name} put me up as a replacement nominee. This is not good for my game.`
              );
            }
            
            // The reciprocal relationship is also affected but less strongly
            this.controller.relationshipSystem.updateRelationship(
              hoh.id,
              replacement.id,
              config.NOMINATION_PENALTY_HOH,
              `You nominated ${replacement.name} as a replacement nominee.`
            );
            
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
