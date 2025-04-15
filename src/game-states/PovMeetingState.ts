
/**
 * @file PovMeetingState.ts
 * @description PoV meeting state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class PovMeetingState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Check if we're at final 3 (only 3 active houseguests)
    const activeHouseguests = this.game.getActiveHouseguests();
    if (activeHouseguests.length <= 3) {
      // Skip PoV meeting at final 3 and go straight to Eviction
      this.getLogger().info("Final 3 detected: Skipping PoV Meeting and going to Eviction");
      this.controller.changeState('EvictionState');
      return;
    }
    
    this.game.phase = 'PoVMeeting';
    
    // If PoV holder is AI-controlled, AI will handle this phase
    const povWinnerId = this.game.povWinner;
    const povWinner = povWinnerId ? this.game.getHouseguestById(povWinnerId) : null;
    if (povWinner && !povWinner.isPlayer) {
      this.getLogger().info(`AI PoV holder ${povWinner.name} will make PoV meeting decisions`);
      // AI logic will be handled elsewhere
    }
  }
  
  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'use_veto',
        text: 'Use Power of Veto',
        parameters: { savedNomineeId: '' }
      },
      {
        actionId: 'dont_use_veto',
        text: 'Do Not Use Power of Veto'
      },
      {
        actionId: 'replacement_nominee',
        text: 'Select Replacement Nominee',
        parameters: { replacementNomineeId: '' }
      },
      {
        actionId: 'fast_forward',
        text: 'Fast Forward'
      }
    ];
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    switch (actionId) {
      case 'use_veto':
        // PoV holder decides to use the veto on a nominee
        if (params && params.savedNomineeId) {
          const savedNomineeId = params.savedNomineeId;
          const savedNominee = this.game.getHouseguestById(savedNomineeId);
          
          if (savedNominee) {
            this.getLogger().info(`PoV holder saved: ${savedNominee.name}`);
            
            // Remove this nominee from the nominees list
            const currentNominees = this.game.nominees || [];
            this.game.nominees = currentNominees.filter((id: string) => id !== savedNomineeId);
            
            return true;
          }
        }
        return false;
        
      case 'replacement_nominee':
        // HoH chooses a replacement nominee
        if (params && params.replacementNomineeId) {
          const replacementNomineeId = params.replacementNomineeId;
          const replacementNominee = this.game.getHouseguestById(replacementNomineeId);
          
          if (replacementNominee) {
            this.getLogger().info(`Replacement nominee: ${replacementNominee.name}`);
            
            // Add the replacement to nominees
            const currentNominees = this.game.nominees || [];
            this.game.nominees = [...currentNominees, replacementNomineeId];
            
            // Immediately advance to Eviction phase
            this.controller.changeState('EvictionState');
            return true;
          }
        }
        return false;
        
      case 'dont_use_veto':
        // PoV holder decides not to use the veto
        this.getLogger().info("PoV holder decided not to use the veto.");
        
        // Immediately advance to Eviction phase
        this.controller.changeState('EvictionState');
        return true;
        
      case 'fast_forward':
        // When fast forwarding through PoV Meeting
        this.getLogger().info("Fast forwarding through PoV Meeting");
        
        // Make some simple default decisions:
        // 1. If PoV holder is a nominee, they save themselves
        // 2. Otherwise, they don't use the veto at all
        
        const povWinnerId = this.game.povWinner;
        const povWinner = povWinnerId ? this.game.getHouseguestById(povWinnerId) : null;
        const currentNominees = this.game.nominees || [];
        
        if (povWinner && povWinnerId && currentNominees.includes(povWinnerId)) {
          // PoV holder is nominated, so they save themselves
          this.getLogger().info(`Fast forward - ${povWinner.name} saved themselves with the PoV`);
          
          // Remove them from nominees
          this.game.nominees = currentNominees.filter((id: string) => id !== povWinnerId);
          
          // Choose a random non-nominated replacement
          const hohId = this.game.hohWinner;
          const eligibleReplacements = this.game.getActiveHouseguests()
            .filter(hg => 
              hg.id !== povWinnerId && 
              hg.id !== hohId && 
              !currentNominees.includes(hg.id)
            )
            .map(hg => hg.id);
            
          if (eligibleReplacements.length > 0) {
            // Choose random replacement
            const randomIndex = Math.floor(Math.random() * eligibleReplacements.length);
            const replacementId = eligibleReplacements[randomIndex];
            const replacement = this.game.getHouseguestById(replacementId);
            
            if (replacement) {
              this.getLogger().info(`Fast forward - ${replacement.name} was chosen as replacement nominee`);
              
              // Add the replacement
              this.game.nominees = [...this.game.nominees, replacementId];
            }
          }
        } else {
          this.getLogger().info("Fast forward - PoV was not used");
          // Do nothing, keep nominees the same
        }
        
        // Advance to Eviction
        this.controller.changeState('EvictionState');
        return true;
        
      default:
        return false;
    }
  }
}
