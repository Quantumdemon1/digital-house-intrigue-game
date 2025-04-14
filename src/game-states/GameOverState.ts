
/**
 * @file GameOverState.ts
 * @description Game over state implementation
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';
import { useToast } from '@/hooks/use-toast';

export class GameOverState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'GameOver';
    this.logger.info("Game has ended - entering GameOver state");
    
    // Record game statistics for viewing
    this.logger.info("Preparing game statistics and results");
  }

  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'new_game',
        text: 'Start New Game',
        category: 'game_flow'
      },
      {
        actionId: 'view_stats',
        text: 'View Game Statistics',
        category: 'information'
      },
      {
        actionId: 'exit_game',
        text: 'Exit to Main Menu',
        category: 'game_flow'
      }
    ];
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    this.logger.debug(`Game over action: ${actionId}`, params);
    
    switch (actionId) {
      case 'new_game':
        this.logger.info("Starting new game");
        this.controller.resetGame();
        return true;
      
      case 'view_stats':
        this.logger.info("Viewing game statistics");
        // Just log this action for now - UI already shows stats
        return true;
      
      case 'exit_game':
        this.logger.info("Exiting to main menu");
        this.controller.exitToMainMenu();
        return true;
        
      default:
        return false;
    }
  }
}
