
/**
 * @file GameOverState.ts
 * @description Game over state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class GameOverState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'GameOver';
    
    // Implementation will come in Phase 2
  }

  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'new_game',
        text: 'Start New Game'
      },
      {
        actionId: 'view_stats',
        text: 'View Game Statistics'
      }
    ];
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    // Placeholder for future implementation
    return true;
  }
}
