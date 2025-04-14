
/**
 * @file InitializationState.ts
 * @description Game initialization state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class InitializationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.getLogger().info("Initializing game");
    
    // Here we would set up the initial game state
    // For Phase 1 we'll just have placeholder implementation
    
    // After setup, transition to first phase
    // In phase 2 we'll transition to HohCompetitionState
    
    this.getLogger().info("InitializationState complete");
  }

  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'start_game',
        text: 'Start Game'
      },
      {
        actionId: 'setup_game',
        text: 'Setup Game Parameters'
      }
    ];
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    switch (actionId) {
      case 'start_game':
        this.getLogger().info("Game start action received");
        // Could transition to HohCompetitionState here
        return true;
      default:
        return false;
    }
  }
}
